import asyncio
import os
from uuid import uuid4

import httpx
from fastapi import APIRouter, HTTPException, Request
from ....core.limiter import limiter
from pydantic import BaseModel, Field
from ....db.usage import get_usage, reserve_usage, release_usage
from ....core.config import settings

router = APIRouter(prefix="/api/v1/cover-letters", tags=["Cover Letters"])

RETRYABLE_STATUS_CODES = {408, 429, 500, 502, 503, 504}
REQUEST_TIMEOUT_SECONDS = 18.0


class CoverLetterRequest(BaseModel):
    job_description: str = Field(min_length=20, max_length=20000)
    skills: list[str] = Field(default_factory=list, max_length=40)
    tone: str = "Professional"


class CoverLetterResponse(BaseModel):
    content: str
    warnings: list[str] = Field(default_factory=list)
    document_type: str = "cover_letter"
    demo_mode: bool = False


def _demo_cover_letter(request: CoverLetterRequest) -> str:
    skills = ", ".join(s.strip() for s in request.skills if s.strip()) or "the skills relevant to this role"
    return (
        "Dear Hiring Manager,\n\n"
        "I am writing to express my interest in the opportunity described. "
        f"My background includes skills in {skills}, and I would welcome the chance "
        "to apply them to your team's needs.\n\n"
        "I would begin by confirming the role's priorities, aligning my work with "
        "your expectations, and communicating progress clearly. I value reliable, "
        "thoughtful work and collaboration, and I would be glad to discuss how my "
        "experience may fit your requirements.\n\n"
        "Thank you for your time and consideration. I look forward to the opportunity "
        "to discuss the role further.\n\n"
        "Sincerely,\n[Your Name]"
    )


def _build_prompt(request: CoverLetterRequest) -> str:
    skills = ", ".join(request.skills) if request.skills else "Not provided"
    return (
        "Write a tailored, professional cover letter based only on the information below. "
        "Do not invent employers, qualifications, achievements, years of experience, or metrics. "
        "Use a natural tone, keep it concise (about 3-5 paragraphs), and return only the letter text.\n\n"
        f"Requested tone: {request.tone}\n"
        f"Skills: {skills}\n"
        f"Job description:\n{request.job_description}"
    )


async def _generate_with_provider(request: CoverLetterRequest) -> str:
    if not settings.llm_api_key or not settings.llm_model:
        raise RuntimeError("LLM_API_KEY or LLM_MODEL is not configured")

    endpoint = settings.llm_base_url.rstrip("/")
    if not endpoint.endswith("/chat/completions"):
        endpoint += "/chat/completions"

    primary_model = settings.llm_model.strip()
    fallback_model = os.getenv("LLM_FALLBACK_MODEL", "").strip()
    models = [primary_model]
    if fallback_model and fallback_model != primary_model:
        models.append(fallback_model)

    headers = {"Authorization": f"Bearer {settings.llm_api_key}"}
    payload_base = {
        "temperature": 0.4,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a careful job-application writing assistant. "
                    "Never fabricate personal facts. Return only the requested cover letter."
                ),
            },
            {"role": "user", "content": _build_prompt(request)},
        ],
    }
    last_error = None

    async with httpx.AsyncClient(
        timeout=httpx.Timeout(REQUEST_TIMEOUT_SECONDS, connect=8.0)
    ) as client:
        for model_index, model in enumerate(models):
            attempts = 1 if model_index == 0 and len(models) > 1 else 2
            for attempt in range(attempts):
                try:
                    response = await client.post(
                        endpoint,
                        headers=headers,
                        json={**payload_base, "model": model},
                    )
                    response.raise_for_status()
                    data = response.json()
                    content = data["choices"][0]["message"]["content"]
                    if not isinstance(content, str) or not content.strip():
                        raise ValueError("The AI provider returned an empty cover letter")
                    if model_index > 0:
                        print(f"Cover letter generation succeeded using fallback model: {model}")
                    return content.strip()

                except httpx.HTTPStatusError as exc:
                    last_error = exc
                    status = exc.response.status_code
                    print(f"Cover letter provider model {model} returned HTTP {status}.")
                    if status not in RETRYABLE_STATUS_CODES:
                        raise
                    if attempt + 1 < attempts:
                        await asyncio.sleep(1.5 * (attempt + 1))

                except (httpx.TimeoutException, httpx.ConnectError) as exc:
                    last_error = exc
                    print(f"Cover letter provider model {model} failed: {type(exc).__name__}.")
                    if attempt + 1 < attempts:
                        await asyncio.sleep(1.5 * (attempt + 1))

    if last_error:
        raise last_error
    raise RuntimeError("Cover letter generation failed without an error detail")




@router.post("/generate", response_model=CoverLetterResponse)
@limiter.limit("10/day")
async def generate_cover_letter(
    request: Request,
    payload: CoverLetterRequest,
):
    ip = request.client.host if request.client else "unknown"

    if not reserve_usage(ip, "cover_letters"):
        raise HTTPException(
            status_code=429,
            detail="Daily cover letter limit reached. Try again tomorrow.",
        )

    try:
        content = await _generate_with_provider(payload)

    except (
        httpx.TimeoutException,
        httpx.ConnectError,
        httpx.HTTPStatusError,
        RuntimeError,
    ):
        # Demo responses do not consume the daily usage quota.
        release_usage(ip, "cover_letters")

        return CoverLetterResponse(
            content=_demo_cover_letter(payload),
            warnings=[
                "Demo mode: the AI provider was unavailable. "
                "This fallback draft does not count toward your daily quota."
            ],
            demo_mode=True,
        )

    except Exception as exc:
        release_usage(ip, "cover_letters")

        print(
            f"Cover letter generation error: "
            f"{type(exc).__name__}: {exc}"
        )

        raise HTTPException(
            status_code=500,
            detail="Cover letter generation failed.",
        ) from exc

    return CoverLetterResponse(
        content=content,
        demo_mode=False,
    )
