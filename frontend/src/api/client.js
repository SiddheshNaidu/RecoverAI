/**
 * RecoverAI API — mock auth/list endpoints + real hackathon backend for AI flows.
 * Backend URLs: set VITE_API_URL (see frontend/.env.example). Empty uses Vite dev proxy (/api → backend).
 */

const LATENCY = 800;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_DB = {
  patients: [
    {
      id: "pat_001",
      name: "Arthur Pendelton",
      status: "Stable",
      risk_level: "LOW",
      recovery_day: 4,
      condition: "Appendectomy Recovery",
      trend_direction: "up",
      trend_delta: "+12",
      adherence_pct: 100,
      wound_status: "Healing well",
      ai_insight: "Recovery is progressing faster than expected.",
      phone: "+91 9800000000",
    },
    {
      id: "pat_002",
      name: "Maria Gonzalez",
      status: "Critical",
      risk_level: "CRITICAL",
      recovery_day: 2,
      condition: "Post-operative monitoring",
      trend_direction: "down",
      trend_delta: "-15",
      adherence_pct: 60,
      wound_status: "Redness reported",
      ai_insight: "High pain score detected in voice logs. Intervention recommended.",
      phone: "+1 555-0199",
    },
  ],
  plan: {
    tasks: [
      { id: 1, title: "Take Amoxicillin 500mg", time: "8:00 AM", completed: true },
      { id: 2, title: "Change dressing (Upload photo optional)", time: "10:00 AM", completed: false },
      { id: 3, title: "Light walking (10 mins)", time: "2:00 PM", completed: false },
    ],
    medications: [
      { name: "Amoxicillin", dosage: "500mg", frequency: "2x daily" },
      { name: "Ibuprofen", dosage: "400mg", frequency: "As needed for pain" },
    ],
  },
};

/** @returns {string} Base URL without trailing slash, or '' to use same-origin proxy */
export function getApiBase() {
  const raw = import.meta.env.VITE_API_URL;
  if (raw === undefined || raw === null || String(raw).trim() === "") return "";
  return String(raw).replace(/\/$/, "");
}

/**
 * @param {string} path
 * @param {RequestInit} [init]
 */
