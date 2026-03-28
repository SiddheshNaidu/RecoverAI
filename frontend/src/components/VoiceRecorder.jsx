/**
 * VoiceRecorder.jsx — 128px gradient mic button with dual pulse rings
 * Exact Match to Stitch Design: Ping animations from Tailwind, 
 * bg-gradient-to-br from-primary-container to-primary, and hover states.
 */

import { useState, useEffect, useRef } from "react";

/**
 * @param {{
 *   isRecording: boolean;
 *   onStart: () => void;
 *   onStop: () => Promise<void>;
 *   onError?: (msg: string) => void;
 * }} props
 */
export default function VoiceRecorder({ isRecording, onStart, onStop, onError }) {
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handleClick = () => {
    if (isRecording) {
      onStop();
    } else {
      onStart();
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] relative">
      {/* Outer pulse ring */}
      {isRecording && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 rounded-full border-2 border-primary/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
          <div className="absolute w-48 h-48 rounded-full border-2 border-primary/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
        </div>
      )}

      {/* Main mic button — 128px */}
      <button
        onClick={handleClick}
        aria-label={isRecording ? `Stop recording (${formatTime(elapsed)})` : "Start recording"}
        aria-pressed={isRecording}
        className="relative z-10 w-32 h-32 rounded-full bg-gradient-to-br from-primary-container to-primary text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center outline-none focus-visible:ring-4 focus-visible:ring-offset-4 focus-visible:ring-primary active:scale-95 group cursor-pointer"
      >
        <span
          className={`material-symbols-outlined text-6xl ${isRecording ? '' : 'group-hover:animate-pulse'}`}
          aria-hidden="true"
        >
          {isRecording ? "stop" : "mic"}
        </span>
        {isRecording && (
          <span className="absolute bottom-4 text-white font-bold text-xs" aria-hidden="true">
            {formatTime(elapsed)}
          </span>
        )}
      </button>

      {/* State label */}
      <div className="mt-8 text-center" aria-live="polite">
        {isRecording ? (
          <p className="text-primary font-bold animate-pulse text-lg">Listening...</p>
        ) : (
          <p className="text-primary font-bold text-lg opacity-0">Listening...</p>
        )}
      </div>
    </div>
  );
}
