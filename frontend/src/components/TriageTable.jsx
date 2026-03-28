/**
 * TriageTable.jsx — Patient triage table for nurse dashboard
 * Exact Match to Stitch Design: surface-container-low header, profile image avatars, 
 * priority dot shadows, specific hover row tracking (bg-secondary/10).
 */

import { getSurgeryLabel } from "../constants/surgeryTypes";

const PRIORITY_STYLES = {
  CRITICAL: {
    rowBg: "bg-error/5",
    dot:   "w-3 h-3 rounded-full bg-error block shadow-[0_0_8px_rgba(186,26,26,0.4)]",
  },
  HIGH: {
    rowBg: "bg-[#eab308]/5",
    dot:   "w-3 h-3 rounded-full bg-[#eab308] block",
  },
  MODERATE: {
    rowBg: "bg-[#eab308]/5",
    dot:   "w-3 h-3 rounded-full bg-[#eab308] block",
  },
  LOW: {
    rowBg: "",
    dot:   "w-3 h-3 rounded-full bg-secondary block",
  },
};

/**
 * Helper to display the trend indicator matching stitch
 */
function TableTrend({ direction, delta }) {
  if (direction === "down") {
    return (
      <div className="flex items-center gap-1 text-error">
        <span className="material-symbols-outlined text-sm" aria-hidden="true">trending_down</span>
        <span className="font-bold">{delta}</span>
      </div>
    );
  }
  if (direction === "up") {
    return (
      <div className="flex items-center gap-1 text-secondary">
        <span className="material-symbols-outlined text-sm" aria-hidden="true">trending_up</span>
        <span className="font-bold">{delta}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-on-surface-variant">
      <span className="material-symbols-outlined text-sm" aria-hidden="true">trending_flat</span>
      <span className="font-bold">Stable</span>
    </div>
  );
}

/**
 * @param {{ patients: Array<Object>; onSelectPatient?: (p: Object) => void }} props
 */
export default function TriageTable({ patients = [], onSelectPatient }) {
  if (!patients.length) {
    return <div className="p-8 text-center text-on-surface-variant text-sm bg-white rounded-lg shadow-sm font-body">No patients to display</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden" role="region" aria-label="Patient triage table">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]" role="grid">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/20">
              {["Prio", "Patient", "Day", "Last Check", "Trajectory", "Meds", "Wound", "AI Insight", "Action"].map((col, i) => (
                <th
                  key={col}
                  scope="col"
                  className={`px-4 py-4 font-label text-[11px] font-bold text-on-surface-variant uppercase tracking-widest ${col === 'Day' ? 'text-center' : ''} ${col === 'Action' ? 'text-right' : ''} ${col === 'AI Insight' ? 'w-64' : ''}`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {patients.map((patient, idx) => {
              const risk  = patient.risk_level ?? "LOW";
              const style = PRIORITY_STYLES[risk] ?? PRIORITY_STYLES.LOW;

              return (
                <tr
                  key={patient.id ?? idx}
                  className={`${style.rowBg} hover:bg-secondary/10 transition-colors duration-200 cursor-pointer`}
                  onClick={() => onSelectPatient?.(patient)}
                  onKeyDown={(e) => e.key === "Enter" && onSelectPatient?.(patient)}
                  tabIndex={0}
                  role="row"
                  aria-label={`${patient.name}, ${risk} risk`}
                >
                  {/* Priority dot */}
                  <td className="px-4 py-5" role="gridcell">
                    <span className={style.dot} aria-hidden="true" />
                  </td>

                  {/* Patient Name / Avatar */}
                  <td className="px-4 py-5" role="gridcell">
                    <div className="flex items-center gap-3">
                      {patient.avatar_url ? (
                        <img 
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" 
                          src={patient.avatar_url} 
                          alt="" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold shadow-sm border-2 border-white">
                          {(patient.name ?? "?")[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-on-surface">{patient.name}</p>
                        <p className="text-xs text-on-surface-variant">ID: #{patient.id?.split('-')[0].substring(0,4).toUpperCase() ?? "0000"}</p>
                      </div>
                    </div>
                  </td>

                  {/* Day */}
                  <td className="px-4 py-5 text-center font-bold text-primary" role="gridcell">
                    D{patient.recovery_day ?? "—"}
                  </td>

                  {/* Last Check */}
                  <td className="px-4 py-5 text-sm text-on-surface-variant" role="gridcell">
                    {patient.last_checkin ?? "2 hrs ago"}
                  </td>

                  {/* Trajectory */}
                  <td className="px-4 py-5" role="gridcell">
                    <TableTrend direction={patient.trend_direction} delta={patient.trend_delta} />
                  </td>

                  {/* Meds */}
                  <td className="px-4 py-5" role="gridcell">
                    <span 
                      className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        (patient.adherence_pct ?? 100) < 80 
                          ? "bg-error-container text-on-error-container" 
                          : "bg-secondary-container text-on-secondary-container"
                      }`}
                    >
                      {patient.adherence_pct ?? 100}%
                    </span>
                  </td>

                  {/* Wound */}
                  <td className="px-4 py-5" role="gridcell">
                    <span className={`text-xs font-semibold ${
                      patient.wound_status?.toLowerCase().includes("worse") ? "text-error" : 
                      patient.wound_status?.toLowerCase().includes("heal") ? "text-secondary" : 
                      "text-on-surface-variant"
                    }`}>
                      {patient.wound_status ?? "Stable"}
                    </span>
                  </td>

                  {/* AI Insight */}
                  <td className="px-4 py-5" role="gridcell">
                    <p className="text-xs leading-relaxed text-on-surface-variant italic">
                      {patient.ai_insight ?? "Recovering as expected."}
                    </p>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-5 text-right" role="gridcell">
                    <button 
                      className="text-primary hover:text-secondary p-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                      onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${patient.phone || "#"}` }}
                      aria-label="Call Patient"
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">call</span>
                    </button>
                    <button 
                      className="text-on-surface-variant hover:text-primary p-1 ml-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                      onClick={(e) => { e.stopPropagation(); onSelectPatient?.(patient); }}
                      aria-label="Flag Patient"
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">flag</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
