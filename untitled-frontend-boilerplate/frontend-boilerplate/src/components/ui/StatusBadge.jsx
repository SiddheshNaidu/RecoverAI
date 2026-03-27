/**
 * components/ui/StatusBadge.jsx — Team UNTITLED | Build-it ON
 * Colored badge. Color is derived from label content — consistent per type.
 *
 * Props:
 *   label: string
 *   className?: string
 */

// Deterministic color from string (so same type always gets same color)
function colorFromString(str) {
  const palette = [
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-amber-100 text-amber-700",
    "bg-purple-100 text-purple-700",
    "bg-teal-100 text-teal-700",
    "bg-rose-100 text-rose-700",
    "bg-orange-100 text-orange-700",
    "bg-indigo-100 text-indigo-700",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) | 0;
  return palette[Math.abs(hash) % palette.length];
}

export default function StatusBadge({ label, className = "" }) {
  const display = label?.replace(/^structured:/, "") || "unknown";
  const color = colorFromString(display);
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${color} ${className}`}>
      {display}
    </span>
  );
}
