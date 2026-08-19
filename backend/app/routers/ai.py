from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Lead, Contact, Deal, User
from app.schemas import ScoreLeadRequest, DraftEmailRequest, ChatAssistantRequest
from app.security import get_current_user
from app import gemini_service

router = APIRouter(prefix="/ai", tags=["ai"])


def _ai_error(exc: RuntimeError) -> HTTPException:
    return HTTPException(status_code=502, detail=str(exc))


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

    contact = (
        db.query(Contact)
        .filter(Contact.id == lead.contact_id, Contact.company_id == current_user.company_id)
        .first()
    )
    if not contact:
        raise HTTPException(status_code=404, detail="Lead contact not found")

    contact_info = f"Name: {contact.name}, Title: {contact.job_title}, Email: {contact.email}"
    try:
        result = gemini_service.score_lead(contact_info, lead.raw_context or "")
    except RuntimeError as exc:
        raise _ai_error(exc) from exc

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

    try:
        email_body = gemini_service.draft_email(
            contact.name, payload.goal, payload.tone, contact.notes or ""
        )
    except RuntimeError as exc:
        raise _ai_error(exc) from exc

    return {"contact_id": contact.id, "email_body": email_body}


@router.post("/chat")
def chat_assistant(
    payload: ChatAssistantRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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
    for lead in leads:
        lines.append(
            f"- Lead #{lead.id} status={lead.status} ai_score={lead.ai_score} source={lead.source}"
        )
    lines.append("DEALS:")
    for deal in deals:
        lines.append(
            f"- Deal '{deal.title}' stage={deal.stage.value if hasattr(deal.stage, 'value') else deal.stage} value=${deal.value}"
        )

    try:
        answer = gemini_service.chat_assistant(payload.question, "\n".join(lines))
    except RuntimeError as exc:
        raise _ai_error(exc) from exc

    return {"answer": answer}
