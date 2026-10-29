# Prolance AI

Full-stack starter: Next.js + TypeScript UI, FastAPI backend, optional OpenAI-compatible LLM API, deterministic validation warnings, and pytest tests.

## Run backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

If `LLM_API_KEY` or `LLM_MODEL` is blank, the API returns a demo draft. Configure both in `backend/.env` to use a compatible chat-completions provider.

## Run frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000. API docs: http://localhost:8000/docs.

## Tests

```bash
cd backend
pip install -r requirements-dev.txt
pytest -q
```

## Production checklist

This starter is not production-ready. Add authentication, per-user authorization, database persistence, rate limits, usage metering, secret management, observability, and a security review. Review generated claims before sending. No marketplace submissions are automated.

Endpoint: `POST /api/v1/proposals/generate`
