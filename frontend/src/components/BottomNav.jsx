/**
 * BottomNav.jsx — Fixed mobile bottom navigation (5 tabs)
 * Stitch design: rounded-t-[2rem], backdrop-blur, teal active bubble
 * ui-ux-pro-max: 44px touch targets, cursor-pointer, smooth 200ms transitions
 */

import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { icon: "home",       label: "Home",     path: null, key: "home" },
  { icon: "mic",        label: "Daily Log", path: "checkin", key: "checkin" },
  { icon: "assignment", label: "Plan",      path: null, key: "plan" },
  { icon: "group",      label: "Team",      path: null, key: "team" },
  { icon: "emergency",  label: "SOS",       path: null, key: "sos", emergency: true },
];

/**
 * @param {{ patientId?: string, activeKey?: string }} props
 */
export default function BottomNav({ patientId, activeKey = "home" }) {
  const navigate  = useNavigate();
  const location  = useLocation();

  const handlePress = (item) => {
    if (item.key === "checkin" && patientId) {
      navigate(`/patient/${patientId}/checkin`);
    } else if (item.key === "home" && patientId) {
      navigate(`/patient/${patientId}`);
    }
    // SOS, Plan, Team — future pages
  };

  const isActive = (item) => {
    if (item.key === "checkin")
      return location.pathname.includes("/checkin");
    if (item.key === "home")
      return !location.pathname.includes("/checkin") && location.pathname.includes("/patient/");
    return item.key === activeKey;
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-end px-4 pb-6 pt-2 bg-surface-container-low backdrop-blur-lg rounded-t-[2rem] shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
      aria-label="Main navigation"
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(item);
        return (
          <button
            key={item.key}
            onClick={() => handlePress(item)}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            className={`
              flex flex-col items-center justify-center p-2 min-w-[44px] min-h-[44px] cursor-pointer
              transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded-xl
              ${active
                ? "bg-primary-container text-on-primary rounded-full mb-2 scale-110 shadow-card-md px-3"
                : item.emergency
                  ? "text-error hover:text-error/80"
                  : "text-on-surface-variant hover:text-primary"
              }
            `}
          >
            <span
              className={`material-symbols-outlined ${active ? "filled" : ""}`}
              style={{
                fontSize: 22,
                fontVariationSettings: active ? "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" : undefined,
              }}
              aria-hidden="true"
            >
              {item.icon}
            </span>
            <span className="font-label text-[10px] font-bold uppercase tracking-wide mt-0.5">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
