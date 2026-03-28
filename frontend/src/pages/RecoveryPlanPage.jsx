import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, useParams, Link } from 'react-router-dom';

const MOCK_PLAN = {
  day: 4,
  condition: 'Appendectomy Recovery',
  phase: 'Phase 2: Mobility Gain',
  goal: 'Walk to the kitchen and back without assistance.',
  motivational_note: 'Your body is healing even when it doesn\'t feel like it. Day 4 is where real recovery begins.',
  instructions: [
    'Take Amoxicillin 500mg with breakfast — never on an empty stomach',
    'Walk for 10 minutes at a light pace, indoors is fine',
    'Inspect wound for redness, discharge, or unusual warmth',
    'Rest after lunch — no heavy lifting, bending, or straining',
  ],
  medications: [
    { time: '9:00 AM',  name: 'Amoxicillin 500mg',  note: 'After breakfast' },
    { time: '2:00 PM',  name: 'Paracetamol 650mg',   note: 'For pain relief' },
    { time: '9:00 PM',  name: 'Amoxicillin 500mg',   note: 'After dinner'   },
  ],
  diet: 'Light meals — dal, rice, khichdi. Avoid spicy, oily food. Stay hydrated with 8+ glasses of water.',
  mobility: 'Light indoor walking only. No stairs without support. Stop activity if pain spikes above 5/10.',
  warnings: [
    'Go to hospital if fever exceeds 101°F (38.3°C)',
    'Call your doctor if wound leaks fluid, pus, or blood',
    'Seek emergency care if shortness of breath occurs',
  ],
};

