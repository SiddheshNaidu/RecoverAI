/**
 * MedConfirmList — Medication confirmation toggles for check-in
 * PRD 4.5: Check/X per medication before recording
 */
import { useState } from 'react';

const DEMO_MEDS = [
  { name: 'Amoxicillin 500mg', critical: true },
  { name: 'Paracetamol 650mg', critical: false },
];

export default function MedConfirmList({ medications = DEMO_MEDS, onChange }) {
  const [taken, setTaken] = useState(() =>
    Object.fromEntries(medications.map(m => [m.name, false]))
  );

  const toggle = (name) => {
    const next = { ...taken, [name]: !taken[name] };
    setTaken(next);
    onChange?.(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-inter text-xs uppercase tracking-widest font-bold text-ink-muted">
        Medications Today
      </h3>
      {medications.map(med => {
        const isDone = taken[med.name];
        return (
          <button
            key={med.name}
            onClick={() => toggle(med.name)}
            className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 text-left border ${
              isDone
                ? 'bg-primary/5 border-primary/20'
                : med.critical
                  ? 'bg-[#fffbf0] border-[#d97706]/20 hover:border-[#d97706]/40'
                  : 'bg-white border-outline-variant/20 hover:border-outline-variant/40'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isDone ? 'bg-primary' : 'bg-surface-high'}`}>
              <span className="material-symbols-outlined text-[20px] text-white">
                {isDone ? 'check' : 'pill'}
              </span>
            </div>
            <div className="flex-1">
              <span className={`font-inter font-medium ${isDone ? 'text-ink-muted line-through' : 'text-ink'}`}>
                {med.name}
              </span>
              {med.critical && !isDone && (
                <span className="block text-xs text-[#d97706] mt-0.5 font-medium">Critical — must not miss</span>
              )}
            </div>
            {isDone && (
              <span className="font-inter text-xs text-primary font-bold">Taken ✓</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
