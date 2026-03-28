"""Gemini helpers: text generation, image analysis, micro-lessons (google-genai SDK)."""

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

from services.claude_service import GEMINI_MODEL

load_dotenv()

logger = logging.getLogger(__name__)

_IMAGE_ANALYSIS_PROMPT = """Analyze this image and describe what you see.
Return valid JSON only with keys:
description, objects, issues, severity, tags"""

_LESSON_PROMPT = """Create a simple, engaging micro-lesson
based on this knowledge card. Plain language.
No markdown. Max 150 words."""

_IMAGE_FALLBACK: dict[str, Any] = {
    "description": "Image analysis failed",
    "objects": [],
    "issues": [],
    "severity": "Unknown",
    "tags": [],
}


def _strip_markdown_fences(text: str) -> str:
    t = text.strip()
    if not t.startswith("```"):
        return t
    t = re.sub(r"^```[\w]*\s*\n?", "", t, count=1)
    t = re.sub(r"\n?```\s*$", "", t)
    return t.strip()


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


def _guess_image_mime(image_bytes: bytes) -> str:
    if len(image_bytes) >= 8 and image_bytes[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if len(image_bytes) >= 2 and image_bytes[:2] == b"\xff\xd8":
        return "image/jpeg"
    if (
        len(image_bytes) >= 12
        and image_bytes[:4] == b"RIFF"
        and image_bytes[8:12] == b"WEBP"
    ):
        return "image/webp"
    if len(image_bytes) >= 6 and image_bytes[:6] in (b"GIF87a", b"GIF89a"):
        return "image/gif"
    return "image/jpeg"


def _coerce_str_list(val: Any) -> list[str]:
    if val is None:
        return []
    if isinstance(val, list):
        return [str(x) for x in val]
    return [str(val)]


def _normalize_image_dict(parsed: dict[str, Any]) -> dict[str, Any]:
    desc = parsed.get("description", "")
    sev = parsed.get("severity", "Unknown")
    return {
        "description": desc if isinstance(desc, str) else str(desc),
        "objects": _coerce_str_list(parsed.get("objects")),
        "issues": _coerce_str_list(parsed.get("issues")),
        "severity": sev if isinstance(sev, str) else str(sev),
        "tags": _coerce_str_list(parsed.get("tags")),
    }


def _generate_sync(api_key: str, prompt: str) -> str:
    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(max_output_tokens=8192),
        )
        return _response_text(response) or ""
    except Exception as exc:  # noqa: BLE001
        logger.exception("Gemini generate (sync) failed: %s", exc)
        return ""


def _analyze_image_sync(api_key: str, image_bytes: bytes) -> dict[str, Any]:
    try:
        if not image_bytes:
            return dict(_IMAGE_FALLBACK)

        client = genai.Client(api_key=api_key)
        mime = _guess_image_mime(image_bytes)
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_bytes(data=image_bytes, mime_type=mime),
                        types.Part.from_text(text=_IMAGE_ANALYSIS_PROMPT),
                    ],
                )
            ],
            config=types.GenerateContentConfig(max_output_tokens=2048),
        )
        raw = _response_text(response)
        cleaned = _strip_markdown_fences(raw)
        try:
            parsed = json.loads(cleaned)
            if isinstance(parsed, dict):
                return _normalize_image_dict(parsed)
        except json.JSONDecodeError as exc:
            logger.error("Gemini analyze_image: JSON parse error: %s", exc)
        return dict(_IMAGE_FALLBACK)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Gemini analyze_image (sync) failed: %s", exc)
        return dict(_IMAGE_FALLBACK)


def _create_lesson_sync(api_key: str, knowledge_card: dict[str, Any]) -> str:
    try:
        card_json = json.dumps(knowledge_card, ensure_ascii=False)
        prompt = f"{_LESSON_PROMPT}\n\nKnowledge card:\n{card_json}"
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(max_output_tokens=1024),
        )
        return (_response_text(response) or "").strip()
    except Exception as exc:  # noqa: BLE001
        logger.exception("Gemini create_lesson (sync) failed: %s", exc)
        return ""


async def generate(prompt: str) -> str:
    try:
        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        if not api_key:
            logger.error("Gemini generate: GEMINI_API_KEY is missing or empty")
            return ""
        return await asyncio.to_thread(_generate_sync, api_key, prompt)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Gemini generate failed: %s", exc)
        return ""


async def analyze_image(image_bytes: bytes) -> dict[str, Any]:
    try:
        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        if not api_key:
            logger.error("Gemini analyze_image: GEMINI_API_KEY is missing or empty")
            return dict(_IMAGE_FALLBACK)
        return await asyncio.to_thread(_analyze_image_sync, api_key, image_bytes)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Gemini analyze_image failed: %s", exc)
        return dict(_IMAGE_FALLBACK)


async def create_lesson(knowledge_card: dict[str, Any]) -> str:
    try:
        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        if not api_key:
            logger.error("Gemini create_lesson: GEMINI_API_KEY is missing or empty")
            return ""
        return await asyncio.to_thread(_create_lesson_sync, api_key, knowledge_card)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Gemini create_lesson failed: %s", exc)
        return ""
