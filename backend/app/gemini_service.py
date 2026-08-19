"""Centralized Gemini API integration for CRM AI features."""
import json

import google.generativeai as genai

from app.config import settings


genai.configure(api_key=settings.GEMINI_API_KEY)


def _model():
    return genai.GenerativeModel(settings.GEMINI_MODEL)


def _response_text(response) -> str:
    text = getattr(response, "text", None)
    if not text:
        raise RuntimeError("AI provider returned an empty response")
    return text.strip()


def score_lead(contact_info: str, context: str) -> dict:
    prompt = f"""You are a CRM lead-scoring assistant for a B2B sales team.

Contact info:
{contact_info}

Interaction history / notes:
{context or "No additional context provided."}

Score this lead's likelihood to convert to a paying customer on a scale of 0-100.
Respond ONLY with valid JSON, no markdown fences, in exactly this shape:
{{"score": <number 0-100>, "reason": "<one or two sentence explanation>"}}
"""
    try:
        response = _model().generate_content(prompt)
        text = _response_text(response).replace("```json", "").replace("```", "").strip()
        data = json.loads(text)
        score = float(data["score"])
        reason = str(data["reason"]).strip()
        if not 0 <= score <= 100 or not reason:
            raise ValueError("Invalid lead scoring response")
        return {"score": score, "reason": reason}
    except (json.JSONDecodeError, KeyError, TypeError, ValueError) as exc:
        raise RuntimeError("AI provider returned an invalid lead score") from exc


def draft_email(contact_name: str, goal: str, tone: str, context: str) -> str:
    prompt = f"""Write a {tone} sales outreach email to {contact_name}.

Goal of this email: {goal}

Relevant context about this contact/deal:
{context or "No additional context provided."}

Rules:
- Keep it under 150 words.
- Do not use placeholder brackets like [Your Name] except for the sign-off name and company.
- Write only the email body, no subject line, no explanation, no markdown.
"""
    try:
        return _response_text(_model().generate_content(prompt))
    except Exception as exc:
        raise RuntimeError("AI email generation failed") from exc


def chat_assistant(question: str, crm_context: str) -> str:
    prompt = f"""You are an AI assistant embedded in a CRM product. You answer questions
using ONLY the CRM data provided below. If the data doesn't contain the answer, say so honestly.

CRM DATA SNAPSHOT:
{crm_context}

USER QUESTION:
{question}

Answer concisely and helpfully, referencing specific records where relevant.
"""
    try:
        return _response_text(_model().generate_content(prompt))
    except Exception as exc:
        raise RuntimeError("AI assistant request failed") from exc
