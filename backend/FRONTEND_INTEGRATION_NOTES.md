# RecoverAI — Backend Integration Notes for @teammate

## Context

The frontend currently uses `MOCK_RESULT` hardcoded data for the check-in flow.
These are the exact API calls the frontend needs to make to the backend to use real Sarvam + Gemini.

---

## 1. Voice Check-in Pipeline (PRIORITY — This is the demo moment)

**Frontend will call:** `POST /api/process-audio`

- Sends: `FormData` with `audio` (WAV blob from browser mic) + `prompt_type: "pain_checkin"`
- Expects back:

```json
{
  "transcript": "थोड़ा दर्द है घाव के पास",
  "item": { ... }
}
```

**Then frontend calls:** `POST /api/generate`

- Sends:

```json
{
  "prompt": "Patient on Day 4 of appendectomy recovery. Voice transcript (translated): 'some pain near wound'. Return JSON: { pain_score: 0-10, risk: 'LOW|MODERATE|HIGH|CRITICAL', summary: '1 sentence', directive: 'what to do today', alert_caregiver: boolean, caregiver_message: 'WhatsApp text in patient language' }"
}
```

- Expects: `{ "result": "{ ... JSON string ... }" }`

---

## 2. Recovery Plan Generation (PRIORITY — This is the wow moment)

**Frontend will call:** `POST /api/generate`

- Sends:

```json
{
  "prompt": "Generate a detailed Day {N} recovery plan for a patient who had {surgery_type}. They are on {medications}. Doctor notes: {instructions}. Return JSON with: { day_goal: string, instructions: string[], medications: [{name, time, note}], warning_signs: string[], diet: string, mobility_level: string, motivational_note: string }"
}
```

---

## 3. WhatsApp Caregiver Alert

**Frontend will call:** `POST /api/deliver`

```json
{
  "phone": "+919800000000",
  "message": "RecoverAI Update: Ramesh had his Day 4 check-in. Pain: 3/10. Status: STABLE. Continue current medications. - RecoverAI"
}
```

---

## 4. Environment Variables Needed

```
SARVAM_API_KEY=   (from https://dashboard.sarvam.ai/)
GEMINI_API_KEY=   (from https://aistudio.google.com/)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER= whatsapp:+14155238886
```

---

## 5. Frontend Base URL Config

The frontend will read `VITE_API_URL` from `.env`:

```
VITE_API_URL=http://localhost:8000
```

Please confirm the port when running `uvicorn main:app`.

---

## 6. Language Code Mapping

Sarvam already handles: `hi-IN`, `mr-IN`, `en-IN`, `ta-IN`, `bn-IN`
Frontend sends the user's selected language as `language_code` in the form.

---

_Written by frontend team. Tag @frontend if anything is unclear._
