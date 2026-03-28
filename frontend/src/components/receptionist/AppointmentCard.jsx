/**
 * AppointmentCard — Upcoming appointment item for receptionist dashboard
 * PRD 4.9: Auto-generated from recovery plan milestones
 */
export default function AppointmentCard({ appointment }) {
  const { date, time, name, reason, day } = appointment;
  return (
    <div className="flex items-center gap-5 p-5 bg-white rounded-2xl shadow-sm hover:shadow-ambient transition-all duration-300">
      {/* Date pill */}
      <div className="flex flex-col items-center justify-center w-14 h-14 bg-surface-low rounded-xl shrink-0">
        <span className="font-inter text-[10px] uppercase text-ink-muted tracking-wider font-bold">{date.split(' ')[0]}</span>
        <span className="font-heading text-xl font-bold text-ink leading-none">{date.split(' ')[1]}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-heading font-bold text-ink text-base truncate">{name}</p>
        <p className="font-inter text-sm text-ink-muted">{time} · {reason}</p>
      </div>
      <span className="font-inter text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-full font-medium shrink-0">
        Day {day}
      </span>
    </div>
  );
}
