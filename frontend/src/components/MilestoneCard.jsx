/**
 * MilestoneCard.jsx — Milestone achievement card
 * Stitch design: border-l-4 primary-container, check_circle FILL=1 in primary-fixed circle
 * ui-ux-pro-max: animate-milestone-in, motion-safe guard, dismiss 44px button
 */

import { useState } from "react";

/**
 * @param {{ title: string; description?: string; day: number; onDismiss?: () => void }} props
 */
export default function MilestoneCard({ title, description, day, onDismiss }) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <div
      className="
        relative flex items-center gap-4 p-4 bg-surface-container-lowest rounded-2xl
        border-l-4 border-primary-container shadow-card
        motion-safe:animate-milestone-in
      "
      role="status"
      aria-label={`Milestone reached: ${title}`}
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0">
        <span
          className="material-symbols-outlined text-primary-container filled"
          style={{ fontSize: 24, fontVariationSettings: "'FILL' 1" }}
          aria-hidden="true"
        >
          check_circle
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary-container mb-0.5">
          Milestone Reached · Day {day}
        </p>
        <p className="font-fraunces text-base font-semibold text-on-surface leading-snug">
          {title}
        </p>
        {description && (
          <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Dismiss */}
      {onDismiss && (
        <button
          onClick={handleDismiss}
          aria-label="Dismiss milestone"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full cursor-pointer hover:bg-surface-container transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 18 }} aria-hidden="true">
            close
          </span>
        </button>
      )}
    </div>
  );
}