export default function RecoveryPlanPage() {
  const { currentPatient } = useApp();
  const navigate = useNavigate();
  const { id } = useParams();

  const plan = MOCK_PLAN;
  const [checkedMeds, setCheckedMeds] = useState(plan.medications.map(() => false));
  const [checkedSteps, setCheckedSteps] = useState(plan.instructions.map(() => false));

  const allMedsDone = checkedMeds.every(Boolean);
  const progress = Math.round((checkedSteps.filter(Boolean).length / checkedSteps.length) * 100);

  const toggleMed  = i => setCheckedMeds(p => { const n = [...p]; n[i] = !n[i]; return n; });
  const toggleStep = i => setCheckedSteps(p => { const n = [...p]; n[i] = !n[i]; return n; });

  return (
    <main className="min-h-screen bg-surface pb-28">

      {/* ── DARK HEADER (matches PatientHome hero) ───────────────────── */}
      <section
        className="relative px-6 md:px-12 lg:px-16 pt-10 pb-14"
        style={{ background: 'linear-gradient(135deg, #1e2c22 0%, #2e3d32 50%, #3d5442 100%)' }}
      >
        <div className="max-w-[800px] mx-auto flex flex-col gap-4 relative z-10">
          {/* Back + label row */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <span className="font-inter text-white/60 text-sm uppercase tracking-widest font-semibold">
              AI Recovery Plan
            </span>
          </div>

          {/* Display heading */}
          <h1
            className="font-heading text-white font-extrabold"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', lineHeight: 0.95, letterSpacing: '-0.03em' }}
          >
            Day {plan.day} Protocol
          </h1>
          <p className="font-inter text-white/60 text-base">{plan.condition} &nbsp;·&nbsp; {plan.phase}</p>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-inter text-white/60 text-xs uppercase tracking-widest">Today's Completion</span>
              <span className="font-heading font-bold text-white text-sm">{progress}%</span>
            </div>
            <div className="h-2 bg-white/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-surface to-transparent pointer-events-none" />
      </section>

      {/* ── CONTENT ──────────────────────────────────────────────────── */}
      <div className="max-w-[800px] mx-auto px-6 md:px-12 pt-10 flex flex-col gap-8">

        {/* Goal card */}
        <div
          className="rounded-[2rem] p-8 flex flex-col gap-5 animate-fade-up relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(74,101,79,0.08), rgba(141,170,145,0.06))' , border: '1px solid rgba(74,101,79,0.15)' }}
        >
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-orb z-10">
            <span className="material-symbols-outlined text-white text-[24px]">flag</span>
          </div>
          <div className="z-10">
            <p className="font-inter text-xs uppercase tracking-widest font-bold text-primary mb-2">Today's Main Goal</p>
            <p className="font-heading text-ink font-semibold" style={{ fontSize: '1.6rem', lineHeight: 1.2 }}>
              "{plan.goal}"
            </p>
            <p className="font-inter text-ink-muted text-sm mt-4 leading-relaxed italic">{plan.motivational_note}</p>
          </div>
        </div>

        {/* Instructions — checkable */}
        <div className="bg-white rounded-[2rem] p-8 animate-fade-up-delay" style={{ boxShadow: '0 4px 24px rgba(28,28,17,0.07)' }}>
          <h2 className="font-heading font-bold text-ink mb-6" style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
            <span className="material-symbols-outlined text-primary align-middle mr-2 text-[26px]">list_alt</span>
            Instructions
          </h2>
          <div className="flex flex-col gap-3">
            {plan.instructions.map((inst, i) => (
              <button
                key={i}
                onClick={() => toggleStep(i)}
                className="flex items-start gap-4 p-4 rounded-2xl text-left transition-all hover:bg-surface-low group"
              >
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 ${checkedSteps[i] ? 'bg-primary border-primary' : 'border-outline-variant group-hover:border-primary'}`}>
                  {checkedSteps[i] && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                </div>
                <span className={`font-inter text-base leading-relaxed transition-all ${checkedSteps[i] ? 'line-through text-ink-muted' : 'text-ink'}`}>
                  {inst}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Medications — time-sorted */}
        <div className="bg-white rounded-[2rem] p-8 animate-fade-up-delay" style={{ boxShadow: '0 4px 24px rgba(28,28,17,0.07)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-bold text-ink" style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
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
                key={i}
                onClick={() => toggleMed(i)}
                className={`flex items-center justify-between p-5 rounded-2xl text-left transition-all duration-300 border-l-4 ${checkedMeds[i] ? 'border-primary bg-primary/5' : 'border-transparent bg-surface-low hover:bg-surface-mid'}`}
              >
                <div>
                  <span className="font-heading font-bold text-sm text-primary tracking-wide block">{med.time}</span>
                  <span className={`font-inter text-base transition-all ${checkedMeds[i] ? 'line-through text-ink-muted' : 'text-ink font-medium'}`}>{med.name}</span>
                  <span className="font-inter text-xs text-ink-muted block mt-0.5">{med.note}</span>
                </div>
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${checkedMeds[i] ? 'bg-primary border-primary' : 'border-outline-variant'}`}>
                  {checkedMeds[i] && <span className="material-symbols-outlined text-white text-[18px]">check</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Diet + Mobility - 2-col */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-up-delay">
          <div className="bg-white rounded-[2rem] p-7" style={{ boxShadow: '0 4px 24px rgba(28,28,17,0.07)' }}>
            <div className="w-11 h-11 rounded-xl bg-[#d97706]/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[#d97706] text-[22px]">restaurant</span>
            </div>
            <h3 className="font-heading font-bold text-ink text-lg mb-2">Diet Today</h3>
            <p className="font-inter text-sm text-ink-muted leading-relaxed">{plan.diet}</p>
          </div>
          <div className="bg-white rounded-[2rem] p-7" style={{ boxShadow: '0 4px 24px rgba(28,28,17,0.07)' }}>
            <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-accent text-[22px]">directions_walk</span>
            </div>
            <h3 className="font-heading font-bold text-ink text-lg mb-2">Mobility</h3>
            <p className="font-inter text-sm text-ink-muted leading-relaxed">{plan.mobility}</p>
          </div>
        </div>

        {/* Warning Signs */}
        <div className="rounded-[2rem] p-8 animate-fade-up-delay" style={{ background: '#fff5f5', border: '1px solid rgba(186,26,26,0.15)' }}>
          <h2 className="font-heading font-bold text-error mb-5" style={{ fontSize: '1.4rem', letterSpacing: '-0.01em' }}>
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

        {/* Start check-in CTA */}
        <Link
          to={`/patient/${id}/checkin`}
          className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl font-heading font-bold text-lg text-white no-underline transition-all hover:scale-[1.01] active:scale-[0.99] animate-fade-up-delay"
          style={{
            background: 'linear-gradient(145deg, #3d5442, #4a654f)',
            boxShadow: '6px 6px 20px rgba(37,53,41,0.4), -3px -3px 12px rgba(141,170,145,0.2), inset 0 1px 0 rgba(255,255,255,0.12)',
          }}
        >
          <span className="material-symbols-outlined text-[22px]">mic</span>
          Start Today's Check-in
        </Link>

      </div>
    </main>
  );
}
