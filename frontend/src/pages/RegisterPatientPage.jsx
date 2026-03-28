/**
 * RegisterPatientPage — Staff-side patient onboarding (PRD 4.10)
 * Route: /receptionist/new
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const SURGERY_TYPES = [
  { id: 'appendectomy',    label: 'Appendectomy',        icon: 'monitoring' },
  { id: 'c_section',       label: 'C-Section',           icon: 'pregnant_woman' },
  { id: 'knee_replacement',label: 'Knee Replacement',    icon: 'social_leaderboard' },
  { id: 'gallbladder',     label: 'Gallbladder Removal', icon: 'health_and_safety' },
  { id: 'other',           label: 'Other Surgery',       icon: 'medical_services' },
];

const PIPELINE = ['Analysing surgery type…', 'Cross-referencing recovery curves…', 'Generating personalized plan…'];

export default function RegisterPatientPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=form, 2=processing, 3=done
  const [pipeStep, setPipeStep] = useState(0);

  const [form, setForm] = useState({
    name: '', phone: '', surgeryType: '', dischargeDate: '',
    caregiverPhone: '', instructions: '', medications: [''],
  });

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const addMed = () => setForm(prev => ({ ...prev, medications: [...prev.medications, ''] }));
  const updateMed = (i, val) => setForm(prev => {
    const meds = [...prev.medications];
    meds[i] = val;
    return { ...prev, medications: meds };
  });
  const removeMed = (i) => setForm(prev => ({
    ...prev, medications: prev.medications.filter((_, idx) => idx !== i),
  }));

  const handleGenerate = (e) => {
    e.preventDefault();
    setStep(2);
    setPipeStep(0);
    const advance = (s) => {
      setPipeStep(s);
      if (s < PIPELINE.length - 1) setTimeout(() => advance(s + 1), 1600);
      else setTimeout(() => setStep(3), 1600);
    };
    setTimeout(() => advance(0), 400);
  };

  return (
    <main className="min-h-screen bg-surface flex flex-col pt-8 pb-28 px-6 md:px-12 lg:px-24">
      <div className="max-w-[720px] mx-auto w-full flex flex-col gap-10">

        {/* Header */}
        <header className="flex items-center gap-4 animate-fade-up">
          <Link to="/receptionist" className="w-10 h-10 rounded-full bg-surface-high flex items-center justify-center hover:bg-surface-dim transition-colors">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div>
            <h1 className="font-heading text-[2rem] md:text-[2.5rem] tracking-tight text-ink">Register New Patient</h1>
            <p className="font-inter text-ink-muted">AI will generate a day-by-day recovery plan instantly</p>
          </div>
        </header>

        {/* STEP 1: Form */}
        {step === 1 && (
          <form onSubmit={handleGenerate} className="flex flex-col gap-8 animate-fade-up-delay">

            {/* Patient details */}
            <div className="bg-white rounded-[2rem] p-8 flex flex-col gap-6 shadow-sm">
              <h2 className="font-heading text-xl font-bold text-ink">Patient Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Full Name" required>
                  <input required value={form.name} onChange={e => update('name', e.target.value)} placeholder="Ramesh Patil" type="text" className="field-input" />
                </Field>
                <Field label="Phone Number" required>
                  <input required value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+91 98000 00000" type="tel" className="field-input" />
                </Field>
                <Field label="Discharge Date" required>
                  <input required value={form.dischargeDate} onChange={e => update('dischargeDate', e.target.value)} type="date" className="field-input" />
                </Field>
                <Field label="Caregiver Phone" required>
                  <input required value={form.caregiverPhone} onChange={e => update('caregiverPhone', e.target.value)} placeholder="+91 98100 00000" type="tel" className="field-input" />
                </Field>
              </div>
            </div>

            {/* Surgery type */}
            <div className="bg-white rounded-[2rem] p-8 flex flex-col gap-6 shadow-sm">
              <h2 className="font-heading text-xl font-bold text-ink">Surgery Type</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {SURGERY_TYPES.map(s => (
                  <button
                    key={s.id} type="button"
                    onClick={() => update('surgeryType', s.id)}
                    className={`flex flex-col items-center gap-3 p-5 rounded-2xl border text-center transition-all ${form.surgeryType === s.id ? 'bg-primary/5 border-primary shadow-sm scale-[1.02]' : 'border-outline-variant/20 hover:border-primary/30 bg-surface-low'}`}
                  >
                    <span className={`material-symbols-outlined text-[28px] ${form.surgeryType === s.id ? 'text-primary' : 'text-ink-muted'}`}>{s.icon}</span>
                    <span className={`font-inter text-sm font-medium ${form.surgeryType === s.id ? 'text-primary' : 'text-ink'}`}>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Medications */}
            <div className="bg-white rounded-[2rem] p-8 flex flex-col gap-5 shadow-sm">
              <h2 className="font-heading text-xl font-bold text-ink">Prescribed Medications</h2>
              {form.medications.map((med, i) => (
                <div key={i} className="flex gap-3">
                  <input
                    value={med}
                    onChange={e => updateMed(i, e.target.value)}
                    placeholder="e.g. Amoxicillin 500mg, twice daily"
                    className="field-input flex-1"
                  />
                  {form.medications.length > 1 && (
                    <button type="button" onClick={() => removeMed(i)} className="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center hover:bg-error/20 transition-colors shrink-0">
                      <span className="material-symbols-outlined text-[18px]">remove</span>
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addMed} className="flex items-center gap-2 text-primary font-inter text-sm font-medium hover:underline">
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                Add another medication
              </button>
            </div>

            {/* Special instructions */}
            <div className="bg-white rounded-[2rem] p-8 flex flex-col gap-4 shadow-sm">
              <h2 className="font-heading text-xl font-bold text-ink">Special Instructions</h2>
              <textarea
                value={form.instructions}
                onChange={e => update('instructions', e.target.value)}
                placeholder="e.g. Non-weight bearing for 2 weeks, keep wound dry…"
                className="field-input resize-none min-h-[100px]"
              />
            </div>

            {/* Submit 3D */}
            <button
              type="submit"
              disabled={!form.name || !form.surgeryType}
              className="w-full py-5 rounded-2xl font-heading font-bold text-lg text-white disabled:opacity-50"
              style={{
                background: 'linear-gradient(145deg, #5a7a5f, #3d5442)',
                boxShadow: '6px 6px 16px rgba(37,53,41,0.4), -3px -3px 10px rgba(141,170,145,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              Generate Recovery Plan with AI
              <span className="material-symbols-outlined ml-2 text-[20px] align-middle">auto_awesome</span>
            </button>
          </form>
        )}

        {/* STEP 2: Processing */}
        {step === 2 && (
          <div className="flex flex-col items-center gap-10 py-20 animate-fade-up">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-orb-breathe shadow-orb relative">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <span className="material-symbols-outlined text-primary text-[40px]">neurology</span>
            </div>
            <div className="flex flex-col gap-5 w-full max-w-sm">
              {PIPELINE.map((msg, i) => (
                <div key={i} className={`flex items-center gap-4 transition-all duration-500 ${i > pipeStep ? 'opacity-25' : 'opacity-100'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i < pipeStep ? 'bg-primary' : i === pipeStep ? 'bg-primary/20 animate-pulse' : 'bg-surface-high'}`}>
                    {i < pipeStep
                      ? <span className="material-symbols-outlined text-white text-[18px]">check</span>
                      : <span className={`material-symbols-outlined text-[18px] ${i === pipeStep ? 'text-primary animate-spin' : 'text-ink-muted'}`}>{i === pipeStep ? 'progress_activity' : 'circle'}</span>
                    }
                  </div>
                  <p className={`font-inter text-base ${i === pipeStep ? 'text-primary font-medium' : 'text-ink-muted'}`}>{msg}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Done */}
        {step === 3 && (
          <div className="flex flex-col items-center gap-8 py-16 text-center animate-fade-up">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-orb">
              <span className="material-symbols-outlined text-white text-[48px]">check_circle</span>
            </div>
            <h2 className="font-heading text-[2.5rem] tracking-tight text-ink">Plan Generated!</h2>
            <p className="font-inter text-ink-muted text-lg max-w-md">
              {form.name}'s personalized recovery plan is live. An SMS link has been sent to their phone.
            </p>
            <div className="flex gap-4 flex-col md:flex-row w-full max-w-sm">
              <Link to="/receptionist" className="flex-1 text-center py-4 rounded-2xl bg-surface-high font-heading font-bold text-ink hover:bg-surface-dim transition-colors">
                Back to Dashboard
              </Link>
              <button
                className="flex-1 py-4 rounded-2xl font-heading font-bold text-white"
                style={{ background: 'linear-gradient(145deg, #5a7a5f, #3d5442)', boxShadow: '5px 5px 12px rgba(37,53,41,0.35), -2px -2px 8px rgba(141,170,145,0.25)' }}
              >
                Register Another
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`.field-input { width: 100%; padding: 1rem 1.25rem; background: #f7f6ef; border-radius: 0.75rem; border: 1px solid rgba(194,200,192,0.3); outline: none; font-family: 'Inter', sans-serif; font-size: 1rem; color: #1a1f1b; transition: border-color 0.2s; } .field-input:focus { border-color: #4a654f; }`}</style>
    </main>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-heading text-sm font-bold text-ink">{label}{required && ' *'}</label>
      {children}
    </div>
  );
}
