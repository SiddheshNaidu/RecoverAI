/**
 * api/client.js — Team UNTITLED | Build-it ON
 * ALL backend calls live here. One function per endpoint.
 * Siddhesh owns this file. Bishnupriya does NOT touch this.
 *
 * Pattern: every function returns { data, error }
 * Never throws — errors are returned as { data: null, error: string }
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const TIMEOUT_MS = 30_000;

// ─── Internal helpers ────────────────────────────────────────────────────────

async function _fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

async function _safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function _call(url, options = {}) {
  try {
    const res = await _fetchWithTimeout(url, options);
    const body = await _safeJson(res);
    if (!res.ok) {
      const msg = body?.error || body?.detail || `HTTP ${res.status}`;
      return { data: null, error: msg };
    }
    if (body?.error) return { data: null, error: body.error };
    return { data: body, error: null };
  } catch (err) {
    if (err.name === "AbortError") return { data: null, error: "Request timed out" };
    return { data: null, error: err.message || "Network error" };
  }
}

// ─── Health ──────────────────────────────────────────────────────────────────

export async function checkHealth() {
  return _call(`${BASE_URL}/health`);
}

// ─── Core processing ─────────────────────────────────────────────────────────

/**
 * POST /api/process-text
 * @param {string} text
 * @param {string} promptType  — e.g. "knowledge", "crisis", "environment"
 * @returns {{ data: Item, error: string|null }}
 */
export async function processText(text, promptType) {
  return _call(`${BASE_URL}/api/process-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: text.trim(), prompt_type: promptType }),
  });
}

/**
 * POST /api/process-audio
 * @param {File|Blob} audioFile
 * @param {string} promptType
 * @returns {{ data: { transcript: string, item: Item }, error: string|null }}
 */
export async function processAudio(audioFile, promptType) {
  const form = new FormData();
  form.append("audio", audioFile);
  form.append("prompt_type", promptType);
  return _call(`${BASE_URL}/api/process-audio`, {
    method: "POST",
    body: form,
  });
}

/**
 * POST /api/process-image
 * @param {File} imageFile
 * @returns {{ data: Item, error: string|null }}
 */
export async function processImage(imageFile) {
  const form = new FormData();
  form.append("image", imageFile);
  return _call(`${BASE_URL}/api/process-image`, {
    method: "POST",
    body: form,
  });
}

/**
 * POST /api/generate
 * @param {string} prompt
 * @returns {{ data: { result: string }, error: string|null }}
 */
export async function generate(prompt) {
  return _call(`${BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: prompt.trim() }),
  });
}

// ─── Items (Supabase) ────────────────────────────────────────────────────────

/**
 * GET /api/items
 * @returns {{ data: { items: Item[], count: number }, error: string|null }}
 */
export async function listItems() {
  return _call(`${BASE_URL}/api/items`);
}

/**
 * POST /api/items
 * @param {string} type
 * @param {Record<string,any>} content
 * @param {Record<string,any>} metadata
 * @returns {{ data: Item, error: string|null }}
 */
export async function createItem(type, content = {}, metadata = {}) {
  return _call(`${BASE_URL}/api/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, content, metadata }),
  });
}

// ─── Delivery ────────────────────────────────────────────────────────────────

/**
 * POST /api/deliver
 * @param {string} phone  — E.164 format e.g. "+91XXXXXXXXXX"
 * @param {string} message
 * @returns {{ data: { success: boolean }, error: string|null }}
 */
export async function deliverWhatsApp(phone, message) {
  return _call(`${BASE_URL}/api/deliver`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, message }),
  });
}
