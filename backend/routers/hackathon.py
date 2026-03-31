"""Hackathon API routes: processing pipelines, items, delivery, and patient auth/plan."""

from datetime import date
import hashlib
import json
from typing import Any
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, Path, Request, UploadFile
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

PATIENT_AUTH_STORE: dict[str, dict[str, Any]] = {}
PATIENT_PROFILE_STORE: dict[str, dict[str, Any]] = {}
DAILY_PLAN_CACHE: dict[str, dict[str, Any]] = {}

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


def _normalize_phone(phone: str | None) -> str:
    p = str(phone or "").strip()
    if not p:
        return ""
    if p.startswith("+"):
        return "+" + "".join(ch for ch in p[1:] if ch.isdigit())
    return "".join(ch for ch in p if ch.isdigit())


def _hash_pin(pin: str) -> str:
    return hashlib.sha256(pin.encode("utf-8")).hexdigest()


def _clean_model_json(raw: Any) -> dict[str, Any] | None:
    text = str(raw or "").strip()
    if not text:
        return None
    cleaned = text.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    try:
        parsed = json.loads(cleaned)
    except Exception:
        return None
    if isinstance(parsed, dict):
        return parsed
    return None


def _safe_recovery_plan(raw: Any, fallback_goal: str) -> dict[str, Any]:
    parsed = _clean_model_json(raw) or {}
    instructions = parsed.get("instructions", [])
    meds = parsed.get("medications", [])
    warnings = parsed.get("warning_signs", [])

    if not isinstance(instructions, list) or not instructions:
        instructions = [
            "Take medicines as prescribed and drink enough water.",
            "Do gentle breathing and short mobility sessions as tolerated.",
            "Log symptoms in daily check-in and monitor wound signs.",
        ]
    if not isinstance(meds, list):
        meds = []
    if not isinstance(warnings, list) or not warnings:
        warnings = [
            "Fever, worsening pain, or wound discharge needs immediate clinical review.",
            "Breathlessness, chest pain, or uncontrolled bleeding is an emergency.",
        ]

    return {
        "day_goal": str(parsed.get("day_goal", fallback_goal)),
        "phase_label": str(parsed.get("phase_label", "Early recovery")),
        "instructions": [str(x) for x in instructions[:8]],
        "medications": [x for x in meds[:8] if isinstance(x, dict)],
        "warning_signs": [str(x) for x in warnings[:6]],
        "diet": str(parsed.get("diet", "Light, protein-rich meals and hydration.")),
        "mobility_level": str(parsed.get("mobility_level", "Short assisted walks as tolerated.")),
        "motivational_note": str(
            parsed.get(
                "motivational_note",
                "Steady daily habits and timely check-ins build a safer recovery.",
            )
        ),
    }


def _plan_prompt(
    profile: dict[str, Any],
    day_number: int,
    prior_plan: dict[str, Any] | None = None,
    checkin_summary: str | None = None,
) -> str:
    meds = profile.get("medications", [])
    meds_line = ", ".join(str(m) for m in meds) if meds else "none listed"
    comorb = profile.get("comorbidities", [])
    comorb_line = ", ".join(str(c) for c in comorb) if comorb else "none"
    return (
        "You are RecoverAI's post-discharge clinical planner. "
        "Produce conservative, practical, safe recovery guidance for today only. "
        f"Patient: {profile.get('name', 'Patient')}. Day: {day_number}. "
        f"Surgery: {profile.get('surgery_type', 'other')}. Discharge: {profile.get('discharge_date', '')}. "
        f"Age: {profile.get('age', '')}. Gender: {profile.get('gender', '')}. "
        f"Comorbidities: {comorb_line}. Restrictions: {profile.get('restrictions', '')}. "
        f"Support system: {profile.get('support_system', '')}. Baseline pain: {profile.get('baseline_pain', '')}. "
        f"Medications: {meds_line}. Language preference: {profile.get('language_preference', 'en')}. "
        f"Special instructions: {profile.get('special_instructions', '')}. "
        f"Check-in summary: {checkin_summary or 'none'}. Prior plan summary: {prior_plan or {}}. "
        "Return JSON only with keys day_goal, phase_label, instructions (array), medications (array of {name,time,note}), "
        "warning_signs (array), diet, mobility_level, motivational_note."
    )


