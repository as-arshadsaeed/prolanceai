
import os
from datetime import datetime, timezone

import psycopg
from psycopg.rows import dict_row


LIMIT = 10

VALID_DOCUMENT_TYPES = ("proposals", "cover_letters")


def _database_url() -> str:
    """Get the PostgreSQL connection URL from environment variables."""
    url = os.getenv("DATABASE_URL")

    if not url:
        raise RuntimeError("DATABASE_URL is not configured")

    return url


def _connect():
    """Connect to PostgreSQL and ensure the usage table exists."""
    conn = psycopg.connect(
        _database_url(),
        row_factory=dict_row,
    )

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS usage (
            ip TEXT NOT NULL,
            usage_date DATE NOT NULL,
            document_type TEXT NOT NULL
                CHECK (
                    document_type IN ('proposals', 'cover_letters')
                ),
            used INTEGER NOT NULL DEFAULT 0
                CHECK (used >= 0),
            PRIMARY KEY (ip, usage_date, document_type)
        )
        """
    )

    return conn


def _today():
    """Return today's date in UTC."""
    return datetime.now(timezone.utc).date()


def get_usage(ip: str) -> dict:
    """Return today's usage counts for an IP address."""
    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT document_type, used
            FROM usage
            WHERE ip = %s AND usage_date = %s
            """,
            (ip, _today()),
        ).fetchall()

    counts = {
        row["document_type"]: row["used"]
        for row in rows
    }

    proposals = counts.get("proposals", 0)
    cover_letters = counts.get("cover_letters", 0)

    return {
        "proposals_used": proposals,
        "proposals_limit": LIMIT,
        "cover_letters_used": cover_letters,
        "cover_letters_limit": LIMIT,
    }


def reserve_usage(ip: str, document_type: str) -> bool:
    """
    Atomically reserve one daily usage.

    Returns True if usage was reserved, or False if the limit was reached.
    """
    if document_type not in VALID_DOCUMENT_TYPES:
        raise ValueError("Invalid document type")

    today = _today()

    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO usage (
                ip,
                usage_date,
                document_type,
                used
            )
            VALUES (%s, %s, %s, 0)
            ON CONFLICT (ip, usage_date, document_type)
            DO NOTHING
            """,
            (ip, today, document_type),
        )

        row = conn.execute(
            """
            UPDATE usage
            SET used = used + 1
            WHERE ip = %s
              AND usage_date = %s
              AND document_type = %s
              AND used < %s
            RETURNING used
            """,
            (ip, today, document_type, LIMIT),
        ).fetchone()

    return row is not None


def release_usage(ip: str, document_type: str) -> None:
    """Release a reserved usage after generation fails."""
    if document_type not in VALID_DOCUMENT_TYPES:
        raise ValueError("Invalid document type")

    with _connect() as conn:
        conn.execute(
            """
            UPDATE usage
            SET used = GREATEST(used - 1, 0)
            WHERE ip = %s
              AND usage_date = %s
              AND document_type = %s
            """,
            (ip, _today(), document_type),
        )
