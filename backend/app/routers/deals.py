from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Deal, User
from app.schemas import DealCreate, DealOut
from app.security import get_current_user

router = APIRouter(prefix="/deals", tags=["deals"])


@router.post("", response_model=DealOut)
def create_deal(
    payload: DealCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deal = Deal(company_id=current_user.company_id, **payload.model_dump())
    db.add(deal)
    db.commit()
    db.refresh(deal)
    return deal


@router.get("", response_model=List[DealOut])
def list_deals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Deal)
        .filter(Deal.company_id == current_user.company_id)
        .order_by(Deal.created_at.desc())
        .all()
    )
