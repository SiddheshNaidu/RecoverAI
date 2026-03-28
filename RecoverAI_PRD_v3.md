# RecoverAI — Product Requirements Document v3.0

**Project:** RecoverAI — Intelligent Post-Discharge Care Companion
**Problem Statement (HC-01):** Design a digital companion that supports patients during their post-hospital recovery phase through personalized recovery plans, symptom monitoring, and timely alerts. The system should enable caregiver access and remote monitoring by healthcare professionals, and may include voice assistance and engagement mechanisms to improve adherence to recovery plans.
**Version:** 3.0 (Revised after team brainstorming — supersedes v2 and Technical PRD)
**Date:** 2026-03-28

---

## 1. Core Vision

> **Post-discharge failure happens because the recovery loop never closes.**

RecoverAI is a **multilingual, AI-powered recovery companion** that:

1. Generates a **personalized daily recovery plan** at discharge using AI
2. Conducts **voice-based daily check-ins** in Hindi, Marathi, or English (via Sarvam AI)
3. Uses **Gemini AI to score pain, detect symptoms**, and adapt tomorrow's plan
4. Keeps **caregivers informed daily** via WhatsApp summaries
5. Gives **hospital receptionists** a dashboard to track their discharged patients

**The language barrier is zero.** Patients speak naturally in their language. The AI understands.

---

## 2. User Roles

| Role             | Who                                       | Access                                                                                                                         |
| ---------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Patient**      | Discharged person (any age, any language) | Self-onboard OR onboarded by receptionist. Sees recovery plan, does check-ins, views history                                   |
| **Caregiver**    | Family member / proxy                     | Added during onboarding. Receives daily WhatsApp updates. Can do check-in on patient's behalf (proxy mode)                     |
| **Receptionist** | Hospital front-desk staff                 | Logs in under a hospital. Registers discharged patients. Sees only their own patients. Tracks appointments and recovery status |

> **Note:** This is NOT a nurse role. Receptionists handle discharge paperwork and appointment tracking — not clinical triage.

---

## 3. Architecture — "Two-Door Entry"

```
┌─────────────────────────────────────────┐
│           LANDING PAGE (/)              │
│   "I'm a Patient"  |  "I'm Staff"      │
└──────────┬──────────────────┬───────────┘
           │                  │
     PATIENT DOOR       RECEPTIONIST DOOR
           │                  │
    ┌──────▼──────┐    ┌──────▼──────┐
    │  Onboarding │    │   Login     │
    │  (2 paths)  │    │  (Hospital) │
    └──────┬──────┘    └──────┬──────┘
           │                  │
    ┌──────▼──────┐    ┌──────▼──────────┐
    │ Patient     │    │ Receptionist    │
    │ Dashboard   │    │ Dashboard       │
    │ ├─ Plan     │    │ ├─ Patient List │
    │ ├─ Check-in │    │ ├─ New Patient  │
    │ ├─ History  │    │ └─ Patient View │
    │ └─ SOS      │    └─────────────────┘
    └─────────────┘
```

---

## 4. Page-by-Page Specification

---

### 4.1 Landing Page (`/`)

**Purpose:** First impression. Explain what RecoverAI does. Two clear entry points.

**Layout:**

- Hero section with tagline: _"Your AI Recovery Companion — in your language"_
- Two large CTA cards:
  - 🏥 **"I'm a Patient"** → `/onboard`
  - 👩‍⚕️ **"Hospital Staff"** → `/login`
- Feature highlights strip (voice check-in, AI plan, multilingual, wound tracking)
- Trust badges (languages supported, privacy note)

**State:** None. Static page.

---

### 4.2 Patient Onboarding (`/onboard`)

**Purpose:** Create patient profile + generate AI recovery plan. This is the **most critical page** — the plan generated here powers the entire experience.

**Two Sub-Paths (tabs or segmented control):**

#### Path A — "Upload Discharge Summary"

1. Patient uploads discharge summary PDF/image
2. Backend sends to Gemini → extracts: surgery type, medications, discharge date, special instructions
3. AI generates personalized recovery plan based on extracted data
4. Patient reviews plan → confirms → enters caregiver phone + language preference
5. → Navigate to `/patient/:id`

