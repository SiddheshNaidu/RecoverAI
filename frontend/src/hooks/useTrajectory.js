/**
 * useTrajectory.js — Transforms raw checkin history API response
 * into Recharts-ready data arrays for TrajectoryChart.
 */

import { useMemo } from "react";
import { RECOVERY_CURVES, getExpectedPain, getExpectedMobility, isFeverRiskDay } from "../constants/recoveryCurves";

/**
 * @typedef {Object} TrajectoryDataPoint
 * @property {number}       day
 * @property {number|null}  actualPain
 * @property {number|null}  expectedPain
 * @property {number|null}  actualMobility
 * @property {number|null}  expectedMobility
 * @property {boolean}      isFeverRiskDay
 * @property {string|null}  riskLevel
 */

/**
 * @typedef {Object} TrajectoryResult
 * @property {TrajectoryDataPoint[]} chartData   - Recharts-ready array
 * @property {number[]}              feverRiskDays
 * @property {number}                totalDays
 */

/**
 * useTrajectory — transform checkin history + surgery type into chart data
 * @param {Object|null}  historyResponse - from GET /api/checkins/:id
 * @param {string}       surgeryType
 * @returns {TrajectoryResult}
 */
export function useTrajectory(historyResponse, surgeryType) {
  return useMemo(() => {
    const curve = RECOVERY_CURVES[surgeryType];
    const totalDays = curve?.totalDays ?? 14;
    const feverRiskDays = curve?.feverRiskDays ?? [];

    if (!historyResponse) {
      // Return expected-only chart data when no history is available
      const chartData = Array.from({ length: totalDays }, (_, i) => ({
        day:              i + 1,
        actualPain:       null,
        expectedPain:     getExpectedPain(surgeryType, i + 1),
        actualMobility:   null,
        expectedMobility: getExpectedMobility(surgeryType, i + 1),
        isFeverRiskDay:   feverRiskDays.includes(i + 1),
        riskLevel:        null,
      }));
      return { chartData, feverRiskDays, totalDays };
    }

    // Build a lookup map: day → checkin data
    const checkinsByDay = {};
    const trajectory = historyResponse.trajectory ?? {};

    const days          = trajectory.days ?? [];
    const actualPain    = trajectory.actual_pain ?? [];
    const actualMob     = trajectory.actual_mobility ?? [];
    const riskLevels    = trajectory.risk_levels ?? [];

    days.forEach((day, i) => {
      checkinsByDay[day] = {
        actualPain:    actualPain[i] ?? null,
        actualMobility: actualMob[i] ?? null,
        riskLevel:     riskLevels[i] ?? null,
      };
    });

    const chartData = Array.from({ length: totalDays }, (_, i) => {
      const day = i + 1;
      const actual = checkinsByDay[day] ?? {};
      return {
        day,
        actualPain:       actual.actualPain ?? null,
        expectedPain:     getExpectedPain(surgeryType, day),
        actualMobility:   actual.actualMobility ?? null,
        expectedMobility: getExpectedMobility(surgeryType, day),
        isFeverRiskDay:   feverRiskDays.includes(day),
        riskLevel:        actual.riskLevel ?? null,
      };
    });

    return { chartData, feverRiskDays, totalDays };
  }, [historyResponse, surgeryType]);
}

export default useTrajectory;
