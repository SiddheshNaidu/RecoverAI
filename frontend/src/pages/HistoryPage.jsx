import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import TrajectoryChart from "../components/patient/TrajectoryChart";
import AdherenceHeatmap from "../components/patient/AdherenceHeatmap";
import supabase, { isSupabaseConfigured } from "../api/db";
import { trajectoryToChartData, buildAdherenceForHeatmap, riskLevelToOrb } from "../lib/recoveryMappers";

const riskColor = {
  stable: "bg-primary text-white",
  moderate: "bg-[#eab308] text-white",
  critical: "bg-error text-white",
};

function entryRiskLabel(summary) {
  const s = (summary || "").toLowerCase();
  if (s.includes("critical") || s.includes("emergency")) return "critical";
  if (s.includes("moderate") || s.includes("caution")) return "moderate";
  return "stable";
}

export default function HistoryPage() {
  const { publicId } = useParams();
  const { currentPatient } = useApp();
  const [entries, setEntries] = useState([]);
  const [trajectory, setTrajectory] = useState([]);
  const [medRows, setMedRows] = useState([]);
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

        let pid = user?.id || currentPatient?.id;

        // If we don't have an internal ID yet, look it up by publicId
        if (!pid && publicId) {
          const { data: pat, error: pe } = await supabase
            .from("patients")
            .select("id")
            .eq("public_id", publicId)
            .single();
          if (pe) throw pe;
          pid = pat.id;
        }

        if (!pid) throw new Error("Sign in or open from your patient link.");

        const [{ data: journal, error: e1 }, { data: traj, error: e2 }, { data: meds, error: e3 }] =
          await Promise.all([
            supabase
              .from("journal_entries")
              .select("entry_date, ai_summary, raw_input")
              .eq("patient_id", pid)
              .order("entry_date", { ascending: false })
              .limit(20),
            supabase
              .from("recovery_trajectory")
              .select("day_number, expected_pain, actual_pain")
              .eq("patient_id", pid)
              .order("day_number"),
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

        setEntries(journal || []);
        setTrajectory(traj || []);
        setMedRows(meds || []);
      } catch (e) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [publicId, currentPatient?.id]);

  const chartData = useMemo(() => trajectoryToChartData(trajectory), [trajectory]);
  const heatmapMeds = useMemo(() => buildAdherenceForHeatmap(medRows), [medRows]);

  const handleShare = () => {
    const text = entries.map((e) => `${e.entry_date}: ${e.ai_summary || ""}`).join("\n");
    navigator.clipboard.writeText(text).then(() => alert("Summary copied!"));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-8">
        <p className="font-inter text-ink-muted">Loading journal…</p>
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

  return (
    <main className="min-h-screen bg-surface flex flex-col pt-12 pb-28 px-6 md:px-12 lg:px-24">
      <div className="max-w-[768px] mx-auto w-full flex flex-col gap-12">
        <section className="animate-fade-up">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-heading text-[3rem] md:text-[4rem] leading-[1.1] tracking-tight text-ink mb-2">
                Recovery <span className="text-primary italic">Journal</span>
              </h1>
              <p className="font-inter text-ink-muted text-lg">Daily check-ins and recovery notes</p>
            </div>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-surface-high hover:bg-surface-dim font-inter text-sm font-medium text-ink transition-colors shrink-0 mt-2"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
              Share with Doctor
            </button>
          </div>
        </section>

        <section className="card-therapeutic p-8 md:p-10 animate-fade-up-delay">
          <TrajectoryChart data={chartData} />
        </section>

        <section className="card-therapeutic p-8 md:p-10 animate-fade-up-delay">
          <AdherenceHeatmap medications={heatmapMeds} />
        </section>

        <section className="flex flex-col gap-5">
          {entries.length === 0 ? (
            <p className="font-inter text-ink-muted text-center">No journal entries yet. Complete a check-in to see history.</p>
          ) : (
            entries.map((entry, idx) => {
              const risk = entryRiskLabel(entry.ai_summary);
              const orb = riskLevelToOrb(risk === "critical" ? "CRITICAL" : risk === "moderate" ? "MODERATE" : "LOW");
              const dateLabel = entry.entry_date
                ? new Date(`${entry.entry_date}T12:00:00`).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
                : "—";
              return (
                <div
                  key={`${entry.entry_date}-${idx}`}
                  className="relative flex gap-6 p-8 rounded-[2rem] bg-white hover:-translate-y-1 hover:shadow-ambient transition-all duration-300 animate-fade-up"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="flex flex-col items-center pt-2">
                    <div
                      className={`w-4 h-4 rounded-full z-10 ${orb === "critical" ? "bg-error" : orb === "moderate" ? "bg-[#eab308]" : "bg-primary"
                        }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <h3 className="font-heading text-xl font-bold text-ink">{dateLabel}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${riskColor[risk]}`}
                      >
                        {risk}
                      </span>
                    </div>
                    <p className="font-inter text-ink text-base md:text-lg leading-relaxed">{entry.ai_summary || entry.raw_input || "—"}</p>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}
