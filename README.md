# NovaCRM — AI Revenue Intelligence Platform

> A multi-tenant CRM that combines pipeline management with AI lead scoring, sales outreach generation, and a context-aware CRM copilot.

**Portfolio project · Full-stack · AI engineering · SaaS architecture**

[![Backend](https://img.shields.io/badge/backend-FastAPI-0f172a?style=flat-square)](#architecture) [![Frontend](https://img.shields.io/badge/frontend-React%20%2F%20Vite-0f172a?style=flat-square)](#architecture) [![Database](https://img.shields.io/badge/database-PostgreSQL-0f172a?style=flat-square)](#architecture) [![AI](https://img.shields.io/badge/AI-Gemini-0f172a?style=flat-square)](#ai-workspace)

## What this demonstrates

NovaCRM is intentionally built as a **real SaaS-style system**, not a static AI demo. Each customer workspace is isolated by `company_id`, authenticated users access only their tenant's records, and AI features operate on CRM context rather than generic prompts.

### Core capabilities

- **Multi-tenant SaaS** — companies, users, contacts, leads and deals are tenant-scoped.
- **JWT authentication** — company signup and secure login flow.
- **Revenue dashboard** — pipeline value, won revenue, open opportunities and customer activity.
- **AI lead scoring** — Gemini evaluates conversion likelihood and explains the score.
- **AI outreach** — generates concise, context-aware follow-up emails.
- **CRM copilot** — ask natural-language questions against the current CRM context.
- **Production-minded configuration** — environment-based API/database settings and explicit AI error handling.
- **Responsive product UI** — desktop and mobile layouts with a consistent SaaS design system.

## Product flow

```text
Customer signup
      ↓
Private company workspace
      ↓
Contacts + customer context
      ↓
Leads + pipeline
      ↓
Gemini lead scoring ──→ priority + reasoning
      ↓
AI follow-up generation
      ↓
CRM Copilot ──→ next-best-action questions
```

## Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                     NovaCRM Web App                     │
│                 React + Vite + Axios                   │
└──────────────────────────┬──────────────────────────────┘
                           │ REST / JWT
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    FastAPI Application                  │
│  Auth │ Contacts │ Leads │ Deals │ AI │ Tenant Guards  │
└───────────────┬───────────────────────┬─────────────────┘
                │                       │
                ▼                       ▼
       ┌────────────────┐       ┌────────────────────┐
       │   PostgreSQL   │       │   Gemini Service   │
       │ tenant-scoped  │       │ scoring / email /  │
       │ CRM records    │       │ CRM copilot        │
       └────────────────┘       └────────────────────┘
```

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Axios |
| Backend | Python, FastAPI, SQLAlchemy, Pydantic |
| Database | PostgreSQL |
| Authentication | JWT + password hashing |
| AI | Google Gemini API |
| Migrations | Alembic |
| API documentation | FastAPI / OpenAPI |

## AI workspace

The AI layer exposes three product features:

1. **Lead scoring** — returns a 0–100 score plus a business explanation.
2. **Follow-up drafting** — turns CRM/customer context into a sales email.
3. **CRM copilot** — answers questions using the current workspace's CRM snapshot.

AI provider failures are surfaced as controlled API errors rather than silently returning fabricated business results.

## Security & SaaS design

The database models include a company/tenant boundary, and application queries use the authenticated user's `company_id` to scope CRM records. This gives the project a concrete multi-tenant security story for technical interviews.

For a production deployment, the next security hardening step would be moving browser authentication from `localStorage` to secure, httpOnly cookies plus CSRF protection.

## Run locally

### 1. Clone and enter the project

```bash
git clone https://github.com/sanjanajaat23-commits/enterprise-ai-crm-saas.git
cd enterprise-ai-crm-saas
```

### 2. PostgreSQL

With Docker:

```bash
docker run --name novacrm-db \
  -e POSTGRES_USER=crm_user \
  -e POSTGRES_PASSWORD=crm_pass \
  -e POSTGRES_DB=ai_crm \
  -p 5432:5432 -d postgres:16
```

### 3. Backend

Windows PowerShell:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Set your values in `backend/.env`:

```env
DATABASE_URL=postgresql://crm_user:crm_pass@localhost:5432/ai_crm
SECRET_KEY=replace-with-a-long-random-secret
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash
FRONTEND_ORIGINS=http://localhost:5173
```

Start the API:

```powershell
python -m uvicorn app.main:app --reload
```

API docs: `http://127.0.0.1:8000/docs`

### 4. Frontend

In a second terminal:

```powershell
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

Start:

```powershell
npm run dev
```

Open `http://localhost:5173`.

### 5. Demo workflow

1. Create a company workspace.
2. Add 3–5 realistic customer profiles and notes.
3. Create leads with buying signals and interaction context.
4. Run **Score with AI** on the leads.
5. Generate a follow-up email.
6. Open **AI Workspace** and ask which opportunities deserve attention.

## Repository structure

```text
enterprise-ai-crm-saas/
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── gemini_service.py
│   │   ├── security.py
│   │   ├── database.py
│   │   ├── config.py
│   │   └── main.py
│   ├── alembic/
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
└── README.md
```

## Engineering roadmap

- [x] Multi-tenant data model
- [x] JWT authentication
- [x] AI lead scoring
- [x] AI outreach generation
- [x] CRM AI assistant
- [x] Responsive SaaS UI
- [x] Environment-based configuration
- [x] Explicit AI error handling
- [ ] Automated test suite + CI expansion
- [ ] Production deployment
- [ ] Audit logging / observability
- [ ] Role-based team administration

## Why this project exists

NovaCRM was built to explore a practical question: **how can AI be embedded into everyday revenue workflows without losing the structure, permissions and context of a real SaaS product?**

The project combines full-stack engineering, API design, relational data modeling, authentication, tenant isolation and applied LLM integration in one deployable product concept.