export async function apiFetchJson(path, init = {}) {
  const base = getApiBase();
  const url = base ? `${base}${path}` : path;
  const res = await fetch(url, init);
  let data = {};
  try {
    data = await res.json();
  } catch {
    /* non-JSON */
  }
  if (!res.ok) {
    const msg = data?.error || res.statusText || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

/**
 * Parse JSON from Gemini `/api/generate` result string (may include markdown fences).
 * @param {unknown} raw
 * @returns {Record<string, unknown>|null}
 */
export function parseModelJsonString(raw) {
  if (raw == null) return null;
  let s = typeof raw === "string" ? raw.trim() : String(raw).trim();
  const tryParse = (t) => {
    try {
      return JSON.parse(t);
    } catch {
      return null;
    }
  };
  let o = tryParse(s);
  if (o && typeof o === "object") return o;
  const cleaned = s
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
  o = tryParse(cleaned);
  if (o && typeof o === "object") return o;
  return null;
}

/**
 * @param {{ transcript: string, recoveryDay?: number, surgeryType?: string, medicationsLine?: string, doctorNotes?: string }} p
 */
export function buildPainCheckinPrompt(p) {
  const day = p.recoveryDay ?? 4;
  const surgery = p.surgeryType ?? "appendectomy";
  const meds = p.medicationsLine ?? "prescribed post-operative medications as directed";
  const notes = p.doctorNotes ?? "follow wound care, medications, and gradual mobilisation";
  const safe = String(p.transcript || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return (
    `Patient on Day ${day} of ${surgery} recovery. ` +
    `Voice or text check-in (original language may be Hindi, Marathi, English, Tamil, Bengali, or mixed): "${safe}". ` +
    `They are on ${meds}. Doctor notes: ${notes}. ` +
    `Return valid JSON only with these keys: ` +
    `transcript_en (English translation), language_detected (short label), ` +
    `pain_score (integer 0-10), risk (LOW|MODERATE|HIGH|CRITICAL), ` +
    `summary (one sentence), directive (what to do today), ` +
    `wound (one sentence or ""), tomorrow (one sentence plan note), ` +
    `whatsapp (short caregiver label e.g. "Primary caregiver"), ` +
    `alert_caregiver (boolean), caregiver_message (brief WhatsApp text in the patient's own language).`
  );
}

/**
 * @param {{ day: number, surgeryType: string, medications: string, instructions: string }} p
 */
export function buildRecoveryPlanPrompt(p) {
  return (
    `Generate a detailed Day ${p.day} recovery plan for a patient who had ${p.surgeryType}. ` +
    `They are on ${p.medications}. Doctor notes: ${p.instructions}. ` +
    `Return JSON only with: ` +
    `{ day_goal: string, phase_label: string, instructions: string[], medications: [{name, time, note}], ` +
    `warning_signs: string[], diet: string, mobility_level: string, motivational_note: string }`
  );
}

/**
 * @param {Blob} audioBlob
 * @param {string} languageCode e.g. hi-IN
 */
export async function processAudioCheckin(audioBlob, languageCode = "hi-IN") {
  const fd = new FormData();
  const ext = audioBlob.type.includes("webm") ? "webm" : "wav";
  fd.append("audio", audioBlob, `recording.${ext}`);
  fd.append("prompt_type", "pain_checkin");
  fd.append("language_code", languageCode);
  const base = getApiBase();
  const url = base ? `${base}/api/process-audio` : "/api/process-audio";
  const res = await fetch(url, { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || res.statusText);
  return data;
}

/**
 * @param {string} text
 */
export async function processTextCheckin(text) {
  return apiFetchJson("/api/process-text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, prompt_type: "pain_checkin" }),
  });
}

/**
 * @param {string} prompt
 */
export async function generateContent(prompt) {
  const data = await apiFetchJson("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  return data;
}

/**
 * @param {string} phone E.164 e.g. +919800000000
 * @param {string} message
 */
export async function deliverWhatsApp(phone, message) {
  return apiFetchJson("/api/deliver", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, message }),
  });
}

/**
 * Full voice/text check-in: Sarvam+structure via backend, then Gemini generate for UI fields.
 * @param {{ audioBlob?: Blob|null, text?: string, languageCode?: string, recoveryDay?: number, surgeryType?: string, medicationsLine?: string, doctorNotes?: string, caregiverPhone?: string|null }} opts
 */
export async function runCheckinPipeline(opts) {
  const languageCode = opts.languageCode || "hi-IN";
  let transcript = "";

  if (opts.audioBlob && opts.audioBlob.size > 0) {
    const audioRes = await processAudioCheckin(opts.audioBlob, languageCode);
    transcript = String(audioRes.transcript || "").trim();
  } else if (opts.text && opts.text.trim()) {
    transcript = opts.text.trim();
    await processTextCheckin(transcript);
  } else {
    throw new Error("No voice or text provided.");
  }

  if (!transcript) {
    throw new Error(
      "Could not get a transcript. Check SARVAM_API_KEY and audio format, or type your symptoms."
    );
  }

  const prompt = buildPainCheckinPrompt({
    transcript,
    recoveryDay: opts.recoveryDay,
    surgeryType: opts.surgeryType,
    medicationsLine: opts.medicationsLine,
    doctorNotes: opts.doctorNotes,
  });
  const gen = await generateContent(prompt);
  const parsed = parseModelJsonString(gen.result);
  if (!parsed) {
    throw new Error("AI returned invalid JSON. Please try again.");
  }

  const phone = opts.caregiverPhone?.replace(/\s/g, "") || null;
  if (parsed.alert_caregiver && phone && /^\+[1-9]\d{1,14}$/.test(phone)) {
    const msg = String(parsed.caregiver_message || "").trim() || `RecoverAI: ${parsed.summary || "Check-in update"}`;
    try {
      await deliverWhatsApp(phone, `RecoverAI Update: ${msg}`);
    } catch {
      /* Twilio optional — still return clinical result */
    }
  }

  return {
    transcript,
    transcript_en: String(parsed.transcript_en ?? transcript),
    language_detected: String(parsed.language_detected ?? "—"),
    pain_score: Number(parsed.pain_score ?? 0),
    risk: String(parsed.risk ?? "LOW"),
    summary: String(parsed.summary ?? ""),
    directive: String(parsed.directive ?? ""),
    wound: parsed.wound ? String(parsed.wound) : "",
    tomorrow: String(parsed.tomorrow ?? ""),
    whatsapp: String(parsed.whatsapp ?? "caregiver"),
    alert_caregiver: Boolean(parsed.alert_caregiver),
    caregiver_message: String(parsed.caregiver_message ?? ""),
  };
}

/**
 * @param {FormData} formData from useCheckin (patient_id, audio, text_input, …)
 */
export async function submitCheckin(formData) {
  const languageCode = formData.get("language_code") || "hi-IN";
  const audio = formData.get("audio");
  const textInput = formData.get("text_input");
  const audioBlob =
    audio && typeof audio.size === "number" && audio.size > 0 ? audio : null;
  const text = textInput ? String(textInput) : "";

  const result = await runCheckinPipeline({
    audioBlob,
    text: audioBlob ? null : text,
    languageCode: String(languageCode),
  });

  return {
    success: true,
    ai_response: result.summary,
    ...result,
  };
}

/**
 * Upload discharge summary for extraction.
 * @param {File} file
 */
export async function extractDischargeSummary(file) {
  const fd = new FormData();
  fd.append("file", file);
  const base = getApiBase();
  const url = base
    ? `${base}/api/patients/extract-discharge`
    : "/api/patients/extract-discharge";
  const res = await fetch(url, { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || res.statusText || "Upload failed");
  return data;
}

/**
 * Create patient + Day-1 generated plan.
 * @param {Record<string, unknown>} payload
 */
export async function createPatientWithPlan(payload) {
  return apiFetchJson("/api/patients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/**
 * Patient PIN login.
 * @param {string} phone
 * @param {string} pin
 */
export async function loginPatientWithPin(phone, pin) {
  return apiFetchJson("/api/auth/patient/login-pin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, pin }),
  });
}

/**
 * Fetch daily adaptive Gemini plan for patient.
 * @param {string} patientId
 * @param {boolean} forceRefresh
 */
export async function fetchDailyPlan(patientId, forceRefresh = false) {
  const q = forceRefresh ? "?force_refresh=true" : "";
  return apiFetchJson(`/api/patients/${patientId}/daily-plan${q}`);
}

/**
 * Adapt today's plan using latest check-in summary.
 * @param {string} patientId
 * @param {{summary?: string, pain_score?: number, risk?: string}} payload
 */
export async function adaptDailyPlanAfterCheckin(patientId, payload) {
  return apiFetchJson(`/api/patients/${patientId}/adapt-plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
}

export const api = {
  async login(role, credentials) {
    await delay(LATENCY);
    if (role === "receptionist") {
      if (credentials.password === "admin") {
        return {
          success: true,
          user: { name: "Sarah Jenkins", role: "receptionist", hospital: "Mercy General" },
        };
      }
      throw new Error("Invalid staff credentials");
    }

    return { success: true, user: MOCK_DB.patients[0] };
  },

  async getPatients() {
    await delay(LATENCY);
    return { success: true, data: MOCK_DB.patients };
  },

  async getPatientPlan(patientId) {
    await delay(LATENCY);
    return { success: true, data: MOCK_DB.plan };
  },

  async submitCheckin(patientId, formData) {
    const fd = formData instanceof FormData ? formData : patientId;
    return submitCheckin(fd);
  },
};
