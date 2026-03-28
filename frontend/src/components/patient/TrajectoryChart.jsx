/**
 * TrajectoryChart — Actual vs Expected recovery curve (Recharts)
 * PRD 4.6: Recovery trajectory chart
 */
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, Legend, Area, AreaChart, CartesianGrid
} from 'recharts';

// Simulated actual pain data for demo
const DEMO_DATA = [
  { day: 1, expected: 8, actual: 8 },
  { day: 2, expected: 7, actual: 7 },
  { day: 3, expected: 5, actual: 6 },
  { day: 4, expected: 4, actual: 3 },
  { day: 5, expected: 3, actual: null },
  { day: 6, expected: 2, actual: null },
  { day: 7, expected: 2, actual: null },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl p-3 shadow-ambient text-sm font-inter border border-outline-variant/20">
      <p className="font-bold text-ink mb-1">Day {label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value}/10
        </p>
      ))}
    </div>
  );
};

export default function TrajectoryChart({ data = DEMO_DATA }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-inter text-xs uppercase tracking-widest font-bold text-ink-muted mb-2">
        Recovery Trajectory
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="expectedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#c2c8c0" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#c2c8c0" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4a654f" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#4a654f" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            tick={{ fontFamily: 'Inter', fontSize: 11, fill: '#a0a8a0' }}
            tickLine={false}
            axisLine={false}
            label={{ value: 'Day', position: 'insideRight', offset: 10, fill: '#a0a8a0', fontSize: 11 }}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fontFamily: 'Inter', fontSize: 11, fill: '#a0a8a0' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone" dataKey="expected" name="Expected"
            stroke="#c2c8c0" strokeWidth={2} fill="url(#expectedGrad)"
            dot={false} activeDot={{ r: 5 }} strokeDasharray="6 3"
          />
          <Area
            type="monotone" dataKey="actual" name="Actual"
            stroke="#4a654f" strokeWidth={2.5} fill="url(#actualGrad)"
            dot={{ fill: '#4a654f', strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: '#4a654f' }}
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex gap-6 justify-center mt-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-[#c2c8c0]" style={{borderTop: '2px dashed #c2c8c0'}} />
          <span className="font-inter text-xs text-ink-muted">Expected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-primary" />
          <span className="font-inter text-xs text-ink-muted">Actual</span>
        </div>
      </div>
    </div>
  );
}
