import enum
from datetime import datetime

from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum, Float
)
from sqlalchemy.orm import relationship

from app.database import Base


class DealStage(str, enum.Enum):
    NEW = "new"
    QUALIFIED = "qualified"
    PROPOSAL = "proposal"
    NEGOTIATION = "negotiation"
    WON = "won"
    LOST = "lost"


class Company(Base):
    """Tenant. Every enterprise customer of the SaaS gets one row here."""
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="company")
    contacts = relationship("Contact", back_populates="company")
    leads = relationship("Lead", back_populates="company")
    deals = relationship("Deal", back_populates="company")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="users")


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255))
    phone = Column(String(50))
    job_title = Column(String(255))
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="contacts")
    leads = relationship("Lead", back_populates="contact")


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=False)
    source = Column(String(255))
    status = Column(String(50), default="open")
    ai_score = Column(Float, nullable=True)         # 0-100, set by Gemini
    ai_score_reason = Column(Text, nullable=True)    # explanation from Gemini
    raw_context = Column(Text, nullable=True)        # notes/emails used for scoring
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="leads")
    contact = relationship("Contact", back_populates="leads")


class Deal(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=False)
    title = Column(String(255), nullable=False)
    value = Column(Float, default=0)
    stage = Column(Enum(DealStage), default=DealStage.NEW)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="deals")


class Activity(Base):
    """Log of interactions (emails, calls, notes) used as context for the AI assistant."""
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=True)
    type = Column(String(50))   # call, email, meeting, note
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