#### Path B — "Answer Questions"

1. Step-by-step guided questionnaire:
   - What surgery did you have? (card selector: Appendectomy, C-Section, Knee Replacement, Gallbladder, Other)
   - When were you discharged? (date picker)
   - What medications were prescribed? (add/remove list)
   - Any special instructions from your doctor? (text area)
2. AI generates recovery plan from answers
3. Patient enters: name, caregiver phone, preferred language
4. → Navigate to `/patient/:id`

**Data sent to backend:**

```json
POST /api/patients
{
  "name": "Ramesh Patil",
  "surgery_type": "appendectomy",
  "discharge_date": "2026-03-25",
  "caregiver_phone": "+919800000000",
  "language_preference": "hi",
  "medications": [
    { "name": "Amoxicillin 500mg", "frequency": "thrice_daily", "critical": true },
    { "name": "Paracetamol 650mg", "frequency": "twice_daily", "critical": false }
  ],
  "discharge_summary_text": "..." // extracted or entered
}
```

**Response includes:** AI-generated recovery plan for Day 1.

---

### 4.3 Patient Home (`/patient/:id`)

**Purpose:** Daily anchor. Show today's status at a glance. Make check-in obvious.

**Layout (top to bottom, mobile-first, max-w-2xl):**

```
┌─────────────────────────────────────┐
│  "Good morning, Ramesh"             │
│  Day 4 of 14 • Appendectomy        │
├─────────────────────────────────────┤
│  Status Orb (pulsing)               │
│  "ON TRACK" / "NEEDS ATTENTION"     │
├─────────────────────────────────────┤
│  Today's Plan Preview (3 items)     │
│  → "View Full Plan"                 │
├─────────────────────────────────────┤
│  🎤 "Record Today's Check-in"       │
│  (large primary CTA button)         │
├─────────────────────────────────────┤
│  Recovery Heatmap (pain + meds)     │
│  Visual grid: green/amber/red       │
├─────────────────────────────────────┤
│  Milestone Card (if triggered)      │
│  "Day 3: Fever risk window closed!" │
├─────────────────────────────────────┤
│  Bottom Nav: Home | Plan | History  │
└─────────────────────────────────────┘
```

**Data fetching (on mount):**

- `GET /api/patients/:id` → patient info + recovery_day
- `GET /api/checkins/:id/plan` → today's adaptive plan
- `GET /api/checkins/:id` → trajectory data (for heatmap)

---

### 4.4 Recovery Plan Page (`/patient/:id/plan`)

**Purpose:** Full view of today's AI-generated recovery plan. The **centerpiece** of the patient experience.

**Layout:**

```
┌─────────────────────────────────────┐
│  "Day 4 Recovery Plan"              │
│  Surgery: Appendectomy              │
├─────────────────────────────────────┤
│  📋 Today's Instructions            │
│  1. Take Amoxicillin with breakfast │
│  2. Walk for 10 minutes (light)     │
│  3. Check wound for redness         │
│  4. Rest after lunch — no lifting   │
├─────────────────────────────────────┤
│  💊 Medication Schedule             │
│  ┌ 9:00 AM  Amoxicillin 500mg  ☐  │
│  ├ 2:00 PM  Paracetamol 650mg  ☐  │
│  └ 9:00 PM  Amoxicillin 500mg  ☐  │
├─────────────────────────────────────┤
│  ⚠️ Warning Signs                   │
│  • Go to hospital if fever > 101°F │
│  • Call doctor if wound leaks fluid│
├─────────────────────────────────────┤
│  🎯 Today's Goal                    │
│  "Walk to the kitchen and back      │
│   without assistance"               │
├─────────────────────────────────────┤
│  Bottom Nav: Home | Plan | History  │
└─────────────────────────────────────┘
```

**Data:** `GET /api/checkins/:id/plan`

---

### 4.5 Daily Check-in Page (`/patient/:id/checkin`)

**Purpose:** The hero demo screen. Patient speaks → AI understands → scores → updates plan.

**Flow States:** `idle` → `recording` → `processing` → `result`

#### State: `idle`

