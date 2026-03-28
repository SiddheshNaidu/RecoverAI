/**
 * AdaptivePlanCard.jsx — Today's AI-generated care plan CTA
 * Stitch design: Fraunces heading, teal dot instructions, gradient CTA button
 * ui-ux-pro-max: 48px CTA height, hover circle bg expansion via scale (no layout shift)
 */

import { useNavigate } from "react-router-dom";

/**
 * @param {{
 *   patientId: string;
 *   day: number;
 *   instructions: string[];
 *   warningSigns?: string[];
 *   todayCheckinDone?: boolean;
 * }} props
 */
export default function AdaptivePlanCard({ patientId, day, instructions = [], warningSigns = [], todayCheckinDone = false }) {
  const navigate = useNavigate();

  return (
    <div className="relative bg-surface-container-lowest rounded-2xl shadow-card overflow-hidden">
      {/* Decorative background circle (GPU scale, no layout) */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary-fixed/10 translate-x-8 -translate-y-8 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 p-5 space-y-4">
        {/* Header */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">
            AI-Adapted Plan
          </p>
          <h2 className="font-fraunces text-xl font-semibold text-on-surface">
            Today's care plan — Day {day}
          </h2>
        </div>

        {/* Instructions */}
        {instructions.length > 0 && (
          <ul className="space-y-2" aria-label="Care instructions">
            {instructions.map((inst, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-on-surface leading-relaxed">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-primary-container mt-2 flex-shrink-0"
                  aria-hidden="true"
                />
                {inst}
              </li>
            ))}
          </ul>
        )}

        {/* Warning Signs — only shown if present */}
        {warningSigns.length > 0 && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-xs font-bold text-amber-800 mb-1.5 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-amber-600" style={{ fontSize: 14 }} aria-hidden="true">
                warning
              </span>
              Contact your nurse if you notice:
            </p>
            <ul className="space-y-1">
              {warningSigns.map((sign, i) => (
                <li key={i} className="text-xs text-amber-900 leading-relaxed">
                  • {sign}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => navigate(`/patient/${patientId}/checkin`)}
          disabled={todayCheckinDone}
          aria-label={todayCheckinDone ? "Today's check-in already submitted" : "Start today's check-in"}
          className={`
            w-full flex items-center justify-center gap-2.5 h-14 rounded-full
            font-bold text-sm tracking-wide cursor-pointer
            transition-all duration-200 active:scale-[0.98]
            focus-visible:ring-2 focus-visible:ring-primary
            ${todayCheckinDone
              ? "bg-surface-container text-on-surface-variant cursor-not-allowed"
              : "bg-gradient-to-r from-primary-container to-primary text-on-primary shadow-card-md hover:shadow-card"
            }
          `}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }} aria-hidden="true">
            {todayCheckinDone ? "check_circle" : "mic"}
          </span>
          {todayCheckinDone ? "Check-in submitted ✓" : "Start today's check-in"}
          {!todayCheckinDone && (
            <span className="material-symbols-outlined" style={{ fontSize: 18 }} aria-hidden="true">
              arrow_right_alt
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
