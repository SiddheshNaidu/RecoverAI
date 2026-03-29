import { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import StatusOrb from "../components/patient/StatusOrb";
import MilestoneCard from "../components/patient/MilestoneCard";
import AdherenceHeatmap from "../components/patient/AdherenceHeatmap";
import { RECOVERY_CURVES } from "../constants/recoveryCurves";
import supabase, { isSupabaseConfigured } from "../api/db";
import {
  riskLevelToOrb,
  buildAdherenceForHeatmap,
  protocolTaskToRow,
} from "../lib/recoveryMappers";

function procedureToConditionKey(procedure) {
  const p = (procedure || "").toLowerCase();
  if (p.includes("append")) return "appendectomy";
  if (p.includes("knee")) return "knee_replacement";
  if (p.includes("hip")) return "hip_replacement";
  if (p.includes("gall")) return "gallbladder";
  if (p.includes("c-section") || p.includes("c_section")) return "c_section";
  return "appendectomy";
}

const SLOT_ORDER = { morning: 0, afternoon: 1, evening: 2 };

export default function PatientHomePage() {
  const { currentPatient } = useApp();
  const { id: paramId } = useParams();
  const [ringProgress, setRingProgress] = useState(0);
  const [patient, setPatient] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [medRows, setMedRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const patientId = patient?.id || paramId || currentPatient?.id || null;

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setError("Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
      setLoading(false);
      return;
    }

    async function fetchHome() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const pid = user?.id || paramId || currentPatient?.id;
        if (!pid) {
          throw new Error("Sign in or open a patient link to load your plan.");
        }

        const today = new Date().toISOString().split("T")[0];

        const [{ data: pat, error: e1 }, { data: taskList, error: e2 }, { data: meds, error: e3 }] =
          await Promise.all([
            supabase
              .from("patients")
              .select(
                "id, name, procedure, recovery_current_day, recovery_total_days, phase, phase_label, risk_level"
              )
              .eq("id", pid)
              .single(),
            supabase
              .from("protocol_tasks")
              .select("task_name, time_slot, icon_type")
              .eq("patient_id", pid)
              .eq("task_date", today)
              .order("time_slot"),
            supabase
              .from("medication_adherence_7day")
              .select("medication_name, dose, log_date, status")
              .eq("patient_id", pid)
              .order("medication_name")
              .order("log_date"),
          ]);

        if (e1) throw e1;
        if (e2) throw e2;
        if (e3) throw e3;

        setPatient(pat);
        const sorted = [...(taskList || [])].sort(
          (a, b) => (SLOT_ORDER[a.time_slot] ?? 9) - (SLOT_ORDER[b.time_slot] ?? 9)
        );
        setTasks(sorted);
        setMedRows(meds || []);
      } catch (e) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    }
    fetchHome();
  }, [paramId, currentPatient?.id]);

  const day = patient?.recovery_current_day ?? 0;
  const totalDays = patient?.recovery_total_days ?? 1;
  const condition = patient?.procedure || "Recovery";
  const patientName = patient?.name?.split(" ")[0] || "Patient";
  const risk = riskLevelToOrb(patient?.risk_level);
  const conditionKey = procedureToConditionKey(patient?.procedure);

  const pct = totalDays > 0 ? day / totalDays : 0;

  useEffect(() => {
    const t = setTimeout(() => setRingProgress(pct * 100), 300);
    return () => clearTimeout(t);
  }, [pct]);

  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (ringProgress / 100) * circumference;

  const heatmapMeds = useMemo(() => buildAdherenceForHeatmap(medRows), [medRows]);

  const taskRows = useMemo(() => {
    if (!patientId) return [];
    return tasks.map((t) => protocolTaskToRow(t, patientId));
  }, [tasks, patientId]);

  const quickActions = [
    {
      label: "Recovery Journal",
      desc: "View past AI summaries",
      icon: "menu_book",
      to: `/patient/${patientId}/history`,
      accent: "bg-primary/8 group-hover:bg-primary/12",
      iconColor: "text-primary",
    },
    {
      label: "Full Plan",
      desc: "Today's complete protocol",
      icon: "list_alt",
      to: `/patient/${patientId}/plan`,
      accent: "bg-[#d97706]/8 group-hover:bg-[#d97706]/12",
      iconColor: "text-[#d97706]",
    },
    {
      label: "SOS Help",
      desc: "Emergency contacts",
      icon: "emergency",
      to: `/patient/${patientId}/sos`,
      accent: "bg-error/8 group-hover:bg-error/12",
      iconColor: "text-error",
    },
  ];

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning,";
    if (h < 17) return "Good afternoon,";
    return "Good evening,";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-8">
        <p className="font-inter text-ink-muted">Loading your recovery plan…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-8">
        <p className="font-inter text-error text-center max-w-md">{error}</p>
      </div>
    );
  }

  const phaseLine = patient?.phase_label || patient?.phase || "Recovery";

  return (
    <main className="min-h-screen bg-surface pb-28">
      <section
        className="relative px-6 md:px-12 lg:px-16 pt-10 pb-14 animate-fade-up overflow-visible"
        style={{
          background: "linear-gradient(135deg, #2e3d32 0%, #3d5442 55%, #4a6b50 100%)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
            backgroundSize: "180px 180px",
          }}
        />

        <div className="max-w-[1100px] mx-auto flex items-start justify-between gap-6 relative z-10">
          <div className="flex-1">
            <p className="font-inter text-white/60 text-base mb-1 tracking-wide">{getGreeting()}</p>
            <h1
              className="font-heading text-white font-extrabold"
              style={{ fontSize: "clamp(3rem, 8vw, 5.5rem)", lineHeight: 0.95, letterSpacing: "-0.03em" }}
            >
              {patientName}
            </h1>
            <p className="font-inter text-white/60 text-base mt-4 tracking-wide">
              Day {day} of {totalDays} &nbsp;·&nbsp; {condition}
            </p>

            <Link
              to={`/patient/${patientId}/checkin`}
              className="inline-flex items-center gap-3 mt-8 px-8 py-4 rounded-2xl font-heading font-bold text-[#2e3d32] no-underline transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(145deg, #d4e8d7, #ffffff)",
                boxShadow:
                  "4px 4px 16px rgba(0,0,0,0.25), -2px -2px 8px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
                fontSize: "1.1rem",
              }}
            >
              <span className="material-symbols-outlined text-[22px]">mic</span>
              Record Today&apos;s Check-in
            </Link>
          </div>

          <div className="shrink-0 mt-2">
            <StatusOrb risk={risk} size="lg" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-surface to-transparent pointer-events-none" />
      </section>

      <div className="max-w-[1100px] mx-auto px-6 md:px-12 lg:px-16 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-8 flex flex-col gap-6">
          <MilestoneCard day={day} conditionKey={conditionKey} curves={RECOVERY_CURVES} />

          <div
            className="bg-white rounded-[2rem] p-8 md:p-10 flex flex-col gap-7 animate-fade-up-delay"
            style={{ boxShadow: "0 4px 32px rgba(28,28,17,0.07)" }}
          >
            <div className="flex items-center justify-between">
              <h2
                className="font-heading font-bold text-ink"
                style={{ fontSize: "1.5rem", letterSpacing: "-0.02em" }}
              >
                Today&apos;s Protocol
              </h2>
              <Link
                to={`/patient/${patientId}/plan`}
                className="font-inter text-sm text-primary font-semibold hover:underline"
              >
                View Full Plan →
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              {taskRows.length === 0 ? (
                <p className="font-inter text-ink-muted text-sm">No protocol tasks for today.</p>
              ) : (
                taskRows.map((task) => <TaskRow key={task.title} {...task} />)
              )}
            </div>
          </div>

          <div
            className="bg-white rounded-[2rem] p-8 animate-fade-up-delay"
            style={{ boxShadow: "0 4px 32px rgba(28,28,17,0.07)" }}
          >
            <AdherenceHeatmap medications={heatmapMeds} />
          </div>
        </section>

        <section className="lg:col-span-4 flex flex-col gap-5">
          <div
            className="bg-white rounded-[2rem] p-8 flex flex-col items-center text-center animate-fade-up-delay-2"
            style={{ boxShadow: "0 4px 32px rgba(28,28,17,0.07)" }}
          >
            <p className="font-inter text-xs uppercase tracking-widest font-bold text-ink-muted mb-6">
              Recovery Progress
            </p>

            <div className="relative flex items-center justify-center mb-5">
              <svg className="transform -rotate-90" width="180" height="180">
                <circle cx="90" cy="90" r={radius} stroke="#e6e3d0" strokeWidth="10" fill="transparent" />
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  stroke="#4a654f"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-[1800ms] ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-heading font-extrabold text-primary leading-none" style={{ fontSize: "4rem" }}>
                  {day}
                </span>
                <span className="font-inter text-base text-ink-muted">of {totalDays} days</span>
              </div>
            </div>

            <div className="w-full h-2 bg-surface-high rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-primary rounded-full transition-all duration-[1800ms] ease-out"
                style={{ width: `${ringProgress}%` }}
              />
            </div>

            <p className="font-heading font-bold text-ink text-base">{condition}</p>
            <p className="font-inter text-sm text-ink-muted mt-1">{phaseLine}</p>
          </div>

          <div className="flex flex-col gap-3 animate-fade-up-delay-2">
            {quickActions.map((q) => (
              <Link
                key={q.label}
                to={q.to}
                className={`group flex items-center gap-4 p-5 rounded-2xl no-underline transition-all duration-200 hover:-translate-y-0.5 ${q.accent}`}
                style={{ boxShadow: "0 2px 12px rgba(28,28,17,0.06)" }}
              >
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className={`material-symbols-outlined text-[22px] ${q.iconColor}`}>{q.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-base font-bold text-ink leading-snug">{q.label}</h3>
                  <p className="font-inter text-xs text-ink-muted mt-0.5 truncate">{q.desc}</p>
                </div>
                <span className="material-symbols-outlined text-ink-muted text-[20px] group-hover:translate-x-1 transition-transform shrink-0">
                  chevron_right
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function TaskRow({ title, time, icon, to, done }) {
  const inner = (
    <>
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
          done ? "bg-primary text-white" : "bg-surface-high text-ink-muted group-hover:bg-primary group-hover:text-white"
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">{done ? "check" : icon}</span>
      </div>
      <div className="flex-1">
        <h4 className="font-heading text-base font-semibold text-ink group-hover:text-primary transition-colors">
          {title}
        </h4>
        <p className="font-inter text-sm text-ink-muted">{time}</p>
      </div>
      {to && (
        <span className="material-symbols-outlined text-ink-muted text-[18px] group-hover:translate-x-1 transition-transform">
          chevron_right
        </span>
      )}
    </>
  );
  if (to) {
    return (
      <Link
        to={to}
        className="group flex items-center gap-4 px-4 py-4 rounded-2xl no-underline transition-all duration-200 hover:bg-surface-low cursor-pointer"
      >
        {inner}
      </Link>
    );
  }
  return (
    <div className="group flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200 opacity-70">
      {inner}
    </div>
  );
}
