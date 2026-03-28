/**
 * RiskResultCard.jsx — Post-submission result with risk level + care directives
 * Exact Match to Stitch Design: animate-slide-up, large central risk badge
 * with overlapping label, plain language text, action cards, and fixed bottom CTA.
 */

import { useNavigate } from "react-router-dom";

const RISK_STYLE = {
  LOW: { bg: "bg-[#f2ecdb]", border: "border-[#e1d5ba]", text: "text-[#8c7853]", icon: "health_and_safety", title: "You're doing great!", label: "Low Risk" },
  MEDIUM: { bg: "bg-amber-100", border: "border-amber-300", text: "text-amber-700", icon: "warning", title: "Monitor your symptoms", label: "Medium Risk" },
  HIGH: { bg: "bg-error-container", border: "border-error", text: "text-error", icon: "emergency", title: "Medical attention needed", label: "High Risk" },
};

/**
 * @param {{ result: Object; onDone: () => void }} props
 */
export default function RiskResultCard({ result, onDone }) {
  if (!result) return null;

  const risk = result.risk_level ?? "LOW";
  const style = RISK_STYLE[risk] ?? RISK_STYLE.LOW;

  return (
    <div
      className="flex-1 flex flex-col min-h-[400px] animate-slide-up"
      role="status"
      aria-live="polite"
      aria-label={`Check-in result: ${risk} risk`}
    >
      <div className="flex-1 flex flex-col justify-center py-6 pt-12">
        {/* Risk badge */}
        <div className="flex justify-center mb-6">
            <div className={`w-24 h-24 rounded-full ${style.bg} border-4 ${style.border} flex items-center justify-center shadow-lg relative`}>
                <span className={`material-symbols-outlined ${style.text} text-4xl`} aria-hidden="true">{style.icon}</span>
                <div className="absolute -bottom-3 px-3 py-1 bg-white rounded-full border border-outline-variant/30 text-xs font-bold text-on-surface uppercase tracking-wider shadow-sm">
                    {style.label}
                </div>
            </div>
        </div>
        
        <h2 className="font-fraunces text-2xl font-bold text-on-surface mb-2 text-center">{style.title}</h2>
        <p className="text-on-surface-variant text-center mb-8 px-4 leading-relaxed">
          {result.plain_language_summary || "Your recovery is on track. Keep resting and following your care plan."}
        </p>
        
        {/* Action Cards */}
        <div className="space-y-4 w-full">
            {/* AI Plan Update */}
            <div className="bg-secondary-container/20 rounded-2xl p-5 border border-secondary-container/40 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary-container text-secondary flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-lg" aria-hidden="true">update</span>
                </div>
                <div>
                    <h3 className="font-bold text-on-surface mb-1">Care Plan Updated</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {result.tomorrows_plan?.length > 0 
                        ? result.tomorrows_plan[0] 
                        : "Your daily care plan has been adjusted based on today's check-in."}
                    </p>
                </div>
            </div>
            
            {/* WhatsApp notification */}
            <div className="bg-white rounded-2xl p-5 border border-outline-variant/20 shadow-sm flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${result.whatsapp_sent === false ? 'bg-surface-container text-outline' : 'bg-[#e8def8] text-[#1d192b]'}`}>
                    <span className="material-symbols-outlined text-lg" aria-hidden="true">
                      {result.whatsapp_sent === false ? "schedule" : "chat"}
                    </span>
                </div>
                <div>
                    <h3 className="font-bold text-on-surface mb-0.5">Family Notified</h3>
                    <p className="text-sm text-on-surface-variant">
                      {result.whatsapp_sent === false 
                        ? "WhatsApp summary pending..."
                        : "A summary has been sent to your proxy via WhatsApp."}
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* Fixed Bottom Action CTA */}
      <div className="pt-6 pb-8 mt-auto sticky bottom-0 bg-gradient-to-t from-[#fdf9f5] via-[#fdf9f5] to-transparent">
          <button 
            onClick={onDone}
            className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg hover:bg-primary/90 hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary cursor-pointer"
            aria-label="Return to Home"  
          >
              Return to Home
              <span className="material-symbols-outlined text-xl" aria-hidden="true">home</span>
          </button>
      </div>
    </div>
  );
}
