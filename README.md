# AI CRM SaaS Enterprise v3 — Setup Guide

Stack: **FastAPI + PostgreSQL** (backend) · **React/Vite** (frontend) · **Gemini API** (AI features)

## What's included
- Multi-tenant data model (each signup = its own `Company`, isolated data)
- JWT auth (signup/login)
- Contacts, Leads, Deals CRUD
- AI features via Gemini:
  - **Lead scoring** — scores a lead 0–100 with a reason
  - **Email drafting** — generates a follow-up email for a contact
  - **Chat assistant** — answers questions about your CRM data

---

## 1. Get a Gemini API key
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API key"
3. Copy it — you'll paste it into `backend/.env` in step 3.

## 2. Set up PostgreSQL
Easiest with Docker:
```bash
docker run --name ai-crm-db -e POSTGRES_USER=crm_user -e POSTGRES_PASSWORD=crm_pass \
  -e POSTGRES_DB=ai_crm -p 5432:5432 -d postgres:16
```
(No Docker? Install Postgres locally and create a database called `ai_crm`.)

## 3. Backend setup
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Now edit .env and paste your GEMINI_API_KEY, and set SECRET_KEY to a random string
# You can generate one with: python -c "import secrets; print(secrets.token_hex(32))"

uvicorn app.main:app --reload --port 8000
```
Backend is now running at http://localhost:8000. Interactive API docs at http://localhost:8000/docs — good for testing endpoints directly before wiring up the frontend.

## 4. Frontend setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at http://localhost:5173.

## 5. Use it
1. Open http://localhost:5173 → "Sign up company" → creates your tenant + admin user
2. Go to **Dashboard** → add a few contacts (put realistic notes in the notes field — this becomes AI context)
3. Go to **Leads** → create a lead for a contact, paste in some interaction notes
4. Click **"Score with Gemini"** → watch it call the real Gemini API and return a score + reasoning
5. Click **"Draft follow-up email"** → Gemini writes an email using that contact's notes
6. Go to **AI Assistant** → ask things like *"Which leads should I prioritize?"* — it answers using your actual CRM data as context

---

## Architecture notes (why it's built this way)
- **Multi-tenancy**: every table has a `company_id`. Every query filters by the logged-in user's `company_id`, so tenants never see each other's data. This is the standard pattern for CRM/SaaS at this stage — you can move to schema-per-tenant or DB-per-tenant later if you need harder isolation for enterprise contracts.
- **JWT auth**: stateless, works well behind a load balancer. Token is stored in `localStorage` on the frontend for simplicity — for production, consider httpOnly cookies to reduce XSS risk.
- **Gemini calls are centralized** in `backend/app/gemini_service.py` — one place to change models, add retries, or swap providers later.
- **`Base.metadata.create_all`** auto-creates tables for local dev. For production, replace with **Alembic migrations** (the package is already in `requirements.txt`) so schema changes are versioned and reversible.

## Next steps to make this production/enterprise-ready
1. **Migrations**: `alembic init alembic`, then generate a migration instead of relying on `create_all`.
2. **Role-based access control**: you have `is_admin` on `User` already — add permission checks (e.g. only admins can invite/remove users).
3. **Rate limiting & retries** around Gemini calls (the SDK can throw on quota/network errors — wrap in try/except and return a friendly error).
4. **Background jobs**: for bulk lead scoring, use a task queue (Celery/RQ) instead of blocking the request.
5. **Deployment**: containerize both services (Dockerfiles), deploy backend to Render/Fly.io/AWS, frontend to Vercel/Netlify, Postgres to a managed provider (RDS, Neon, Supabase).
6. **Billing**: integrate Stripe for subscription tiers if you're monetizing as SaaS.
7. **Audit logging**: log AI calls (who asked what, what was returned) — useful for enterprise trust/compliance asks.

## Project structure
```
ai-crm/
├── backend/
│   ├── app/
│   │   ├── routers/        # auth, contacts, leads, deals, ai
│   │   ├── models.py       # SQLAlchemy models
│   │   ├── schemas.py      # Pydantic request/response models
│   │   ├── gemini_service.py
│   │   ├── security.py     # JWT + password hashing
│   │   ├── database.py
│   │   ├── config.py
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── pages/           # Login, Dashboard, Leads, AIAssistant
    │   ├── api.js
    │   └── App.jsx
    └── package.json
```
