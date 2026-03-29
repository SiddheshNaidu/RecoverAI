/**
 * TrajectoryChart — Actual vs Expected recovery curve (Recharts)
 * PRD 4.6: Recovery trajectory chart — smoothed with natural interpolation
 */
import {
  ResponsiveContainer, XAxis, YAxis,
  Tooltip, Area, AreaChart
} from 'recharts';

// Demo data for empty/loading state
const DEMO_DATA = [
  { day: 1, expected: 8, actual: 8 },
  { day: 3, expected: 6.8, actual: 7.2 },
  { day: 5, expected: 5.5, actual: 5 },
  { day: 7, expected: 4.2, actual: 4.5 },
  { day: 10, expected: 3, actual: null },
  { day: 14, expected: 2, actual: null },
];

const EXPECTED_COLOR = '#94a3b8'; // slate-400
const ACTUAL_COLOR = '#4a654f'; // forest green

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-ambient text-sm font-inter border border-outline-variant/20">
      <p className="font-semibold text-ink mb-2 text-xs uppercase tracking-wider">Day {label}</p>
      {payload.map(p => p.value !== null && (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-ink-muted">{p.name}:</span>
          <span className="font-semibold" style={{ color: p.color }}>{p.value}/10</span>
        </div>
      ))}
    </div>
  );
};

const CustomDot = ({ cx, cy, payload, dataKey }) => {
  if (payload[dataKey] === null || payload[dataKey] === undefined) return null;
  const color = dataKey === 'actual' ? ACTUAL_COLOR : EXPECTED_COLOR;
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill={color} opacity={0.15} />
      <circle cx={cx} cy={cy} r={3} fill={color} />
    </g>
  );
};

export default function TrajectoryChart({ data }) {
  const series = (data === undefined || data === null) ? DEMO_DATA : data;
  const isEmpty = Array.isArray(series) && series.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="font-inter text-xs uppercase tracking-widest font-bold text-ink-muted mb-2">
          Recovery Trajectory
        </h3>
        <p className="font-inter text-sm text-ink-muted">No trajectory points recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header + Legend */}
      <div className="flex items-center justify-between">
        <h3 className="font-inter text-xs uppercase tracking-widest font-bold text-ink-muted">
          Recovery Trajectory
        </h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-0 border-t-2 border-dashed" style={{ borderColor: EXPECTED_COLOR }} />
            <span className="font-inter text-xs text-ink-muted">Expected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-0.5 rounded-full" style={{ background: ACTUAL_COLOR }} />
            <span className="font-inter text-xs text-ink-muted">Actual</span>
          </div>
        </div>
      </div>

      {/* Smoothed area chart */}
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={series} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="expectedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={EXPECTED_COLOR} stopOpacity={0.15} />
              <stop offset="95%" stopColor={EXPECTED_COLOR} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={ACTUAL_COLOR} stopOpacity={0.22} />
              <stop offset="95%" stopColor={ACTUAL_COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="day"
            tickFormatter={(v) => `D${v}`}
            tick={{ fontFamily: 'Inter', fontSize: 10, fill: '#a0aba0' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 10]}
            tickCount={6}
            tick={{ fontFamily: 'Inter', fontSize: 10, fill: '#a0aba0' }}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8e2', strokeWidth: 1.5 }} />

          {/* Expected — dashed, muted */}
          <Area
            type="natural"
            dataKey="expected"
            name="Expected"
            stroke={EXPECTED_COLOR}
            strokeWidth={1.5}
            strokeDasharray="6 4"
            fill="url(#expectedGrad)"
            dot={false}
            activeDot={{ r: 5, fill: EXPECTED_COLOR, stroke: 'white', strokeWidth: 2 }}
          />

          {/* Actual — solid, prominent */}
          <Area
            type="natural"
            dataKey="actual"
            name="Actual"
            stroke={ACTUAL_COLOR}
            strokeWidth={2.5}
            fill="url(#actualGrad)"
            dot={<CustomDot dataKey="actual" />}
            activeDot={{ r: 7, fill: ACTUAL_COLOR, stroke: 'white', strokeWidth: 2 }}
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      <p className="font-inter text-[10px] text-ink-muted text-center">
        Days since discharge · Pain score (0 = no pain, 10 = worst)
      </p>
    </div>
  );
}
