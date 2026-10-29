import httpx
from fastapi import APIRouter, HTTPException, Request

from ....schemas.schemas import ProposalRequest, ProposalResponse
from ....services.service import generate_proposal
from ....validation.validation import render_full_text, validate_proposal
from ....core.limiter import limiter
from ....db.usage import reserve_usage, release_usage

router = APIRouter(
    prefix="/api/v1/proposals",
    tags=["Proposals"],
)


@router.post("/generate", response_model=ProposalResponse)
@limiter.limit("10/day")
async def create_proposal(
    request: Request,
    payload: ProposalRequest,
):
    ip = request.client.host if request.client else "unknown"

    if not reserve_usage(ip, "proposals"):
        raise HTTPException(
            status_code=429,
            detail="Daily proposal limit reached. Try again tomorrow.",
        )

    try:
        proposal_id, proposal, demo_mode = await generate_proposal(payload)

        return ProposalResponse(
            proposal_id=proposal_id,
            proposal=proposal,
            full_text=render_full_text(proposal),
            validation_issues=validate_proposal(payload, proposal),
            demo_mode=demo_mode,
        )

    except httpx.TimeoutException as exc:
        release_usage(ip, "proposals")
        raise HTTPException(
            status_code=504,
            detail="Proposal generation timed out.",
        ) from exc

    except httpx.HTTPStatusError as exc:
        release_usage(ip, "proposals")
        raise HTTPException(
            status_code=502,
            detail="The AI provider returned an error.",
        ) from exc

    except httpx.RequestError as exc:
        release_usage(ip, "proposals")
        raise HTTPException(
            status_code=502,
            detail="The AI provider could not be reached.",
        ) from exc

    except Exception:
        release_usage(ip, "proposals")
        raise