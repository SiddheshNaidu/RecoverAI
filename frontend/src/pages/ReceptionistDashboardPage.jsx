import { useState } from 'react';
import { Link } from 'react-router-dom';
import SummaryCards    from '../components/receptionist/SummaryCards';
import AppointmentCard from '../components/receptionist/AppointmentCard';
import StatusOrb       from '../components/patient/StatusOrb';

const PATIENTS = [
  { id: '1', name: 'Robert Chen',   procedure: 'Hip Replacement',    day: 4,  total: 30, risk: 'critical', trend: 'Increasing pain reported' },
  { id: '2', name: 'Martha Davis',  procedure: 'Knee Replacement',   day: 2,  total: 30, risk: 'critical', trend: 'Fever 101.2°F reported'   },
  { id: '3', name: 'Sarah Jenkins', procedure: 'Knee Replacement',   day: 14, total: 30, risk: 'moderate', trend: 'Mild swelling noted'        },
  { id: '4', name: 'James Wilson',  procedure: 'ACL Reconstruction', day: 21, total: 30, risk: 'stable',   trend: 'Improving rapidly'          },
  { id: '5', name: 'Emily Thorne',  procedure: 'Spinal Fusion',      day: 8,  total: 42, risk: 'stable',   trend: 'On track'                   },
  { id: '6', name: 'Michael Chang', procedure: 'Rotator Cuff',       day: 6,  total: 21, risk: 'moderate', trend: 'Mild swelling observed'      },
];

const APPOINTMENTS = [
  { date: 'Mar 29', time: '10:00 AM', name: 'Ramesh Patil',  reason: 'Day 7 Wound Check',  day: 7  },
  { date: 'Mar 30', time: '2:00 PM',  name: 'Sunita Sharma', reason: 'Stitches Removal',   day: 14 },
];

export default function ReceptionistDashboardPage() {
  const [search, setSearch] = useState('');

  const filtered = PATIENTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.procedure.toLowerCase().includes(search.toLowerCase())
  );

  const riskFirst = [...filtered].sort((a, b) => {
    const order = { critical: 0, moderate: 1, stable: 2 };
    return order[a.risk] - order[b.risk];
  });

  const critical = PATIENTS.filter(p => p.risk === 'critical').length;

  return (
    <main className="min-h-screen bg-surface pb-12">

      {/* ── Page header ─────────────────────────────────────────── */}
      <div
        className="px-6 md:px-12 lg:px-20 py-10 border-b border-outline-variant/10 animate-fade-up"
        style={{ background: 'linear-gradient(135deg, #2e3d32 0%, #3d5442 60%, #4a6b50 100%)' }}
      >
        <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="font-inter text-white/60 text-sm uppercase tracking-widest font-semibold mb-2">
              City Hospital &nbsp;·&nbsp; Receptionist Portal
            </p>
            <h1
              className="font-heading font-extrabold text-white"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 0.95, letterSpacing: '-0.03em' }}
            >
              Patient Directory
            </h1>
            {critical > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <p className="font-inter text-sm text-white/70">
                  <span className="font-bold text-red-300">{critical} critical</span> patient{critical > 1 ? 's' : ''} need attention
                </p>
              </div>
            )}
          </div>
          <Link
            to="/receptionist/new"
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-heading font-bold text-base no-underline shrink-0 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(145deg, #d4e8d7, #ffffff)',
              color: '#2e3d32',
              boxShadow: '4px 4px 16px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.6)',
            }}
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Register Patient
          </Link>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 md:px-12 lg:px-20 pt-8 flex flex-col gap-10">

        {/* Summary cards */}
        <SummaryCards active={PATIENTS.length} needsAttention={critical} appointments={APPOINTMENTS.length} />

        {/* Appointments row */}
        <section className="animate-fade-up-delay">
          <h2 className="font-heading font-bold text-ink mb-4" style={{ fontSize: '1.375rem', letterSpacing: '-0.02em' }}>
            <span className="material-symbols-outlined text-primary align-middle mr-2 text-[22px]">calendar_month</span>
            Upcoming Appointments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {APPOINTMENTS.map((a, i) => <AppointmentCard key={i} appointment={a} />)}
          </div>
        </section>

        {/* Patient list */}
        <section className="flex flex-col gap-5 animate-fade-up-delay">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-heading font-bold text-ink" style={{ fontSize: '1.375rem', letterSpacing: '-0.02em' }}>
              All Patients&nbsp;
              <span className="font-inter font-normal text-base text-ink-muted">({riskFirst.length})</span>
            </h2>
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" style={{ fontSize: '18px' }}>search</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search patients..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl font-inter text-sm text-ink focus:outline-none transition-colors"
                style={{
                  background: '#fff',
                  border: '1px solid rgba(194,200,192,0.3)',
                  boxShadow: '0 1px 4px rgba(28,28,17,0.06)',
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {riskFirst.map((p, i) => <PatientRow key={p.id} patient={p} delay={i * 40} />)}
          </div>
        </section>
      </div>
    </main>
  );
}

function PatientRow({ patient: p, delay }) {
  const isCritical = p.risk === 'critical';
  const isModerate = p.risk === 'moderate';
  const pct = Math.round((p.day / p.total) * 100);

  return (
    <Link
      to={`/receptionist/patient/${p.id}`}
      className="group flex items-center gap-5 px-6 py-5 rounded-2xl no-underline transition-all duration-200 hover:-translate-y-0.5 animate-fade-up"
      style={{
        background: isCritical ? 'rgba(186,26,26,0.04)' : '#ffffff',
        border: isCritical ? '1px solid rgba(186,26,26,0.18)' : '1px solid rgba(194,200,192,0.15)',
        boxShadow: isCritical
          ? '0 4px 16px rgba(186,26,26,0.08)'
          : '0 2px 12px rgba(28,28,17,0.06)',
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Day badge */}
      <div
        className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0"
        style={{ background: isCritical ? 'rgba(186,26,26,0.08)' : 'rgba(74,101,79,0.07)' }}
      >
        <span
          className="font-heading font-extrabold leading-none"
          style={{ fontSize: '1.6rem', color: isCritical ? '#ba1a1a' : '#1c1c11' }}
        >
          {p.day}
        </span>
        <span
          className="font-inter uppercase tracking-wide"
          style={{ fontSize: '9px', color: isCritical ? '#ba1a1a' : '#424842' }}
        >
          Day
        </span>
      </div>

      {/* Patient info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="font-heading font-bold text-ink text-lg">{p.name}</h3>
          <StatusOrb risk={p.risk} size="sm" />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
          <span className="font-inter text-sm text-ink-muted">{p.procedure}</span>
          <span
            className="font-inter text-sm font-semibold"
            style={{
              color: isCritical ? '#ba1a1a' : isModerate ? '#d97706' : '#4a654f',
            }}
          >
            {p.trend}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
        <span className="font-inter text-xs text-ink-muted">{pct}% complete</span>
        <div className="w-28 h-1.5 bg-surface-high rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: isCritical ? '#ba1a1a' : isModerate ? '#d97706' : '#4a654f',
            }}
          />
        </div>
      </div>

      <span
        className="material-symbols-outlined text-ink-muted shrink-0 group-hover:translate-x-1 transition-transform"
        style={{ fontSize: '20px' }}
      >
        chevron_right
      </span>
    </Link>
  );
}
