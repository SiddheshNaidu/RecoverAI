/**
 * ReceptionistPatientView — Detailed patient view for clinical staff (PRD 4.11)
 * Route: /receptionist/patient/:id
 */
import { useParams, Link } from 'react-router-dom';
import StatusOrb     from '../components/patient/StatusOrb';
import TrajectoryChart   from '../components/patient/TrajectoryChart';
import AdherenceHeatmap  from '../components/patient/AdherenceHeatmap';

const PATIENT_DETAIL = {
  '1': { name: 'Robert Chen',   surgery: 'Hip Replacement',  day: 4,  total: 30, risk: 'critical', phone: '+91 98011 11111', caregiverPhone: '+91 98011 22222', caregiverName: 'Alice Chen (Wife)' },
  '2': { name: 'Martha Davis',  surgery: 'Knee Replacement', day: 2,  total: 30, risk: 'critical', phone: '+91 98022 22222', caregiverPhone: '+91 98022 33333', caregiverName: 'John Davis (Son)' },
  default: { name: 'Patient',   surgery: 'Post-Op Recovery', day: 5,  total: 14, risk: 'stable',   phone: '+91 98000 00000', caregiverPhone: '+91 98000 11111', caregiverName: 'Family Member' },
};

const ALERTS = [
  { date: 'Mar 28', msg: 'Caregiver notified: Pain score 3/10. Status: ON TRACK ✅' },
  { date: 'Mar 27', msg: 'Caregiver notified: Slight fever. Risk elevated to MODERATE ⚠️' },
  { date: 'Mar 26', msg: 'Caregiver notified: First check-in complete. Status: Expected 📋' },
];

export default function ReceptionistPatientView() {
  const { id } = useParams();
  const p = PATIENT_DETAIL[id] || PATIENT_DETAIL.default;
  const isCritical = p.risk === 'critical';

  return (
    <main className="min-h-screen bg-surface flex flex-col pt-8 pb-28 px-6 md:px-12 lg:px-24">
      <div className="max-w-[900px] mx-auto w-full flex flex-col gap-10">

        {/* Header */}
        <header className="flex items-center gap-4 animate-fade-up">
          <Link to="/receptionist" className="w-10 h-10 rounded-full bg-surface-high flex items-center justify-center hover:bg-surface-dim transition-colors">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div className="flex-1">
            <h1 className="font-heading text-[2rem] md:text-[2.5rem] tracking-tight text-ink">{p.name}</h1>
            <p className="font-inter text-ink-muted">{p.surgery} · Day {p.day} of {p.total}</p>
          </div>
          <StatusOrb risk={p.risk} size="lg" />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left column */}
          <div className="flex flex-col gap-6">

            {/* Patient info card */}
            <div className={`rounded-[2rem] p-8 shadow-sm ${isCritical ? 'bg-error/5 border border-error/20' : 'bg-white'}`}>
              <h2 className="font-heading text-lg font-bold text-ink mb-6">Patient Info</h2>
              <div className="flex flex-col gap-4">
                <InfoRow icon="event"        label="Discharge Date"  value="Mar 25, 2026" />
                <InfoRow icon="calendar_view_week" label="Recovery Day" value={`Day ${p.day} of ${p.total}`} />
                <InfoRow icon="trending_up"  label="Risk Level"     value={<span className={`font-bold uppercase ${isCritical ? 'text-error' : 'text-[#d97706]'}`}>{p.risk}</span>} />
              </div>
            </div>

            {/* Contact buttons */}
            <div className="flex flex-col gap-3">
              <a href={`tel:${p.phone}`} className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm hover:shadow-ambient transition-all group">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                  <span className="material-symbols-outlined text-[22px]">call</span>
                </div>
                <div>
                  <p className="font-inter text-sm text-ink-muted">Call Patient</p>
                  <p className="font-heading font-bold text-ink">{p.phone}</p>
                </div>
              </a>
              <a href={`tel:${p.caregiverPhone}`} className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm hover:shadow-ambient transition-all group">
                <div className="w-12 h-12 rounded-full bg-[#d97706]/10 flex items-center justify-center group-hover:bg-[#d97706] group-hover:text-white transition-colors text-[#d97706]">
                  <span className="material-symbols-outlined text-[22px]">family_restroom</span>
                </div>
                <div>
                  <p className="font-inter text-sm text-ink-muted">Call Caregiver ({p.caregiverName})</p>
                  <p className="font-heading font-bold text-ink">{p.caregiverPhone}</p>
                </div>
              </a>
            </div>

            {/* WhatsApp alert log */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm flex flex-col gap-4">
              <h2 className="font-heading text-lg font-bold text-ink flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#16a34a]">whatsapp</span>
                Caregiver Alert History
              </h2>
              {ALERTS.map((a, i) => (
                <div key={i} className="flex gap-4 items-start py-3 border-b border-outline-variant/10 last:border-0">
                  <span className="font-inter text-xs text-ink-muted shrink-0 pt-1">{a.date}</span>
                  <p className="font-inter text-sm text-ink">{a.msg}</p>
                </div>
              ))}
            </div>

          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">

            {/* Trajectory chart */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm">
              <TrajectoryChart />
            </div>

            {/* Adherence heatmap */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm">
              <AdherenceHeatmap />
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
