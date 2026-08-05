from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Lead, Contact, Deal, User
from app.schemas import ScoreLeadRequest, DraftEmailRequest, ChatAssistantRequest
from app.security import get_current_user
from app import gemini_service

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/score-lead")
def score_lead(
    payload: ScoreLeadRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lead = (
        db.query(Lead)
        .filter(Lead.id == payload.lead_id, Lead.company_id == current_user.company_id)
        .first()
    )
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    contact = db.query(Contact).filter(Contact.id == lead.contact_id).first()
    contact_info = f"Name: {contact.name}, Title: {contact.job_title}, Email: {contact.email}"

    result = gemini_service.score_lead(contact_info, lead.raw_context or "")

    lead.ai_score = result["score"]
    lead.ai_score_reason = result["reason"]
    db.commit()
    db.refresh(lead)

    return {"lead_id": lead.id, "score": lead.ai_score, "reason": lead.ai_score_reason}


@router.post("/draft-email")
def draft_email(
    payload: DraftEmailRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contact = (
        db.query(Contact)
        .filter(Contact.id == payload.contact_id, Contact.company_id == current_user.company_id)
        .first()
    )
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    context = contact.notes or ""
    email_body = gemini_service.draft_email(contact.name, payload.goal, payload.tone, context)
    return {"contact_id": contact.id, "email_body": email_body}


@router.post("/chat")
def chat_assistant(
    payload: ChatAssistantRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Build a compact snapshot of this company's CRM data as context.
    leads = (
        db.query(Lead)
        .filter(Lead.company_id == current_user.company_id)
        .limit(50)
        .all()
    )
    deals = (
        db.query(Deal)
        .filter(Deal.company_id == current_user.company_id)
        .limit(50)
        .all()
    )

    lines = ["LEADS:"]
    for l in leads:
        lines.append(f"- Lead #{l.id} status={l.status} ai_score={l.ai_score} source={l.source}")
    lines.append("DEALS:")
    for d in deals:
        lines.append(f"- Deal '{d.title}' stage={d.stage.value if hasattr(d.stage,'value') else d.stage} value=${d.value}")

    context = "\n".join(lines)
    answer = gemini_service.chat_assistant(payload.question, context)
    return {"answer": answer}
