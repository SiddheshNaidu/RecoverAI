/**
 * EmergencyCard.jsx — Hospital guidance decision card
 * Stitch design: red-tinted surface, emergency_home icon, "Ask RecoverAI" CTA
 * ui-ux-pro-max: 48px CTA, focus ring, error color with sufficient contrast
 */

export default function EmergencyCard() {
  return (
    <div
      className="bg-error-container/10 border border-error/20 rounded-2xl p-4 space-y-3"
      role="complementary"
      aria-label="Emergency guidance"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center flex-shrink-0">
          <span
            className="material-symbols-outlined text-error"
            style={{ fontSize: 20 }}
            aria-hidden="true"
          >
            emergency_home
          </span>
        </div>
        <div>
          <p className="font-bold text-sm text-on-surface leading-snug">
            Not sure if you should go to hospital?
          </p>
          <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
            Describe your symptoms and RecoverAI will advise.
          </p>
        </div>
      </div>

      <button
        aria-label="Ask RecoverAI for emergency guidance"
        className="
          w-full h-11 rounded-full bg-surface-container-lowest border border-error/30
          text-error text-sm font-bold cursor-pointer
          hover:bg-error hover:text-on-error
          transition-all duration-200 active:scale-[0.98]
          focus-visible:ring-2 focus-visible:ring-error
        "
      >
        Ask RecoverAI
      </button>
    </div>
  );
}
