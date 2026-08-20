# NovaCRM AI — Revenue Intelligence Platform

> AI-powered, multi-tenant CRM that brings lead scoring, sales outreach, pipeline intelligence, and a context-aware Revenue Copilot into one SaaS platform.

**Portfolio project · Full-stack engineering · AI engineering · SaaS architecture**

[![Backend](https://img.shields.io/badge/backend-FastAPI-0f172a?style=flat-square)](#architecture) [![Frontend](https://img.shields.io/badge/frontend-React%20%2F%20Vite-0f172a?style=flat-square)](#architecture) [![Database](https://img.shields.io/badge/database-PostgreSQL-0f172a?style=flat-square)](#architecture) [![AI](https://img.shields.io/badge/AI-Google%20Gemini-0f172a?style=flat-square)](#ai-workspace) [![CI](https://img.shields.io/badge/CI-GitHub%20Actions-0f172a?style=flat-square)](#production-readiness)

---

## Overview

NovaCRM AI is a full-stack SaaS CRM built around one idea:

**AI should understand the sales workflow, not sit beside it as a generic chatbot.**

Each company receives an isolated workspace where users can manage contacts, leads, deals, activities, and revenue workflows.

AI features operate on CRM context to help sales teams identify high-intent leads, create personalized outreach, and decide which opportunities deserve attention.

---

## Core Features

### Multi-Tenant CRM

- Company-based tenant isolation
- Users belong to a company workspace
- Contacts, leads, deals, and activities are tenant-scoped
- Authenticated requests use the user's `company_id`

### Authentication

- Company/workspace signup
- Secure login
- JWT-based authentication
- Password hashing
- Protected API routes

### Revenue Dashboard

Track pipeline value, won revenue, open opportunities, deal stages, customer activity, and lead performance.

### AI Lead Scoring

Gemini evaluates CRM context and produces a `0–100` score, buying-intent reasoning, customer context, and sales prioritization.

### AI Follow-Up Generation

Generate personalized sales outreach using contact information, lead context, CRM activity, and buying signals.

### Revenue Copilot

Ask natural-language questions about the current CRM workspace.

```text
Which leads should I prioritize today?
Which opportunities have the strongest buying signals?
What should I follow up on this week?
Draft a follow-up for this customer.
```

The copilot works from CRM context rather than treating every request as a generic AI prompt.

---

## Product Flow

```text
                    NovaCRM AI
                        │
                        ▼
             Authentication & Workspace
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
      Contacts        Leads         Deals
          │             │             │
          └─────────────┼─────────────┘
                        ▼
               CRM Activity Context
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
     AI Scoring     AI Outreach   Revenue Copilot
          │             │             │
          └─────────────┼─────────────┘
                        ▼
               Revenue Intelligence
```

---

## Architecture

```text
┌──────────────────────────────────────────────────────┐
│                  React + Vite                        │
│ Dashboard · Contacts · Leads · Deals · AI Workspace │
└───────────────────────┬──────────────────────────────┘
                        │ REST / JSON
                        ▼
┌──────────────────────────────────────────────────────┐
│                     FastAPI                          │
│ Auth · CRM APIs · AI APIs · Tenant Authorization     │
└───────────────┬──────────────────────┬───────────────┘
                │                      │
                ▼                      ▼
      ┌──────────────────┐    ┌─────────────────────┐
      │    PostgreSQL    │    │    Gemini Service   │
      │ Tenant-scoped    │    │ Scoring · Outreach  │
      │ CRM records      │    │ · Revenue Copilot   │
      └──────────────────┘    └─────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Axios |
| Backend | Python, FastAPI, SQLAlchemy, Pydantic |
| Database | PostgreSQL |
| Authentication | JWT + password hashing |
| AI | Google Gemini API |
| Migrations | Alembic |
| API Documentation | FastAPI / OpenAPI |
| CI/CD | GitHub Actions |
| Version Control | Git + GitHub |

---

## AI Workspace

NovaCRM AI exposes three AI workflows:

1. **Lead scoring** — returns a validated `0–100` score with business reasoning.
2. **Personalized follow-up** — turns CRM and customer context into concise sales outreach.
3. **Revenue Copilot** — answers questions using the current workspace's CRM snapshot.

The copilot receives relevant CRM context so responses can reason about the current workspace.

AI provider failures are surfaced as controlled API errors rather than silently returning fabricated business results.

---

## Security & SaaS Design

NovaCRM AI is designed around a concrete multi-tenant security model:

```text
Company
 ├── Users
 ├── Contacts
 ├── Leads
 ├── Deals
 └── Activities
```

Application queries scope CRM records to the authenticated user's `company_id`, creating a clear tenant-isolation boundary.

For a production deployment, additional hardening can include secure httpOnly authentication cookies, CSRF protection, production secret management, rate limiting, database backups, structured logging, managed PostgreSQL, HTTPS/TLS, and production deployment infrastructure.

---

## Production Readiness

The repository includes GitHub Actions CI for both application layers.

### Backend CI

```text
Checkout → Python 3.12 → Install dependencies → Compile Python modules
```

### Frontend CI

```text
Checkout → Node.js 20 → npm ci → Production build
```

### Protected Main Branch

The `main` branch requires pull requests, successful backend CI, successful frontend CI, and blocks force pushes.

---

## Run Locally

### 1. Clone

```bash
git clone https://github.com/sanjanajaat23-commits/novacrm-ai.git
cd novacrm-ai
```

### 2. PostgreSQL

With Docker:

```bash
docker run --name novacrm-db \
  -e POSTGRES_USER=crm_user \
  -e POSTGRES_PASSWORD=crm_pass \
  -e POSTGRES_DB=ai_crm \
  -p 5432:5432 \
  -d postgres:16
```

### 3. Backend

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

### 4. Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

---

## Demo Workflow

1. Create a company workspace.
2. Create or log in as a user.
3. Add realistic customer profiles.
4. Create leads with buying signals.
5. Run **Score with AI**.
6. Review the AI reasoning.
7. Generate a personalized follow-up.
8. Open **Revenue Copilot**.
9. Ask which opportunities deserve attention.
10. Review the recommended sales actions.

---

## Screenshots

### Revenue Overview

![Revenue Overview](./Screenshot%202026-08-20%20025559.png)

### AI Lead Scoring

![AI Lead Scoring](./Screenshot%202026-08-20%20034420.png)

### Revenue Copilot

![Revenue Copilot](./Screenshot%202026-08-20%20035013.png)

### AI Workspace

![AI Workspace](./Screenshot%202026-08-20%20041506.png)

### Customer Context

![Customer Context](./Screenshot%202026-08-20%20054805.png)

---

## Repository Structure

```text
novacrm-ai/
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
│   ├── alembic.ini
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   └── package.json
├── .github/
│   └── workflows/
│       └── ci.yml
└── README.md
```

---

## Engineering Highlights

This project demonstrates:

- Full-stack application architecture
- REST API design
- Multi-tenant data modeling
- Authentication and authorization
- Relational database design
- Database migrations
- Applied LLM integration
- Context-aware AI workflows
- Frontend/backend integration
- Automated CI
- Protected production branch
- Environment-based configuration
- Explicit AI error handling

---

## Roadmap

- [x] Multi-tenant CRM
- [x] JWT authentication
- [x] AI lead scoring
- [x] AI outreach generation
- [x] Revenue Copilot
- [x] Responsive SaaS UI
- [x] Environment-based configuration
- [x] Database migrations
- [x] GitHub Actions CI
- [x] Protected `main` branch
- [x] Product screenshots
- [ ] Production deployment
- [ ] Public demo environment
- [ ] Automated test expansion
- [ ] Audit logging and observability
- [ ] Role-based team administration

---

## Why NovaCRM AI?

NovaCRM AI explores a practical engineering question:

> **How can AI be embedded into everyday revenue workflows without losing the structure, permissions, and context of a real SaaS product?**

The project combines full-stack engineering, API design, relational data modeling, authentication, tenant isolation, CI/CD, and applied LLM integration into one product concept.

---

## Project Status

**Phase 1 — Production Readiness**

The core SaaS CRM, AI workflows, CI pipeline, protected main branch, and product documentation are in place.

The next stage is deployment and production infrastructure rather than adding unnecessary demo features.

---

## License

This project is currently presented as a portfolio project.
