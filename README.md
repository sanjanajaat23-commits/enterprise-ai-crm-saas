# NovaCRM — AI Revenue Intelligence Platform

> A multi-tenant CRM that combines pipeline management with AI lead scoring, sales outreach generation, and a context-aware revenue copilot.

**Portfolio project · Full-stack · AI engineering · SaaS architecture**

[![Backend](https://img.shields.io/badge/backend-FastAPI-0f172a?style=flat-square)](#architecture) [![Frontend](https://img.shields.io/badge/frontend-React%20%2F%20Vite-0f172a?style=flat-square)](#architecture) [![Database](https://img.shields.io/badge/database-PostgreSQL-0f172a?style=flat-square)](#architecture) [![AI](https://img.shields.io/badge/AI-Gemini-0f172a?style=flat-square)](#ai-workspace)

## Overview

NovaCRM is a SaaS-style CRM built around a simple idea: **AI should understand the sales workflow, not sit beside it as a generic chatbot.**

Each company gets an isolated workspace. Users manage contacts, leads and opportunities, then use AI to score buying intent, generate outreach and ask questions about the current pipeline.

## Core capabilities

- **Multi-tenant SaaS** — companies, users, contacts, leads and deals are tenant-scoped.
- **JWT authentication** — company signup and secure login flow.
- **Revenue dashboard** — pipeline value, won revenue, open opportunities and customer activity.
- **AI lead scoring** — Gemini evaluates conversion likelihood and explains the score.
- **AI outreach** — generates concise, context-aware follow-up emails.
- **Revenue copilot** — answers natural-language questions against the current CRM context.
- **Production-minded configuration** — environment-based API/database settings and controlled AI errors.
- **Responsive product UI** — consistent SaaS design across desktop and mobile layouts.

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
Revenue Copilot ──→ next-best-action questions
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
       │ CRM records    │       │ revenue copilot    │
       └────────────────┘       └────────────────────┘
```

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Axios |
| Backend | Python, FastAPI, SQLAlchemy, Pydantic |
| Database | PostgreSQL-compatible relational architecture |
| Authentication | JWT + password hashing |
| AI | Google Gemini API |
| Migrations | Alembic |
| API documentation | FastAPI / OpenAPI |

## AI workspace

Nova exposes three AI workflows:

1. **Lead scoring** — returns a validated 0–100 score plus business reasoning.
2. **Follow-up drafting** — turns contact and CRM context into concise sales outreach.
3. **Revenue copilot** — answers questions using the current workspace's CRM snapshot.

The copilot receives related contact identity and CRM context, so user-facing answers can reference people by name instead of internal database IDs.

AI provider failures are surfaced as controlled API errors rather than silently returning fabricated business results.

## Security & SaaS design

Application queries scope CRM records to the authenticated user's `company_id`, giving the project a concrete multi-tenant isolation story.

For a production deployment, the next authentication hardening step would be moving browser authentication from `localStorage` to secure, httpOnly cookies plus CSRF protection.

## Run locally

### 1. Clone

```bash
git clone https://github.com/sanjanajaat23-commits/enterprise-ai-crm-saas.git
cd enterprise-ai-crm-saas
```

### 2. Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Set your values in `backend/.env`:

```env
DATABASE_URL=your-database-url
SECRET_KEY=replace-with-a-long-random-secret
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=your-supported-gemini-model
FRONTEND_ORIGINS=http://localhost:5173
```

Start the API:

```powershell
python -m uvicorn app.main:app --reload --port 8000
```

API docs: `http://127.0.0.1:8000/docs`

### 3. Frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## Demo workflow

1. Create a company workspace.
2. Add realistic customer profiles and notes.
3. Create leads with buying signals and interaction context.
4. Run **Score with AI**.
5. Generate a personalized follow-up.
6. Open **AI Workspace** and ask which opportunities deserve attention.

## Screenshots

The final demo captures highlight:

- Revenue Overview
- AI Lead Scoring
- Revenue Copilot
- Personalized AI Follow-up
- Customer Context

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

NovaCRM explores a practical engineering question: **how can AI be embedded into everyday revenue workflows without losing the structure, permissions and context of a real SaaS product?**

The project brings together full-stack engineering, REST API design, relational data modeling, authentication, tenant isolation and applied LLM integration in one product concept.
