/**
 * Map DB enums / shapes to UI components (StatusOrb, charts, heatmaps).
 */

/** @param {string | null | undefined} level */
export function riskLevelToOrb(level) {
  const u = String(level || "LOW").toUpperCase();
  if (u === "CRITICAL") return "critical";
  if (u === "MODERATE") return "moderate";
  return "stable";
}

/** Sort: CRITICAL → MODERATE → LOW */
export function compareRiskLevel(a, b) {
  const order = { CRITICAL: 0, MODERATE: 1, LOW: 2 };
  const ra = order[String(a?.risk_level || "LOW").toUpperCase()] ?? 2;
  const rb = order[String(b?.risk_level || "LOW").toUpperCase()] ?? 2;
  return ra - rb;
}

/**
 * @param {Array<{ medication_name?: string, name?: string, dose?: string, day_number?: number, log_date?: string, status?: string }>} rows
 */
export function groupMedicationsByName(rows) {
  const map = {};
  rows.forEach((r) => {
    const name = r.medication_name || r.name || "Medication";
    if (!map[name]) {
      map[name] = { name, dose: r.dose || "", days: [] };
    }
    map[name].days.push({
      day: r.day_number,
      status: r.status,
      log_date: r.log_date,
    });
  });
  return Object.values(map);
}

/**
 * Build 7-column adherence rows for AdherenceHeatmap from flat view rows (last 7 calendar days).
 * @param {Array<{ medication_name: string, dose?: string, log_date: string, status: string }>} rows
 */
export function buildAdherenceForHeatmap(rows) {
  const byName = {};
  rows.forEach((r) => {
    const n = r.medication_name || "Med";
    if (!byName[n]) byName[n] = { name: n, dose: r.dose || "", byDate: {} };
    const d = r.log_date;
    if (d) byName[n].byDate[d] = r.status;
  });

  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const dt = new Date();
    dt.setDate(dt.getDate() - i);
    dates.push(dt.toISOString().split("T")[0]);
  }

  return Object.values(byName).map((m) => ({
    name: m.name,
    critical: false,
    days: dates.map((dateStr) => {
      const st = m.byDate[dateStr];
      if (!st) return null;
      if (st === "taken") return true;
      if (st === "missed") return false;
      return null;
    }),
  }));
}

/**
 * @param {Array<{ day_number: number, expected_pain: number, actual_pain: number | null }>} rows
 */
export function trajectoryToChartData(rows) {
  if (!rows?.length) return [];
  return [...rows]
    .sort((a, b) => a.day_number - b.day_number)
    .map((r) => ({
      day: r.day_number,
      expected: Number(r.expected_pain),
      actual: r.actual_pain == null ? null : Number(r.actual_pain),
    }));
}

const SLOT_LABEL = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

/**
 * @param {string} slot
 */
export function timeSlotLabel(slot) {
  return SLOT_LABEL[slot] || slot || "";
}

/**
 * @param {{ task_name: string, time_slot: string, icon_type?: string }} t
 * @param {string} patientId
 */
export function protocolTaskToRow(t, patientId) {
  const slot = timeSlotLabel(t.time_slot);
  const to = t.icon_type === "mic" ? `/patient/${patientId}/checkin` : null;
  return {
    title: t.task_name,
    time: slot,
    icon: t.icon_type || "check_circle",
    to,
    done: false,
  };
}
