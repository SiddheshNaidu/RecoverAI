/**
 * SummaryCards — PRD 4.9 receptionist dashboard stat cards
 */
export default function SummaryCards({ active = 12, needsAttention = 3, appointments = 2 }) {
  const cards = [
    { label: 'Active Patients', value: active,         icon: 'group',            color: 'text-primary',   bg: 'bg-primary/10' },
    { label: 'Needs Attention', value: needsAttention, icon: 'warning',          color: 'text-error',     bg: 'bg-error/10' },
    { label: 'Appointments',    value: appointments,   icon: 'calendar_month',   color: 'text-[#d97706]', bg: 'bg-[#d97706]/10' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((c, i) => (
        <div
          key={c.label}
          className="bg-white rounded-[1.25rem] p-5 flex flex-col gap-3 animate-fade-up shadow-sm hover:shadow-ambient transition-shadow duration-300"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className={`w-12 h-12 rounded-full ${c.bg} flex items-center justify-center`}>
            <span className={`material-symbols-outlined text-[24px] ${c.color}`}>{c.icon}</span>
          </div>
          <div>
            <div className={`font-heading text-[2rem] md:text-[2.2rem] font-bold leading-none ${c.color}`}>{c.value}</div>
            <div className="font-inter text-sm text-ink-muted mt-1">{c.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
