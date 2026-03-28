/**
 * SummaryCards.jsx — 4 stat cards for Nurse Dashboard header
 * Exact Match to Stitch Design: Top-left filled icon, top-right uppercase label,
 * 3xl Fraunces bold value, and bottom description string. Custom shadow and border-l-4.
 */

const CARD_CONFIG = [
  {
    key:         "critical",
    icon:        "error",
    label:       "Urgent",
    borderColor: "border-error",
    colorClass:  "text-error",
    desc:        "Immediate intervention required",
    prefix:      "",
    suffix:      " Critical",
  },
  {
    key:         "needs_review",
    icon:        "warning",
    label:       "Warning",
    borderColor: "border-[#eab308]",
    colorClass:  "text-[#eab308]",
    desc:        "Potential clinical drift detected",
    prefix:      "",
    suffix:      " Needs review",
  },
  {
    key:         "on_track",
    icon:        "check_circle",
    label:       "Stable",
    borderColor: "border-secondary",
    colorClass:  "text-secondary",
    desc:        "Normal recovery parameters",
    prefix:      "",
    suffix:      " On track",
  },
  {
    key:         "avg_day",
    icon:        "assignment",
    label:       "Cohort",
    borderColor: "border-outline",
    colorClass:  "text-outline",
    desc:        "Standard discharge window",
    prefix:      "Avg Day ",
    suffix:      "",
  },
];

/**
 * @param {{ stats: { critical: number; needs_review: number; on_track: number; avg_day: number } }} props
 */
export default function SummaryCards({ stats = {} }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
      role="list"
      aria-label="Patient summary statistics"
    >
      {CARD_CONFIG.map((card) => {
        const val = stats[card.key] ?? 0;
        return (
          <div
            key={card.key}
            className={`bg-white p-6 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.02)] border-l-4 ${card.borderColor}`}
            role="listitem"
            aria-label={`${card.label}: ${val}`}
          >
            <div className="flex justify-between items-start">
              <span
                className={`material-symbols-outlined ${card.colorClass}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
                aria-hidden="true"
              >
                {card.icon}
              </span>
              <span className={`text-xs font-label font-bold ${card.colorClass} uppercase`}>
                {card.label}
              </span>
            </div>
            <p className="text-3xl font-fraunces font-bold text-on-surface mt-4">
              {card.prefix}{val}{card.suffix}
            </p>
            <p className="text-sm text-on-surface-variant mt-1">
              {card.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
}
