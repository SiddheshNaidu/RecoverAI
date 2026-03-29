/**
 * PainScoreGauge — Animated arc gauge showing 0-10 pain score
 * PRD 4.5 result state: visual Gemini pain score
 */
import { useEffect, useState } from 'react';

const COLORS = {
  low:      '#3d5442',   // sage — score 0–3
  moderate: '#d97706',   // amber — score 4–6
  high:     '#dc2626',   // red — score 7–10
};

function getColor(score) {
  if (score <= 3) return COLORS.low;
  if (score <= 6) return COLORS.moderate;
  return COLORS.high;
}

function getRisk(score) {
  if (score <= 3) return 'LOW';
  if (score <= 5) return 'MODERATE';
  if (score <= 7) return 'HIGH';
  return 'CRITICAL';
}

export default function PainScoreGauge({ score = 3, animated = true }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!animated) { setDisplayed(score); return; }
    let cur = 0;
    const interval = setInterval(() => {
      cur += 0.25;
      if (cur >= score) { setDisplayed(score); clearInterval(interval); return; }
      setDisplayed(Math.round(cur * 10) / 10);
    }, 30);
    return () => clearInterval(interval);
  }, [score, animated]);

  const pct = displayed / 10;             // 0–1
  const radius = 80;
  const circumference = Math.PI * radius; // half-circle
  const offset = circumference * (1 - pct);
  const color = getColor(displayed);
  const risk = getRisk(score);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* SVG Arc Gauge */}
      <div className="relative" style={{ width: 220, height: 120 }}>
        <svg width="220" height="120" viewBox="0 0 220 120">
          {/* Background track */}
          <path
            d="M 20 110 A 90 90 0 0 1 200 110"
            fill="none" stroke="#e6e3d0" strokeWidth="14" strokeLinecap="round"
          />
          {/* Animated foreground arc */}
          <path
            d="M 20 110 A 90 90 0 0 1 200 110"
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct)}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1), stroke 0.6s' }}
          />
        </svg>
        {/* Center reading */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span className="font-heading text-[3rem] font-bold leading-none" style={{ color }}>
            {displayed.toFixed(0)}
          </span>
          <span className="font-inter text-xs text-ink-muted">/ 10</span>
        </div>
      </div>

      {/* Risk badge */}
      <span
        className="px-5 py-2 rounded-full font-heading font-bold text-sm tracking-widest uppercase text-white"
        style={{ backgroundColor: color }}
      >
        {risk}
      </span>
    </div>
  );
}
