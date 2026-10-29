import asyncio
import json
import os
from uuid import uuid4

import httpx

from ..core.config import settings
from ..prompts.prompts import SYSTEM_PROMPT
from ..schemas.schemas import ProposalRequest, ProposalSection

# Keep each provider attempt short enough for the frontend request deadline.
REQUEST_TIMEOUT_SECONDS = 12.0
CONNECT_TIMEOUT_SECONDS = 8.0
RETRYABLE_STATUS_CODES = {408, 429, 500, 502, 503, 504}


def demo_proposal(request: ProposalRequest) -> ProposalSection:
    skills = ", ".join(request.skills[:5]) or "the skills required for this project"
    evidence = request.portfolio_evidence[:3] or (
        [request.experience_summary.strip()]
        if request.experience_summary.strip()
        else [
            "I can share relevant project examples once I know which experience "
            "best fits your requirements."
        ]
    )

    return ProposalSection(
        opening=(
            f"Hello, I’d be glad to help with this project. "
            f"My relevant skills include {skills}."
        ),
        understanding=(
            "From your brief, the priority is to deliver the requested work "
            "reliably, with clear communication and a maintainable result."
        ),
        approach=(
            "I would confirm the scope and acceptance criteria first, break "
            "the work into milestones, implement the agreed solution, and test "
            "it against the requirements. I’ll flag assumptions early rather "
            "than guess."
        ),
        relevant_evidence=evidence,
        questions=[
            "Are there existing systems, constraints, or integrations I should account for?",
            "What are the most important acceptance criteria for the first milestone?",
        ],
        closing=(
            f"My rate is {request.hourly_rate}. I’m happy to discuss the scope "
            "and agree on a practical first milestone."
        ),
    )


async def call_llm(request: ProposalRequest) -> ProposalSection:
    if not settings.llm_api_key or not settings.llm_model:
        raise RuntimeError("LLM_API_KEY or LLM_MODEL is not configured.")

    primary_model = settings.llm_model.strip()
    fallback_model = os.getenv("LLM_FALLBACK_MODEL", "gemini-3.5-flash-lite").strip()
    models = [primary_model]
    if fallback_model and fallback_model != primary_model:
        models.append(fallback_model)

    user_payload = {
        "job_description": request.job_description,
        "skills": request.skills,
        "experience_summary": request.experience_summary,
        "portfolio_evidence": request.portfolio_evidence,
        "hourly_rate": request.hourly_rate,
        "tone": request.tone,
        "length": request.length,
    }
    base_payload = {
        "temperature": 0.3,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": json.dumps(user_payload, ensure_ascii=False),
            },
        ],
    }

    endpoint = settings.llm_base_url.rstrip("/")
    if not endpoint.endswith("/chat/completions"):
        endpoint += "/chat/completions"
    headers = {"Authorization": f"Bearer {settings.llm_api_key}"}
    last_error = None

    async with httpx.AsyncClient(
        timeout=httpx.Timeout(REQUEST_TIMEOUT_SECONDS, connect=CONNECT_TIMEOUT_SECONDS)
    ) as client:
        for model_index, model in enumerate(models):
            # One try on the primary model; up to two tries on the fallback model.
            attempts = 1 if model_index == 0 else 2
            for attempt in range(attempts):
                payload = {**base_payload, "model": model}
                try:
                    response = await client.post(endpoint, headers=headers, json=payload)
                    response.raise_for_status()
                    data = response.json()
                    content = data["choices"][0]["message"]["content"]
                    proposal = ProposalSection.model_validate(json.loads(content))
                    if model_index > 0:
                        print(f"AI provider fallback succeeded using model: {model}")
                    return proposal

                except httpx.HTTPStatusError as exc:
                    last_error = exc
                    status = exc.response.status_code
                    print(f"AI provider model {model} returned HTTP {status}.")
                    print(f"Provider response: {exc.response.text[:1000]}")
                    if status not in RETRYABLE_STATUS_CODES:
                        raise
                    if model_index == 0:
                        print(f"Switching to fallback model: {fallback_model}")
                        break
                    if attempt == attempts - 1:
                        break
                    await asyncio.sleep(1.5 * (attempt + 1))

                except (httpx.TimeoutException, httpx.ConnectError) as exc:
                    last_error = exc
                    print(f"AI provider model {model} failed: {type(exc).__name__}.")
                    if model_index == 0:
                        print(f"Switching to fallback model: {fallback_model}")
                        break
                    if attempt == attempts - 1:
                        break
                    await asyncio.sleep(1.5 * (attempt + 1))

                except httpx.HTTPStatusError as exc:
                    print(
                        f"Final provider HTTP error: {exc.response.status_code} "
                        f"- {exc.response.text[:1000]}"
                    )
                    if exc.response.status_code not in RETRYABLE_STATUS_CODES:
                        raise

                except (httpx.TimeoutException, httpx.ConnectError) as exc:
                    print(
                        f"Final provider connection error: "
                        f"{type(exc).__name__}: {exc}"
                    )

    if last_error:
        raise last_error
    raise RuntimeError("AI provider request failed without an error detail.")


async def generate_proposal(request: ProposalRequest):
    if not settings.llm_api_key or not settings.llm_model:
        return str(uuid4()), demo_proposal(request), True

    try:
        proposal = await call_llm(request)
        return str(uuid4()), proposal, False
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code not in RETRYABLE_STATUS_CODES:
            raise
        print(
            f"Primary and fallback AI models failed (HTTP {exc.response.status_code}); "
            "returning clearly labeled demo draft."
        )
    except (httpx.TimeoutException, httpx.ConnectError) as exc:
        print(
            f"Primary and fallback AI models timed out or could not connect "
            f"({type(exc).__name__}); returning clearly labeled demo draft."
        )

    return str(uuid4()), demo_proposal(request), True
