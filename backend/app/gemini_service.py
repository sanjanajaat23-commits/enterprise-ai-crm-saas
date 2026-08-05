"""
Central place for all Gemini API calls.
Uses the official google-generativeai SDK.
Get an API key at https://aistudio.google.com/app/apikey
"""
import json
import google.generativeai as genai

from app.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)


def _model():
    return genai.GenerativeModel(settings.GEMINI_MODEL)


def score_lead(contact_info: str, context: str) -> dict:
    """
    Ask Gemini to score a lead 0-100 and explain why.
    Returns {"score": float, "reason": str}
    """
    prompt = f"""You are a CRM lead-scoring assistant for a B2B sales team.

Contact info:
{contact_info}

Interaction history / notes:
{context or "No additional context provided."}

Score this lead's likelihood to convert to a paying customer on a scale of 0-100.
Respond ONLY with valid JSON, no markdown fences, in exactly this shape:
{{"score": <number 0-100>, "reason": "<one or two sentence explanation>"}}
"""
    response = _model().generate_content(prompt)
    text = response.text.strip()
    text = text.replace("```json", "").replace("```", "").strip()
    try:
        data = json.loads(text)
        return {"score": float(data["score"]), "reason": data["reason"]}
    except (json.JSONDecodeError, KeyError, ValueError):
        return {"score": 50.0, "reason": "AI response could not be parsed; default score applied."}


def draft_email(contact_name: str, goal: str, tone: str, context: str) -> str:
    """
    Ask Gemini to draft a follow-up / outreach email.
    Returns plain text email body.
    """
    prompt = f"""Write a {tone} sales outreach email to {contact_name}.

Goal of this email: {goal}

Relevant context about this contact/deal:
{context or "No additional context provided."}

Rules:
- Keep it under 150 words.
- Do not use placeholder brackets like [Your Name] except for the sign-off name and company.
- Write only the email body, no subject line, no explanation, no markdown.
"""
    response = _model().generate_content(prompt)
    return response.text.strip()


def chat_assistant(question: str, crm_context: str) -> str:
    """
    Answer a natural-language question about the company's CRM data.
    crm_context should be a compact text summary of relevant leads/deals/contacts.
    """
    prompt = f"""You are an AI assistant embedded in a CRM product. You answer questions
using ONLY the CRM data provided below. If the data doesn't contain the answer, say so honestly.

CRM DATA SNAPSHOT:
{crm_context}

USER QUESTION:
{question}

Answer concisely and helpfully, referencing specific records where relevant.
"""
    response = _model().generate_content(prompt)
    return response.text.strip()
