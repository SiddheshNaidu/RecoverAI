import { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate, useParams, Link } from "react-router-dom";
import supabase, { isSupabaseConfigured } from "../api/db";
import { timeSlotLabel } from "../lib/recoveryMappers";

export default function RecoveryPlanPage() {
  const { currentPatient } = useApp();
  const navigate = useNavigate();
  const { id } = useParams();

  const [patient, setPatient] = useState(null);
  const [medications, setMedications] = useState([]);
  const [protocolTasks, setProtocolTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setError("Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const pid = user?.id || id || currentPatient?.id;
        if (!pid) throw new Error("Sign in or open your patient plan link.");

        const today = new Date().toISOString().split("T")[0];

        const [{ data: pat, error: e1 }, { data: meds, error: e2 }, { data: tasks, error: e3 }] =
          await Promise.all([
            supabase
              .from("patients")
              .select("phase, phase_label, procedure, recovery_total_days, recovery_current_day")
              .eq("id", pid)
              .single(),
            supabase.from("medications").select("name, dose").eq("patient_id", pid).order("name"),
            supabase
              .from("protocol_tasks")
              .select("task_name, time_slot, icon_type")
              .eq("patient_id", pid)
              .eq("task_date", today)
              .order("time_slot"),
          ]);

        if (e1) throw e1;
        if (e2) throw e2;
        if (e3) throw e3;

        setPatient(pat);
        setMedications(meds || []);
        setProtocolTasks(tasks || []);
      } catch (e) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, currentPatient?.id]);

  const plan = useMemo(() => {
    if (!patient) return null;
    const day = patient.recovery_current_day ?? 1;
    const condition = patient.procedure || "Recovery";
    const phase = patient.phase_label || patient.phase || "Recovery phase";
    const instructions =
      protocolTasks.length > 0
        ? protocolTasks.map((t) => `${timeSlotLabel(t.time_slot)}: ${t.task_name}`)
        : ["Follow medication schedule", "Complete daily check-in", "Monitor wound as directed"];
    const medRows =
      medications.length > 0
        ? medications.map((m) => ({
            time: "As prescribed",
            name: m.dose ? `${m.name} (${m.dose})` : m.name,
            note: m.dose || "",
          }))
        : [{ time: "—", name: "No medications on file", note: "Ask your care team" }];
    return {
      day,
      condition,
      phase,
      goal: protocolTasks[0]?.task_name || `Progress through ${phase}`,
      motivational_note: patient.phase
        ? `You are in ${patient.phase}. Consistency speeds healing.`
        : "Your body is healing every day.",
      instructions,
      medications: medRows,
      diet: "Follow the diet guidance from your discharge paperwork. Stay hydrated.",
      mobility: "Increase activity only as approved by your clinical team.",
      warnings: [
        "Seek urgent care for fever, uncontrolled pain, wound separation, or breathing difficulty.",
        "Contact your surgeon for unexpected bleeding or signs of infection.",
      ],
    };
  }, [patient, medications, protocolTasks]);

  const [checkedMeds, setCheckedMeds] = useState([]);
  const [checkedSteps, setCheckedSteps] = useState([]);

  useEffect(() => {
    if (!plan) return;
    setCheckedMeds(plan.medications.map(() => false));
    setCheckedSteps(plan.instructions.map(() => false));
  }, [plan]);

  const allMedsDone = checkedMeds.length && checkedMeds.every(Boolean);
  const progress = plan?.instructions?.length
    ? Math.round((checkedSteps.filter(Boolean).length / plan.instructions.length) * 100)
    : 0;

  const toggleMed = (i) => setCheckedMeds((p) => {
    const n = [...p];
    n[i] = !n[i];
    return n;
  });
  const toggleStep = (i) => setCheckedSteps((p) => {
    const n = [...p];
    n[i] = !n[i];
    return n;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-8">
        <p className="font-inter text-ink-muted">Loading recovery plan…</p>
      </div>
    );
  }
  if (error || !plan) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-8">
        <p className="font-inter text-error text-center max-w-md">{error || "No plan data."}</p>
      </div>
    );
  }

  const patientId = id || currentPatient?.id || "";

  return (
    <main className="min-h-screen bg-surface pb-28">
      <section
        className="relative px-6 md:px-12 lg:px-16 pt-10 pb-14"
        style={{ background: "linear-gradient(135deg, #1e2c22 0%, #2e3d32 50%, #3d5442 100%)" }}
      >
        <div className="max-w-[800px] mx-auto flex flex-col gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <span className="font-inter text-white/60 text-sm uppercase tracking-widest font-semibold">
              Recovery Plan
            </span>
          </div>

          <h1
            className="font-heading text-white font-extrabold"
            style={{ fontSize: "clamp(2.5rem, 7vw, 4.5rem)", lineHeight: 0.95, letterSpacing: "-0.03em" }}
          >
            Day {plan.day} Protocol
          </h1>
          <p className="font-inter text-white/60 text-base">
            {plan.condition} &nbsp;·&nbsp; {plan.phase}
          </p>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-inter text-white/60 text-xs uppercase tracking-widest">
                Today&apos;s Completion
              </span>
              <span className="font-heading font-bold text-white text-sm">{progress}%</span>
            </div>
            <div className="h-2 bg-white/15 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-surface to-transparent pointer-events-none" />
      </section>

      <div className="max-w-[800px] mx-auto px-6 md:px-12 pt-10 flex flex-col gap-8">
        <div
          className="rounded-[2rem] p-8 flex flex-col gap-5 animate-fade-up relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(74,101,79,0.08), rgba(141,170,145,0.06))",
            border: "1px solid rgba(74,101,79,0.15)",
          }}
        >
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-orb z-10">
            <span className="material-symbols-outlined text-white text-[24px]">flag</span>
          </div>
          <div className="z-10">
            <p className="font-inter text-xs uppercase tracking-widest font-bold text-primary mb-2">Today&apos;s Main Goal</p>
            <p className="font-heading text-ink font-semibold" style={{ fontSize: "1.6rem", lineHeight: 1.2 }}>
              &quot;{plan.goal}&quot;
            </p>
            <p className="font-inter text-ink-muted text-sm mt-4 leading-relaxed italic">{plan.motivational_note}</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-8 animate-fade-up-delay" style={{ boxShadow: "0 4px 24px rgba(28,28,17,0.07)" }}>
          <h2 className="font-heading font-bold text-ink mb-6" style={{ fontSize: "1.5rem", letterSpacing: "-0.02em" }}>
            <span className="material-symbols-outlined text-primary align-middle mr-2 text-[26px]">list_alt</span>
            Instructions
          </h2>
          <div className="flex flex-col gap-3">
            {plan.instructions.map((inst, i) => (
              <button
                key={inst}
                type="button"
                onClick={() => toggleStep(i)}
                className="flex items-start gap-4 p-4 rounded-2xl text-left transition-all hover:bg-surface-low group"
              >
                <div
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 ${
                    checkedSteps[i] ? "bg-primary border-primary" : "border-outline-variant group-hover:border-primary"
                  }`}
                >
                  {checkedSteps[i] && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                </div>
                <span
                  className={`font-inter text-base leading-relaxed transition-all ${
                    checkedSteps[i] ? "line-through text-ink-muted" : "text-ink"
                  }`}
                >
                  {inst}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-8 animate-fade-up-delay" style={{ boxShadow: "0 4px 24px rgba(28,28,17,0.07)" }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-bold text-ink" style={{ fontSize: "1.5rem", letterSpacing: "-0.02em" }}>
              <span className="material-symbols-outlined text-primary align-middle mr-2 text-[26px]">pill</span>
              Medications
            </h2>
            {allMedsDone && (
              <span className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider animate-pop-in">
                <span className="material-symbols-outlined text-[14px]">check_circle</span> All Done
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3">
            {plan.medications.map((med, i) => (
              <button
                key={`${med.name}-${i}`}
                type="button"
                onClick={() => toggleMed(i)}
                className={`flex items-center justify-between p-5 rounded-2xl text-left transition-all duration-300 border-l-4 ${
                  checkedMeds[i] ? "border-primary bg-primary/5" : "border-transparent bg-surface-low hover:bg-surface-mid"
                }`}
              >
                <div>
                  <span className="font-heading font-bold text-sm text-primary tracking-wide block">{med.time}</span>
                  <span
                    className={`font-inter text-base transition-all ${
                      checkedMeds[i] ? "line-through text-ink-muted" : "text-ink font-medium"
                    }`}
                  >
                    {med.name}
                  </span>
                  <span className="font-inter text-xs text-ink-muted block mt-0.5">{med.note}</span>
                </div>
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    checkedMeds[i] ? "bg-primary border-primary" : "border-outline-variant"
                  }`}
                >
                  {checkedMeds[i] && <span className="material-symbols-outlined text-white text-[18px]">check</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-up-delay">
          <div className="bg-white rounded-[2rem] p-7" style={{ boxShadow: "0 4px 24px rgba(28,28,17,0.07)" }}>
            <div className="w-11 h-11 rounded-xl bg-[#d97706]/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[#d97706] text-[22px]">restaurant</span>
            </div>
            <h3 className="font-heading font-bold text-ink text-lg mb-2">Diet Today</h3>
            <p className="font-inter text-sm text-ink-muted leading-relaxed">{plan.diet}</p>
          </div>
          <div className="bg-white rounded-[2rem] p-7" style={{ boxShadow: "0 4px 24px rgba(28,28,17,0.07)" }}>
            <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-accent text-[22px]">directions_walk</span>
            </div>
            <h3 className="font-heading font-bold text-ink text-lg mb-2">Mobility</h3>
            <p className="font-inter text-sm text-ink-muted leading-relaxed">{plan.mobility}</p>
          </div>
        </div>

        <div
          className="rounded-[2rem] p-8 animate-fade-up-delay"
          style={{ background: "#fff5f5", border: "1px solid rgba(186,26,26,0.15)" }}
        >
          <h2 className="font-heading font-bold text-error mb-5" style={{ fontSize: "1.4rem", letterSpacing: "-0.01em" }}>
            <span className="material-symbols-outlined align-middle mr-2 text-[26px]">warning</span>
            Warning Signs — Seek Help Immediately
          </h2>
          <div className="flex flex-col gap-3">
            {plan.warnings.map((w, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="material-symbols-outlined text-error text-[18px] mt-0.5 shrink-0">emergency</span>
                <p className="font-inter text-[#8c2a2a] text-base leading-relaxed">{w}</p>
              </div>
            ))}
          </div>
        </div>

        <Link
          to={`/patient/${patientId}/checkin`}
          className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl font-heading font-bold text-lg text-white no-underline transition-all hover:scale-[1.01] active:scale-[0.99] animate-fade-up-delay"
          style={{
            background: "linear-gradient(145deg, #3d5442, #4a654f)",
            boxShadow:
              "6px 6px 20px rgba(37,53,41,0.4), -3px -3px 12px rgba(141,170,145,0.2), inset 0 1px 0 rgba(255,255,255,0.12)",
          }}
        >
          <span className="material-symbols-outlined text-[22px]">mic</span>
          Start Today&apos;s Check-in
        </Link>
      </div>
    </main>
  );
}
