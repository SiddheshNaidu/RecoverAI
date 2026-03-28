/**
 * NurseDashboardPage.jsx — Desktop-first nurse triage dashboard
 * Exact Match to Stitch Design: max-w-[2000px] main container,
 * xl:flex-row for the main content grid, Ping animation for active monitoring.
 */

import { useState, useEffect, useCallback } from "react";
import { getTriageQueue } from "../api/client";

import TopNav        from "../components/TopNav";
import LoadingState  from "../components/LoadingState";
import ErrorState    from "../components/ErrorState";
import SummaryCards  from "../components/SummaryCards";
import TriageTable   from "../components/TriageTable";
import AlertsSidebar from "../components/AlertsSidebar";

// Demo on-call doctor (would come from /api/oncall in production)
const DEMO_DOCTOR = {
  name:      "Dr. Aisha Mehta",
  specialty: "Post-Surgical Lead",
  phone:     "+91 98000 00000",
};

export default function ReceptionistDashboardPage() {
  const [patients,  setPatients]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchTriage = useCallback(async () => {
    try {
      const data = await getTriageQueue();
      setPatients(data.patients ?? []);
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      setError(err.message ?? "Failed to load patient queue");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + 60s auto-refresh
  useEffect(() => {
    fetchTriage();
    const interval = setInterval(fetchTriage, 60_000);
    return () => clearInterval(interval);
  }, [fetchTriage]);

  // Derive summary stats from patient list
  const stats = {
    critical:    patients.filter((p) => p.risk_level === "CRITICAL").length,
    needs_review: patients.filter((p) => p.risk_level === "HIGH" || p.risk_level === "MODERATE").length,
    on_track:    patients.filter((p) => p.risk_level === "LOW").length,
    avg_day:     patients.length
      ? Math.round(patients.reduce((a, p) => a + (p.recovery_day ?? 0), 0) / patients.length)
      : 0,
  };

  // Alerts: patients with CRITICAL or HIGH risk
  const alerts = patients
    .filter((p) => p.risk_level === "CRITICAL" || p.risk_level === "HIGH")
    .map((p) => ({
      id:           p.id,
      patient_name: p.name,
      message:      p.ai_insight ?? `Day ${p.recovery_day} — requires nurse review`,
      risk_level:   p.risk_level,
      phone:        p.phone,
    }));

  const handleSelectPatient = (patient) => {
    // In full implementation: open slide-in panel or navigate
    console.log("Selected patient:", patient.id);
  };

  return (
    <div className="min-h-screen bg-[#fdf9f5] font-body antialiased text-on-surface pt-24 overflow-x-hidden selection:bg-primary/20">
      <TopNav nurseMode nurseName="Eleanor R." wardLabel="Charge Nurse, Ward 4" />

      <main className="max-w-[2000px] mx-auto px-6 pb-20" role="main" aria-label="Nurse triage dashboard">
        
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-fraunces text-4xl font-semibold text-on-surface leading-tight mb-2">
              Ward 4 Overview
            </h1>
            <span className="font-semibold text-on-surface">Receptionist Dashboard</span>
            <p className="text-on-surface-variant font-medium flex items-center gap-2 text-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
              </span>
              Actively monitoring <span className="font-bold text-primary">{patients.length} patients</span> in Ward 4B
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchTriage}
              aria-label="Refresh patient data"
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-outline-variant/30 text-on-surface font-bold rounded-full hover:bg-surface-container transition-colors focus-visible:ring-2 focus-visible:ring-primary shadow-sm text-sm"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">refresh</span>
              Refresh
              <span className="text-xs text-outline font-normal ml-1 hidden sm:inline">
                ({lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
              </span>
            </button>
            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors shadow-sm text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
              aria-label="Export shift handover report"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">assignment</span>
              Handover
            </button>
          </div>
        </div>

        {/* ── Summary Cards ───────────────────────────────────────── */}
        <SummaryCards stats={stats} />

        {/* ── Main content: table + sidebar ───────────────────────── */}
        <div className="flex flex-col xl:flex-row gap-8">

          {/* Receptionist Top Nav */}
          <div className="flex-1 min-w-0" role="region" aria-live="polite" aria-label="Patient triage list">
            {loading ? (
              <LoadingState message="Loading patient queue…" />
            ) : error ? (
              <ErrorState message={error} onRetry={fetchTriage} />
            ) : (
              <TriageTable
                patients={patients}
                onSelectPatient={handleSelectPatient}
              />
            )}
          </div>

          {/* Persistent alerts sidebar */}
          <AlertsSidebar
            alerts={alerts}
            onCallDoctor={DEMO_DOCTOR}
          />
        </div>
      </main>
    </div>
  );
}
