---
status: investigating
trigger: "analyze the codebase and help me in each debugging,1) after selecting im patient the 2 options guided interview and upload part, guided interview should be questions which we need gemini api to understand what the patient's diease is and what should be the perfect recovery plan for them. but the uploading part is not working nor the information is going to gemini nor an unique plan is generating for any patient. and there shoud be an caregiver option during the registration of patient, for more precise understanding analyze @RecoverAI_PRD_v3.md file"
created: 2026-03-29T12:18:34+05:30
updated: 2026-03-29T12:20:46+05:30
---

## Current Focus

hypothesis: Root cause is an architectural mismatch: PRD expects onboarding-driven patient creation + Gemini plan generation endpoints, but codebase currently has demo onboarding UI plus generic hackathon routes without patient onboarding contract.
test: Confirm absence of /api/patients onboarding contract and verify only generic endpoints exist.
expecting: Conclusive root-cause statement supported by route-level and page-level evidence.
next_action: return diagnosis with prioritized fix direction per issue

## Symptoms

expected: After selecting "I'm Patient", guided interview should ask meaningful clinical questions and use Gemini to infer disease context + generate individualized recovery plan; upload flow should successfully send extracted information to Gemini; each patient should get unique plan; patient registration should include caregiver option.
actual: Upload flow not working; information not reaching Gemini; unique plans not being generated; caregiver option appears missing in patient registration.
errors: No concrete runtime error string provided yet.
reproduction: 1) Select "I'm Patient" 2) Observe guided interview/upload options 3) Try upload flow 4) Check generated plan behavior and registration fields.
started: Unknown (not yet provided).

## Eliminated

## Evidence

- timestamp: 2026-03-29T12:19:49+05:30
  checked: RecoverAI_PRD_v3.md section 4.2 + 7.2
  found: PRD requires two patient onboarding paths (upload discharge summary and answer questions), both generating AI plan via Gemini, and caregiver data entry during onboarding.
  implication: Current implementation must include real upload parsing + Gemini plan generation + caregiver capture in patient onboarding to be compliant.

- timestamp: 2026-03-29T12:19:49+05:30
  checked: src/pages/OnboardPage.jsx
  found: Both "Guided Interview" and "Smart Upload" call handleSimulateAI, which only sets timeout then logs demo user id 'demo123' and navigates; no API calls are made.
  implication: Neither path sends data to backend/Gemini; generated plan cannot be based on actual patient inputs.

- timestamp: 2026-03-29T12:19:49+05:30
  checked: src/pages/OnboardPage.jsx upload section
  found: Upload UI is a styled div/button area with no <input type="file">, no onChange, no FormData construction, no OCR/extraction request.
  implication: Upload flow is non-functional by design; no file can be selected or sent to Gemini.

- timestamp: 2026-03-29T12:19:49+05:30
  checked: src/pages/OnboardPage.jsx manual interview fields
  found: Interview collects condition/date/age/gender/comorbidities etc. but does not collect required patient name/caregiver phone/language per PRD path B completion step.
  implication: Patient self-onboarding misses mandatory caregiver option/data and cannot drive caregiver notifications.

- timestamp: 2026-03-29T12:19:49+05:30
  checked: src/api/client.js and usage pattern
  found: Gemini integration exists only in check-in pipeline (runCheckinPipeline -> /api/generate with pain_checkin prompt). There is a buildRecoveryPlanPrompt helper but no onboarding page calls it.
  implication: Plan generation during onboarding is not implemented, causing non-unique or generic plans.

- timestamp: 2026-03-29T12:19:49+05:30
  checked: src/pages/PatientHomePage.jsx and src/pages/RecoveryPlanPage.jsx
  found: Plan/task rendering comes from Supabase tables (patients, protocol_tasks, medications) for current date; no request to onboarding AI generation endpoint and no per-patient generated plan retrieval pipeline.
  implication: Even if onboarding collected data, unique AI-generated Day 1 plan is not wired into patient plan display.

- timestamp: 2026-03-29T12:19:49+05:30
  checked: src/pages/RegisterPatientPage.jsx
  found: Staff registration includes caregiverPhone and writes caregivers table, but patient self-onboarding lacks equivalent caregiver registration fields.
  implication: Caregiver support exists only in receptionist flow, not in "I'm a Patient" flow requested by user/PRD.

- timestamp: 2026-03-29T12:20:24+05:30
  checked: repo structure glob across frontend/backend
  found: Dedicated backend exists under /backend with gemini_service.py and routers/hackathon.py, indicating AI server capabilities separate from frontend mock flows.
  implication: Need to verify whether required onboarding routes exist and are currently uncalled by frontend.

- timestamp: 2026-03-29T12:20:46+05:30
  checked: backend/main.py + backend/routers/hackathon.py
  found: Backend exposes only generic endpoints (/api/process-text, /api/process-audio, /api/process-image, /api/generate, /api/items, /api/deliver). No /api/patients or onboarding-specific discharge upload/plan generation route matching PRD contract.
  implication: Frontend cannot implement PRD onboarding contract against current backend API; direct patient-onboarding AI generation pipeline is missing.

- timestamp: 2026-03-29T12:20:46+05:30
  checked: backend/services/gemini_service.py
  found: Gemini helper supports freeform generate(prompt) and image analysis only; no typed workflow for extracting discharge summary and persisting personalized Day-1 plan.
  implication: Unique per-patient recovery plan generation at onboarding is not implemented as a domain workflow.

- timestamp: 2026-03-29T12:20:46+05:30
  checked: backend/schemas.py
  found: Schemas are limited to generic Item model, not patient onboarding payload/response models from PRD.
  implication: Missing domain schema contract reinforces endpoint gap and contributes to integration failure.

## Resolution

root_cause: 
fix: 
verification: 
files_changed: []
