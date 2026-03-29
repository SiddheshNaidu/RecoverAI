/**
 * ReceptionistPatientView — Staff patient detail (Supabase)
 * Route: /receptionist/patient/:id
 */
import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import StatusOrb from "../components/patient/StatusOrb";
import TrajectoryChart from "../components/patient/TrajectoryChart";
import AdherenceHeatmap from "../components/patient/AdherenceHeatmap";
import supabase, { isSupabaseConfigured } from "../api/db";
import {
  trajectoryToChartData,
  buildAdherenceForHeatmap,
  riskLevelToOrb,
} from "../lib/recoveryMappers";

export default function ReceptionistPatientView() {
  const { publicId } = useParams();
  const [patient, setPatient] = useState(null);
  const [caregiver, setCaregiver] = useState(null);
  const [trajectory, setTrajectory] = useState([]);
  const [medRows, setMedRows] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!publicId) return;
    if (!isSupabaseConfigured() || !supabase) {
      setError("Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
      setLoading(false);
      return;
    }

    async function fetchPatientDetail() {
      try {
        const [
          { data: pat, error: e1 },
        ] = await Promise.all([
          supabase.from("patients").select("*").eq("public_id", publicId).single(),
        ]);

        if (e1) throw e1;
        const id = pat.id; // Get the internal UUID for other queries

        const [
          { data: cg, error: e2 },
          { data: traj, error: e3 },
          { data: meds, error: e4 },
          { data: alts, error: e5 },
        ] = await Promise.all([
          supabase.from("caregivers").select("name, phone, relation").eq("patient_id", id).maybeSingle(),
          supabase
            .from("recovery_trajectory")
            .select("day_number, expected_pain, actual_pain")
            .eq("patient_id", id)
            .order("day_number"),
          supabase
            .from("medication_adherence_7day")
            .select("medication_name, dose, log_date, status")
            .eq("patient_id", id)
            .order("medication_name")
            .order("log_date"),
          supabase
            .from("caregiver_alerts")
            .select("alert_date, message")
            .eq("patient_id", id)
            .order("alert_date", { ascending: false })
            .limit(10),
        ]);

        if (e1) throw e1;
        if (e2 && e2.code !== "PGRST116") throw e2;
        if (e3) throw e3;
        if (e4) throw e4;
        if (e5) throw e5;

        setPatient(pat);
        setCaregiver(cg ?? null);
        setTrajectory(traj || []);
        setMedRows(meds || []);
        setAlerts(alts || []);
      } catch (e) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    }
    fetchPatientDetail();
  }, [publicId]);

  const chartData = useMemo(() => trajectoryToChartData(trajectory), [trajectory]);
  const heatmapMeds = useMemo(() => buildAdherenceForHeatmap(medRows), [medRows]);

  const orbRisk = riskLevelToOrb(patient?.risk_level);
  const isCritical = orbRisk === "critical";

  if (loading) {
    return <div className="p-8 text-center font-inter text-ink-muted">Loading patient…</div>;
  }
  if (error) {
    return <div className="p-8 text-center font-inter text-error">Error: {error}</div>;
  }
  if (!patient) {
    return <div className="p-8 text-center">Patient not found.</div>;
  }

  const p = patient;
  const day = p.recovery_current_day ?? 0;
  const total = p.recovery_total_days ?? 1;
  const dischargeFmt = p.discharge_date
    ? new Date(`${p.discharge_date}T12:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : "—";

  return (
    <main className="min-h-screen bg-surface flex flex-col pt-8 pb-28 px-6 md:px-12 lg:px-24">
      <div className="max-w-[900px] mx-auto w-full flex flex-col gap-10">
        <header className="flex items-center gap-4 animate-fade-up">
          <Link
            to="/receptionist"
            className="w-10 h-10 rounded-full bg-surface-high flex items-center justify-center hover:bg-surface-dim transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div className="flex-1">
            <h1 className="font-heading text-[2rem] md:text-[2.5rem] tracking-tight text-ink">{p.name}</h1>
            <p className="font-inter text-ink-muted">
              {p.procedure || "—"} · Day {day} of {total}
            </p>
          </div>
          <StatusOrb risk={orbRisk} size="lg" />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col gap-6">
            <div className={`rounded-[2rem] p-8 shadow-sm ${isCritical ? "bg-error/5 border border-error/20" : "bg-white"}`}>
              <h2 className="font-heading text-lg font-bold text-ink mb-6">Patient Info</h2>
              <div className="flex flex-col gap-4">
                <InfoRow icon="event" label="Discharge Date" value={dischargeFmt} />
                <InfoRow
                  icon="calendar_view_week"
                  label="Recovery Day"
                  value={`Day ${day} of ${total}`}
                />
                <InfoRow
                  icon="trending_up"
                  label="Risk Level"
                  value={
                    <span className={`font-bold uppercase ${isCritical ? "text-error" : "text-[#d97706]"}`}>
                      {p.risk_level || "—"}
                    </span>
                  }
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={p.phone ? `tel:${String(p.phone).replace(/\s/g, "")}` : undefined}
                className={`flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm hover:shadow-ambient transition-all group ${!p.phone ? "opacity-60 pointer-events-none" : ""}`}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                  <span className="material-symbols-outlined text-[22px]">call</span>
                </div>
                <div>
                  <p className="font-inter text-sm text-ink-muted">Call Patient</p>
                  <p className="font-heading font-bold text-ink">{p.phone || "—"}</p>
                </div>
              </a>
              <a
                href={
                  caregiver?.phone
                    ? `tel:${String(caregiver.phone).replace(/\s/g, "")}`
                    : undefined
                }
                className={`flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm hover:shadow-ambient transition-all group ${!caregiver?.phone ? "opacity-60 pointer-events-none" : ""}`}
              >
                <div className="w-12 h-12 rounded-full bg-[#d97706]/10 flex items-center justify-center group-hover:bg-[#d97706] group-hover:text-white transition-colors text-[#d97706]">
                  <span className="material-symbols-outlined text-[22px]">family_restroom</span>
                </div>
                <div>
                  <p className="font-inter text-sm text-ink-muted">
                    Call Caregiver ({caregiver?.name || "—"}
                    {caregiver?.relation ? ` · ${caregiver.relation}` : ""})
                  </p>
                  <p className="font-heading font-bold text-ink">{caregiver?.phone || "—"}</p>
                </div>
              </a>
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-sm flex flex-col gap-4">
              <h2 className="font-heading text-lg font-bold text-ink flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#16a34a]">chat</span>
                Caregiver Alert History
              </h2>
              {alerts.length === 0 ? (
                <p className="font-inter text-sm text-ink-muted">No alerts logged yet.</p>
              ) : (
                alerts.map((a) => (
                  <div
                    key={`${a.alert_date}-${a.message?.slice(0, 20)}`}
                    className="flex gap-4 items-start py-3 border-b border-outline-variant/10 last:border-0"
                  >
                    <span className="font-inter text-xs text-ink-muted shrink-0 pt-1">
                      {a.alert_date
                        ? new Date(`${a.alert_date}T12:00:00`).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                        : "—"}
                    </span>
                    <p className="font-inter text-sm text-ink">{a.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm">
              <TrajectoryChart data={chartData} />
            </div>
            <div className="bg-white rounded-[2rem] p-8 shadow-sm">
              <AdherenceHeatmap medications={heatmapMeds} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-surface-low flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-ink-muted text-[18px]">{icon}</span>
      </div>
      <div>
        <p className="font-inter text-xs text-ink-muted">{label}</p>
        <p className="font-inter text-base text-ink font-medium">{value}</p>
      </div>
    </div>
  );
}