def _cache_daily_plan(
    patient_id: str,
    plan: dict[str, Any],
    source: str,
    day: int,
    date_str: str,
    checkin_summary: str = "",
) -> dict[str, Any]:
    payload = {
        "patient_id": patient_id,
        "date": date_str,
        "day": day,
        "plan": plan,
        "source": source,
        "checkin_summary": checkin_summary,
    }
    DAILY_PLAN_CACHE[f"{patient_id}:{date_str}"] = payload
    return payload


def _persist_daily_plan_snapshot(
    sb: Client | None,
    patient_id: str,
    date_str: str,
    source: str,
    plan: dict[str, Any],
    checkin_summary: str,
) -> None:
    if sb is None:
        return
    try:
        sb.table("items").insert(
            {
                "type": "daily_plan",
                "content": {
                    "patient_id": patient_id,
                    "date": date_str,
                    "source": source,
                    "plan": plan,
                    "checkin_summary": checkin_summary,
                },
                "metadata": {
                    "patient_id": patient_id,
                    "date": date_str,
                    "source": source,
                },
            }
        ).execute()
    except Exception:
        # Non-blocking persistence path
        return


def _persist_auth_snapshot(
    sb: Client | None,
    patient_id: str,
    phone: str,
    pin_hash: str,
    name: str,
) -> None:
    if sb is None or not phone or not pin_hash:
        return
    try:
        sb.table("items").insert(
            {
                "type": "patient_auth",
                "content": {
                    "patient_id": patient_id,
                    "phone": phone,
                    "pin_hash": pin_hash,
                    "name": name,
                },
                "metadata": {
                    "patient_id": patient_id,
                    "phone": phone,
                },
            }
        ).execute()
    except Exception:
        return


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


class CreatePatientBody(BaseModel):
    name: str
    surgery_type: str
    patient_phone: str | None = None
    patient_pin: str | None = None
    discharge_date: str | None = None
    caregiver_phone: str | None = None
    language_preference: str | None = None
    medications: list[dict[str, Any]] = Field(default_factory=list)
    discharge_summary_text: str | None = None
    special_instructions: str | None = None
    age: int | None = None
    gender: str | None = None
    comorbidities: list[str] = Field(default_factory=list)
    restrictions: str | None = None
    support_system: str | None = None
    baseline_pain: int | None = None


class PatientPinLoginBody(BaseModel):
    phone: str
    pin: str = Field(..., min_length=4, max_length=8)


class AdaptPlanBody(BaseModel):
    summary: str | None = None
    pain_score: int | None = None
    risk: str | None = None


@router.post("/auth/patient/login-pin")
@api_rate_limit
async def patient_login_pin(
    request: Request,
    body: PatientPinLoginBody,
) -> Any:
    phone = _normalize_phone(body.phone)
    pin_hash = _hash_pin(body.pin)

    local = PATIENT_AUTH_STORE.get(phone)
    if local and local.get("pin_hash") == pin_hash:
        pid = str(local.get("patient_id"))
        profile = PATIENT_PROFILE_STORE.get(pid, {})
        return {
            "patient": {
                "id": pid,
                "name": str(local.get("name") or profile.get("name") or "Patient"),
                "condition": str(profile.get("procedure_label") or profile.get("surgery_type") or "Recovery"),
                "phone": phone,
                "recovery_day": int(profile.get("recovery_current_day") or 1),
            }
        }

    try:
        sb = get_supabase()
        try:
            auth_res = (
                sb.table("items")
                .select("content")
                .eq("type", "patient_auth")
                .contains("metadata", {"phone": phone})
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )
            auth_rows = auth_res.data or []
            if auth_rows:
                c = auth_rows[0].get("content") or {}
                stored_hash = str(c.get("pin_hash") or "")
                if stored_hash and stored_hash == pin_hash:
                    pid = str(c.get("patient_id") or "")
                    if pid:
                        PATIENT_AUTH_STORE[phone] = {
                            "patient_id": pid,
                            "pin_hash": stored_hash,
                            "name": str(c.get("name") or "Patient"),
                        }
                        return {
                            "patient": {
                                "id": pid,
                                "name": str(c.get("name") or "Patient"),
                                "condition": "Recovery",
                                "phone": phone,
                                "recovery_day": 1,
                            }
                        }
        except Exception:
            pass

        pres = (
            sb.table("patients")
            .select("id,name,procedure,recovery_current_day,phone")
            .eq("phone", phone)
            .limit(1)
            .execute()
        )
        rows = pres.data or []
        if not rows:
            return JSONResponse(status_code=401, content={"error": "Invalid phone or PIN"})
        row = rows[0]
        if pin_hash != _hash_pin("1234"):
            return JSONResponse(status_code=401, content={"error": "Invalid phone or PIN"})
        return {
            "patient": {
                "id": row.get("id"),
                "name": row.get("name") or "Patient",
                "condition": row.get("procedure") or "Recovery",
                "phone": phone,
                "recovery_day": row.get("recovery_current_day") or 1,
            }
        }
    except Exception:
        return JSONResponse(status_code=401, content={"error": "Invalid phone or PIN"})


