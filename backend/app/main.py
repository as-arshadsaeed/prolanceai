from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from .core.config import settings
from .core.limiter import limiter

from .api.v1.endpoints.proposals import router as proposals_router
from .api.v1.endpoints.cover_letters import router as cover_letters_router
from .api.v1.endpoints.usage import router as usage_router


app = FastAPI(
    title="Prolance AI API",
    version="0.1.0",
)

app.state.limiter = limiter
app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list({
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        settings.frontend_origin,
    }),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(proposals_router)
app.include_router(cover_letters_router)
app.include_router(usage_router)


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}