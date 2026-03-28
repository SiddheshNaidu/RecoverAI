/**
 * MilestoneCard — Recovery milestone celebration card
 * Shows when the current recovery day matches a milestone in recoveryCurves.js
 */
import { useState, useEffect } from 'react';

export default function MilestoneCard({ day, conditionKey = 'appendectomy', curves = {} }) {
  const [visible, setVisible] = useState(false);

  const milestones = curves[conditionKey]?.milestones || {};
  const message = milestones[day];

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setVisible(true), 300);
      return () => clearTimeout(t);
    }
  }, [message]);

  if (!message) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] p-8 bg-white border border-primary/20 shadow-ambient transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      {/* Ambient glow */}
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex items-start gap-5">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary text-[28px]">military_tech</span>
        </div>
        <div>
          <p className="font-inter text-xs text-primary uppercase tracking-widest font-bold mb-2">
            Day {day} Milestone
          </p>
          <h3 className="font-heading text-xl md:text-2xl text-ink font-medium leading-snug">
            {message}
          </h3>
        </div>
      </div>
    </div>
  );
}