@router.get("/patients/{patient_id}/daily-plan")
@api_rate_limit
async def patient_daily_plan(
    request: Request,
    patient_id: str = Path(...),
    force_refresh: bool = False,
) -> Any:
    if gemini_service is None:
        return _err("gemini_service module is not available")

    today = date.today().isoformat()
    cache_key = f"{patient_id}:{today}"
    if not force_refresh and cache_key in DAILY_PLAN_CACHE:
        return DAILY_PLAN_CACHE[cache_key]

    profile = PATIENT_PROFILE_STORE.get(patient_id)
    if not profile:
        try:
            sb = get_supabase()
            p_res = (
                sb.table("patients")
                .select(
                    "id,public_id,name,procedure,discharge_date,recovery_total_days,recovery_current_day,phase_label,phone"
                )
                .or_(f"id.eq.{patient_id},public_id.eq.{patient_id}")
                .single()
                .execute()
            )
            row = p_res.data or {}
            if not row:
                return JSONResponse(status_code=404, content={"error": "Patient not found"})
            meds_res = (
                sb.table("medications")
                .select("name,dose")
                .eq("patient_id", patient_id)
                .execute()
            )
            meds_rows = meds_res.data or []
            meds_line = [
                f"{m.get('name')} ({m.get('dose')})" if m.get("dose") else str(m.get("name"))
                for m in meds_rows
                if m.get("name")
            ]
            profile = {
                "id": patient_id,
                "name": row.get("name") or "Patient",
                "surgery_type": (row.get("procedure") or "other").lower().replace(" ", "_"),
                "discharge_date": row.get("discharge_date"),
                "language_preference": "en",
                "medications": meds_line,
                "special_instructions": row.get("phase_label") or "",
                "patient_phone": row.get("phone") or "",
                "procedure_label": row.get("procedure") or "Recovery",
                "recovery_total_days": int(row.get("recovery_total_days") or 30),
                "recovery_current_day": int(row.get("recovery_current_day") or 1),
            }
            PATIENT_PROFILE_STORE[patient_id] = profile
        except Exception:
            return JSONResponse(status_code=404, content={"error": "Patient not found"})

    prev = DAILY_PLAN_CACHE.get(cache_key)
    day_num = int(profile.get("recovery_current_day") or 1)
    raw = await gemini_service.generate(_plan_prompt(profile, day_number=day_num, prior_plan=prev))
    plan = _safe_recovery_plan(raw, fallback_goal=f"Day {day_num} recovery guidance")
    payload = _cache_daily_plan(
        patient_id=patient_id,
        plan=plan,
        source="daily_refresh",
        day=day_num,
        date_str=today,
    )
    try:
        sb = get_supabase()
    except Exception:
        sb = None
    _persist_daily_plan_snapshot(
        sb=sb,
        patient_id=patient_id,
        date_str=today,
        source="daily_refresh",
        plan=plan,
        checkin_summary="",
    )
    return payload


