# GramUdyog.AI

SIH26091: AI-Driven Hyper-Local Business Advisory and Financial Structuring Assistant for Rural Micro-Entrepreneurs.

**Status: foundation scaffold only.** The React shell and FastAPI liveness endpoint are implemented. Assessment, financial calculations, maps, persistence, multilingual support, voice, officer review and DPR export remain to be built. No market dataset is loaded.

## Repository structure

```text
Gram_Udyog_AI/
  frontend/
    src/
      app/           React shell
      lib/           API client
      types/         Evidence contracts
      styles.css     Tailwind and accessibility styles
    .env.example
    package.json
  backend/
    app/
      api/           Versioned endpoints
      core/          Environment settings
      domain/
        finance/     Reserved deterministic calculations
        schemes/     Reserved versioned routing
      models/        Reserved persistence models
      repositories/  Reserved data adapters
      schemas/       Evidence contracts
      services/ai/   Reserved explanation providers
    tests/
    .env.example
    Dockerfile
    pyproject.toml
  database/
    init/            PostGIS bootstrap
    migrations/      Migration policy
    seeds/           Demo data policy
  docs/
  .env.example
  compose.yaml
```

## Setup (PowerShell)

Requires Node.js 22.12+ or 24 LTS, Python 3.11+, and optional Docker Compose.

API terminal:
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python -m pip install -e ".[dev]"
Copy-Item .env.example .env
.\.venv\Scripts\python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Frontend terminal:
```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open http://127.0.0.1:5173 and select Check backend connection.
API docs: http://127.0.0.1:8000/docs.
The health endpoint reports process liveness only, not database readiness.
No credentials are required for this scaffold.

Optional containers, from repository root:
```powershell
Copy-Item .env.example .env
# Set POSTGRES_PASSWORD in root .env first.
docker compose up --build -d
```
Use the container API instead of the local API process. Frontend still runs through npm.
Compose provisions PostGIS, but the API does not yet query it.
Bootstrap SQL runs only on initial database volume creation.
Supabase is not configured. Never expose database credentials in VITE_ variables.

## Checks
```powershell
cd frontend
npm run lint
npm run build
cd ../backend
.\.venv\Scripts\python -m pytest
.\.venv\Scripts\python -m ruff check .
```

Frontend dependencies are locked after installation. Backend ranges should be locked before deployment.

## Security and truthfulness

Only example environment files are tracked. No personal data or identity documents are collected.
CORS permits local origins; it is not authorization. No officer write endpoints exist yet.
The shell is English only. Leaflet is installed as a dependency; no map or tile request is implemented.
No AI provider is called. All market data and financial outputs are unavailable at this milestone.
See docs/IMPLEMENTATION_PLAN.md for the remaining scope.
