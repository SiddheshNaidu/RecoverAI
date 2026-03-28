/**
 * AdherenceHeatmap.jsx — 7-day medication adherence grid (nurse view)
 * ui-ux-pro-max: color + text indicator, accessible role=grid, 4.5:1 contrast
 */

const CELL_STATUS = {
  adhered:         { bg: "bg-secondary-container",       text: "text-secondary",     label: "Taken",         symbol: "✓" },
  missed:          { bg: "bg-error-container",           text: "text-error",         label: "Missed",        symbol: "✗" },
  critical_missed: { bg: "bg-error",                     text: "text-on-error",      label: "Critical miss", symbol: "✗" },
  pending:         { bg: "bg-surface-container",         text: "text-on-surface-variant", label: "Pending",  symbol: "–" },
  future:          { bg: "bg-surface-container-lowest",  text: "text-outline",       label: "Future",        symbol: "·" },
};

/**
 * @param {{
 *   medications: Array<{ name: string; critical: boolean; daily_status: string[] }>;
 *   days: number[];
 *   compact?: boolean;
 * }} props
 */
export default function AdherenceHeatmap({ medications = [], days = [], compact = false }) {
  if (!medications.length) return null;

  return (
    <div
      className="overflow-x-auto no-scrollbar"
      role="region"
      aria-label="Medication adherence heatmap"
    >
      <table className="w-full text-xs" role="grid">
        <thead>
          <tr>
            <th scope="col" className="text-left font-bold text-on-surface-variant py-1 pr-3 min-w-[100px]">
              Medication
            </th>
            {days.map((d) => (
              <th key={d} scope="col" className="text-center font-medium text-on-surface-variant pb-1 min-w-[32px]">
                D{d}
              </th>
            ))}
            <th scope="col" className="text-right font-bold text-on-surface-variant py-1 pl-2 min-w-[40px]">
              %
            </th>
          </tr>
        </thead>
        <tbody>
          {medications.map((med) => {
            const takenCount = med.daily_status.filter((s) => s === "adhered").length;
            const pct        = days.length ? Math.round((takenCount / days.length) * 100) : 0;

            return (
              <tr key={med.name} className="group">
                <td className="py-1 pr-3 text-on-surface font-semibold whitespace-nowrap">
                  {med.name}
                  {med.critical && (
                    <span className="ml-1 text-error text-[9px]" title="Critical medication" aria-label="critical">★</span>
                  )}
                </td>

                {med.daily_status.map((status, i) => {
                  const cfg = CELL_STATUS[status] ?? CELL_STATUS.future;
                  return (
                    <td
                      key={i}
                      className={`text-center py-1 ${compact ? "px-0.5" : "px-1"}`}
                      title={`Day ${days[i]}: ${cfg.label}`}
                    >
                      <span
                        className={`
                          inline-flex items-center justify-center font-bold
                          ${compact ? "w-5 h-5 text-[9px] rounded" : "w-7 h-7 text-[10px] rounded-md"}
                          ${cfg.bg} ${cfg.text}
                        `}
                        aria-label={cfg.label}
                      >
                        {cfg.symbol}
                      </span>
                    </td>
                  );
                })}

                <td className="text-right py-1 pl-2">
                  <span
                    className={`font-bold ${pct < 80 ? "text-error" : "text-secondary"}`}
                    aria-label={`${pct}% adherence`}
                  >
                    {pct}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
