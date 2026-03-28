"""Hackathon API routes: processing pipelines, items, delivery."""

from typing import Any

from fastapi import APIRouter, Depends, File, Form, Request, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from supabase import Client

from database import get_supabase
from rate_limiter import limiter
from schemas import Item, ItemCreate

try:
    from services import claude_service
except ImportError:
    try:
        import claude_service
    except ImportError:
        claude_service = None  # type: ignore[assignment]

try:
    from services import sarvam
except ImportError:
    try:
        import sarvam
    except ImportError:
        sarvam = None  # type: ignore[assignment]

try:
    from services import gemini_service
except ImportError:
    try:
        import gemini_service
    except ImportError:
        gemini_service = None  # type: ignore[assignment]

try:
    from services import twilio_service
except ImportError:
    try:
        import twilio_service
    except ImportError:
        twilio_service = None  # type: ignore[assignment]

MAX_TEXT_CHARS = 10_000
MAX_UPLOAD_BYTES = 10 * 1024 * 1024

api_rate_limit = limiter.shared_limit("30/minute", scope="api")

router = APIRouter(tags=["hackathon"])


def _supabase_dep() -> Client:
    return get_supabase()


def _err(msg: str) -> JSONResponse:
    return JSONResponse(status_code=500, content={"error": msg})


def _payload_too_large(msg: str) -> JSONResponse:
    return JSONResponse(status_code=413, content={"error": msg})


def _content_from_structure(result: Any) -> dict[str, Any]:
    if isinstance(result, dict):
        return result
    return {"result": result}


def _insert_item_row(
    sb: Client, item_type: str, content: dict[str, Any], metadata: dict[str, Any]
) -> dict[str, Any]:
    payload = {"type": item_type, "content": content, "metadata": metadata}
    res = sb.table("items").insert(payload).execute()
    if not res.data:
        raise RuntimeError("Insert returned no row")
    return res.data[0]


def _any_string_over_limit(obj: Any, limit: int) -> bool:
    if isinstance(obj, str):
        return len(obj) > limit
    if isinstance(obj, dict):
        return any(_any_string_over_limit(v, limit) for v in obj.values())
    if isinstance(obj, list):
        return any(_any_string_over_limit(i, limit) for i in obj)
    return False


async def _read_upload_capped(upload: UploadFile, max_bytes: int) -> bytes | None:
    total = 0
    chunks: list[bytes] = []
    chunk_size = min(1024 * 1024, max_bytes + 1)
    while True:
        chunk = await upload.read(chunk_size)
        if not chunk:
            break
        total += len(chunk)
        if total > max_bytes:
            return None
        chunks.append(chunk)
    return b"".join(chunks)


class ProcessTextBody(BaseModel):
    text: str = Field(..., max_length=MAX_TEXT_CHARS)
    prompt_type: str = Field(..., max_length=MAX_TEXT_CHARS)


class GenerateBody(BaseModel):
    prompt: str = Field(..., max_length=MAX_TEXT_CHARS)


class DeliverBody(BaseModel):
    phone: str
    message: str = Field(..., max_length=MAX_TEXT_CHARS)


@router.post("/process-text")
@api_rate_limit
async def process_text(
    request: Request,
    body: ProcessTextBody,
    sb: Client = Depends(_supabase_dep),
) -> Any:
    try:
        if claude_service is None:
            return _err("claude_service module is not available")
        structured = await claude_service.structure(body.text, body.prompt_type)
        content = _content_from_structure(structured)
        metadata: dict[str, Any] = {
            "source": "text",
            "prompt_type": body.prompt_type,
        }
        row = _insert_item_row(
            sb, f"structured:{body.prompt_type}", content, metadata
        )
        return Item.model_validate(row).model_dump(mode="json")
    except Exception as e:
        return _err(str(e))


@router.post("/process-audio")
@api_rate_limit
async def process_audio(
    request: Request,
    audio: UploadFile = File(...),
    prompt_type: str = Form(..., max_length=MAX_TEXT_CHARS),
    language_code: str = Form(default="hi-IN", max_length=32),
    sb: Client = Depends(_supabase_dep),
) -> Any:
    try:
        if sarvam is None:
            return _err("sarvam module is not available")
        if claude_service is None:
            return _err("claude_service module is not available")
        audio_bytes = await _read_upload_capped(audio, MAX_UPLOAD_BYTES)
        if audio_bytes is None:
            return _payload_too_large(
                f"Audio upload exceeds maximum size of {MAX_UPLOAD_BYTES // (1024 * 1024)}MB"
            )
        transcript = await sarvam.transcribe(
            audio_bytes, language_code, audio.content_type
        )
        structured = await claude_service.structure(transcript, prompt_type)
        content = _content_from_structure(structured)
        metadata: dict[str, Any] = {
            "source": "audio",
            "prompt_type": prompt_type,
            "transcript": transcript,
        }
        row = _insert_item_row(sb, f"structured:{prompt_type}", content, metadata)
        item = Item.model_validate(row).model_dump(mode="json")
        return {"transcript": transcript, "item": item}
    except Exception as e:
        return _err(str(e))


@router.post("/process-image")
@api_rate_limit
async def process_image(
    request: Request,
    image: UploadFile = File(...),
    sb: Client = Depends(_supabase_dep),
) -> Any:
    try:
        if gemini_service is None:
            return _err("gemini_service module is not available")
        image_bytes = await _read_upload_capped(image, MAX_UPLOAD_BYTES)
        if image_bytes is None:
            return _payload_too_large(
                f"Image upload exceeds maximum size of {MAX_UPLOAD_BYTES // (1024 * 1024)}MB"
            )
        analysis = await gemini_service.analyze_image(image_bytes)
        content = _content_from_structure(analysis)
        metadata: dict[str, Any] = {"source": "image"}
        row = _insert_item_row(sb, "image_analysis", content, metadata)
        return Item.model_validate(row).model_dump(mode="json")
    except Exception as e:
        return _err(str(e))


@router.post("/generate")
@api_rate_limit
async def generate(
    request: Request,
    body: GenerateBody,
) -> Any:
    try:
        if gemini_service is None:
            return _err("gemini_service module is not available")
        result = await gemini_service.generate(body.prompt)
        return {"result": str(result)}
    except Exception as e:
        return _err(str(e))


@router.get("/items")
@api_rate_limit
def list_api_items(
    request: Request,
    sb: Client = Depends(_supabase_dep),
) -> Any:
    try:
        res = (
            sb.table("items")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )
        rows = res.data or []
        items = [Item.model_validate(r).model_dump(mode="json") for r in rows]
        return {"items": items, "count": len(items)}
    except Exception as e:
        return _err(str(e))


@router.post("/items")
@api_rate_limit
def create_api_item(
    request: Request,
    body: ItemCreate,
    sb: Client = Depends(_supabase_dep),
) -> Any:
    try:
        if _any_string_over_limit(body.model_dump(), MAX_TEXT_CHARS):
            return _payload_too_large(
                f"One or more text fields exceed {MAX_TEXT_CHARS} characters"
            )
        row = _insert_item_row(
            sb,
            body.type,
            body.content,
            body.metadata,
        )
        return Item.model_validate(row).model_dump(mode="json")
    except Exception as e:
        return _err(str(e))


@router.post("/deliver")
@api_rate_limit
async def deliver(
    request: Request,
    body: DeliverBody,
) -> Any:
    try:
        if twilio_service is None:
            return _err("twilio_service module is not available")
        success = await twilio_service.send_whatsapp(body.phone, body.message)
        return {"success": success}
    except Exception as e:
        return _err(str(e))
