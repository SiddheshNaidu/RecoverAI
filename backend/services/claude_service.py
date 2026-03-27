"""Gemini-backed structuring & classification (module name kept for imports)."""

from __future__ import annotations

import asyncio
import json
import logging
import os
import re
from typing import Any

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

logger = logging.getLogger(__name__)

GEMINI_MODEL = "gemini-3.1-flash-lite-preview"

PROMPT_TEMPLATES: dict[str, str] = {
    "knowledge": """
You are a knowledge structuring engine.
Input: raw text or speech transcript.
Output: valid JSON only. No prose. No markdown.
Schema:
{
  "title": "5-8 word descriptive title",
  "domain": "Education|Health|Agriculture|Environment|Livelihood|Other",
  "summary": "2-3 sentences, plain language",
  "key_points": ["point 1", "point 2", "point 3"],
  "target_audience": "who benefits most",
  "action_items": ["what someone can do with this"],
  "complexity": "Beginner|Intermediate|Expert"
}
""",
    "eligibility": """
You are an eligibility matching engine for Indian government schemes.
Input: user profile as JSON.
Output: valid JSON only.
Schema:
{
  "matched_schemes": [
    {
      "name": "scheme name",
      "benefit": "what user gets in plain language",
      "why_eligible": "one sentence",
      "documents_needed": ["doc1", "doc2"],
      "how_to_apply": "3 sentence step by step",
      "authority": "which office or portal"
    }
  ],
  "total_matched": 0,
  "priority_scheme": "highest impact scheme name"
}
""",
    "crisis": """
You are a crisis response assistant.
Input: description of emergency situation.
Output: valid JSON only. Be specific and actionable.
Schema:
{
  "situation_type": "Legal|Health|Safety|Financial|Disaster|Other",
  "urgency": "Immediate|Within 24 hours|Within a week",
  "rights_violated": ["right with law reference"],
  "immediate_steps": ["step 1", "step 2", "step 3"],
  "complaint_letter": "full formatted letter ready to send",
  "authority_to_contact": "exact name and type",
  "emergency_contacts": ["contact 1", "contact 2"]
}
""",
    "environment": """
You are an environmental issue classifier.
Input: citizen report text or image analysis.
Output: valid JSON only.
Schema:
{
  "issue_type": "Waste|Water|Air|Noise|Land|Other",
  "severity": "Low|Medium|High|Critical",
  "severity_reason": "one sentence",
  "affected_area": "estimated impact radius",
  "recommended_action": {
    "citizen": "what reporter can do right now",
    "authority": "which authority to notify",
    "timeline": "how urgent is official response"
  },
  "tags": ["searchable tags"]
}
""",
    "livelihood": """
You are a livelihood opportunity matcher.
Input: worker or farmer profile.
Output: valid JSON only.
Schema:
{
  "profile_summary": "one sentence",
  "opportunities": [
    {
      "type": "Scheme|Market|Training|Job|Other",
      "name": "opportunity name",
      "benefit": "what they get",
      "match_reason": "why this fits their profile",
      "next_step": "single most important action"
    }
  ],
  "priority_action": "the one thing they should do today",
  "income_potential": "estimated benefit in rupees if applicable"
}
""",
}


def _strip_markdown_fences(text: str) -> str:
    t = text.strip()
    if not t.startswith("```"):
        return t
    t = re.sub(r"^```[\w]*\s*\n?", "", t, count=1)
    t = re.sub(r"\n?```\s*$", "", t)
    return t.strip()


def _fail(raw: str) -> dict[str, str]:
    return {"error": "structuring failed", "raw": raw}


def _response_text(response: Any) -> str:
    try:
        t = getattr(response, "text", None)
        if t is not None:
            return str(t).strip()
    except (ValueError, AttributeError):
        pass
    parts: list[str] = []
    cand = getattr(response, "candidates", None) or []
    for c in cand:
        content = getattr(c, "content", None)
        prts = getattr(content, "parts", None) if content else None
        if not prts:
            continue
        for p in prts:
            txt = getattr(p, "text", None)
            if txt:
                parts.append(str(txt))
    return "".join(parts).strip()


def _gemini_generate(
    api_key: str,
    system_instruction: str,
    user_message: str,
    max_output_tokens: int,
) -> str:
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=user_message,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction.strip(),
            max_output_tokens=max_output_tokens,
        ),
    )
    return _response_text(response)


async def structure(text: str, prompt_type: str) -> dict[str, Any]:
    try:
        key = (prompt_type or "").strip().lower()
        if key not in PROMPT_TEMPLATES:
            key = "knowledge"
        system_prompt = PROMPT_TEMPLATES[key]

        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        if not api_key:
            logger.error("Gemini: GEMINI_API_KEY is missing or empty")
            return _fail("GEMINI_API_KEY not set")

        raw_text = await asyncio.to_thread(
            _gemini_generate,
            api_key,
            system_prompt,
            text,
            4096,
        )
        cleaned = _strip_markdown_fences(raw_text)
        try:
            parsed = json.loads(cleaned)
        except json.JSONDecodeError as exc:
            logger.error("Gemini structure: JSON parse error: %s", exc)
            return _fail(raw_text or str(exc))

        if isinstance(parsed, dict):
            return parsed
        logger.error("Gemini structure: root JSON is not an object")
        return _fail(raw_text)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Gemini structure failed: %s", exc)
        return _fail(str(exc))


async def classify(text: str, categories: list[str]) -> str:
    try:
        if not categories:
            return ""

        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        if not api_key:
            logger.error("Gemini classify: GEMINI_API_KEY is missing or empty")
            return categories[0]

        cat_lines = "\n".join(f"- {c}" for c in categories)
        user_msg = (
            f"You must classify the text into exactly ONE of these categories.\n"
            f"Reply with ONLY the category string, character-for-character as listed (no punctuation, no explanation).\n\n"
            f"Allowed categories:\n{cat_lines}\n\n"
            f"Text:\n{text}"
        )

        raw = await asyncio.to_thread(
            _gemini_generate,
            api_key,
            "You output exactly one label from the allowed list.",
            user_msg,
            256,
        )
        answer = _strip_markdown_fences(raw).strip()
        if not answer:
            return categories[0]

        for c in categories:
            if answer == c:
                return c
        lower = answer.lower()
        for c in categories:
            if c.lower() == lower:
                return c
        for c in categories:
            if c.lower() in lower or lower in c.lower():
                return c

        return categories[0]
    except Exception as exc:  # noqa: BLE001
        logger.exception("Gemini classify failed: %s", exc)
        return categories[0] if categories else ""
