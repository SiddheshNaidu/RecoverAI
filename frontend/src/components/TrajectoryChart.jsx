/**
 * TrajectoryChart.jsx — Recharts dual-line recovery trajectory
 * Stitch design: expected=dashed teal, actual=solid amber, deviation shading
 * ui-ux-pro-max: accessible aria-label, WCAG colors, responsive container
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
  Legend,
} from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-card-md border border-outline-variant/30 p-3 text-xs font-body min-w-[140px]">
      <p className="font-bold text-on-surface mb-1.5">Day {label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-3">
          <span className="text-on-surface-variant">{entry.name}</span>
          <span className="font-semibold" style={{ color: entry.color }}>
            {entry.value != null ? entry.value.toFixed(1) : "—"}/10
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * @param {{ chartData: Array; feverRiskDays: number[]; compact?: boolean }} props
 */
export default function TrajectoryChart({ chartData = [], feverRiskDays = [], compact = true }) {
  if (!chartData.length) return null;

  // Fever risk ReferenceArea spans
  const feverRanges = [];
  let rangeStart = null;
  feverRiskDays.forEach((d) => {
    if (rangeStart === null) rangeStart = d;
    if (!feverRiskDays.includes(d + 1)) {
      feverRanges.push([rangeStart, d]);
      rangeStart = null;
    }
  });

  return (
    <div
      className="w-full"
      role="img"
      aria-label="Recovery trajectory chart showing actual vs expected pain and mobility scores"
    >
      <ResponsiveContainer width="100%" height={compact ? 200 : 300}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          {/* Fever risk shading */}
          {feverRanges.map(([x1, x2], i) => (
            <ReferenceArea
              key={i}
              x1={x1}
              x2={x2}
              fill="#FEF3C7"
              fillOpacity={0.5}
              label={i === 0 ? { value: "⚠ Fever risk", position: "top", fontSize: 10, fill: "#B45309" } : undefined}
            />
          ))}

          {!compact && <CartesianGrid strokeDasharray="3 3" stroke="#BEC9C5" strokeOpacity={0.4} />}

          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: "#6e7976", fontFamily: "Plus Jakarta Sans" }}
            tickLine={false}
            axisLine={{ stroke: "#BEC9C5" }}
            label={{ value: "Day", position: "insideBottom", offset: -2, fontSize: 10, fill: "#6e7976" }}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fontSize: 10, fill: "#6e7976", fontFamily: "Plus Jakarta Sans" }}
            tickLine={false}
            axisLine={false}
            width={24}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Expected pain — dashed teal */}
          <Line
            type="monotone"
            dataKey="expectedPain"
            name="Expected pain"
            stroke="#00685b"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            strokeOpacity={0.5}
            dot={false}
            connectNulls
          />
          {/* Actual pain — solid amber */}
          <Line
            type="monotone"
            dataKey="actualPain"
            name="Actual pain"
            stroke="#f59e0b"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#f59e0b", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
            connectNulls
          />
          {/* Expected mobility — dashed teal */}
          <Line
            type="monotone"
            dataKey="expectedMobility"
            name="Expected mobility"
            stroke="#004e44"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            strokeOpacity={0.4}
            dot={false}
            connectNulls
          />
          {/* Actual mobility — solid primary */}
          <Line
            type="monotone"
            dataKey="actualMobility"
            name="Actual mobility"
            stroke="#004e44"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#004e44", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#004e44", stroke: "#fff", strokeWidth: 2 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 px-1" aria-hidden="true">
        {[
          { label: "Expected", style: "dashed", color: "#00685b" },
          { label: "Actual Pain", style: "solid", color: "#f59e0b" },
          { label: "Actual Mobility", style: "solid", color: "#004e44" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span
              className="inline-block w-5 h-0"
              style={{
                borderTop: `2px ${item.style === "dashed" ? "dashed" : "solid"} ${item.color}`,
                opacity: item.style === "dashed" ? 0.6 : 1,
              }}
            />
            <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