- Proxy toggle: "I am Ramesh" ↔ "Reporting for Ramesh" (sets `reporter_type`)
- Medication confirmation list (check/X per medication)
- Two input modes:
  - 🎤 **Voice** (primary, large mic button) — records audio → sent to Sarvam AI for transcription
  - ⌨️ **Type** (fallback) — text area for manual input
- 📸 **Wound photo** (optional) — camera/upload button
- Submit button (disabled until voice/text exists)

#### State: `recording`

- Large pulsing mic button with concentric rings
- Live waveform visualizer (8 animated bars)
- Sarvam AI processes audio → transcript streams in real-time
- Stop button

#### State: `processing`

- Full-screen animated state:
  - Step 1: "Transcribing your words..." (Sarvam AI)
  - Step 2: "Understanding your symptoms..." (Gemini AI)
  - Step 3: "Updating your recovery plan..." (Plan generation)

#### State: `result`

- **Pain/Symptom Score** from Gemini (visual gauge: 1–10)
- **Risk Level** badge (LOW / MODERATE / HIGH / CRITICAL)
- **Plain language summary**: "You're recovering well. The mild discomfort is normal for Day 4."
- **Hospital directive**: "Stay home and rest" / "Visit hospital today" / "Call emergency"
- **Wound status** (if photo uploaded): "Wound: Stable — healing as expected"
- **Tomorrow's plan preview**: "Your Day 5 plan has been updated"
- **Caregiver notification status**: "✓ Update sent to Priya's WhatsApp"
- **"Return to Home"** CTA

**API Call:**

```
POST /api/checkins (multipart/form-data)
Fields:
  patient_id: UUID
  reporter_type: "self" | "family_proxy"
  audio: File (optional — .webm, sent to Sarvam AI)
  text_input: string (optional — if no audio)
  wound_image: File (optional)
  medications_confirmed: JSON string { "Amoxicillin 500mg": true, "Paracetamol 650mg": false }
```

**Backend Pipeline (sequential):**

1. `audio` → **Sarvam AI** → transcript (multilingual: Hindi/Marathi/English)
2. `transcript` + `wound_image` → **Gemini AI** → pain score, symptom extraction, wound analysis
3. Extracted data → **Risk Engine** → risk level + readmission score
4. Risk data + patient history → **Gemini AI** → adaptive plan for tomorrow
5. If caregiver_phone exists → **WhatsApp** (daily summary to caregiver)
6. Return full `CheckinResponse`

---

### 4.6 Recovery Journal / Check-in History (`/patient/:id/history`)

**Purpose:** Simplified timeline of past check-ins. Must be readable by elderly patients.

**Design Principles:**

- **Large text** (16px minimum body)
- **Color-coded days** (green = good, amber = watch, red = concern)
- **No medical jargon** — "You felt good" not "Pain score: 2/10"
- **Visual timeline**, not a data table

**Layout:**

```
┌─────────────────────────────────────┐
│  "Your Recovery Journey"            │
├─────────────────────────────────────┤
│  Day 4 (Today) ───── 🟢 On Track   │
│  "You reported mild discomfort.     │
│   Wound is healing well."          │
│  Pain: ██░░░░░░░░ 2/10             │
├─────────────────────────────────────┤
│  Day 3 ───────────── 🟡 Monitor    │
│  "You had slight fever. Medicine    │
│   was taken. Wound was stable."    │
│  Pain: ████░░░░░░ 4/10             │
├─────────────────────────────────────┤
│  Day 2 ───────────── 🟡 Monitor    │
│  "Some pain after walking.          │
│   That's normal for Day 2."        │
│  Pain: ██████░░░░ 6/10             │
├─────────────────────────────────────┤
│  Day 1 ───────────── 🔴 Expected   │
│  "First day after surgery.          │
│   High pain is normal."            │
│  Pain: ████████░░ 8/10             │
└─────────────────────────────────────┘
```

**Also includes:**

- Recovery trajectory chart (actual vs expected curves)
- Medication adherence heatmap (7-day grid)
- Share button → generates a summary that can be sent to doctor

**Data:** `GET /api/checkins/:id` → full history + trajectory data

---

### 4.7 Emergency / SOS Page (`/patient/:id/sos`)

**Purpose:** One-tap emergency help when a patient is scared or in pain.

**Layout:**

- Large red **"Call Emergency"** button (tel: link)
- **Hospital directive** from last check-in ("Go to hospital immediately")
- Emergency numbers (ambulance, hospital, doctor)
- Caregiver contact (one-tap call)
- Location sharing prompt

**This page should be accessible from bottom nav in 1 tap.**

---

### 4.8 Receptionist Login (`/login`)

**Purpose:** Hospital staff authentication (simulated for demo).

**Layout:**

- Hospital name selector (dropdown or search)
- Staff name input
- Staff ID / password (simulated)
- → Navigate to `/receptionist`

**For demo:** Pre-fill with "City Hospital" and "Priya Sharma, Receptionist"

---

### 4.9 Receptionist Dashboard (`/receptionist`)

**Purpose:** Overview of all discharged patients registered by this receptionist.

**Layout:**

```
┌──────────────────────────────────────────────────────┐
│  City Hospital — Priya Sharma, Receptionist          │
├──────────────────────────────────────────────────────┤
│  Summary Cards:                                      │
│  [12 Active] [3 Needs Attention] [2 Appointments]    │
├──────────────────────────────────────────────────────┤
│  📋 Upcoming Appointments                            │
│  ┌ Tomorrow 10AM — Ramesh Patil (Day 7 wound check) │
│  └ Mar 30 2PM — Sunita Sharma (stitches removal)    │
├──────────────────────────────────────────────────────┤
│  Patient List (sorted by risk, simplified)           │
│  ┌ 🔴 Ramesh Patil    Day 4  Appendectomy   →      │
│  ├ 🟡 Sunita Sharma   Day 2  C-Section      →      │
│  ├ 🟢 Vikram Joshi    Day 6  Knee           →      │
│  └ 🟢 Anita Desai     Day 8  Gallbladder    →      │
├──────────────────────────────────────────────────────┤
│  [+ Register New Patient]                            │
└──────────────────────────────────────────────────────┘
```

**Key design:** Each patient row is a **card** (not a dense table row) — simplified, scannable, tap to view details.

**Appointments:** Auto-generated from recovery plan milestones (e.g., "Day 7: wound check appointment" → appears as a scheduled item).

