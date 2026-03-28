/**
 * TranscriptCard.jsx — Live transcript with extracted symptom chips
 * Exact Match to Stitch Design: 3xl rounded white card, 
 * pulsing red recording indicator, replay button, and specific tag styles.
 */

/**
 * @param {{
 *   transcript: string;
 *   tags?: Array<{ label: string; sentiment: 'warn' | 'ok' | 'neutral' }>;
 *   onRetry?: () => void;
 * }} props
 */
export default function TranscriptCard({ transcript, tags = [], onRetry }) {
  if (!transcript) return null;

  const getTagIcon = (label) => {
    const l = label.toLowerCase();
    if (l.includes("pain")) return "healing";
    if (l.includes("swelling")) return "water_drop";
    if (l.includes("fever")) return "thermostat";
    if (l.includes("sleep")) return "bedtime";
    return "check_circle";
  };

  const getTagStyle = (sentiment) => {
    switch (sentiment) {
      case "warn": return "bg-error-container/50 text-error";
      case "ok": return "bg-[#e8def8] text-[#1d192b]"; // positive/ok styling from Stitch
      default: return "bg-secondary-container/50 text-secondary";
    }
  };

  return (
    <div
      className="bg-white rounded-3xl p-6 border border-outline-variant/20 shadow-sm relative overflow-hidden"
      aria-label="Voice transcript"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Live Transcript</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse" aria-hidden="true"></span>
            <span className="text-sm font-medium text-error">Captured</span>
          </div>
        </div>
        
        {onRetry && (
          <button 
            onClick={onRetry}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            aria-label="Restart recording"
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">replay</span>
          </button>
        )}
      </div>

      <div role="log" aria-live="polite" aria-label="Transcript text">
        <p className="font-fraunces text-lg leading-relaxed text-on-surface mb-6">
          "{transcript}"
        </p>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-outline-variant/10" aria-label="Extracted symptoms">
          {tags.map((tag, i) => (
            <span
              key={i}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium
                ${getTagStyle(tag.sentiment)}
              `}
            >
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                {getTagIcon(tag.label)}
              </span>
              {tag.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
