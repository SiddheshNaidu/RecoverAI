/**
 * AlertsLog.jsx — Last 3 WhatsApp alert history for patient view
 * ui-ux-pro-max: relative timestamps, color-only risk supplemented with text labels
 */

function relativeTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const min  = Math.floor(diff / 60000);
  if (min < 1)  return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24)  return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

const LEVEL_STYLE = {
  LOW:      { bg: "bg-secondary-container/40", text: "text-secondary", icon: "info" },
  MODERATE: { bg: "bg-amber-100",              text: "text-amber-800", icon: "warning" },
  HIGH:     { bg: "bg-error-container",        text: "text-error",     icon: "error" },
  CRITICAL: { bg: "bg-[#EDE9FE]",              text: "text-[#5B21B6]", icon: "emergency" },
};

/**
 * @param {{ alerts: Array<{ id: string; message: string; risk_level: string; created_at: string }> }} props
 */
export default function AlertsLog({ alerts = [] }) {
  if (!alerts.length) return null;
  const recent = alerts.slice(0, 3);

  return (
    <section aria-label="Recent alerts" className="space-y-2">
      <h3 className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
        Recent Alerts
      </h3>
      <ul className="space-y-2">
        {recent.map((alert) => {
          const style = LEVEL_STYLE[alert.risk_level] ?? LEVEL_STYLE.LOW;
          return (
            <li
              key={alert.id}
              className={`flex items-start gap-3 p-3 rounded-xl ${style.bg}`}
            >
              <span
                className={`material-symbols-outlined ${style.text} flex-shrink-0`}
                style={{ fontSize: 18 }}
                aria-hidden="true"
              >
                {style.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-on-surface leading-relaxed line-clamp-2">
                  {alert.message}
                </p>
              </div>
              <time
                className="text-[10px] font-medium text-on-surface-variant whitespace-nowrap flex-shrink-0"
                dateTime={alert.created_at}
                aria-label={new Date(alert.created_at).toLocaleString()}
              >
                {relativeTime(alert.created_at)}
              </time>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
