/**
 * usePatient.js — Fetches patient data and manages recovery day state.
 * Auto-calculates recovery_day if not returned by backend.
 */

import { useState, useEffect, useCallback } from "react";
import { getPatient, getMedications } from "../api/client";
import { useApp } from "../context/AppContext";

/**
 * Calculate recovery day from discharge date (1-indexed).
 * Day 1 = discharge date itself.
 */
function calcRecoveryDay(dischargeDateStr) {
  if (!dischargeDateStr) return 1;
  const discharge = new Date(dischargeDateStr);
  const today     = new Date();
  discharge.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today - discharge) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

/**
 * usePatient — Load patient data + medications for a given patient ID.
 * Also syncs patient into AppContext.
 *
 * @param {string | null} patientId
 * @returns {{
 *   patient: Object | null,
 *   medications: Object[],
 *   recoveryDay: number,
 *   loading: boolean,
 *   error: string | null,
 *   refetch: () => Promise<void>
 * }}
 */
export function usePatient(patientId) {
  const { setCurrentPatient } = useApp();

  const [patient,     setPatient]     = useState(null);
  const [medications, setMedications] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [recoveryDay, setRecoveryDay] = useState(1);

  const fetchAll = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);

    try {
      const [patientData, medData] = await Promise.all([
        getPatient(patientId),
        getMedications(patientId),
      ]);

      // Backend may return recovery_day, or we calculate it locally
      const day =
        patientData.recovery_day ??
        calcRecoveryDay(patientData.discharge_date);

      const enriched = { ...patientData, recovery_day: day };

      setPatient(enriched);
      setRecoveryDay(day);
      setMedications(medData.medications ?? []);
      setCurrentPatient(enriched);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load patient");
    } finally {
      setLoading(false);
    }
  }, [patientId, setCurrentPatient]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    patient,
    medications,
    recoveryDay,
    loading,
    error,
    refetch: fetchAll,
  };
}

export default usePatient;
