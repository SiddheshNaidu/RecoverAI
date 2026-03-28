/**
 * TopNav.jsx — Fixed top navigation bar (shared across patient + nurse)
 * Exact Match to Stitch Design: "medical_services" icon next to font-fraunces recoverAI brand,
 * and a full avatar/charge nurse block on the right for Nurse Mode.
 */

import { useNavigate } from "react-router-dom";

/**
 * @param {{ title?: string; subtitle?: string; nurseMode?: boolean; nurseName?: string; wardLabel?: string; showBack?: boolean; backPath?: string }} props
 */
export default function TopNav({
  title,
  subtitle,
  nurseMode = false,
  nurseName,
  wardLabel,
  showBack = false,
  backPath,
}) {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 w-full flex justify-between items-center px-6 py-4 max-w-full bg-[#fdf9f5]/95 backdrop-blur-xl z-50">
      
      {/* Left side: Brand or Back Button + Title */}
      {showBack ? (
        <div className="flex items-center gap-3">
          <button
            onClick={() => (backPath ? navigate(backPath) : navigate(-1))}
            aria-label="Go back"
            className="p-2 -ml-2 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer hover:bg-surface-container transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-2xl" aria-hidden="true">
              arrow_back
            </span>
          </button>

          <div className="flex flex-col">
            <h1 className="font-fraunces text-xl font-semibold text-primary leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs font-medium text-on-surface-variant uppercase tracking-widest">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div 
          className="flex items-center gap-2 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-1" 
          onClick={() => navigate("/")}
          role="link"
          tabIndex={0}
          aria-label="RecoverAI Home"
        >
          <span className="material-symbols-outlined text-primary text-2xl" aria-hidden="true">medical_services</span>
          <span className="font-fraunces font-bold text-xl text-primary tracking-tight">recoverAI</span>
        </div>
      )}

      {/* Right side: Nurse Info or generic actions */}
      <div className="flex items-center gap-6">
        {nurseMode ? (
          <div className="flex items-center gap-3">
            <img 
              className="w-10 h-10 rounded-full object-cover shadow-sm border-2 border-white" 
              src="https://images.unsplash.com/photo-1594824436949-1361dc619208?q=80&w=200&auto=format&fit=crop" 
              alt={nurseName || "Nurse"}
            />
            <div className="hidden sm:block">
              <p className="font-bold text-on-surface text-sm">{nurseName || "Eleanor R."}</p>
              <p className="text-xs text-on-surface-variant">{wardLabel || "Charge Nurse, Ward 4"}</p>
            </div>
          </div>
        ) : (
          <button
            aria-label="Profile"
            className="p-2 rounded-full min-w-[44px] min-h-[44px] flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-2xl" aria-hidden="true">
              account_circle
            </span>
          </button>
        )}
      </div>

    </nav>
  );
}
