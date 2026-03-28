/**
 * RecoveryDayBadge.jsx — SVG circular progress ring
 * Stitch design: teal ring, day number center, "of N" below
 * ui-ux-pro-max: SVG transform animation, semantic aria-label
 */

/**
 * @param {{ day: number; totalDays: number; size?: 'sm'|'lg' }} props
 */
export default function RecoveryDayBadge({ day = 1, totalDays = 14, size = "lg" }) {
  const isLarge = size === "lg";
  const dimension = isLarge ? 80 : 44;
  const strokeW   = isLarge ? 6 : 4;
  const radius    = (dimension / 2) - (strokeW / 2);
  const circumference = 2 * Math.PI * radius;
  const progress  = Math.min(1, (day - 1) / Math.max(totalDays - 1, 1));
  const dashOffset = circumference * (1 - progress);

  return (
    <div
      className="flex flex-col items-center gap-0.5"
      role="img"
      aria-label={`Recovery Day ${day} of ${totalDays}`}
    >
      <div className="relative" style={{ width: dimension, height: dimension }}>
        <svg
          width={dimension}
          height={dimension}
          viewBox={`0 0 ${dimension} ${dimension}`}
          className="-rotate-90"
          aria-hidden="true"
        >
          {/* Background track */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeW}
            className="text-surface-container"
          />
          {/* Progress arc */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="text-primary-container transition-all duration-700 motion-reduce:transition-none"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-bold text-primary-container leading-none ${isLarge ? "text-2xl" : "text-sm"}`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {day}
          </span>
          {isLarge && (
            <span className="text-[9px] text-on-surface-variant font-medium leading-none mt-0.5">
              of {totalDays}
            </span>
          )}
        </div>
      </div>

      {isLarge && (
        <p className="text-xs text-on-surface-variant font-medium tracking-wide">
          Day {day} of {totalDays}
        </p>
      )}
    </div>
  );
}
