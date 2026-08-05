from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Contact, User
from app.schemas import ContactCreate, ContactOut
from app.security import get_current_user

router = APIRouter(prefix="/contacts", tags=["contacts"])


@router.post("", response_model=ContactOut)
def create_contact(
    payload: ContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contact = Contact(company_id=current_user.company_id, **payload.model_dump())
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


@router.get("", response_model=List[ContactOut])
def list_contacts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Contact)
        .filter(Contact.company_id == current_user.company_id)
        .order_by(Contact.created_at.desc())
        .all()
    )


@router.get("/{contact_id}", response_model=ContactOut)
def get_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contact = (
        db.query(Contact)
        .filter(Contact.id == contact_id, Contact.company_id == current_user.company_id)
        .first()
    )
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact
