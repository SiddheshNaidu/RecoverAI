# UNTITLED — Build-it ON Playbook v2.1
**Kaushik Naik | Siddhesh Naidu | Bishnupriya Mohapatra | Sakshi Palankar**
A.P. Shah Institute of Technology | TCET EWT Build-it ON | March 2026

---

## 1. Two-Phase Reality

| Phase | What It Is |
|---|---|
| Phase 1 — PPT Submission (done) | EchoElders idea. Shortlisting only. EchoElders does NOT get built at the hackathon. |
| Phase 2 — Offline Buildathon (Mar 28) | TCET gives THEIR PS 24hrs before event. You build their PS. Not yours. |

**Key dates:**
- Mar 25 11:59 PM → PPT deadline
- Mar 26 1:00 PM → Shortlisted teams announced
- Mar 27 12:00 AM → THEIR PS drops. Build starts.
- Mar 28 8:00 AM → Event (6hrs evaluation, not building from scratch)

Real build window = ~32hrs between 12AM Mar 27 and 8AM Mar 28.

---

## 2. Team Roles

| Member | Role | What They Do | Tools |
|---|---|---|---|
| Kaushik | Sentry | Reads PS at midnight. Writes battle plan. Security + logic checks on every major push. Unblocks Bishnupriya. Decides what gets cut before lockdown. | Aider CLI, Arch terminal, .ai-context |
| Siddhesh | Architect + Dev | All tech decisions. Builds core pipeline. Cursor prompt chaining. Fixes what AI gets wrong. | Cursor IDE, FastAPI, React, Supabase |
| Bishnupriya | Frontend Dev | UI components — cards, galleries, forms. Always isolated from Siddhesh's API work. Kaushik gives atomic tasks, she executes in Cursor. | Cursor IDE, React + Tailwind |
| Sakshi | Product Lead | Demo story, screenshots, pitch. Records demo input clips before event. Runs pitch rehearsal. Presents on evaluation day. | Slides, demo inputs, pitch script |

**Siddhesh's one rule:** Does not context switch. Bishnupriya's questions → Kaushik first. Only if Kaushik can't unblock → Siddhesh.

**Sakshi's actual job:**
- Record 3 demo input clips before PS drops
- Maintain Hero Moments log throughout build day (timestamp / what worked / what broke / how fixed)
- Update slides with real screenshots as features come online
- Runs the pitch on evaluation day

---

## 3. Timeline

### Mar 26 — Pre-Work Day
Everything in Section 7 checklist done tonight. Discover broken API keys now, not at 1AM.

### Mar 27 12AM–3AM — Kaushik Solo

| Time | Task |
|---|---|
| 12:00–12:45 AM | Read PS 3x. Answer: core user + problem? Which archetype? What pre-built applies? What needs building fresh? |
| 12:45–2:00 AM | Write battle plan. Exact task per person for Sprint 1. Cursor prompt for Siddhesh ready to paste. Atomic UI task for Bishnupriya with dummy data. Update .ai-context PS-specific section. |
| 2:00–3:00 AM | Light API confirmation only. Test call on whichever APIs the PS needs. Both return correct? Stop. Don't build features alone. |
| 3:00 AM | Sleep. Alarm 8:15 AM. |

> **45-min rule:** Stuck >45min on anything → mark TODO, move on. Siddhesh fixes it faster when fresh.

### Mar 27 8:30AM–4PM — College Build Day

| Time | What |
|---|---|
| 8:30–8:45 AM | Briefing. Kaushik shows PS analysis + Sprint 1 task per person. 15 mins max. Everyone laptops open at 8:45. |
| 8:45–12:00 PM | Sprint 1. Core pipeline end-to-end. Full flow from input to output must exist by noon. |
| 12:00 PM | P0 checkpoint. Core pipeline working? If not, everything stops until it is. Quick lunch, don't leave campus. |
| 1:00–3:00 PM | Sprint 2. Secondary features — search, filters, delivery layer. Bishnupriya on gallery/UI. Sakshi screenshotting. |
| 3:00–4:00 PM | Sprint 3. Edge cases, error handling, UI cleanup. No new features. |
| 4:00 PM | ★ FEATURE LOCKDOWN ★ Leave college. Beat peak hours. |

**Why 4PM:** Walk to station = 45–50 mins. Mumbai local peak = 5PM–9PM. Leave 4PM → station by 4:45 → home by 5:30. Don't take laptops on a peak-hour Mumbai local.

### Mar 27 Post-4PM — Remote Evening (Google Meet)

| Time | What |
|---|---|
| ~5:30 PM | Everyone home. Open Google Meet. |
| 6:00–7:00 PM | Sakshi runs full demo on screen share. Everyone notes bugs. Hero Moments extracted. |
| 7:00–8:00 PM | Kaushik + Siddhesh fix bugs. Sakshi + Bishnupriya rehearse pitch. |
| 8:00–8:30 PM | Final deploy. Vercel live. Railway live. Demo on live URL. WhatsApp tested to Sakshi's phone. |
| 8:30–9:00 PM | Pitch rehearsal ×2. Timed. Under 90 seconds. Team asks hard judge questions. |
| 9:00 PM | Everyone sleeps. |
| Mar 28 7:00 AM | Kaushik final end-to-end on live URL. |
| Mar 28 8:00 AM | Walk in. |

---

## 4. Boilerplate Stack

Pre-build this before Mar 27 midnight so you write features at 12:30AM, not set up environments.

```
FRONTEND
  React + Tailwind base app
  Generic file/audio/text upload component
  Generic card display component (takes any JSON)
  Generic list/gallery view
  Loading states + error states already written

BACKEND (FastAPI)
  POST /api/process-text    → accepts text, returns structured JSON
  POST /api/process-audio   → accepts audio blob, returns transcript + JSON
  POST /api/process-image   → accepts image, returns analysis JSON
  POST /api/generate        → accepts any prompt, returns LLM output
  GET  /api/items           → returns all records from Supabase
  POST /api/items           → writes a record to Supabase

DATABASE (Supabase)
  items table: id, type, content (JSONB), metadata (JSONB), created_at
  JSONB = never touch schema again regardless of PS

API WRAPPERS (pre-written, pre-tested)
  /services/sarvam.py   → speech to text
  /services/claude.py   → structuring, reasoning, classification
  /services/gemini.py   → generation, summarisation, image analysis
  /services/twilio.py   → WhatsApp delivery

DEPLOYMENT
  Vercel linked to GitHub (auto-deploys on push)
  Railway running FastAPI
  Both live and tested before midnight Mar 27
```

### Tech Stack

| Tool | Role | Cost |
|---|---|---|
| Sarvam AI | Speech-to-text, Indian languages | ₹0 dev tier |
| Claude API | Structuring, reasoning, classification | ₹0 free credits |
| Gemini API | Generation, summarisation, image analysis | ₹0 AI Studio |
| FastAPI | Backend | ₹0 |
| Supabase | PostgreSQL + JSONB | ₹0 free tier |
| React + Tailwind | Frontend | ₹0 |
| Vercel | Frontend deploy | ₹0 hobby |
| Railway | Backend deploy | ₹0 trial |
| Twilio WhatsApp | Delivery | ₹0 trial |
| Cursor IDE | AI coding | ₹0 student .edu |
| Aider CLI | Terminal AI agent (Kaushik) | ₹0 |

---

## 5. The 5 PS Archetypes

When PS drops, Kaushik identifies archetype in 10 mins. Siddhesh pastes prompt and builds.

### Archetype 1 — Knowledge / Education Access
Someone has knowledge that needs to reach people who can't access it. Language barriers, literacy gaps, rural access, indigenous knowledge.
- Flow: Transcribe → Classify → Simplify → Translate → Deliver
- APIs: Sarvam + Claude + Gemini

```python
# CLAUDE PROMPT — Archetype 1
system: """
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
"""
user: "Here is the content to structure: {transcript}"
```

### Archetype 2 — Benefits / Rights / Scheme Discovery
Users don't know what they're entitled to. Match their profile to schemes/rights and explain how to access.
- Flow: Converse → Profile → Match → Explain → Guide
- APIs: Claude + Gemini

```python
# CLAUDE PROMPT — Archetype 2
system: """
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
  "total_matched": number,
  "priority_scheme": "highest impact scheme name"
}
"""
user: "User profile: {profile_json}"
```

### Archetype 3 — Crisis / Emergency Response
Someone is in a difficult situation right now. Immediate, actionable guidance delivered fast.
- Flow: Understand → Identify law/resource → Generate response plan → Connect to help
- APIs: Claude + Twilio (immediate WhatsApp)

```python
# CLAUDE PROMPT — Archetype 3
system: """
You are a crisis response assistant.
Input: description of emergency situation.
Output: valid JSON only. Be specific and actionable.
Schema:
{
  "situation_type": "Legal|Health|Safety|Financial|Disaster|Other",
  "urgency": "Immediate|Within 24 hours|Within a week",
  "rights_violated": ["right 1 with law reference"],
  "immediate_steps": ["step 1", "step 2", "step 3"],
  "complaint_letter": "full formatted letter ready to send",
  "authority_to_contact": "exact name and type",
  "emergency_contacts": ["contact 1", "contact 2"]
}
"""
user: "Situation: {user_description}"
```

### Archetype 4 — Environmental / Sustainability Monitoring
Citizens track, report, or respond to environmental issues. AI analyses data or reports and surfaces insights.
- Flow: Collect report → Classify → Score severity → Aggregate → Alert
- APIs: Gemini Vision + Claude

```python
# CLAUDE PROMPT — Archetype 4
system: """
You are an environmental issue classifier.
Input: citizen report — text description or image analysis.
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
"""
user: "Report: {report_text}. Image analysis: {image_analysis}"
```

### Archetype 5 — Livelihood / Skill / Economic Empowerment
Workers, farmers, small business owners need better access to markets, skills, pricing, opportunities.
- Flow: Profile → Match opportunities → Generate action plan
- APIs: Claude + Gemini

```python
# CLAUDE PROMPT — Archetype 5
system: """
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
"""
user: "Profile: {user_profile}"
```

---

## 6. The .ai-context File

Every AI agent reads this first. Kaushik + Siddhesh co-write Mar 26 evening. PS-specific section filled at 12:30AM Mar 27.

```
# .ai-context — Team UNTITLED | Build-it ON
# ALL AI AGENTS READ THIS FIRST. THIS FILE IS LAW.

## STACK (NO DEVIATIONS)
Frontend:   React.js + Tailwind CSS
            → No other CSS framework
            → No Redux. useState/useContext only.
Backend:    Python FastAPI + Pydantic on every endpoint
Database:   Supabase SDK only. No raw psycopg2. JSONB for variable content.
Speech:     Sarvam AI API
LLM 1:      Claude API — structuring, reasoning, classification
LLM 2:      Gemini API — generation, summarisation, image analysis
Delivery:   Twilio WhatsApp API
Deploy:     Vercel (frontend) + Railway (backend)

## FOLDER STRUCTURE
/src
  /components    → React UI (Bishnupriya)
  /pages         → Page views
  /api           → FastAPI routes (Siddhesh)
  /services      → One file per external API only
    sarvam.py / claude.py / gemini.py / twilio.py
  /models        → Pydantic + Supabase schemas
/tests           → Kaushik only

## SUPABASE SCHEMA (DO NOT ALTER ON BUILD DAY)
items: id (uuid), type (text), content (jsonb), metadata (jsonb), created_at (timestamptz)

## PS-SPECIFIC (fill at 12:30AM Mar 27)
PS_ARCHETYPE:    [1-5]
PRIMARY_USER:    [who]
CORE_FEATURE:    [single most important thing for demo]
CLAUDE_ROLE:     [what Claude does]
GEMINI_ROLE:     [what Gemini does]
SARVAM_NEEDED:   [yes/no]

## FEATURE PRIORITY (fill after reading PS)
P0 — Must work for demo: [1] [2] [3]
P1 — Should work: [4] [5]
P2 — Only if P0+P1 done: [6]

## SECURITY
→ No raw SQL. Supabase ORM only.
→ All API keys in .env. Never hardcoded.
→ All routes have Pydantic input validation.
→ CORS configured on FastAPI before first deploy.
→ No user data logged to console.

## AI CANNOT
→ Install libraries not listed here
→ Use localStorage
→ Create files outside folder structure
→ Suggest architectural changes after 3AM Mar 27
```

---

## 7. Pre-Work Checklist — Mar 26 Evening

| Person | Task | Done When |
|---|---|---|
| Siddhesh | React + FastAPI boilerplate running locally | Both start without errors |
| Siddhesh | Sarvam AI test call | Returns transcript from 10-sec audio |
| Siddhesh | Claude API test call | Returns valid JSON |
| Siddhesh | Gemini API test call | Returns text response |
| Siddhesh | Supabase schema deployed | items table accepts test insert |
| Siddhesh | Twilio WhatsApp test | Real message received on test number |
| Kaushik | .ai-context written + pushed to GitHub | All 4 members can see it |
| Kaushik | Aider CLI installed on Arch | aider --help works |
| Kaushik | GitHub repo set up | All 4 have push access |
| Bishnupriya | Cursor IDE student tier active | 500 fast requests showing |
| Bishnupriya | Can run boilerplate locally | Frontend + backend start |
| Sakshi | 3 demo input clips recorded | Audio files saved and accessible |
| Sakshi | Demo story written | One paragraph: user, problem, demo flow |

---

## 8. Golden Rules

| Rule | Why |
|---|---|
| Never demo on localhost | Live Vercel URL only. Always. |
| Sarvam has a fallback | Pre-processed transcript ready if API goes down mid-demo |
| WhatsApp goes to Sakshi's phone | Real message on real phone = best demo moment |
| Feature lockdown is 4PM | New features break working ones at this stage |
| .ai-context is law | Any Cursor suggestion outside the stack gets rejected |
| Don't point AI at the whole project | Specific file only. Broad context = hallucinations. |
| P0 before anything else | Broken demo with 10 features < working demo with 3 |
| Siddhesh does not context switch | Bishnupriya → Kaushik first. Period. |
| Test demo inputs before the event | Sakshi's clips through live pipeline on Mar 27 night |
| Sleep | Everyone else will be exhausted. Team UNTITLED won't be. |

---

## Context Summary (for new chat)

**Who:** Team UNTITLED — 4 members from A.P. Shah Institute of Technology participating in TCET EWT Build-it ON hackathon.

**What:** AI for Social Impact & Sustainability hackathon. PPT submission (EchoElders idea) for shortlisting. Actual hackathon PS given by TCET on Mar 27 12AM. Build window ~32hrs. Event Mar 28 8AM.

**EchoElders (PPT only):** Voice-first AI platform. Elder speaks → Sarvam AI transcribes → Claude structures into Knowledge Card → stored in Supabase → youth adopts skill → Gemini generates micro-lesson → WhatsApp delivery via Twilio.

**Stack:** React + Tailwind / FastAPI / Supabase (JSONB) / Sarvam AI / Claude API / Gemini API / Twilio / Vercel + Railway. Budget ₹0.

**Roles:** Kaushik = Sentry (reads PS at midnight, writes battle plan, security checks, guides Bishnupriya). Siddhesh = Architect + Dev (core pipeline, Cursor prompt chaining, no context switching). Bishnupriya = Frontend Dev (UI only, atomic tasks from Kaushik). Sakshi = Product Lead (demo clips, hero moments log, pitch).

**Methodology:** A+K Hybrid. .ai-context file is law. Aider CLI for security checks. Cursor IDE for building. Kaushik solo 12–3AM (analysis + battle plan, not building). Full team 8:30AM college. Feature lockdown 4PM. Remote evening on Meet. Everyone sleeps by 9PM.

**5 PS archetypes prepared:** Knowledge/Education, Benefits/Scheme Discovery, Crisis/Emergency, Environmental Monitoring, Livelihood/Economic Empowerment. Pre-written Claude prompt for each.
