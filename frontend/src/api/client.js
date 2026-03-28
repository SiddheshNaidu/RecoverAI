/**
 * api/client.js — RecoverAI — All backend HTTP calls.
 * Base URL from VITE_API_URL (falls back to localhost:8000 for dev).
 * All functions throw on error for use with try/catch in hooks.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      ...(options.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const err = await response.json();
      message = err.detail || err.message || message;
    } catch { /* non-JSON error body */ }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

// ── Patients ──────────────────────────────────────────────────────────────────

export function createPatient(data) {
  return request("/api/patients", { method: "POST", body: JSON.stringify(data) });
}

export function getPatient(patientId) {
  return request(`/api/patients/${patientId}`);
}

export function addMedication(patientId, data) {
  return request(`/api/patients/${patientId}/medications`, { method: "POST", body: JSON.stringify(data) });
}

export function getMedications(patientId) {
  return request(`/api/patients/${patientId}/medications`);
}

// ── Check-ins ─────────────────────────────────────────────────────────────────

export function submitCheckin(formData) {
  return request("/api/checkins", { method: "POST", body: formData });
}

export function getCheckinHistory(patientId) {
  return request(`/api/checkins/${patientId}`);
}

export function getTodayCheckin(patientId) {
  return request(`/api/checkins/${patientId}/today`);
}

export function getAdaptivePlan(patientId) {
  return request(`/api/checkins/${patientId}/plan`);
}

// ── Dashboard (Nurse) ─────────────────────────────────────────────────────────

export function getTriageQueue() {
  return request("/api/dashboard/triage");
}

export function getPatientDetail(patientId) {
  return request(`/api/dashboard/patient/${patientId}`);
}

// ── Alerts ────────────────────────────────────────────────────────────────────

export function getAlertHistory(patientId) {
  return request(`/api/alerts/${patientId}`);
}

// ── Health ────────────────────────────────────────────────────────────────────

export function checkHealth() {
  return request("/health");
}
