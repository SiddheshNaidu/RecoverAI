/**
 * StatusOrb.jsx — Inline risk badge pill in patient home header
 * Stitch design: amber/error/secondary pill with pulsing dot indicator
 * ui-ux-pro-max: color not the only indicator, ARIA label, transform-only animation
 */

const RISK_CONFIG = {
  LOW: {
    bg:      "bg-secondary-container",
    text:    "text-secondary",
    dot:     "bg-secondary",
    label:   "STABLE",
    pulse:   "animate-orb-stable",
  },
  MODERATE: {
    bg:      "bg-amber-100",
    text:    "text-amber-800",
    dot:     "bg-amber-500",
    label:   "MODERATE RISK",
    pulse:   "animate-orb-monitor",
  },
  HIGH: {
    bg:      "bg-error-container",
    text:    "text-error",
    dot:     "bg-error shadow-critical",
    label:   "HIGH RISK",
    pulse:   "animate-orb-high",
  },
  CRITICAL: {
    bg:      "bg-[#EDE9FE]",
    text:    "text-[#5B21B6]",
    dot:     "bg-[#7C3AED] shadow-critical",
    label:   "CRITICAL",
    pulse:   "animate-orb-high",
  },
};

/**
 * @param {{ level: 'LOW'|'MODERATE'|'HIGH'|'CRITICAL'; size?: 'sm'|'lg' }} props
 */
export default function StatusOrb({ level = "LOW", size = "sm" }) {
  const cfg = RISK_CONFIG[level] ?? RISK_CONFIG.LOW;
  const isLarge = size === "lg";

  return (
    <span
      className={`
        inline-flex items-center gap-2 rounded-full font-bold tracking-wide
        ${cfg.bg} ${cfg.text}
        ${isLarge ? "px-5 py-2.5 text-sm" : "px-4 py-1.5 text-xs"}
      `}
      role="status"
      aria-label={`Recovery status: ${cfg.label}`}
    >
      {/* Pulsing dot — animates in sync with risk level */}
      <span
        className={`
          rounded-full motion-safe:${cfg.pulse} flex-shrink-0
          ${isLarge ? "w-2.5 h-2.5" : "w-2 h-2"}
          ${cfg.dot}
        `}
        aria-hidden="true"
      />
      {cfg.label}
    </span>
  );
}
