from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


# ---------- Auth ----------
class CompanySignup(BaseModel):
    company_name: str
    admin_email: EmailStr
    admin_password: str
    admin_full_name: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ---------- Contact ----------
class ContactCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    job_title: Optional[str] = None
    notes: Optional[str] = None


class ContactOut(ContactCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Lead ----------
class LeadCreate(BaseModel):
    contact_id: int
    source: Optional[str] = None
    raw_context: Optional[str] = None


class LeadOut(BaseModel):
    id: int
    contact_id: int
    source: Optional[str]
    status: str
    ai_score: Optional[float]
    ai_score_reason: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Deal ----------
class DealCreate(BaseModel):
    contact_id: int
    title: str
    value: float = 0
    stage: str = "new"


class DealOut(DealCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- AI ----------
class ScoreLeadRequest(BaseModel):
    lead_id: int


class DraftEmailRequest(BaseModel):
    contact_id: int
    goal: str          # e.g. "follow up after demo", "re-engage cold lead"
    tone: str = "professional"


class ChatAssistantRequest(BaseModel):
    question: str
