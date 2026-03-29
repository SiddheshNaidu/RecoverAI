/**
 * AppointmentCard — Upcoming appointment (Supabase `appointments` + joined `patients`)
 */
function formatDateParts(isoDate) {
  if (!isoDate) return { line1: "—", line2: "—" };
  const d = new Date(`${isoDate}T12:00:00`);
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const dayNum = d.getDate();
  return { line1: month, line2: String(dayNum) };
}

export default function AppointmentCard({ appointment }) {
  const nested = appointment.patients;
  const name =
    (typeof nested === "object" && nested?.name) ||
    appointment.name ||
    "Patient";
  const reason = appointment.reason || "—";
  const time = appointment.appt_time || "—";
  const dayBadge =
    (typeof nested === "object" && nested?.recovery_current_day != null
      ? nested.recovery_current_day
      : appointment.day) ?? "—";
  const { line1, line2 } = formatDateParts(appointment.appt_date);

  return (
    <div className="flex items-center gap-5 p-5 bg-white rounded-2xl shadow-sm hover:shadow-ambient transition-all duration-300">
      <div className="flex flex-col items-center justify-center w-14 h-14 bg-surface-low rounded-xl shrink-0">
        <span className="font-inter text-[10px] uppercase text-ink-muted tracking-wider font-bold">{line1}</span>
        <span className="font-heading text-xl font-bold text-ink leading-none">{line2}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-heading font-bold text-ink text-base truncate">{name}</p>
        <p className="font-inter text-sm text-ink-muted">
          {time} · {reason}
        </p>
      </div>
      <span className="font-inter text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-full font-medium shrink-0">
        Day {dayBadge}
      </span>
    </div>
  );
}
