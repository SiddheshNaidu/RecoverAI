/**
 * TrendPill.jsx — Compact trend indicator for nurse table
 * ui-ux-pro-max: icon+color+text (never color alone), accessible aria-label
 */

const TREND_CONFIG = {
  up_bad:   { icon: "trending_up",   color: "text-error",          bg: "bg-error-container/50",        label: "Worsening" },
  down_good:{ icon: "trending_down", color: "text-secondary",      bg: "bg-secondary-container/50",    label: "Improving" },
  flat:     { icon: "trending_flat", color: "text-on-surface-variant", bg: "bg-surface-container",    label: "Stable" },
  up_good:  { icon: "trending_up",   color: "text-secondary",      bg: "bg-secondary-container/50",   label: "Improving" },
};

/**
 * @param {{ direction: 'up_bad'|'down_good'|'flat'|'up_good'; delta?: string }} props
 */
export default function TrendPill({ direction = "flat", delta }) {
  const cfg = TREND_CONFIG[direction] ?? TREND_CONFIG.flat;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color}`}
      aria-label={`Trend: ${cfg.label}${delta ? ` (${delta})` : ""}`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 14 }} aria-hidden="true">
        {cfg.icon}
      </span>
      {delta || cfg.label}
    </span>
  );
}
