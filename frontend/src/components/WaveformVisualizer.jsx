/**
 * WaveformVisualizer.jsx — 8 animated bars mimicking live audio waveform
 * Stitch design: w-1 primary rounded-full bars with varying heights
 * ui-ux-pro-max: CSS animation via transform:scaleY only, aria-hidden (decorative)
 */

const BARS = [
  { h: "12px", delay: "0ms"   },
  { h: "24px", delay: "120ms" },
  { h: "16px", delay: "60ms"  },
  { h: "32px", delay: "200ms" },
  { h: "20px", delay: "80ms"  },
  { h: "28px", delay: "150ms" },
  { h: "12px", delay: "40ms"  },
  { h: "20px", delay: "180ms" },
];

/**
 * @param {{ active?: boolean }} props
 */
export default function WaveformVisualizer({ active = true }) {
  if (!active) return null;

  return (
    <div
      className="flex items-center justify-center gap-[3px] h-10"
      aria-hidden="true"
      role="presentation"
    >
      {BARS.map((bar, i) => (
        <span
          key={i}
          className="w-[3px] bg-primary rounded-full motion-safe:animate-wave-bar"
          style={{
            height: bar.h,
            animationDelay: bar.delay,
            transformOrigin: "center",
          }}
        />
      ))}
    </div>
  );
}
