/**
 * StatusOrb — Pulsing recovery status indicator
 * Sizes: 'lg' (80px, PatientHome hero), 'sm' (12px, Dashboard badge)
 * States: 'stable' (sage), 'moderate' (amber), 'critical' (red pulse)
 */
export default function StatusOrb({ risk = 'stable', size = 'lg' }) {
  const colorMap = {
    stable:   { bg: 'bg-primary',   shadow: 'shadow-[0_0_24px_rgba(74,101,79,0.4)]',  icon: 'ecg_heart' },
    moderate: { bg: 'bg-[#d97706]', shadow: 'shadow-[0_0_24px_rgba(217,119,6,0.4)]',  icon: 'warning' },
    critical: { bg: 'bg-error',     shadow: 'shadow-[0_0_32px_rgba(186,26,26,0.5)]',   icon: 'emergency' },
  };
  const c = colorMap[risk] || colorMap.stable;

  if (size === 'sm') {
    return (
      <span
        className={`inline-block w-3 h-3 rounded-full ${c.bg} ${risk === 'critical' ? 'animate-pulse' : ''}`}
        aria-label={`Status: ${risk}`}
      />
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center w-20 h-20 md:w-28 md:h-28 rounded-full ${c.bg} ${c.shadow} animate-orb-breathe`}
      aria-label={`Recovery status: ${risk}`}
    >
      {/* Outer ripple ring */}
      <div className={`absolute inset-0 rounded-full ${c.bg} opacity-30 animate-ping`} />
      <span className="material-symbols-outlined text-white text-[32px] md:text-[40px] relative z-10">
        {c.icon}
      </span>
    </div>
  );
}
