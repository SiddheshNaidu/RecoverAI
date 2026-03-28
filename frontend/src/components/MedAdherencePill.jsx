/**
 * MedAdherencePill.jsx — % badge for nurse table
 * ui-ux-pro-max: color+text, accessible aria-label
 */

/**
 * @param {{ pct: number }} props
 */
export default function MedAdherencePill({ pct = 100 }) {
  const isLow  = pct < 80;
  const cls    = isLow
    ? "bg-error-container text-on-error-container"
    : "bg-secondary-container text-on-secondary-container";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${cls}`}
      aria-label={`Medication adherence: ${pct}%${isLow ? " — below threshold" : ""}`}
    >
      {pct}%{isLow ? " ⚠" : ""}
    </span>
  );
}
