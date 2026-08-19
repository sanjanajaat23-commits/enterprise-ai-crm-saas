from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, contacts, leads, deals, ai

app = FastAPI(title="AI CRM SaaS Enterprise v3")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(contacts.router)
app.include_router(leads.router)
app.include_router(deals.router)
app.include_router(ai.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "AI CRM SaaS Enterprise v3"}
