/**
 * recoveryCurves.js — Mirror of backend/constants/recovery_curves.py
 */

export const RECOVERY_CURVES = {
  appendectomy: {
    expectedPain:     [8, 7, 5, 4, 3, 2, 2, 1, 1, 1, 0, 0, 0, 0],
    expectedMobility: [1, 1, 2, 3, 4, 5, 6, 7, 8, 8, 9, 9, 10, 10],
    feverRiskDays:    [1, 2, 3, 4],
    milestones: {
      3:  { title: "Fever risk window closed", day: 3 },
      7:  { title: "Light walking expected", day: 7 },
      14: { title: "Wound healing checkpoint", day: 14 },
    },
    totalDays: 14,
  },
  c_section: {
    expectedPain:     [9, 8, 7, 6, 5, 4, 3, 3, 2, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    expectedMobility: [0, 1, 1, 2, 2, 3, 4, 5, 5, 6, 7, 7, 8, 8, 9, 9, 10, 10, 10, 10, 10],
    feverRiskDays:    [1, 2, 3, 4, 5],
    milestones: {
      3:  { title: "Incision check", day: 3 },
      7:  { title: "Mobility milestone", day: 7 },
      14: { title: "Stitches review", day: 14 },
      21: { title: "Full recovery checkpoint", day: 21 },
    },
    totalDays: 21,
  },
  knee_replacement: {
    expectedPain:     [9, 8, 8, 7, 6, 6, 5, 5, 4, 4, 3, 3, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    expectedMobility: [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 10],
    feverRiskDays:    [1, 2, 3],
    milestones: {
      7:  { title: "First physio milestone", day: 7 },
      14: { title: "Stairs expected", day: 14 },
      30: { title: "Full weight bearing", day: 30 },
    },
    totalDays: 30,
  },
  gallbladder: {
    expectedPain:     [7, 6, 4, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    expectedMobility: [1, 2, 3, 5, 6, 7, 8, 9, 9, 10, 10, 10, 10, 10],
    feverRiskDays:    [1, 2, 3],
    milestones: {
      3:  { title: "Normal diet expected", day: 3 },
      7:  { title: "Full activity", day: 7 },
      14: { title: "Complete recovery", day: 14 },
    },
    totalDays: 14,
  },
};

export function getExpectedPain(surgeryType, day) {
  const curve = RECOVERY_CURVES[surgeryType];
  if (!curve) return null;
  return curve.expectedPain[day - 1] ?? null;
}

export function getExpectedMobility(surgeryType, day) {
  const curve = RECOVERY_CURVES[surgeryType];
  if (!curve) return null;
  return curve.expectedMobility[day - 1] ?? null;
}

export function isFeverRiskDay(surgeryType, day) {
  return RECOVERY_CURVES[surgeryType]?.feverRiskDays.includes(day) ?? false;
}

export function getMilestone(surgeryType, day) {
  return RECOVERY_CURVES[surgeryType]?.milestones[day] ?? null;
}
