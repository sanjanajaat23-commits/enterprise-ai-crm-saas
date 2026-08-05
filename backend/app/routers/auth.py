from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Company
from app.schemas import CompanySignup, Token
from app.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=Token)
def signup(payload: CompanySignup, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.admin_email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    company = Company(name=payload.company_name)
    db.add(company)
    db.flush()  # get company.id before commit

    admin = User(
        company_id=company.id,
        email=payload.admin_email,
        hashed_password=hash_password(payload.admin_password),
        full_name=payload.admin_full_name,
        is_admin=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)

    token = create_access_token({"sub": str(admin.id)})
    return Token(access_token=token)


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token({"sub": str(user.id)})
    return Token(access_token=token)
