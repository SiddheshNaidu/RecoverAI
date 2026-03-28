/**
 * PatientHomePage.jsx — Patient home with mobile-first vertical layout
 * Exact Match to Stitch Design: max-w-2xl flex-col layout,
 * Status hero section, prominent CTA button, stacked cards.
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCheckinHistory, getAdaptivePlan, getAlertHistory, getTodayCheckin } from "../api/client";
import { usePatient }         from "../hooks/usePatient";
import { useTrajectory }      from "../hooks/useTrajectory";

import TopNav          from "../components/TopNav";
import BottomNav       from "../components/BottomNav";
import LoadingState    from "../components/LoadingState";
import ErrorState      from "../components/ErrorState";
import StatusOrb       from "../components/StatusOrb";
import RecoveryDayBadge from "../components/RecoveryDayBadge";
import TrajectoryChart from "../components/TrajectoryChart";
import MedicationStrip from "../components/MedicationStrip";
import MilestoneCard   from "../components/MilestoneCard";
import AdaptivePlanCard from "../components/AdaptivePlanCard";
import EmergencyCard   from "../components/EmergencyCard";
import AlertsLog       from "../components/AlertsLog";
import { getSurgeryLabel } from "../constants/surgeryTypes";

export default function PatientHomePage() {
  const { id }  = useParams();
  const navigate = useNavigate();
  const { patient, medications, recoveryDay, loading, error, refetch } = usePatient(id);

  const [history,     setHistory]     = useState(null);
  const [plan,        setPlan]        = useState(null);
  const [alerts,      setAlerts]      = useState([]);
  const [todayDone,   setTodayDone]   = useState(false);
  const [milestone,   setMilestone]   = useState(null);
  const [medConfirms, setMedConfirms] = useState({});

  const { chartData, feverRiskDays } = useTrajectory(history, patient?.surgery_type);

  // Parallel data fetch on mount
  useEffect(() => {
    if (!id) return;
    Promise.allSettled([
      getCheckinHistory(id).then(setHistory),
      getAdaptivePlan(id).then(setPlan),
      getAlertHistory(id).then((d) => setAlerts(d.alerts ?? [])),
      getTodayCheckin(id).then((d) => {
        setTodayDone(!!d);
        if (d?.milestone) setMilestone(d.milestone);
        if (d?.medication_confirmations) setMedConfirms(d.medication_confirmations);
      }),
    ]);
  }, [id]);

  if (loading) return <LoadingState fullScreen message="Loading your recovery…" />;
  if (error)   return <ErrorState message={error} onRetry={refetch} />;
  if (!patient) return null;

  const riskLevel = history?.latest_risk_level ?? "LOW";

  return (
    <div className="min-h-screen bg-[#fdf9f5] font-body antialiased text-on-surface">
      <TopNav />
      
      {/* Stitch layout: max-w-2xl pt-24 pb-32 flex-col gap-6 */}
      <main className="max-w-2xl mx-auto pt-24 pb-32 px-4 sm:px-6 flex flex-col gap-6">

        {/* ── Status hero ───────────────────────────────────── */}
        <section className="flex flex-col items-center justify-center py-6" aria-label="Current status">
          <div className="relative w-32 h-32 flex items-center justify-center mb-4">
            <StatusOrb level={riskLevel} size="lg" aria-hidden="true" />
          </div>
          <h1 className="font-fraunces text-3xl font-semibold text-on-surface text-center mb-1">
            Good {getGreeting()}, {patient.name.split(" ")[0]}
          </h1>
          <p className="text-on-surface-variant font-medium text-center flex items-center gap-2">
            Day {recoveryDay} of {getSurgeryLabel(patient.surgery_type)} Recovery
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container/50 text-secondary text-xs font-bold uppercase tracking-wider">
              {riskLevel} Risk
            </span>
          </p>
        </section>

        {/* ── Main Check-in CTA ───────────────────────────── */}
        <button 
          onClick={() => navigate(`/patient/${id}/checkin`)}
          disabled={todayDone}
          className={`w-full py-4 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary mb-2 ${
            todayDone 
              ? "bg-outline-variant/50 cursor-not-allowed shadow-none" 
              : "bg-primary hover:bg-primary/90 hover:shadow-xl hover:-translate-y-1 active:scale-95 cursor-pointer"
          }`}
        >
          {todayDone ? "Check-in Complete" : "Record Today's Check-in"}
          <span className="material-symbols-outlined text-xl">{todayDone ? "check_circle" : "mic"}</span>
        </button>

        {/* ── Milestone (conditional) ───────────────────────────── */}
        {milestone && (
          <MilestoneCard
            title={milestone.title}
            description={milestone.description}
            day={recoveryDay}
            onDismiss={() => setMilestone(null)}
          />
        )}

        {/* ── Recovery Timeline (Chart) ─────────────────────────── */}
        <section className="bg-white rounded-3xl p-6 border border-outline-variant/20 shadow-sm relative overflow-hidden" aria-label="Recovery trajectory">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Progress</p>
              <h2 className="font-fraunces text-xl font-bold text-on-surface">Recovery Timeline</h2>
            </div>
            <RecoveryDayBadge day={recoveryDay} totalDays={getRTotalDays(patient.surgery_type)} />
          </div>
          
          <TrajectoryChart chartData={chartData} feverRiskDays={feverRiskDays} compact />
          
          {history?.ai_insight && (
             <div className="mt-4 pt-4 border-t border-outline-variant/10">
               <p className="font-fraunces italic text-on-surface-variant text-sm border-l-2 border-primary/30 pl-3 leading-relaxed">
                 "{history.ai_insight}"
               </p>
             </div>
          )}
        </section>

        {/* ── AI Insights (Adaptive Plan) ───────────────────────── */}
        <section className="bg-secondary-container/20 rounded-3xl p-6 border border-secondary-container/40 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychiatry</span>
           </div>
           <AdaptivePlanCard
             patientId={id}
             day={recoveryDay}
             instructions={plan?.instructions ?? [
               "Rest as much as possible, limit stairs",
               "Take medications as prescribed",
               "Keep wound dry and clean",
             ]}
             warningSigns={plan?.warning_signs ?? []}
             todayCheckinDone={todayDone}
           />
        </section>

        {/* ── Daily Tasks (Medications) ─────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
             <h2 className="font-fraunces text-xl font-bold text-on-surface">Daily Tasks</h2>
             <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{medications?.length || 0} Meds</span>
          </div>
          <MedicationStrip medications={medications} confirmations={medConfirms} />
        </section>

        {/* ── Additional Info (Alerts & Emergency) ──────────────── */}
        <div className="space-y-6 mt-2">
           <EmergencyCard />
           {alerts.length > 0 && <AlertsLog alerts={alerts} />}
        </div>

      </main>

      <BottomNav patientId={id} activeKey="home" />
    </div>
  );
}

// Utilities
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function getRTotalDays(surgeryType) {
  const map = { appendectomy: 14, c_section: 21, knee_replacement: 30, gallbladder: 14 };
  return map[surgeryType] ?? 14;
}

