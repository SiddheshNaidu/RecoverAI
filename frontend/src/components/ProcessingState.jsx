/**
 * ProcessingState.jsx — 3-step animated processing screen
 * Exact Match to Stitch Design: Ping/Pulse animations for the AI graphic, 
 * explicitly styled steps (complete, active spinning, pending).
 */

import { useState, useEffect } from "react";

const STEPS = [
  { icon: "mic",            label: "Transcribing audio" },
  { icon: "psychiatry",     label: "Evaluating risk indicators" },
  { icon: "update",         label: "Updating your care plan" },
];

/**
 * @param {{ onComplete?: () => void }} props
 */
export default function ProcessingState({ onComplete }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < STEPS.length) {
        setActiveStep(currentStep);
      } else {
        clearInterval(interval);
        setTimeout(() => onComplete?.(), 800);
      }
    }, 2000); // 2sec per step
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center min-h-[400px]"
      role="status"
      aria-live="polite"
      aria-label="Processing your check-in"
    >
      {/* Animated AI processing graphic */}
      <div className="relative w-32 h-32 flex items-center justify-center mb-8">
        <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping"></div>
        <div className="absolute inset-2 bg-primary/20 rounded-full animate-pulse delay-75"></div>
        <div className="absolute inset-4 bg-gradient-to-br from-primary-container to-primary rounded-full flex items-center justify-center shadow-lg z-10">
            <span className="material-symbols-outlined text-white text-4xl animate-spin" style={{ animationDuration: '3s' }} aria-hidden="true">autorenew</span>
        </div>
      </div>
      
      <h2 className="font-fraunces text-2xl font-bold text-on-surface mb-2 text-center">Analyzing Update</h2>
      <p className="text-on-surface-variant text-center mb-8">RecoverAI is reviewing your symptoms...</p>
      
      {/* Progress steps */}
      <div className="w-full max-w-sm space-y-4">
        {STEPS.map((step, i) => {
          const isDone = i < activeStep;
          const isActive = i === activeStep;
          const isPending = i > activeStep;

          return (
            <div key={i} className="flex items-center gap-3">
              {isDone && (
                <>
                  <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">check</span>
                  </div>
                  <span className="text-on-surface font-medium opacity-50 line-through transition-all">{step.label}</span>
                </>
              )}
              
              {isActive && (
                <>
                  <div className="w-8 h-8 rounded-full bg-primary-container text-primary flex items-center justify-center shadow-sm relative">
                      <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">{step.icon}</span>
                  </div>
                  <span className="text-primary font-bold transition-all">{step.label}</span>
                </>
              )}
              
              {isPending && (
                <>
                  <div className="w-8 h-8 rounded-full bg-surface-container text-outline flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">{step.icon}</span>
                  </div>
                  <span className="text-on-surface-variant font-medium transition-all">{step.label}</span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
