/**
 * MedConfirmList.jsx — Check/X toggle for each medication
 * Stitch design: divided list, segmented pill toggle (check=primary, X=outline)
 * ui-ux-pro-max: 44px touch targets, ARIA pressed, keyboard accessible
 */

/**
 * @param {{
 *   medications: Array<{ name: string; dosage?: string; frequency?: string }>;
 *   confirmations: Record<string, boolean>;
 *   onChange: (name: string, confirmed: boolean) => void;
 * }} props
 */
export default function MedConfirmList({ medications = [], confirmations = {}, onChange }) {
  if (!medications.length) return null;

  return (
    <section aria-label="Medication confirmation" className="space-y-3">
      <h3 className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
        Today's Medication
      </h3>

      <div
        className="bg-surface-container-lowest rounded-2xl divide-y divide-surface-container shadow-card"
        role="list"
      >
        {medications.map((med) => {
          const taken = confirmations[med.name];

          return (
            <div
              key={med.name}
              role="listitem"
              className="flex items-center justify-between p-4 gap-3"
            >
              {/* Med info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-fixed rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 20 }}>
                    pill
                  </span>
                </div>
                <div>
                  <p className="font-bold text-sm text-on-surface">{med.name}</p>
                  {(med.dosage || med.frequency) && (
                    <p className="text-xs text-on-surface-variant">
                      {[med.dosage, med.frequency?.replace(/_/g, " ")].filter(Boolean).join(" • ")}
                    </p>
                  )}
                </div>
              </div>

              {/* Segmented toggle — check | X */}
              <div
                className="flex bg-surface-container rounded-full p-1"
                role="group"
                aria-label={`Confirm ${med.name} medication`}
              >
                <button
                  onClick={() => onChange(med.name, true)}
                  aria-label={`Mark ${med.name} as taken`}
                  aria-pressed={taken === true}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center cursor-pointer
                    transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary
                    ${taken === true
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                    }
                  `}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }} aria-hidden="true">check</span>
                </button>

                <button
                  onClick={() => onChange(med.name, false)}
                  aria-label={`Mark ${med.name} as not taken`}
                  aria-pressed={taken === false}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center cursor-pointer
                    transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-error
                    ${taken === false
                      ? "bg-error-container text-error shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                    }
                  `}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }} aria-hidden="true">close</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
