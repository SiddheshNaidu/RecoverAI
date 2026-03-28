/**
 * AlertsSidebar.jsx — Persistent right sidebar for nurse dashboard
 * Exact Match to Stitch Design: w-full xl:w-80 space-y-6 layout,
 * bg-white p-4 rounded-[1rem] shadow-sm cards, specific icon backgrounds.
 */

const ALERT_STYLE = {
  CRITICAL: {
    wrapperCls: "border border-error/10",
    iconBg: "bg-error/10",
    iconColor: "text-error",
    icon: "priority_high",
    pillTag: "text-[10px] text-error font-bold mt-1 uppercase",
    btnCls: "bg-error text-white hover:bg-error/90",
    btnIcon: "call",
    btnText: "Call Now",
  },
  HIGH: {
    wrapperCls: "border border-error/10",
    iconBg: "bg-error/10",
    iconColor: "text-error",
    icon: "monitor_heart",
    pillTag: "text-[10px] text-error font-bold mt-1 uppercase",
    btnCls: "bg-error text-white hover:bg-error/90",
    btnIcon: "call",
    btnText: "Call Now",
  },
  MODERATE: {
    wrapperCls: "border border-outline-variant/20",
    iconBg: "bg-surface-container-high",
    iconColor: "text-on-surface-variant",
    icon: "pill",
    pillTag: "text-[10px] text-on-surface-variant font-bold mt-1 uppercase",
    btnCls: "bg-surface-container-high text-primary hover:bg-surface-container-highest",
    btnIcon: "chat",
    btnText: "Message Family",
  },
  LOW: {
    wrapperCls: "border border-outline-variant/20",
    iconBg: "bg-surface-container-high",
    iconColor: "text-on-surface-variant",
    icon: "check_circle",
    pillTag: "text-[10px] text-on-surface-variant font-bold mt-1 uppercase",
    btnCls: "bg-surface-container-high text-primary hover:bg-surface-container-highest",
    btnIcon: "chat",
    btnText: "View Details",
  },
};

/**
 * @param {{
 *   alerts: Array<{ id: string; patient_name: string; message: string; risk_level: string; phone?: string }>;
 *   onCallDoctor: { name: string; phone: string; specialty: string } | null;
 * }} props
 */
export default function AlertsSidebar({ alerts = [], onCallDoctor = null }) {
  const urgentCount = alerts.filter((a) => a.risk_level === "CRITICAL" || a.risk_level === "HIGH").length;

  return (
    <aside className="w-full xl:w-80 space-y-6 flex-shrink-0" role="complementary" aria-label="Patient alerts">
      <div className="flex items-center justify-between">
        <h2 className="font-fraunces text-xl font-semibold text-on-surface">Alerts</h2>
        {urgentCount > 0 && (
          <span className="bg-error text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
            {urgentCount} URGENT
          </span>
        )}
      </div>

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-6 bg-white rounded-[1rem] shadow-sm border border-outline-variant/20">
            No active alerts
          </p>
        ) : (
          alerts.slice(0, 5).map((alert) => {
            const style = ALERT_STYLE[alert.risk_level] ?? ALERT_STYLE.MODERATE;
            return (
              <div key={alert.id} className={`bg-white p-4 rounded-[1rem] shadow-sm ${style.wrapperCls}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full ${style.iconBg} flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined ${style.iconColor} text-xl`} aria-hidden="true">
                      {style.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">{alert.patient_name}</h3>
                    <p className="text-xs text-on-surface-variant">{alert.message}</p>
                    <p className={style.pillTag}>{alert.risk_level} ALERT</p>
                  </div>
                </div>
                <button
                  className={`w-full mt-4 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-2 ${style.btnCls} outline-none focus-visible:ring-2 focus-visible:ring-primary`}
                  onClick={() => alert.phone ? window.location.href = `tel:${alert.phone}` : null}
                  aria-label={`${style.btnText} for ${alert.patient_name}`}
                >
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">{style.btnIcon}</span>
                  {style.btnText}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Team Coordination Section */}
      {onCallDoctor && (
        <div className="bg-primary-container p-6 rounded-[1.5rem] text-on-primary-container">
          <h3 className="font-fraunces text-lg font-medium mb-3">On-Call Support</h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
               <span className="font-bold text-white text-sm uppercase">
                 {(onCallDoctor.name ?? "?")[0]}
               </span>
            </div>
            <div>
              <p className="font-bold text-sm text-white">{onCallDoctor.name}</p>
              <p className="text-xs opacity-80 text-white/80">{onCallDoctor.specialty}</p>
            </div>
          </div>
          <button 
            className="w-full py-2 bg-on-primary-container text-primary-container text-xs font-bold rounded-full hover:opacity-90 transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-white"
            onClick={() => onCallDoctor.phone ? window.location.href = `tel:${onCallDoctor.phone}` : null}
            aria-label={`Page ${onCallDoctor.name}`}
          >
            Page Doctor
          </button>
        </div>
      )}
    </aside>
  );
}
