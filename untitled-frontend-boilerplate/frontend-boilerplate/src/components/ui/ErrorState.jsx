/**
 * components/ui/ErrorState.jsx — Team UNTITLED | Build-it ON
 *
 * Props:
 *   message: string
 *   onRetry?: () => void
 *   className?: string
 */

import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorState({ message, onRetry, className = "" }) {
  return (
    <div className={`flex flex-col items-center gap-3 py-6 px-4 rounded-xl bg-red-50 border border-red-100 text-center ${className}`}>
      <AlertCircle size={24} className="text-red-400" />
      <p className="text-sm text-red-600 max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
        >
          <RefreshCw size={12} />
          Try again
        </button>
      )}
    </div>
  );
}