**Data:** `GET /api/dashboard/triage` (scoped to receptionist's patients)

---

### 4.10 Register New Patient (`/receptionist/new`)

**Purpose:** Receptionist enters discharge details → AI generates recovery plan for the patient.

**Flow:**

1. Patient name + phone number
2. Surgery type (card selector)
3. Discharge date
4. Medications list (add/remove)
5. Caregiver phone (mandatory)
6. Special instructions (text area)
7. **"Generate Recovery Plan"** → AI creates plan
8. Review plan → Confirm
9. Patient receives SMS/link to access their plan

**API:** `POST /api/patients` + `POST /api/patients/:id/medications`

---

### 4.11 Receptionist Patient View (`/receptionist/patient/:id`)

**Purpose:** View a specific patient's recovery progress.

**Layout:**

- Patient info card (name, surgery, day, risk level)
- Recovery heatmap (pain trend + medication adherence)
- Recent check-in summaries (last 3 days)
- Alert history (WhatsApp messages sent)
- Contact buttons: Call Patient | Call Caregiver
- Appointment scheduling

**Data:** `GET /api/dashboard/patient/:id`

---

## 5. Tech Stack

### Frontend

| Tool                      | Role                         |
| ------------------------- | ---------------------------- |
| React 18.x                | UI framework                 |
| Vite 5.x                  | Build tool                   |
| Tailwind CSS 3.x          | Styling                      |
| Recharts 2.x              | Charts (trajectory, heatmap) |
| Material Symbols Outlined | Icons (via Google Fonts)     |
| React Router v6           | Routing                      |
| Fetch API                 | HTTP calls                   |
| useState + useContext     | State management             |

### Backend

| Tool                   | Role                                                              |
| ---------------------- | ----------------------------------------------------------------- |
| Python 3.11+ / FastAPI | API server                                                        |
| Supabase               | PostgreSQL database                                               |
| Sarvam AI API          | Multilingual speech-to-text (Hindi, Marathi, English)             |
| Google Gemini API      | Pain scoring, symptom extraction, wound analysis, plan generation |
| Twilio WhatsApp API    | Caregiver daily notifications                                     |

---

## 6. API Endpoints

### Patients

```
POST   /api/patients                    → Create patient + generate AI plan
GET    /api/patients/:id                → Get patient + recovery_day
POST   /api/patients/:id/medications    → Add medication
GET    /api/patients/:id/medications    → Get medications list
```

### Check-ins

```
POST   /api/checkins                    → Submit check-in (multipart: audio/text + wound photo)
GET    /api/checkins/:id                → Get check-in history + trajectory data
GET    /api/checkins/:id/today          → Get today's check-in result
GET    /api/checkins/:id/plan           → Get today's adaptive plan
```

### Dashboard (Receptionist)

```
GET    /api/dashboard/triage            → All patients for this receptionist
GET    /api/dashboard/patient/:id       → Full patient detail view
```

### Alerts

```
GET    /api/alerts/:id                  → Alert history for patient
```

### Health

```
GET    /health                          → { "status": "ok" }
```

---

## 7. AI Integration Details

### 7.1 Sarvam AI — Multilingual Voice Transcription

- **When:** During daily check-in, when patient records voice
- **Input:** Audio blob (.webm/.mp3/.wav)
- **Processing:** Transcribes Hindi/Marathi/English speech to text
- **Output:** Clean transcript in the original language
- **Why Sarvam:** Optimized for Indian languages, better accuracy than generic STT for Hindi/Marathi

### 7.2 Google Gemini API — The AI Brain

Gemini handles **4 tasks** in the check-in pipeline:

| Task                   | Input                                                 | Output                                            |
| ---------------------- | ----------------------------------------------------- | ------------------------------------------------- |
| **Symptom Extraction** | Transcript (any language)                             | Structured JSON: pain_score, symptoms, severity   |
| **Pain Scoring**       | Extracted symptoms + recovery day + surgery type      | Score 0–10 + trend (improving/stable/worsening)   |
| **Wound Analysis**     | Wound photo + yesterday's status                      | Status (Improving/Stable/Worsening) + observation |
| **Plan Generation**    | Today's assessment + patient history + recovery curve | Tomorrow's personalized daily plan                |

### 7.3 WhatsApp (Twilio) — Caregiver Notifications

- **When:** After every daily check-in (not just HIGH risk — every day)
- **To:** Caregiver phone number (entered during onboarding)
- **Content:**

```
RecoverAI Daily Update — Ramesh Patil
Day 4 of 14 | Status: ON TRACK ✅

Today's check-in: Ramesh reported mild discomfort near the wound.
Pain: 3/10 (improving from yesterday's 5/10)
Medications: All taken ✅
Wound: Stable — healing normally

Tomorrow's focus: Light walking, wound observation every 4 hours.

If concerned, call: [hospital number]
```

---

## 8. Recovery Heatmap Specification

The heatmap is a **visual grid** that combines two data sources:

### Pain/Symptom Heatmap

| Day 1 | Day 2 | Day 3 | Day 4 | Day 5 | Day 6 | Day 7 |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 🔴 8  | 🔴 6  | 🟡 4  | 🟡 3  | 🟢 2  | ⬜ —  | ⬜ —  |

Colors based on pain score deviation from expected:

- 🟢 Green: On track or better than expected
- 🟡 Amber: Slightly off curve
- 🔴 Red: Significantly worse than expected
- ⬜ Gray: Future / no data

### Medication Adherence Heatmap

| Med           | D1  | D2  | D3  | D4  |
| ------------- | :-: | :-: | :-: | :-: |
| Amoxicillin ★ | ✅  | ✅  | ❌  | ✅  |
| Paracetamol   | ✅  | ✅  | ✅  | ⬜  |

★ = Critical medication (3 consecutive misses → HIGH RISK flag)

**Shared with:** Receptionist dashboard (if hospital flow) OR caregiver via WhatsApp (if direct flow)

---

## 9. Recovery Curve Constants

```javascript
// Frontend mirror of backend curves
const RECOVERY_CURVES = {
  appendectomy: {
    expected_pain: [8, 7, 5, 4, 3, 2, 2, 1, 1, 1, 0, 0, 0, 0],
    expected_mobility: [1, 1, 2, 3, 4, 5, 6, 7, 8, 8, 9, 9, 10, 10],
    fever_risk_days: [1, 2, 3, 4],
    milestones: {
      3: "Fever risk window closed",
      7: "Light walking expected",
      14: "Wound healing checkpoint",
    },
    total_days: 14,
  },
  c_section: {
    expected_pain: [
      9, 8, 7, 6, 5, 4, 3, 3, 2, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    expected_mobility: [
      0, 1, 1, 2, 2, 3, 4, 5, 5, 6, 7, 7, 8, 8, 9, 9, 10, 10, 10, 10, 10,
    ],
    fever_risk_days: [1, 2, 3, 4, 5],
    milestones: {
      3: "Incision check",
      7: "Mobility milestone",
      14: "Stitches review",
      21: "Full recovery",
    },
    total_days: 21,
  },
  knee_replacement: {
    expected_pain: [
      9, 8, 8, 7, 6, 6, 5, 5, 4, 4, 3, 3, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0,
    ],
    expected_mobility: [
      0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9,
      9, 10, 10, 10, 10,
    ],
    fever_risk_days: [1, 2, 3],
    milestones: {
      7: "First physio milestone",
      14: "Stairs expected",
      30: "Full weight bearing",
    },
    total_days: 30,
  },
  gallbladder: {
    expected_pain: [7, 6, 4, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    expected_mobility: [1, 2, 3, 5, 6, 7, 8, 9, 9, 10, 10, 10, 10, 10],
    fever_risk_days: [1, 2, 3],
    milestones: {
      3: "Normal diet expected",
      7: "Full activity",
      14: "Complete recovery",
    },
    total_days: 14,
  },
};
```

---

## 10. Frontend Folder Structure

```
/src
  App.jsx                          ← Router: all routes defined here
  main.jsx                         ← React root
  index.css                        ← Tailwind + design tokens

  /api
    client.js                      ← All fetch calls to backend

  /hooks
    useApi.js                      ← Generic { data, loading, error, execute }
    usePatient.js                  ← Patient context + recovery day
    useCheckin.js                  ← Check-in flow state machine
    useTrajectory.js               ← Chart data transformation

  /context
    AppContext.jsx                 ← Global: currentPatient, currentRole

  /constants
    recoveryCurves.js              ← Mirror of backend curves
    surgeryTypes.js                ← Display labels

  /components
    /patient
      StatusOrb.jsx                ← Pulsing recovery status indicator
      RecoveryDayBadge.jsx         ← "Day 4 of 14" progress ring
      TrajectoryChart.jsx          ← Recharts: actual vs expected curves
      AdherenceHeatmap.jsx         ← Medication + pain heatmap grid
      MilestoneCard.jsx            ← Recovery milestone celebration
      AdaptivePlanCard.jsx         ← Today's plan preview (collapsible)
      AlertsLog.jsx                ← Recent caregiver notifications

    /checkin
      ProxyToggle.jsx              ← "I am X" / "Reporting for X"
      VoiceRecorder.jsx            ← Mic button + waveform + Sarvam integration
      TranscriptCard.jsx           ← Live transcript display
      MedConfirmList.jsx           ← Medication check/X toggles
      WoundUpload.jsx              ← Optional wound photo upload
      ProcessingState.jsx          ← 3-step AI processing animation
      RiskResultCard.jsx           ← Post-check-in result card
      PainScoreGauge.jsx           ← Visual 0–10 pain score from Gemini

    /receptionist
      PatientCard.jsx              ← Single patient card (not table row)
      AppointmentCard.jsx          ← Upcoming appointment item
      SummaryCards.jsx              ← Active / Attention / Appointments counts

    /ui
      LoadingState.jsx
      ErrorState.jsx
      StatusBadge.jsx
      EmptyState.jsx
      TopNav.jsx
      BottomNav.jsx

  /pages
    LandingPage.jsx                ← /
    OnboardPage.jsx                ← /onboard (patient self-service)
    PatientHomePage.jsx            ← /patient/:id
    RecoveryPlanPage.jsx           ← /patient/:id/plan
    CheckinPage.jsx                ← /patient/:id/checkin
    HistoryPage.jsx                ← /patient/:id/history
    SOSPage.jsx                    ← /patient/:id/sos
    LoginPage.jsx                  ← /login (receptionist)
    ReceptionistDashboard.jsx      ← /receptionist
    RegisterPatientPage.jsx        ← /receptionist/new
    ReceptionistPatientView.jsx    ← /receptionist/patient/:id
```

---

## 11. Routing Table

```jsx
<Routes>
  {/* Public */}
  <Route path="/" element={<LandingPage />} />

  {/* Patient Flow */}
  <Route path="/onboard" element={<OnboardPage />} />
  <Route path="/patient/:id" element={<PatientHomePage />} />
  <Route path="/patient/:id/plan" element={<RecoveryPlanPage />} />
  <Route path="/patient/:id/checkin" element={<CheckinPage />} />
  <Route path="/patient/:id/history" element={<HistoryPage />} />
  <Route path="/patient/:id/sos" element={<SOSPage />} />

  {/* Receptionist Flow */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/receptionist" element={<ReceptionistDashboard />} />
  <Route path="/receptionist/new" element={<RegisterPatientPage />} />
  <Route
    path="/receptionist/patient/:id"
    element={<ReceptionistPatientView />}
  />

  {/* Catch-all */}
  <Route path="*" element={<Navigate to="/" />} />
</Routes>
```

---

## 12. Demo Walkthrough (2.5 Minutes)

| Time | Screen         | What Happens                                                                           |
| ---- | -------------- | -------------------------------------------------------------------------------------- |
| 0:00 | Landing        | Show two-door entry. Tap "I'm a Patient"                                               |
| 0:10 | Onboard        | Select "Appendectomy". Enter name, meds, caregiver phone. AI generates Day 1 plan      |
| 0:30 | Patient Home   | Show recovery plan, status orb, medication schedule. "It's Day 4, let's check in"      |
| 0:40 | Check-in       | Patient's son taps "Reporting for Ramesh". Speaks in Hindi. Sarvam transcribes live    |
| 1:00 | Processing     | "Transcribing... Understanding symptoms... Updating plan..."                           |
| 1:10 | Result         | Pain score: 3/10. Risk: LOW. Wound: Stable. Tomorrow's plan updated. "✓ Sent to Priya" |
| 1:25 | History        | Show 4-day recovery journal. Pain decreasing. Green trend                              |
| 1:35 | Receptionist   | Switch to receptionist view. Show patient list. Ramesh's row shows latest update       |
| 1:50 | Patient Detail | Receptionist sees heatmap, check-in history, upcoming appointment                      |
| 2:00 | WhatsApp       | Show the daily update message sent to caregiver                                        |
| 2:10 | END            | —                                                                                      |

---

## 13. Environment Variables

### Frontend (`.env`)

```
VITE_API_URL=http://localhost:8000
```

### Backend (`.env`)

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
SARVAM_API_KEY=your-sarvam-subscription-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_FROM_NUMBER=whatsapp:+14155238886
```

---

## 14. What's Live vs. Mocked in Demo

| Feature                                  | Status       | Notes                             |
| ---------------------------------------- | ------------ | --------------------------------- |
| Voice check-in → Sarvam transcription    | ✅ Live      | Core demo feature                 |
| Gemini pain scoring + symptom extraction | ✅ Live      | Core wow moment                   |
| AI recovery plan generation              | ✅ Live      | Generated at onboarding           |
| WhatsApp to caregiver                    | ✅ Live      | Daily update after each check-in  |
| Wound photo → Gemini analysis            | ✅ Live      | Optional per check-in             |
| Recovery trajectory chart                | ✅ Live      | Real data from Supabase           |
| Medication adherence heatmap             | ⚠️ Seeded    | Days 1–3 pre-seeded, Day 4 live   |
| Receptionist dashboard                   | ⚠️ Seeded    | 4–5 realistic pre-seeded patients |
| Milestone cards                          | ✅ Live      | Triggered from curve constants    |
| Readmission risk score                   | ✅ Live      | Calculated from check-in data     |
| Hospital login/auth                      | 🎭 Simulated | Role selection, no real auth      |

---

_This PRD supersedes RecoverAI_Technical_PRD.md and RecoverAI_MVP_v2.md._
_Design System is a separate document — this PRD contains zero styling decisions._
