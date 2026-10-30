# GramUdyog.AI

SIH26091: AI-Driven Hyper-Local Business Advisory and Financial Structuring Assistant for Rural Micro-Entrepreneurs.

**Status: local MVP prototype.** The mobile intake flow, clearly labelled synthetic evidence prompts,
qualitative category comparison, deterministic finance simulator, save/retrieve, token-protected
officer audit, and printable draft report are implemented. The market coverage is not a real
survey; no actual customer counts, competitor density, or local price observations exist.
Local development uses SQLite; a PostgreSQL adapter is available when a database URL is configured. Geospatial PostGIS queries are not yet integrated.

## Repository structure

```text
Gram_Udyog_AI/
  frontend/
    src/
      app/           Assessment journey shell
      features/      Intake, evidence, finance, comparison, report, officer, voice
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
POST /api/v1/assessments/preview validates inputs. POST /evidence supplies synthetic prompts for the five selected demonstration localities. POST /finance/calculate provides an indicative plan. POST /compare makes qualitative comparisons. POST /assessments saves confirmed details and optional calculated financial inputs locally.
No credentials are required for this scaffold.

Optional containers, from repository root:
```powershell
Copy-Item .env.example .env
# Set POSTGRES_PASSWORD in root .env first.
docker compose up --build -d
```
Use the container API instead of the local API process. Frontend still runs through npm.
Compose provisions PostGIS, but the API currently persists to its SQLite volume and does not yet query PostGIS.
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
The entrepreneur and officer interfaces support English and Tamil; user-entered notes remain in the language in which they were written. Audio guidance uses browser speech synthesis; Tamil voice playback requires a device with a Tamil voice. Leaflet is installed, but there is no map because coordinates and competitor locations are unavailable.
No AI provider is called. Synthetic market prompts are labelled sample with unavailable observation dates. Finance uses user assumptions and versioned prototype defaults, never a sanction.
See docs/IMPLEMENTATION_PLAN.md for the remaining scope.



## Officer review in local development

Set a strong OFFICER_API_TOKEN in backend/.env before starting the API. The officer form
accepts this token in page memory and sends it to the backend; it is never placed in VITE_
variables or persisted by the UI. Without the token, officer endpoints return 503.
Deploy behind HTTPS with proper identity and role management before real officer use.
Review and field-observation events are append-only. Each saved assessment remains an immutable input snapshot; the reviewer name is self-reported because this prototype uses a shared officer token.

## Current limits

- SQLite is the local default; a configured PostgreSQL connection supports saved records.
  PostGIS geospatial queries and a competitor map are not implemented.
- The Coimbatore demo provides synthetic prompts, not observed market statistics or verified
  sources. Other districts show unavailable coverage. Category costs are user assumptions.
- Scheme defaults came from the supplied SIH brief and need confirmation against current
  official documents. The prototype uses interest-only moratorium and full repayment tenure
  afterward; no subsidy, fees, tax, or insurance are included.
- Draft report print/PDF is browser print output. Report notes are not persisted.
- No AI provider is called; the explanatory copy is deterministic. The API has no account
  authentication for entrepreneur records; the random assessment ID is a bearer-like locator.
  Avoid entering sensitive information. Production access control is still required.
- Headless Chrome checks covered mobile and desktop layout, the main journey, offline errors,
  and PDF generation. Physical-device, screen-reader, Tamil voice playback, Docker and PostGIS
  runtime checks remain outstanding.


## Five-region seasonal demo

The intake dropdown selects one of Sulur (Coimbatore), Palladam (Tiruppur), Perundurai
(Erode), Omalur (Salem), or Melur (Madurai). Location names are demonstration selections,
not verified 5–10 km observations. Seasonal indices are invented scenario values, not
observed sales or rainfall data; the IMD reference explains the general Tamil Nadu
northeast monsoon context, not these numbers. Observation dates are unavailable.
English and Tamil interface labels, demo evidence, financial explanations, and draft-report labels are available; user-entered notes are not translated automatically.

Location and common amount choices use dropdowns. Presets limit precision; officer identity and field notes still require text entry. Demo coverage requires the matching district, block, and locality.


## Stage 3 local tools

- Field survey checklist: prompts for customers, competing businesses, suppliers,
  seasonality and payment habits. The checkboxes are not saved or evidence.
- Officer field observations: save an assessment, configure OFFICER_API_TOKEN in
  backend/.env, then record a source, observation date, reviewer and finding.
  Entries are append-only and can be reloaded using the officer token. The status
  indicates an officer attestation, not independent verification by this system.
  They do not automatically alter the sample evidence or DPR.
- Startup cost builder: select estimates for equipment, premises, initial stock,
  setup and initial working capital. Use the calculated total in the simulator.
- Break-even: (fixed monthly operating costs + debt payment) / contribution margin.
  Contribution margin is the percentage of sales remaining after variable costs;
  exclude variable costs from fixed costs. Results are indicative.
- Saved assessment history: the browser stores up to 20 assessment identifiers;
  the server stores confirmed inputs and the latest calculated financial assumptions in local SQLite. Reopen an assessment to
  revise it and save separately; choose two saved snapshots to compare inputs.
  History is browser-specific and the IDs act as access links: keep them private.
- Audio guidance: uses a matching browser speech-synthesis voice. If Tamil speech
  is absent, the app displays a message and the visible text remains available.

Field observations and saved assessments use SQLite locally or PostgreSQL when configured.
Account-based security and automatic backup are not implemented by this application.


## Vercel durable storage and audio

The Vercel deployment supports PostgreSQL through either DATABASE_URL or POSTGRES_URL.
Connect a PostgreSQL resource to the project's Production environment. The first
successful request creates three app-prefixed tables and indexes; the database user
must have permission to create tables. Saving remains disabled when no database is
configured or the database cannot be reached. Existing local SQLite data is not
automatically migrated. These connection values are secrets and must only be set
in Vercel's server-side environment settings, never in VITE_ variables.

Officer review also requires OFFICER_API_TOKEN on Vercel. The shared token is only
a prototype authorization mechanism; reviewer identities are self-reported.
Audio uses a matching voice installed in the browser or operating system. Voice
discovery can be asynchronous. Tamil playback requires a Tamil voice; the interface
provides text guidance when none is available.
