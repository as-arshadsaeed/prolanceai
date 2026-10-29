
import re

from ..schemas.schemas import ProposalRequest, ProposalSection, ValidationIssue


NUMBER_WORDS = {
    "zero": "0",
    "one": "1",
    "two": "2",
    "three": "3",
    "four": "4",
    "five": "5",
    "six": "6",
    "seven": "7",
    "eight": "8",
    "nine": "9",
    "ten": "10",
    "eleven": "11",
    "twelve": "12",
    "fifteen": "15",
    "twenty": "20",
    "thirty": "30",
    "forty": "40",
    "fifty": "50",
    "hundred": "100",
    "thousand": "1000",
}

NUMBER_PATTERN = re.compile(
    r"\b\d+(?:,\d{3})*(?:\.\d+)?%?\b"
    r"|\b(?:"
    + "|".join(NUMBER_WORDS)
    + r")\b",
    re.IGNORECASE,
)

EXPERIENCE_CONTEXT = re.compile(
    r"\b("
    r"years?|months?|clients?|projects?|customers?|"
    r"companies|businesses|certifications?|"
    r"experience|increased|improved|reduced|grew|"
    r"generated|delivered|managed|completed|"
    r"revenue|percent|percentage|conversion|"
    r"performance|savings|successfully"
    r")\b",
    re.IGNORECASE,
)


def render_full_text(p: ProposalSection) -> str:
    parts = [
        p.opening,
        p.understanding,
        p.approach,
        *p.relevant_evidence,
    ]

    if p.questions:
        parts.append("Questions: " + " ".join(p.questions))

    parts.append(p.closing)

    return "\n\n".join(
        x.strip() for x in parts if x and x.strip()
    )


def normalize_numbers(text: str) -> str:
    def replace_number(match: re.Match) -> str:
        value = match.group(0).lower()
        return NUMBER_WORDS.get(value, value.replace(",", ""))

    return NUMBER_PATTERN.sub(replace_number, text)


def find_unsupported_numeric_claims(
    draft: str,
    evidence: str,
) -> list[str]:
    normalized_draft = normalize_numbers(draft)
    normalized_evidence = normalize_numbers(evidence)

    unsupported = []

    for match in NUMBER_PATTERN.finditer(normalized_draft):
        value = match.group(0)

        # Ignore numbers that are present in the supplied evidence.
        if re.search(
            rf"(?<!\w){re.escape(value)}(?!\w)",
            normalized_evidence,
            re.IGNORECASE,
        ):
            continue

        # Inspect the sentence containing the number.
        start = normalized_draft.rfind(".", 0, match.start()) + 1
        end_candidates = [
            pos
            for pos in (
                normalized_draft.find(".", match.end()),
                normalized_draft.find("!", match.end()),
                normalized_draft.find("?", match.end()),
                normalized_draft.find("\n", match.end()),
            )
            if pos != -1
        ]
        end = min(end_candidates) + 1 if end_candidates else len(
            normalized_draft
        )

        sentence = normalized_draft[start:end].strip()

        # Questions are less likely to assert personal achievements.
        if sentence.endswith("?"):
            continue

        # Only flag numbers used near experience or achievement language.
        if EXPERIENCE_CONTEXT.search(sentence):
            unsupported.append(value)

    return sorted(set(unsupported))


def validate_proposal(
    request: ProposalRequest,
    proposal: ProposalSection,
) -> list[ValidationIssue]:
    issues = []
    full_text = render_full_text(proposal)
    text_lower = full_text.lower()

    if (
        not request.portfolio_evidence
        and not request.experience_summary.strip()
    ):
        issues.append(
            ValidationIssue(
                severity="warning",
                code="NO_EVIDENCE",
                message=(
                    "No experience or portfolio evidence was supplied. "
                    "Review experience-related claims carefully."
                ),
            )
        )

    missing = [
        skill
        for skill in request.skills
        if len(skill) > 2
        and skill.lower() in request.job_description.lower()
        and skill.lower() not in text_lower
    ]

    if missing:
        issues.append(
            ValidationIssue(
                severity="warning",
                code="SKILLS_NOT_MENTIONED",
                message=(
                    "Supplied skills present in the job description "
                    "but absent from draft: " + ", ".join(missing)
                ),
            )
        )

    source = " ".join(
        [request.experience_summary, *request.portfolio_evidence]
    )

    unsupported_numbers = find_unsupported_numeric_claims(
        full_text,
        source,
    )

    if unsupported_numbers:
        issues.append(
            ValidationIssue(
                severity="warning",
                code="REVIEW_NUMERIC_CLAIMS",
                message=(
                    "Review numeric claims near experience or achievement "
                    "language. Unsupported number(s): "
                    + ", ".join(unsupported_numbers)
                    + ". Confirm each claim against the supplied evidence."
                ),
            )
        )

    length_targets = {
        "short": 130,
        "medium": 230,
        "long": 380,
    }
    target = length_targets.get(request.length, 230)

    if len(full_text.split()) > target * 1.5:
        issues.append(
            ValidationIssue(
                severity="warning",
                code="LENGTH_OVER_TARGET",
                message=(
                    "The draft may be longer than the selected length."
                ),
            )
        )

    if not issues:
        issues.append(
            ValidationIssue(
                severity="info",
                code="BASIC_CHECKS_PASSED",
                message=(
                    "Basic automated checks passed; manually verify "
                    "the proposal before sending."
                ),
            )
        )

    return issues
