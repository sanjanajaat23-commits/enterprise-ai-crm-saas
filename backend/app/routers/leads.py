from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Lead, User
from app.schemas import LeadCreate, LeadOut
from app.security import get_current_user

router = APIRouter(prefix="/leads", tags=["leads"])


@router.post("", response_model=LeadOut)
def create_lead(
    payload: LeadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lead = Lead(company_id=current_user.company_id, **payload.model_dump())
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead


@router.get("", response_model=List[LeadOut])
def list_leads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Lead)
        .filter(Lead.company_id == current_user.company_id)
        .order_by(Lead.created_at.desc())
        .all()
    )


@router.get("/{lead_id}", response_model=LeadOut)
def get_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lead = (
        db.query(Lead)
        .filter(Lead.id == lead_id, Lead.company_id == current_user.company_id)
        .first()
    )
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead
