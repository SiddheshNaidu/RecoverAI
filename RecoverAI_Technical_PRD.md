# RecoverAI — Technical PRD
**Hackathon:** Nakshatra | APSIT | HC-01  
**Team:** [TEAM_NAME] | A.P. Shah Institute of Technology  
**Version:** 1.0 | Based on MVP v2.0  
**Scope:** Frontend (all screens, components, state) + Backend (all endpoints, schemas, services, wiring)  
> Design System is a separate document. This PRD contains zero styling decisions.

---

## 1. Tech Stack

### Frontend
| Tool | Version | Role |
|------|---------|------|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool + dev server |
| Tailwind CSS | 3.x | Styling (utility-only, no custom CSS) |
| Recharts | 2.x | Recovery trajectory chart, adherence heatmap |
| Lucide React | 0.383.0 | Icons |
| React Router v6 | 6.x | Client-side routing |
| Fetch API | native | All HTTP calls (no axios) |
| useState + useContext | native | All state (no Redux, no Zustand) |

### Backend
| Tool | Version | Role |
|------|---------|------|
| Python | 3.11+ | Runtime |
| FastAPI | 0.111+ | API framework |
| Pydantic v2 | 2.x | Input/output validation on every endpoint |
| Supabase Python SDK | 2.x | Database client (no raw SQL) |
| python-dotenv | 1.x | Environment variable loading |
| slowapi | 0.1.x | Rate limiting |
| httpx | 0.27+ | Async HTTP for external API calls |
| uvicorn | 0.29+ | ASGI server |

### External APIs
| Service | SDK/Method | Role |
|---------|-----------|------|
| Sarvam AI | REST (httpx) | Hindi/Marathi speech-to-text transcription |
| Anthropic Claude API | REST (httpx) | Clinical risk structuring, adaptive plan generation, conversational extraction |
| Google Gemini 1.5 Pro | REST (httpx) | Wound image analysis |
| Twilio WhatsApp | twilio Python SDK | Caregiver + family alert delivery |
| Supabase | supabase-py SDK | PostgreSQL + JSONB storage |

### Deployment
| Service | What |
|---------|------|
| Vercel | Frontend (auto-deploy on push to main) |
| Railway | Backend FastAPI (uvicorn) |
| Supabase | Managed PostgreSQL |

---

## 2. Supabase Schema

> JSONB everywhere. Schema never changes on build day regardless of PS evolution.

```sql
-- Patients table
CREATE TABLE patients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  surgery_type TEXT NOT NULL,  -- 'appendectomy' | 'c_section' | 'knee_replacement' | 'gallbladder'
  discharge_date DATE NOT NULL,
  caregiver_phone TEXT,        -- E.164 format: +91XXXXXXXXXX
  family_phone TEXT,
  metadata    JSONB DEFAULT '{}',  -- hospital_name, ward, doctor_name, etc.
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Daily check-ins
CREATE TABLE checkins (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID REFERENCES patients(id),
  recovery_day    INTEGER NOT NULL,
  reporter_type   TEXT NOT NULL,  -- 'self' | 'family_proxy'
  transcript      TEXT,           -- raw Sarvam output
  wound_analysis  JSONB,          -- Gemini output: { status, observation, change_from_yesterday }
  risk_assessment JSONB NOT NULL, -- Claude output (full schema below)
  medications_confirmed JSONB,    -- { med_name: true|false } per medication
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Medications per patient
CREATE TABLE medications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  UUID REFERENCES patients(id),
  name        TEXT NOT NULL,
  frequency   TEXT NOT NULL,   -- 'once_daily' | 'twice_daily' | 'thrice_daily'
  critical    BOOLEAN DEFAULT FALSE,  -- triggers escalation if missed 3x
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Recovery milestones (pre-seeded per surgery type)
CREATE TABLE milestones (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surgery_type  TEXT NOT NULL,
  day_number    INTEGER NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL
);

-- Alerts log
CREATE TABLE alerts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  UUID REFERENCES patients(id),
  checkin_id  UUID REFERENCES checkins(id),
  recipient   TEXT NOT NULL,    -- 'caregiver' | 'family'
  phone       TEXT NOT NULL,
  message     TEXT NOT NULL,
  delivered   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. Recovery Curve Constants

> Hardcoded in `backend/constants/recovery_curves.py`. These power the trajectory engine.

```python
# Pain score (0–10), mobility score (0–10), fever risk (boolean window)
RECOVERY_CURVES = {
    "appendectomy": {
        "expected_pain":     [8, 7, 5, 4, 3, 2, 2, 1, 1, 1, 0, 0, 0, 0],
        "expected_mobility": [1, 1, 2, 3, 4, 5, 6, 7, 8, 8, 9, 9, 10, 10],
        "fever_risk_days":   [1, 2, 3, 4],
        "milestones": {3: "Fever risk window closed", 7: "Light walking expected", 14: "Wound healing checkpoint"},
        "total_days": 14
    },
    "c_section": {
        "expected_pain":     [9, 8, 7, 6, 5, 4, 3, 3, 2, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        "expected_mobility": [0, 1, 1, 2, 2, 3, 4, 5, 5, 6, 7, 7, 8, 8, 9, 9, 10, 10, 10, 10, 10],
        "fever_risk_days":   [1, 2, 3, 4, 5],
        "milestones": {3: "Incision check", 7: "Mobility milestone", 14: "Stitches review", 21: "Full recovery checkpoint"},
        "total_days": 21
    },
    "knee_replacement": {
        "expected_pain":     [9, 8, 8, 7, 6, 6, 5, 5, 4, 4, 3, 3, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        "expected_mobility": [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 10],
        "fever_risk_days":   [1, 2, 3],
        "milestones": {7: "First physio milestone", 14: "Stairs expected", 30: "Full weight bearing"},
        "total_days": 30
    },
    "gallbladder": {
        "expected_pain":     [7, 6, 4, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        "expected_mobility": [1, 2, 3, 5, 6, 7, 8, 9, 9, 10, 10, 10, 10, 10],
        "fever_risk_days":   [1, 2, 3],
        "milestones": {3: "Normal diet expected", 7: "Full activity", 14: "Complete recovery"},
        "total_days": 14
    }
}
```

---

## 4. Backend Architecture

### Folder Structure
```
/backend
  main.py                    ← FastAPI app, CORS, rate limiter, router registration
  database.py                ← Supabase client singleton
  rate_limiter.py            ← slowapi limiter config
  schemas.py                 ← All Pydantic models
  /constants
    recovery_curves.py       ← Surgery type curves + milestones
    prompt_templates.py      ← All Claude + Gemini prompt strings
  /routers
    patients.py              ← CRUD for patients + medications
    checkins.py              ← Check-in submission pipeline (main flow)
    dashboard.py             ← Nurse dashboard aggregated data
    alerts.py                ← Alert history
  /services
    sarvam.py                ← Speech-to-text
    claude_service.py        ← Risk structuring + plan generation + extraction
    gemini_service.py        ← Wound image analysis
    twilio_service.py        ← WhatsApp delivery
  /utils
    risk_engine.py           ← Readmission risk score calculator
    trajectory.py            ← Actual vs expected curve comparison
  .env.example
  requirements.txt
```

---

## 5. Backend — All Endpoints

### 5.1 Health
```
GET /health
Response: { "status": "ok", "version": "1.0" }
```

---

### 5.2 Patients Router — `/api/patients`

#### Create Patient
```
POST /api/patients
Body (JSON):
{
  "name": string,
  "surgery_type": "appendectomy" | "c_section" | "knee_replacement" | "gallbladder",
  "discharge_date": "YYYY-MM-DD",
  "caregiver_phone": string,     // E.164
  "family_phone": string,        // E.164
  "metadata": {}                 // optional
}
Response: Patient object
```

#### Get Patient
```
GET /api/patients/{patient_id}
Response: Patient object + recovery_day (calculated from discharge_date)
```

#### Add Medication
```
POST /api/patients/{patient_id}/medications
Body:
{
  "name": string,
  "frequency": "once_daily" | "twice_daily" | "thrice_daily",
  "critical": boolean
}
Response: Medication object
```

#### Get Patient Medications
```
GET /api/patients/{patient_id}/medications
Response: { "medications": Medication[] }
```

---

### 5.3 Check-ins Router — `/api/checkins` *(Core pipeline)*

#### Submit Check-in *(The main flow — chains 4 services)*
```
POST /api/checkins
Content-Type: multipart/form-data
Form fields:
  patient_id:       string (UUID)
  reporter_type:    "self" | "family_proxy"
  audio:            File (optional — .webm/.mp3/.wav, max 10MB)
  wound_image:      File (optional — image/*, max 10MB)
  text_input:       string (optional — if audio not provided)
  medications_confirmed: string (JSON string of { med_name: boolean })

Processing pipeline (sequential):
  1. If audio → sarvam.transcribe(audio_bytes) → transcript
     Else → transcript = text_input
  2. If wound_image → gemini_service.analyze_wound(image_bytes, yesterday_wound_status) → wound_analysis
     Else → wound_analysis = None
  3. claude_service.extract_and_assess(transcript, wound_analysis, patient, recovery_day) → risk_assessment
  4. risk_engine.calculate_readmission_score(patient_id, risk_assessment, medications_confirmed) → readmission_score
  5. Insert checkin row to Supabase
  6. If risk_assessment.alert_caregiver == true → twilio_service.send_whatsapp(caregiver_phone, alert_message)
  7. If risk_assessment.alert_family == true → twilio_service.send_whatsapp(family_phone, family_message)
  8. Return full CheckinResponse

Response:
{
  "checkin_id": UUID,
  "recovery_day": integer,
  "transcript": string,
  "wound_analysis": {
    "status": "Improving" | "Stable" | "Worsening",
    "observation": string,
    "change_from_yesterday": string
  } | null,
  "risk_assessment": {
    "risk_level": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
    "risk_reason": string,
    "symptoms_detected": string[],
    "plain_language_summary": string,
    "recommended_action": string,
    "hospital_directive": "stay_home" | "go_today" | "call_emergency",
    "alert_caregiver": boolean,
    "alert_family": boolean,
    "alert_message": string | null,
    "family_message": string | null,
    "recovery_day_assessment": "On track" | "Needs monitoring" | "Seek care"
  },
  "readmission_score": float,  // 0.0 to 1.0
  "readmission_risk": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "adaptive_plan_tomorrow": {
    "title": string,
    "instructions": string[],
    "warning_signs": string[],
    "medications_reminder": string[]
  },
  "milestone_triggered": {
    "day": integer,
    "title": string,
    "description": string
  } | null,
  "alerts_sent": ["caregiver" | "family"]
}
```

#### Get Patient Check-in History
```
GET /api/checkins/{patient_id}
Response:
{
  "checkins": CheckinSummary[],  // sorted by recovery_day asc
  "trajectory": {
    "days": integer[],
    "actual_pain": float[],
    "expected_pain": float[],
    "actual_mobility": float[],
    "expected_mobility": float[],
    "risk_levels": string[]
  }
}
```

#### Get Today's Check-in
```
GET /api/checkins/{patient_id}/today
Response: CheckinResponse | null
```

#### Get Adaptive Plan for Today
```
GET /api/checkins/{patient_id}/plan
Response: {
  "recovery_day": integer,
  "plan": {
    "title": string,
    "instructions": string[],
    "warning_signs": string[],
    "medications_reminder": string[]
  },
  "milestone": { "title": string, "description": string } | null
}
```

---

### 5.4 Dashboard Router — `/api/dashboard`

#### Nurse Triage Queue
```
GET /api/dashboard/triage
Response:
{
  "patients": [
    {
      "patient_id": UUID,
      "name": string,
      "surgery_type": string,
      "recovery_day": integer,
      "last_checkin_at": datetime | null,
      "risk_level": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
      "trend": "improving" | "stable" | "worsening",
      "ai_insight": string,
      "readmission_score": float,
      "trajectory_status": "On track" | "Behind" | "Ahead",
      "medication_adherence_pct": float,
      "caregiver_phone": string
    }
  ],
  "total_patients": integer,
  "high_risk_count": integer,
  "aggregate_readmission_risk": float
}
```

#### Patient Detail for Dashboard
```
GET /api/dashboard/patient/{patient_id}
Response: Full patient view — trajectory data, all check-ins, medication heatmap, alert history
```

---

### 5.5 Alerts Router — `/api/alerts`

```
GET /api/alerts/{patient_id}
Response: { "alerts": Alert[] }  // sorted by created_at desc
```

---

## 6. Claude Prompt Templates

> All prompts live in `backend/constants/prompt_templates.py`

### 6.1 Clinical Extraction + Risk Assessment
```python
RISK_ASSESSMENT_SYSTEM = """
You are a post-discharge clinical risk assessment engine for Indian patients.
Input: patient's natural language symptom report (may be in Hindi, Marathi, or English — translated internally).
Output: valid JSON ONLY. No prose, no markdown, no explanation outside the JSON.

Schema:
{
  "risk_level": "LOW|MODERATE|HIGH|CRITICAL",
  "risk_reason": "one sentence plain language explanation in English",
  "symptoms_detected": ["symptom1", "symptom2"],
  "pain_score_estimated": 0-10,
  "mobility_score_estimated": 0-10,
  "plain_language_summary": "2-3 sentences, no medical jargon, for patient/family to read",
  "recommended_action": "specific next step in plain language",
  "hospital_directive": "stay_home|go_today|call_emergency",
  "alert_caregiver": true|false,
  "alert_family": true|false,
  "alert_message": "WhatsApp message text for caregiver if alert_caregiver true, else null",
  "family_message": "WhatsApp message text for family if alert_family true, else null",
  "recovery_day_assessment": "On track|Needs monitoring|Seek care"
}

Risk classification rules:
- LOW: symptoms expected for recovery day, no fever, wound stable
- MODERATE: one concerning symptom (mild fever, new minor swelling), medication missed once
- HIGH: fever + wound symptom combo, pain worsening when should decrease, 2+ missed critical meds
- CRITICAL: severe pain spike, signs of sepsis, heavy bleeding, patient unresponsive description

WhatsApp message format:
⚠️ RecoverAI Alert — {patient_name}
Day {recovery_day} | {RISK_LEVEL}
{one line symptom summary}
Action: {recommended_action}
"""

RISK_ASSESSMENT_USER = """
Patient: {patient_name}
Surgery: {surgery_type}
Recovery Day: {recovery_day} of {total_days}
Reporter: {reporter_type}

Symptom Report:
{transcript}

Wound Analysis (from image AI):
{wound_analysis_text}

Medications confirmed today: {medications_confirmed}
Yesterday's risk level: {yesterday_risk_level}
Yesterday's wound status: {yesterday_wound_status}
"""
```

### 6.2 Adaptive Daily Plan Generation
```python
ADAPTIVE_PLAN_SYSTEM = """
You are a post-discharge recovery planning engine.
Generate tomorrow's personalized care plan based on today's check-in.
Output: valid JSON ONLY.

Schema:
{
  "title": "Day {N} Recovery Plan — short descriptive subtitle",
  "instructions": ["instruction 1", "instruction 2", "instruction 3", "instruction 4"],
  "warning_signs": ["go to hospital if X", "call doctor if Y"],
  "medications_reminder": ["Take {med_name} with food at 9AM", ...]
}

Rules:
- If fever reported today → include temperature monitoring instruction
- If wound swelling → include wound observation frequency
- If missed medication → lead with medication instruction
- If pain decreasing as expected → advance activity level
- Instructions must be actionable, specific, no jargon
- Maximum 5 instructions, 3 warning signs, all medications listed
"""

ADAPTIVE_PLAN_USER = """
Patient: {patient_name}
Surgery: {surgery_type}
Tomorrow will be: Day {next_recovery_day} of {total_days}
Today's risk level: {risk_level}
Today's symptoms: {symptoms_detected}
Today's wound status: {wound_status}
Medications: {medications_list}
Medications missed today: {missed_medications}
Expected recovery status tomorrow (from curve): Pain {expected_pain}/10, Mobility {expected_mobility}/10
"""
```

### 6.3 Wound Analysis (Gemini)
```python
WOUND_ANALYSIS_PROMPT = """
You are a wound assessment assistant. Analyse this wound photo for post-surgical recovery monitoring.

Patient context:
- Surgery type: {surgery_type}
- Recovery day: {recovery_day}
- Yesterday's wound description: {yesterday_wound_status}

Assess the wound image and return valid JSON ONLY:
{
  "status": "Improving|Stable|Worsening",
  "observation": "one objective sentence describing what you see",
  "change_from_yesterday": "Improved|No change|Worsened|First photo",
  "concerning_signs": ["sign1", "sign2"],  // empty array if none
  "clinical_flags": {
    "redness_present": true|false,
    "swelling_present": true|false,
    "discharge_visible": true|false,
    "wound_edges_separated": true|false
  }
}

Be conservative — if photo quality is poor, return status "Stable" and note poor image quality in observation.
"""
```

---

## 7. Risk Engine Logic

> `backend/utils/risk_engine.py`

```python
def calculate_readmission_score(
    trajectory_deviation: float,    # 0.0–1.0 (how far off expected curve)
    medication_adherence: float,    # 0.0–1.0 (% doses taken this recovery)
    wound_trend: str,               # "Improving" | "Stable" | "Worsening"
    risk_level: str,                # "LOW" | "MODERATE" | "HIGH" | "CRITICAL"
    recovery_day: int,
    surgery_type: str
) -> float:
    """
    Weighted readmission risk score. Returns 0.0 (no risk) to 1.0 (critical).
    
    Weights:
    - trajectory_deviation:   30%
    - medication_adherence:   25%  (inverted — low adherence = high risk)
    - wound_trend:            20%
    - current_risk_level:     15%
    - recovery_day_factor:    10%  (early days = higher baseline risk)
    """
```

---

## 8. Frontend Architecture

### 8.1 Folder Structure
```
/src
  App.jsx                    ← Router setup, role-based entry point
  main.jsx                   ← React root
  index.css                  ← Tailwind directives only

  /api
    client.js                ← All fetch calls. Siddhesh owns. Nobody touches.

  /hooks
    useApi.js                ← { data, loading, error, execute, reset } per endpoint
    usePatient.js            ← Patient context fetch + recovery day calculation
    useCheckin.js            ← Submit check-in pipeline hook
    useTrajectory.js         ← Chart data transformation hook

  /context
    AppContext.jsx            ← Global: current patient, role, PS_CONFIG

  /constants
    recoveryCurves.js        ← Mirror of backend curves (for frontend chart)
    surgeryTypes.js          ← Display labels per surgery type

  /components
    /patient
      RecoveryDayBadge.jsx   ← "Day 4 of 14" with progress ring
      StatusOrb.jsx          ← Pulsing status indicator (STABLE/MONITOR/HIGH)
      TrajectoryChart.jsx    ← Recharts: actual vs expected, dual axis
      AdherenceHeatmap.jsx   ← Medication grid (green/red squares per day)
      MilestoneCard.jsx      ← Triggered milestone notification card
      AdaptivePlanCard.jsx   ← Today's care plan, expandable instructions
      AlertsLog.jsx          ← Recent WhatsApp alerts sent

    /checkin
      CheckinTabs.jsx        ← Voice / Text tab switcher
      VoiceRecorder.jsx      ← MediaRecorder mic flow
      ProxyToggle.jsx        ← "Reporting for [patient name]" toggle
      MedConfirmList.jsx     ← Checkbox list: confirm each medication
      WoundUpload.jsx        ← Image upload with preview
      RiskResultCard.jsx     ← Post-submit result: risk level + summary + plan

    /nurse
      TriageTable.jsx        ← Sorted patient queue table
      PatientRow.jsx         ← Single row: name, risk badge, trend, AI insight
      RiskBadge.jsx          ← Color-coded LOW/MODERATE/HIGH/CRITICAL badge
      TrendArrow.jsx         ← ↑ ↓ → trend indicator
      ReadmissionGauge.jsx   ← Visual score gauge per patient
      AggregateBar.jsx       ← Hospital-level stats strip

    /ui
      LoadingState.jsx
      ErrorState.jsx
      StatusBadge.jsx
      EmptyState.jsx

  /pages
    PatientHomePage.jsx      ← Route: /patient/:id
    CheckinPage.jsx          ← Route: /patient/:id/checkin
    NurseDashboardPage.jsx   ← Route: /dashboard
    OnboardPage.jsx          ← Route: / (patient setup — demo only)
```

---

## 9. Frontend — Screen by Screen

### Page 1: OnboardPage (`/`)
**Purpose:** Demo entry point. In production this would be auth. For demo it's a patient selector.

**Components:**
- Surgery type selector (4 options as cards)
- Pre-filled patient name input
- Discharge date picker
- Caregiver phone + family phone inputs
- Medications entry list (add/remove rows)
- "Enter as Patient" CTA → navigates to `/patient/:id`
- "Enter as Nurse" CTA → navigates to `/dashboard`

**State:**
- `useState` for form fields
- On submit → `POST /api/patients` + `POST /api/patients/:id/medications`
- On success → stores `patient_id` in AppContext, navigates

---

### Page 2: PatientHomePage (`/patient/:id`)
**Purpose:** Patient's daily anchor. Recovery status at a glance.

**Layout (top to bottom):**

```
┌─────────────────────────────────────┐
│  Header: "Good morning, Ramesh"     │
│  RecoveryDayBadge: Day 4 of 14      │
├─────────────────────────────────────┤
│  StatusOrb (large, center)          │
│  STABLE / MONITOR / HIGH RISK       │
├─────────────────────────────────────┤
│  AdaptivePlanCard (today's plan)    │
│  Collapsible — shows 4 instructions │
├─────────────────────────────────────┤
│  TrajectoryChart (compact, 2-axis)  │
│  Pain actual vs expected            │
├─────────────────────────────────────┤
│  AdherenceHeatmap (medication grid) │
├─────────────────────────────────────┤
│  MilestoneCard (if triggered today) │
├─────────────────────────────────────┤
│  "Record Today's Check-in" CTA btn  │
│  → navigates to /patient/:id/checkin│
├─────────────────────────────────────┤
│  AlertsLog (last 3 alerts)          │
└─────────────────────────────────────┘
```

**Data fetching (on mount):**
- `GET /api/patients/:id` → patient info + recovery_day
- `GET /api/checkins/:id/plan` → today's adaptive plan
- `GET /api/checkins/:id` → trajectory data + history
- `GET /api/alerts/:id` → alerts log

---

### Page 3: CheckinPage (`/patient/:id/checkin`)
**Purpose:** The demo's hero screen. Voice → AI → result.

**Flow states:** `idle` → `recording` → `transcribing` → `reviewing` → `processing` → `result`

**Layout by state:**

**`idle`:**
- ProxyToggle at top ("I am Ramesh" / "Reporting for Ramesh")
- MedConfirmList — checkbox per medication
- CheckinTabs (Voice / Text)
- WoundUpload — optional
- Submit button (disabled until transcript exists)

**`recording`:** (Voice tab active)
- Large mic button with pulse ring animation
- Live transcript preview streaming in
- Stop recording button

**`transcribing`:**
- Transcript text displayed
- "Analysing wound..." if image attached
- Subtle loading indicator

**`processing`:**
- Full screen: "Updating your recovery plan..."
- Three step indicators: "Assessing symptoms → Analysing wound → Generating tomorrow's plan"

**`result`:**
- RiskResultCard slides up:
  - Risk level badge (large, colored)
  - `plain_language_summary`
  - `hospital_directive` card (stay home / go today / call emergency)
  - Wound status one-liner (if image submitted)
  - Medications confirmed summary
  - Tomorrow's adaptive plan preview
  - WhatsApp alert status ("✓ Dr. [name] has been notified" or "No alert needed")
- MilestoneCard if triggered
- "Back to Home" CTA

**State managed by `useCheckin` hook:**
```js
const {
  step,           // idle | recording | transcribing | reviewing | processing | result
  transcript,
  result,         // full CheckinResponse from API
  startRecording,
  stopRecording,
  submitCheckin,
  reset
} = useCheckin(patientId)
```

---

### Page 4: NurseDashboardPage (`/dashboard`)
**Purpose:** Caregiver/nurse triage queue. Power-user screen.

**Layout:**

```
┌──────────────────────────────────────────────────────┐
│  AggregateBar: Total patients | High risk | Avg score│
├──────────────────────────────────────────────────────┤
│  TriageTable (sorted HIGH → CRITICAL first)          │
│  Columns:                                            │
│    Priority | Patient | Surgery | Day | Last check-in│
│    Trend | AI Insight | Readmission Risk | Action    │
├──────────────────────────────────────────────────────┤
│  Click any row → slide-in Patient Detail panel       │
│    TrajectoryChart (full size)                       │
│    AdherenceHeatmap (full history)                   │
│    All check-in summaries                            │
│    Alert history                                     │
│    "Schedule Callback" button (tel: link)            │
└──────────────────────────────────────────────────────┘
```

**Data fetching:**
- `GET /api/dashboard/triage` → full patient queue (on mount + auto-refresh every 60s)
- On row click → `GET /api/dashboard/patient/:id` → patient detail panel

---

## 10. State Architecture

```
AppContext:
  currentPatient: Patient | null
  currentRole: "patient" | "nurse"
  PS_CONFIG: {
    PROMPT_TYPE: "recovery_risk",
    AUDIO_ENABLED: true,
    FILE_ENABLED: true,
    WHATSAPP_ENABLED: true,
    PRIMARY_LABEL: "Check-in"
  }

Page-level state (useState only, no cross-page sharing needed):
  PatientHomePage: { trajectoryData, todayPlan, alertsLog, milestones }
  CheckinPage: { step, transcript, audioBlob, woundImage, medConfirmations, result }
  NurseDashboardPage: { patients, selectedPatientId, patientDetail }
```

---

## 11. API Client — Full Method List

> `src/api/client.js` — Siddhesh owns this file entirely.

```js
// Patients
createPatient(data)                          → POST /api/patients
getPatient(patientId)                        → GET  /api/patients/:id
addMedication(patientId, data)               → POST /api/patients/:id/medications
getMedications(patientId)                    → GET  /api/patients/:id/medications

// Check-ins
submitCheckin(formData)                      → POST /api/checkins (multipart)
getCheckinHistory(patientId)                 → GET  /api/checkins/:id
getTodayCheckin(patientId)                   → GET  /api/checkins/:id/today
getAdaptivePlan(patientId)                   → GET  /api/checkins/:id/plan

// Dashboard
getTriageQueue()                             → GET  /api/dashboard/triage
getPatientDetail(patientId)                  → GET  /api/dashboard/patient/:id

// Alerts
getAlertHistory(patientId)                   → GET  /api/alerts/:id

// Health
checkHealth()                                → GET  /health
```

---

## 12. Environment Variables

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:8000
```

### Backend (`.env`)
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=your-service-role-key

ANTHROPIC_API_KEY=your-claude-api-key
GEMINI_API_KEY=your-gemini-api-key
SARVAM_API_KEY=your-sarvam-subscription-key

TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_FROM_NUMBER=whatsapp:+14155238886
```

---

## 13. Build Day Task Ownership

| Task | Owner | Estimated Time |
|------|-------|---------------|
| Backend: Supabase schema migration | Siddhesh | 20 min |
| Backend: Recovery curves constants | Siddhesh | 20 min |
| Backend: Claude prompt templates | Siddhesh | 45 min |
| Backend: `POST /api/checkins` pipeline | Siddhesh | 90 min |
| Backend: All other endpoints | Siddhesh | 60 min |
| Backend: Risk engine + trajectory utils | Siddhesh | 45 min |
| Frontend: `src/api/client.js` + hooks | Siddhesh | 30 min |
| Frontend: AppContext + routing | Siddhesh | 20 min |
| Frontend: CheckinPage (full flow) | Siddhesh | 90 min |
| Frontend: PatientHomePage | Siddhesh | 45 min |
| Frontend: TrajectoryChart component | Bishnupriya | 60 min |
| Frontend: AdherenceHeatmap component | Bishnupriya | 45 min |
| Frontend: NurseDashboardPage + TriageTable | Bishnupriya | 75 min |
| Frontend: RiskResultCard + StatusOrb | Bishnupriya | 45 min |
| Frontend: AdaptivePlanCard + MilestoneCard | Bishnupriya | 30 min |
| Kaushik: Supabase RLS + security checks | Kaushik | ongoing |
| Kaushik: API validation stress tests | Kaushik | ongoing |
| Sakshi: Demo data seeding | Sakshi | 30 min |
| Sakshi: Demo script + video recording | Sakshi | 60 min |
| Deploy: Vercel + Railway + live test | Siddhesh | 30 min |
| **Total Siddhesh** | | **~8 hrs** |
| **Total Bishnupriya** | | **~4.5 hrs** |

---

## 14. Demo Data (Pre-seed Before Recording)

```json
Patient: {
  "name": "Ramesh Patil",
  "surgery_type": "appendectomy",
  "discharge_date": "[today - 3 days]",
  "caregiver_phone": "+91[Sakshi's number]",
  "family_phone": "+91[Sakshi's number]",
}

Medications: [
  { "name": "Amoxicillin 500mg", "frequency": "thrice_daily", "critical": true },
  { "name": "Paracetamol 650mg", "frequency": "twice_daily", "critical": false },
  { "name": "Pantoprazole 40mg", "frequency": "once_daily", "critical": false }
]

Pre-existing check-ins (Days 1–3): Seed with realistic data showing
  Day 1: HIGH (expected), Day 2: MODERATE, Day 3: LOW
  → trajectory shows improving but Day 4 will spike (demo check-in)
```

---

## 15. What's Mocked vs Live for Demo

| Feature | Status | Notes |
|---------|--------|-------|
| Voice check-in → Claude risk | ✅ Live | Core demo feature |
| Wound photo → Gemini analysis | ✅ Live | Core wow moment |
| WhatsApp to Sakshi's phone | ✅ Live | Hero moment |
| Trajectory chart | ✅ Live | Real Supabase data |
| Adaptive plan generation | ✅ Live | Claude call |
| Nurse triage dashboard | ⚠️ Seeded | 4-5 pre-seeded patients, one real |
| Medication adherence heatmap | ✅ Live | Day 1-3 pre-seeded, Day 4 live |
| Milestone card | ✅ Live | Triggers from curve constants |
| Readmission risk score | ✅ Live | Calculated from check-in |
| Multi-patient nurse view | ⚠️ Seeded | Real nurse queue logic, seeded data |

---

*Design System document is separate. This PRD contains zero visual/styling decisions.*
*Open items: Team name, confirm Sakshi's phone for WhatsApp demo, confirm surgery type (appendectomy recommended).*
