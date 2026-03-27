/**
 * components/ui/LoadingState.jsx — Team UNTITLED | Build-it ON
 *
 * Props:
 *   variant: "spinner" | "bar" | "text"   — default "spinner"
 *   label?: string                         — message below spinner
 *   className?: string
 */

import { Loader2 } from "lucide-react";

export default function LoadingState({ variant = "spinner", label = "Loading…", className = "" }) {
  if (variant === "bar") {
    return (
      <div className={`w-full ${className}`}>
        <div className="h-1 w-full bg-gray-100 rounded overflow-hidden">
          <div className="h-full bg-gray-800 rounded animate-[loading-bar_1.4s_ease-in-out_infinite]" />
        </div>
        {label && <p className="text-xs text-gray-400 mt-2 text-center">{label}</p>}
      </div>
    );
  }

  if (variant === "text") {
    return (
      <p className={`text-sm text-gray-500 text-center ${className}`}>{label}</p>
    );
  }

  // spinner (default)
  return (
    <div className={`flex flex-col items-center justify-center py-8 gap-3 ${className}`}>
      <Loader2 size={28} className="animate-spin text-gray-500" />
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
