import { useParams } from 'react-router-dom';
import TrajectoryChart from '../components/patient/TrajectoryChart';
import AdherenceHeatmap from '../components/patient/AdherenceHeatmap';

const historyData = [
  { day: 4, date: 'Today',     score: 3, risk: 'stable',   text: 'Mild discomfort near the wound. Normal for Day 4.' },
  { day: 3, date: 'Yesterday', score: 4, risk: 'moderate', text: 'Slight fever in the morning. Medication taken on time. Wound stable.' },
  { day: 2, date: 'Mar 26',    score: 6, risk: 'moderate', text: 'Some pain after walking. Normal for Day 2. Rest recommended.' },
  { day: 1, date: 'Mar 25',    score: 8, risk: 'critical', text: 'First day after surgery. High pain expected. Monitoring closely.' },
];

const heatmap = Array.from({ length: 30 }).map((_, i) => {
  if (i < 5) return 'bg-error opacity-80';
  if (i < 15) return 'bg-[#eab308] opacity-80';
  return 'bg-primary opacity-80';
});

const riskColor = {
  stable:   'bg-primary text-white',
  moderate: 'bg-[#eab308] text-white',
  critical: 'bg-error text-white',
};

export default function HistoryPage() {
  const { id } = useParams();

  const handleShare = () => {
    const text = historyData.map(e => `Day ${e.day}: Pain ${e.score}/10 — ${e.text}`).join('\n');
    navigator.clipboard.writeText(text).then(() => alert('Summary copied!'));
  };

  return (
    <main className="min-h-screen bg-surface flex flex-col pt-12 pb-28 px-6 md:px-12 lg:px-24">
      <div className="max-w-[768px] mx-auto w-full flex flex-col gap-12">

        {/* Header */}
        <section className="animate-fade-up">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-heading text-[3rem] md:text-[4rem] leading-[1.1] tracking-tight text-ink mb-2">
                Recovery <span className="text-primary italic">Journal</span>
              </h1>
              <p className="font-inter text-ink-muted text-lg">Daily check-ins analysed by Gemini AI</p>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-surface-high hover:bg-surface-dim font-inter text-sm font-medium text-ink transition-colors shrink-0 mt-2"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
              Share with Doctor
            </button>
          </div>
        </section>

        {/* Trajectory Chart */}
        <section className="card-therapeutic p-8 md:p-10 animate-fade-up-delay">
          <TrajectoryChart />
        </section>

        {/* 30-Day Pain Heatmap */}
        <section className="animate-fade-up-delay">
          <h2 className="font-inter text-xs uppercase tracking-widest font-bold text-ink-muted mb-4">30-Day Overview</h2>
          <div className="flex gap-1 overflow-x-auto pb-2 hide-scrollbar">
            {heatmap.map((color, i) => (
              <div
                key={i}
                title={`Day ${30 - i}`}
                className={`w-4 h-10 md:w-6 md:h-12 rounded-sm shrink-0 ${color} hover:scale-110 hover:opacity-100 transition-all cursor-pointer`}
              />
            ))}
          </div>
        </section>

        {/* Adherence Heatmap */}
        <section className="card-therapeutic p-8 md:p-10 animate-fade-up-delay">
          <AdherenceHeatmap />
        </section>

        {/* Narrative timeline */}
        <section className="flex flex-col gap-5">
          {historyData.map((entry, idx) => (
            <div
              key={entry.day}
              className="relative flex gap-6 p-8 rounded-[2rem] bg-white hover:-translate-y-1 hover:shadow-ambient transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="flex flex-col items-center pt-2">
                <div className={`w-4 h-4 rounded-full z-10 ${
                  entry.risk === 'stable' ? 'bg-primary' : entry.risk === 'moderate' ? 'bg-[#eab308]' : 'bg-error'
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <h3 className="font-heading text-xl font-bold text-ink">Day {entry.day}</h3>
                  <div className="flex items-center gap-3">
                    <span className="font-inter text-sm text-ink-muted">{entry.date}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${riskColor[entry.risk]}`}>
                      {entry.risk}
                    </span>
                  </div>
                </div>
                <p className="font-inter text-ink text-base md:text-lg leading-relaxed">{entry.text}</p>

                {/* Pain bar */}
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-surface-high rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-700"
                      style={{ width: `${entry.score * 10}%` }}
                    />
                  </div>
                  <span className="font-inter text-sm text-ink-muted font-medium shrink-0">{entry.score}/10</span>
                </div>
              </div>
            </div>
          ))}
        </section>

      </div>
    </main>
  );
}
