/**
 * ProxyToggle — Switch between patient self-reporting and family proxy
 * PRD 4.5: "I am Ramesh" ↔ "Reporting for Ramesh"
 */
export default function ProxyToggle({ patientName = 'the patient', value = 'self', onChange }) {
  return (
    <div className="flex rounded-2xl bg-surface-high p-1 gap-1 w-full max-w-sm mx-auto">
      {[
        { id: 'self',         label: `I am ${patientName}`,          icon: 'person' },
        { id: 'family_proxy', label: `Reporting for ${patientName}`, icon: 'family_restroom' },
      ].map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange?.(opt.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-inter text-sm font-medium transition-all duration-300 ${
            value === opt.id
              ? 'bg-white text-primary shadow-sm scale-[1.02]'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">{opt.icon}</span>
          <span className="hidden sm:inline">{opt.label}</span>
          <span className="sm:hidden">{opt.id === 'self' ? 'Myself' : 'Proxy'}</span>
        </button>
      ))}
    </div>
  );
}