@router.post("/patients/{patient_id}/adapt-plan")
@api_rate_limit
async def adapt_plan_after_checkin(
    request: Request,
    patient_id: str = Path(...),
    body: AdaptPlanBody = None,
) -> Any:
    if gemini_service is None:
        return _err("gemini_service module is not available")

    today = date.today().isoformat()
    profile = PATIENT_PROFILE_STORE.get(patient_id)
    if not profile:
        try:
            sb_seed = get_supabase()
            p_res = (
                sb_seed.table("patients")
                .select(
                    "id,public_id,name,procedure,discharge_date,recovery_total_days,recovery_current_day,phase_label,phone"
                )
                .or_(f"id.eq.{patient_id},public_id.eq.{patient_id}")
                .single()
                .execute()
            )
            row = p_res.data or {}
            if not row:
                return JSONResponse(status_code=404, content={"error": "Patient not found"})
            meds_res = (
                sb_seed.table("medications")
                .select("name,dose")
                .eq("patient_id", patient_id)
                .execute()
            )
            meds_rows = meds_res.data or []
            meds_line = [
                f"{m.get('name')} ({m.get('dose')})" if m.get("dose") else str(m.get("name"))
                for m in meds_rows
                if m.get("name")
            ]
            profile = {
                "id": patient_id,
                "name": row.get("name") or "Patient",
                "surgery_type": (row.get("procedure") or "other").lower().replace(" ", "_"),
                "discharge_date": row.get("discharge_date"),
                "language_preference": "en",
                "medications": meds_line,
                "special_instructions": row.get("phase_label") or "",
                "patient_phone": row.get("phone") or "",
                "procedure_label": row.get("procedure") or "Recovery",
                "recovery_total_days": int(row.get("recovery_total_days") or 30),
                "recovery_current_day": int(row.get("recovery_current_day") or 1),
            }
            PATIENT_PROFILE_STORE[patient_id] = profile
        except Exception:
            return JSONResponse(status_code=404, content={"error": "Patient not found"})

    body = body or AdaptPlanBody()
    checkin_summary = (
        f"Summary: {body.summary or ''}; Pain: {body.pain_score if body.pain_score is not None else ''}; Risk: {body.risk or ''}"
    )
    day_num = int(profile.get("recovery_current_day") or 1)
    prior = DAILY_PLAN_CACHE.get(f"{patient_id}:{today}")
    raw = await gemini_service.generate(
        _plan_prompt(
            profile,
            day_number=day_num,
            prior_plan=prior,
            checkin_summary=checkin_summary,
        )
    )
    plan = _safe_recovery_plan(raw, fallback_goal=f"Day {day_num} adapted recovery guidance")
    payload = _cache_daily_plan(
        patient_id=patient_id,
        plan=plan,
        source="checkin_adapt",
        day=day_num,
        date_str=today,
        checkin_summary=checkin_summary,
    )
    try:
        sb = get_supabase()
    except Exception:
        sb = None
    _persist_daily_plan_snapshot(
        sb=sb,
        patient_id=patient_id,
        date_str=today,
        source="checkin_adapt",
        plan=plan,
        checkin_summary=checkin_summary,
    )

    # ── Post check-in caregiver WhatsApp alert ─────────────────────────────
    if twilio_service is not None and sb is not None:
        try:
            cg_res = (
                sb.table("caregivers")
                .select("phone, name")
                .eq("patient_id", patient_id)
                .limit(1)
                .execute()
            )
            cg = (cg_res.data or [{}])[0]
            cg_phone = cg.get("phone", "")
            if cg_phone:
                patient_name = profile.get("name", "Your patient")
                pain = body.pain_score
                risk = (body.risk or "LOW").upper()
                day = day_num
                summary_line = (body.summary or "").strip()[:120]
                if risk == "CRITICAL":
                    tone = "🚨 URGENT"
                elif risk == "MODERATE":
                    tone = "⚠️ Attention"
                else:
                    tone = "✅ Update"
                msg_parts = [
                    f"{tone} — RecoverAI",
                    f"Patient: {patient_name} (Day {day})",
                    f"Pain score: {pain}/10  |  Risk: {risk}",
                ]
                if summary_line:
                    msg_parts.append(f"Summary: {summary_line}")
                if risk == "CRITICAL":
                    msg_parts.append("Please contact your loved one immediately.")
                msg = "\n".join(msg_parts)[:500]
                sent = await twilio_service.send_whatsapp(cg_phone, msg)
                if sb and sent:
                    try:
                        sb.table("caregiver_alerts").insert([
                            {"patient_id": patient_id, "alert_date": today, "message": msg}
                        ]).execute()
                    except Exception:  # noqa: BLE001
                        pass
        except Exception:  # noqa: BLE001
            pass  # Never block check-in response on notification failure

    return payload


