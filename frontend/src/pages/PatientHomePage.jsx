import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import StatusOrb    from '../components/patient/StatusOrb';
import MilestoneCard from '../components/patient/MilestoneCard';
import AdherenceHeatmap from '../components/patient/AdherenceHeatmap';
import { RECOVERY_CURVES } from '../constants/recoveryCurves';

export default function PatientHomePage() {
  const { currentPatient } = useApp();
  const { id } = useParams();
  const [ringProgress, setRingProgress] = useState(0);

  const patientId   = id || currentPatient?.id || 'demo123';
  const patientName = currentPatient?.name?.split(' ')[0] || 'Sarah';
  const condition   = currentPatient?.condition || 'Appendectomy Recovery';
  const day         = 4;
  const totalDays   = 14;
  const risk        = 'stable';

  const radius        = 72;
  const circumference = 2 * Math.PI * radius;
  const pct           = day / totalDays;

  useEffect(() => {
    const t = setTimeout(() => setRingProgress(pct * 100), 300);
    return () => clearTimeout(t);
  }, [pct]);

  const strokeDashoffset = circumference - (ringProgress / 100) * circumference;

  const quickActions = [
    {
      label: 'Recovery Journal',
      desc: 'View past AI summaries',
      icon: 'menu_book',
      to: `/patient/${patientId}/history`,
      accent: 'bg-primary/8 group-hover:bg-primary/12',
      iconColor: 'text-primary',
    },
    {
      label: 'Full Plan',
      desc: "Today's complete protocol",
      icon: 'list_alt',
      to: `/patient/${patientId}/plan`,
      accent: 'bg-[#d97706]/8 group-hover:bg-[#d97706]/12',
      iconColor: 'text-[#d97706]',
    },
    {
      label: 'SOS Help',
      desc: 'Emergency contacts',
      icon: 'emergency',
      to: `/patient/${patientId}/sos`,
      accent: 'bg-error/8 group-hover:bg-error/12',
      iconColor: 'text-error',
    },
  ];

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning,';
    if (h < 17) return 'Good afternoon,';
    return 'Good evening,';
  };

  return (
    <main className="min-h-screen bg-surface pb-28">

      {/* ─── DARK HERO SECTION ────────────────────────────────────── */}
      <section
        className="relative px-6 md:px-12 lg:px-16 pt-10 pb-14 animate-fade-up overflow-visible"
        style={{
          background: 'linear-gradient(135deg, #2e3d32 0%, #3d5442 55%, #4a6b50 100%)',
        }}
      >
        {/* Subtle grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
            backgroundSize: '180px 180px',
          }}
        />

        <div className="max-w-[1100px] mx-auto flex items-start justify-between gap-6 relative z-10">
          <div className="flex-1">
            {/* Greeting */}
            <p className="font-inter text-white/60 text-base mb-1 tracking-wide">{getGreeting()}</p>
            <h1
              className="font-heading text-white font-extrabold"
              style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', lineHeight: 0.95, letterSpacing: '-0.03em' }}
            >
              {patientName}
            </h1>
            <p className="font-inter text-white/60 text-base mt-4 tracking-wide">
              Day {day} of {totalDays} &nbsp;·&nbsp; {condition}
            </p>

            {/* ── DOMINANT CHECK-IN CTA ── */}
            <Link
              to={`/patient/${patientId}/checkin`}
              className="inline-flex items-center gap-3 mt-8 px-8 py-4 rounded-2xl font-heading font-bold text-[#2e3d32] no-underline transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(145deg, #d4e8d7, #ffffff)',
                boxShadow: '4px 4px 16px rgba(0,0,0,0.25), -2px -2px 8px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
                fontSize: '1.1rem',
              }}
            >
              <span className="material-symbols-outlined text-[22px]">mic</span>
              Record Today's Check-in
            </Link>
          </div>

          {/* StatusOrb — top-right of hero */}
          <div className="shrink-0 mt-2">
            <StatusOrb risk={risk} size="lg" />
          </div>
        </div>

        {/* Subtle bottom fade into surface */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-surface to-transparent pointer-events-none" />
      </section>

      {/* ─── CONTENT BELOW HERO ───────────────────────────────────── */}
      <div className="max-w-[1100px] mx-auto px-6 md:px-12 lg:px-16 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT — main column */}
        <section className="lg:col-span-8 flex flex-col gap-6">

          {/* Milestone */}
          <MilestoneCard day={day} conditionKey="appendectomy" curves={RECOVERY_CURVES} />

          {/* Today's Protocol */}
          <div className="bg-white rounded-[2rem] p-8 md:p-10 flex flex-col gap-7 animate-fade-up-delay"
            style={{ boxShadow: '0 4px 32px rgba(28,28,17,0.07)' }}>

            <div className="flex items-center justify-between">
              <h2
                className="font-heading font-bold text-ink"
                style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}
              >
                Today's Protocol
              </h2>
              <Link to={`/patient/${patientId}/plan`}
                className="font-inter text-sm text-primary font-semibold hover:underline">
                View Full Plan →
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              {[
                { title: 'Morning Check-in',    time: '8:00 – 10:00 AM', icon: 'mic',             to: `/patient/${patientId}/checkin`, done: false },
                { title: 'Wound Observation',   time: 'Afternoon',       icon: 'bandage',         to: null,                            done: false },
                { title: 'Light Walk (10 min)', time: 'Evening',         icon: 'directions_walk', to: null,                            done: false },
              ].map(task => <TaskRow key={task.title} {...task} />)}
            </div>
          </div>

          {/* Adherence heatmap */}
          <div className="bg-white rounded-[2rem] p-8 animate-fade-up-delay"
            style={{ boxShadow: '0 4px 32px rgba(28,28,17,0.07)' }}>
            <AdherenceHeatmap />
          </div>

        </section>

        {/* RIGHT — sidebar */}
        <section className="lg:col-span-4 flex flex-col gap-5">

          {/* Recovery Ring Card */}
          <div
            className="bg-white rounded-[2rem] p-8 flex flex-col items-center text-center animate-fade-up-delay-2"
            style={{ boxShadow: '0 4px 32px rgba(28,28,17,0.07)' }}
          >
            <p className="font-inter text-xs uppercase tracking-widest font-bold text-ink-muted mb-6">
              Recovery Progress
            </p>

            <div className="relative flex items-center justify-center mb-5">
              <svg className="transform -rotate-90" width="180" height="180">
                <circle cx="90" cy="90" r={radius} stroke="#e6e3d0" strokeWidth="10" fill="transparent" />
                <circle
                  cx="90" cy="90" r={radius}
                  stroke="#4a654f" strokeWidth="10" fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-[1800ms] ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span
                  className="font-heading font-extrabold text-primary leading-none"
                  style={{ fontSize: '4rem' }}
                >
                  {day}
                </span>
                <span className="font-inter text-base text-ink-muted">of {totalDays} days</span>
              </div>
            </div>

            {/* Mini progress bar */}
            <div className="w-full h-2 bg-surface-high rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-primary rounded-full transition-all duration-[1800ms] ease-out"
                style={{ width: `${ringProgress}%` }}
              />
            </div>

            <p className="font-heading font-bold text-ink text-base">{condition}</p>
            <p className="font-inter text-sm text-ink-muted mt-1">Phase 2: Mobility Gain</p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-3 animate-fade-up-delay-2">
            {quickActions.map(q => (
              <Link
                key={q.label}
                to={q.to}
                className={`group flex items-center gap-4 p-5 rounded-2xl no-underline transition-all duration-200 hover:-translate-y-0.5 ${q.accent}`}
                style={{ boxShadow: '0 2px 12px rgba(28,28,17,0.06)' }}
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
  const Tag = to ? Link : 'div';
  return (
    <Tag
      to={to}
      className={`group flex items-center gap-4 px-4 py-4 rounded-2xl no-underline transition-all duration-200 ${to ? 'hover:bg-surface-low cursor-pointer' : 'opacity-70'}`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
        done ? 'bg-primary text-white' : 'bg-surface-high text-ink-muted group-hover:bg-primary group-hover:text-white'
      }`}>
        <span className="material-symbols-outlined text-[20px]">{done ? 'check' : icon}</span>
      </div>
      <div className="flex-1">
        <h4 className="font-heading text-base font-semibold text-ink group-hover:text-primary transition-colors">{title}</h4>
        <p className="font-inter text-sm text-ink-muted">{time}</p>
      </div>
      {to && (
        <span className="material-symbols-outlined text-ink-muted text-[18px] group-hover:translate-x-1 transition-transform">
          chevron_right
        </span>
      )}
    </Tag>
  );
}
