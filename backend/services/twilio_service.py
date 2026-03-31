"""Twilio WhatsApp delivery helpers."""

from __future__ import annotations

import asyncio
import logging
import os
from typing import Any

from dotenv import load_dotenv
from twilio.base.exceptions import TwilioException
from twilio.rest import Client

load_dotenv()

logger = logging.getLogger(__name__)


def _whatsapp_address(to: str) -> str:
    t = (to or "").strip().replace(" ", "")  # ← add this
    if not t:
        return ""
    lower = t.lower()
    if lower.startswith("whatsapp:"):
        return t
    return f"whatsapp:{t}"

def _send_whatsapp_sync(account_sid: str, auth_token: str, from_: str, to: str, body: str) -> bool:
    try:
        to_addr = _whatsapp_address(to)
        if not to_addr or not body:
            return False
        client = Client(account_sid, auth_token)
        client.messages.create(body=body, from_=from_, to=to_addr)
        return True
    except TwilioException as exc:
        logger.error("Twilio WhatsApp failed: %s", exc)
        return False
    except Exception as exc:  # noqa: BLE001
        logger.exception("Twilio WhatsApp unexpected error: %s", exc)
        return False


async def send_whatsapp(to: str, message: str) -> bool:
    try:
        account_sid = os.getenv("TWILIO_ACCOUNT_SID", "").strip()
        auth_token = os.getenv("TWILIO_AUTH_TOKEN", "").strip()
        from_number = os.getenv("TWILIO_FROM_NUMBER", "").strip()

        if not account_sid or not auth_token or not from_number:
            logger.error(
                "Twilio: missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_FROM_NUMBER"
            )
            return False

        return await asyncio.to_thread(
            _send_whatsapp_sync,
            account_sid,
            auth_token,
            from_number,
            to,
            message,
        )
    except Exception as exc:  # noqa: BLE001
        logger.exception("Twilio send_whatsapp failed: %s", exc)
        return False


def _get_field(item: dict[str, Any], key: str, default: Any = "") -> Any:
    if key in item and item[key] is not None and item[key] != "":
        return item[key]
    content = item.get("content")
    if isinstance(content, dict) and key in content and content[key] is not None:
        v = content[key]
        if v != "":
            return v
    return default


def _get_str(item: dict[str, Any], key: str, default: str = "") -> str:
    v = _get_field(item, key, default)
    if v is None:
        return default
    return str(v).strip() or default


def _get_list_field(item: dict[str, Any], key: str) -> list[Any]:
    v = _get_field(item, key, None)
    if isinstance(v, list):
        return v
    return []


def format_item_for_whatsapp(item: dict[str, Any]) -> str:
    try:
        title = _get_str(item, "title", "Untitled")
        summary = _get_str(item, "summary", "—")
        key_points = _get_list_field(item, "key_points")
        action_items = _get_list_field(item, "action_items")

        lines: list[str] = [
            f"✅ {title}",
            "",
            f"📋 Summary: {summary}",
            "",
            "Key Points:",
        ]
        for p in key_points:
            lines.append(f"• {p}")
        lines.append("")
        next_step = "—"
        if action_items:
            next_step = str(action_items[0]).strip() or "—"
        lines.append(f"Next Step: {next_step}")

        text = "\n".join(lines)
        if len(text) > 500:
            text = text[:497] + "..."
        return text
    except Exception as exc:  # noqa: BLE001
        logger.exception("format_item_for_whatsapp failed: %s", exc)
        return "✅ Update\n\n📋 Summary: —\n\nKey Points:\n\nNext Step: —"[:500]
