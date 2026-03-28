/**
 * MedicationStrip.jsx — Horizontal scrollable medication pills
 * Stitch design: pill-shaped cards, check_circle for taken, dashed border for pending
 * ui-ux-pro-max: scroll hint visible, touch targets 44px, keyboard accessible
 */

/**
 * @param {{ medications: Array<{ name: string; frequency: string; critical: boolean }>, confirmations: Record<string, boolean> }} props
 */
export default function MedicationStrip({ medications = [], confirmations = {} }) {
  if (!medications.length) return null;

  const taken   = Object.values(confirmations).filter(Boolean).length;
  const total   = medications.length;

  return (
    <section aria-label="Today's medications" className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          Today's Medications
        </h3>
        <span className="text-xs font-bold text-primary-container">
          {taken} of {total} taken
        </span>
      </div>

      <div
        className="flex gap-3 overflow-x-auto pb-2 no-scrollbar"
        role="list"
        aria-label="Medication list"
      >
        {medications.map((med) => {
          const isTaken = confirmations[med.name] === true;
          return (
            <div
              key={med.name}
              role="listitem"
              className={`
                flex-none flex items-center gap-3 px-5 py-3.5 rounded-full min-h-[44px]
                bg-surface-container-lowest transition-all duration-200
                ${isTaken
                  ? "border-2 border-primary-container/30"
                  : "border-2 border-dashed border-outline-variant"
                }
                ${med.critical && !isTaken ? "border-error/40 bg-error-container/20" : ""}
              `}
            >
              <span
                className={`material-symbols-outlined ${isTaken ? "filled" : ""}`}
                style={{
                  fontSize: 20,
                  fontVariationSettings: isTaken ? "'FILL' 1" : "'FILL' 0",
                  color: isTaken ? "var(--md-primary-container)" : "var(--md-outline-variant)",
                }}
                aria-hidden="true"
              >
                {isTaken ? "check_circle" : "radio_button_unchecked"}
              </span>
              <div>
                <p className={`font-bold text-sm ${isTaken ? "text-on-surface" : "text-on-surface-variant"}`}>
                  {med.name}
                  {med.critical && (
                    <span className="ml-1 text-[9px] font-bold text-error uppercase tracking-wide">★</span>
                  )}
                </p>
                <p className="text-[10px] text-on-surface-variant leading-none mt-0.5">
                  {med.frequency.replace(/_/g, " ")}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
