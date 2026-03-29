/**
 * AdherenceHeatmap — 7-day medication adherence grid
 * Color: green = taken, red = missed, gray = upcoming
 */
const DAY_LABELS = ["D1", "D2", "D3", "D4", "D5", "D6", "D7"];

export default function AdherenceHeatmap({ medications }) {
  const rows = medications?.length ? medications : [];

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-inter text-xs uppercase tracking-widest font-bold text-ink-muted mb-2">
        7-Day Adherence
      </h3>
      {rows.length === 0 && (
        <p className="font-inter text-sm text-ink-muted">No medication logs for the last 7 days.</p>
      )}

      {/* Day column headers */}
      <div className="grid gap-1" style={{ gridTemplateColumns: `1fr repeat(7, 2rem)` }}>
        <div /> {/* spacer for med name column */}
        {DAY_LABELS.map(l => (
          <div key={l} className="text-center font-inter text-[10px] text-ink-muted uppercase">{l}</div>
        ))}
      </div>

      {rows.map((med) => (
        <div key={med.name} className="grid items-center gap-1" style={{ gridTemplateColumns: `1fr repeat(7, 2rem)` }}>
          <div className="flex items-center gap-2 pr-3">
            {med.critical && (
              <span className="material-symbols-outlined text-[14px] text-[#d97706]">star</span>
            )}
            <span className="font-inter text-sm text-ink truncate">{med.name}</span>
          </div>
          {med.days.map((taken, i) => {
            let bg = 'bg-surface-high'; // future / no data
            if (taken === true)  bg = 'bg-primary';
            if (taken === false) bg = 'bg-error';
            return (
              <div
                key={i}
                title={taken === null ? 'Upcoming' : taken ? 'Taken' : 'Missed'}
                className={`w-7 h-7 rounded-lg ${bg} transition-all duration-300 hover:scale-110 mx-auto`}
              />
            );
          })}
        </div>
      ))}

      <div className="flex gap-4 mt-2">
        {[['bg-primary','Taken'],['bg-error','Missed'],['bg-surface-high','Upcoming']].map(([color, label]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${color}`} />
            <span className="font-inter text-xs text-ink-muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