# ── Missed check-in cron alert ─────────────────────────────────────────────
# Call this at 9 PM daily (e.g. via cron → POST /api/caregiver-alerts/missed-checkin)
# Protected by a simple secret header (CRON_SECRET env var) to avoid abuse.

@router.post("/caregiver-alerts/missed-checkin")
async def missed_checkin_alerts(request: Request) -> Any:
    """
    Idempotent cron endpoint: sends WhatsApp alerts to caregivers of patients
    who have not submitted a check-in today. Safe to call multiple times.
    """
    import os

    secret = os.getenv("CRON_SECRET", "")
    if secret:
        provided = request.headers.get("x-cron-secret", "")
        if provided != secret:
            return JSONResponse(status_code=403, content={"error": "Forbidden"})

    if twilio_service is None:
        return JSONResponse(status_code=503, content={"error": "twilio_service unavailable"})

    try:
        sb = get_supabase()
    except Exception:
        return _err("Database unavailable")

    today = date.today().isoformat()
    sent_count = 0
    skipped_count = 0
    errors: list[str] = []

    try:
        # 1. All active patients
        pts_res = (
            sb.table("patients")
            .select("id, name, recovery_current_day")
            .execute()
        )
        patients = pts_res.data or []

        # 2. Patients who DID check in today (have a journal entry)
        journal_res = (
            sb.table("journal_entries")
            .select("patient_id")
            .eq("entry_date", today)
            .execute()
        )
        checked_in_ids = {r["patient_id"] for r in (journal_res.data or [])}

        # 3. Patients who already got a missed-checkin alert today (idempotency)
        existing_alerts_res = (
            sb.table("caregiver_alerts")
            .select("patient_id")
            .eq("alert_date", today)
            .ilike("message", "%missed%check-in%")
            .execute()
        )
        already_alerted_ids = {r["patient_id"] for r in (existing_alerts_res.data or [])}

        missed = [
            p for p in patients
            if p["id"] not in checked_in_ids and p["id"] not in already_alerted_ids
        ]

        for p in missed:
            pid = p["id"]
            patient_name = p.get("name", "Your patient")
            day = p.get("recovery_current_day", 1)
            try:
                cg_res = (
                    sb.table("caregivers")
                    .select("phone, name")
                    .eq("patient_id", pid)
                    .limit(1)
                    .execute()
                )
                cg = (cg_res.data or [{}])[0]
                cg_phone = cg.get("phone", "")
                if not cg_phone:
                    skipped_count += 1
                    continue

                msg = (
                    f"📋 RecoverAI — Missed Check-in\n"
                    f"Patient: {patient_name} (Day {day})\n"
                    f"Your loved one has not submitted their daily check-in today. "
                    f"Please reach out to make sure they're okay."
                )[:500]

                sent = await twilio_service.send_whatsapp(cg_phone, msg)
                if sent:
                    try:
                        sb.table("caregiver_alerts").insert([
                            {"patient_id": pid, "alert_date": today, "message": msg}
                        ]).execute()
                    except Exception:  # noqa: BLE001
                        pass
                    sent_count += 1
                else:
                    errors.append(f"WhatsApp delivery failed for patient {pid}")
            except Exception as exc:  # noqa: BLE001
                errors.append(f"Error for patient {pid}: {exc}")

    except Exception as exc:  # noqa: BLE001
        return _err(str(exc))

    return {
        "date": today,
        "sent": sent_count,
        "skipped_no_caregiver": skipped_count,
        "errors": errors,
    }


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
        stt = await sarvam.transcribe_with_meta(
            audio_bytes, language_code, audio.content_type
        )
        transcript = str(stt.get("transcript") or "").strip()
        if not transcript:
            err = str(stt.get("error") or "Unable to transcribe audio")
            return JSONResponse(
                status_code=400,
                content={
                    "error": f"{err}. Please switch to typed check-in or retry with clearer audio."
                },
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


@router.post("/patients/extract-discharge")
@api_rate_limit
async def extract_discharge_summary(
    request: Request,
    file: UploadFile = File(...),
) -> Any:
    try:
        if gemini_service is None:
            return _err("gemini_service module is not available")
        payload = await _read_upload_capped(file, MAX_UPLOAD_BYTES)
        if payload is None:
            return _payload_too_large(
                f"Upload exceeds maximum size of {MAX_UPLOAD_BYTES // (1024 * 1024)}MB"
            )
        mime = file.content_type or "application/pdf"
        extracted = await gemini_service.extract_discharge_summary(
            payload,
            mime,
            file.filename or "discharge-summary",
        )
        return {"extracted": extracted}
    except Exception as e:
        return _err(str(e))


@router.post("/patients")
@api_rate_limit
async def create_patient(
    request: Request,
    body: CreatePatientBody,
) -> Any:
    try:
        if gemini_service is None:
            return _err("gemini_service module is not available")

        sb: Client | None = None
        persistence_warnings: list[str] = []
        try:
            sb = get_supabase()
        except Exception as supa_exc:  # noqa: BLE001
            persistence_warnings.append(
                f"Supabase unavailable; returning non-persisted plan only ({supa_exc})"
            )

        surgery = (body.surgery_type or "other").strip().lower()
        if surgery not in {
            "appendectomy",
            "c_section",
            "knee_replacement",
            "gallbladder",
            "other",
        }:
            surgery = "other"

        med_strings: list[str] = []
        for med in body.medications:
            if not isinstance(med, dict):
                continue
            name = str(med.get("name", "")).strip()
            if not name:
                continue
            freq = str(med.get("frequency", "")).strip()
            med_strings.append(f"{name} ({freq})" if freq else name)

        profile = {
            "name": body.name,
            "surgery_type": surgery,
            "discharge_date": body.discharge_date,
            "language_preference": body.language_preference or "en",
            "age": body.age,
            "gender": body.gender,
            "comorbidities": body.comorbidities,
            "restrictions": body.restrictions,
            "support_system": body.support_system,
            "baseline_pain": body.baseline_pain,
            "medications": med_strings,
            "special_instructions": body.special_instructions
            or body.discharge_summary_text
            or "",
            "patient_phone": _normalize_phone(body.patient_phone),
            "caregiver_phone": _normalize_phone(body.caregiver_phone),
        }
        raw = await gemini_service.generate(_plan_prompt(profile, day_number=1))
        plan = _safe_recovery_plan(raw, fallback_goal=f"Stabilize Day 1 recovery for {body.name}")

        proc_label = {
            "appendectomy": "Appendectomy",
            "c_section": "C-Section",
            "knee_replacement": "Knee Replacement",
            "gallbladder": "Gallbladder Removal",
            "other": "Other Surgery",
        }.get(surgery, "Other Surgery")

        patient_row = {
            "name": body.name.strip(),
            "phone": profile["patient_phone"] or None,
            "procedure": proc_label,
            "discharge_date": body.discharge_date or None,
            "recovery_total_days": 30,
            "recovery_current_day": 1,
            "risk_level": "LOW",
            "phase": "Phase 1",
            "phase_label": str(plan.get("phase_label", "Early recovery")),
            "hospital_name": "Self-Onboard",
            "hospital_phone": None,
        }

        patient_id = str(uuid4())
        if sb is not None:
            try:
                p_res = sb.table("patients").insert([patient_row]).execute()
                if p_res.data and p_res.data[0].get("id"):
                    patient_id = p_res.data[0]["id"]
                else:
                    persistence_warnings.append("Patient row insert returned no data")
            except Exception as persist_exc:  # noqa: BLE001
                persistence_warnings.append(f"Patient insert failed ({persist_exc})")

        caregiver_phone = profile["caregiver_phone"]
        if sb is not None and caregiver_phone:
            try:
                sb.table("caregivers").insert(
                    [
                        {
                            "patient_id": patient_id,
                            "name": "Primary caregiver",
                            "phone": caregiver_phone,
                            "relation": "Family",
                        }
                    ]
                ).execute()
            except Exception as persist_exc:  # noqa: BLE001
                persistence_warnings.append(f"Caregiver insert failed ({persist_exc})")

        if sb is not None:
            for med in med_strings:
                try:
                    sb.table("medications").insert(
                        [{"patient_id": patient_id, "name": med, "dose": ""}]
                    ).execute()
                except Exception as persist_exc:  # noqa: BLE001
                    persistence_warnings.append(f"Medication insert failed ({persist_exc})")

        instructions = plan.get("instructions", [])
        task_date = date.today().isoformat()
        if sb is not None and isinstance(instructions, list):
            for idx, inst in enumerate(instructions[:6]):
                text = str(inst).strip()
                if not text:
                    continue
                slot = "morning" if idx < 2 else "afternoon" if idx < 4 else "evening"
                try:
                    sb.table("protocol_tasks").insert(
                        [
                            {
                                "patient_id": patient_id,
                                "task_name": text,
                                "time_slot": slot,
                                "icon_type": "check_circle",
                                "task_date": task_date,
                            }
                        ]
                    ).execute()
                except Exception as persist_exc:  # noqa: BLE001
                    persistence_warnings.append(
                        f"Protocol task insert failed ({persist_exc})"
                    )

        if sb is not None:
            traj_points = []
            total_days = patient_row["recovery_total_days"]
            for d in range(1, total_days + 1):
                # Simple linear recovery model: start at 8, go down to 2
                expected = max(2, 8 - (d - 1) * (6 / total_days))
                traj_points.append({
                    "patient_id": patient_id,
                    "day_number": d,
                    "expected_pain": round(expected, 1),
                    "actual_pain": round(expected, 1) if d == 1 else None
                })
            try:
                sb.table("recovery_trajectory").insert(traj_points).execute()
            except Exception as persist_exc:  # noqa: BLE001
                persistence_warnings.append(f"Trajectory insert failed ({persist_exc})")

        phone_key = profile["patient_phone"]
        if phone_key and body.patient_pin and body.patient_pin.isdigit() and len(body.patient_pin) >= 4:
            pin_hash = _hash_pin(body.patient_pin)
            PATIENT_AUTH_STORE[phone_key] = {
                "patient_id": patient_id,
                "pin_hash": pin_hash,
                "name": body.name,
            }
            _persist_auth_snapshot(
                sb=sb,
                patient_id=patient_id,
                phone=phone_key,
                pin_hash=pin_hash,
                name=body.name,
            )

        PATIENT_PROFILE_STORE[patient_id] = {
            **profile,
            "id": patient_id,
            "procedure_label": proc_label,
            "recovery_total_days": 30,
            "recovery_current_day": 1,
        }
        _cache_daily_plan(
            patient_id=patient_id,
            plan=plan,
            source="onboarding",
            day=1,
            date_str=task_date,
        )
        _persist_daily_plan_snapshot(
            sb=sb,
            patient_id=patient_id,
            date_str=task_date,
            source="onboarding",
            plan=plan,
            checkin_summary="",
        )

        response: dict[str, Any] = {
            "patient": {
                "id": patient_id,
                "public_id": str(p_res.data[0].get("public_id") if p_res.data else ""),
                "name": body.name,
                "surgery_type": surgery,
                "discharge_date": body.discharge_date,
                "patient_phone": profile["patient_phone"] or None,
                "caregiver_phone": caregiver_phone or None,
                "language_preference": body.language_preference,
            },
            "plan": plan,
        }
        if persistence_warnings:
            response["warnings"] = persistence_warnings
        return response
    except Exception as e:
        return _err(str(e))
