from fastapi import APIRouter, Request

from ....db.usage import get_usage

router = APIRouter(
    prefix="/api/v1/usage",
    tags=["Usage"],
)


@router.get("")
async def read_usage(request: Request):
    ip = request.client.host if request.client else "unknown"
    return get_usage(ip)