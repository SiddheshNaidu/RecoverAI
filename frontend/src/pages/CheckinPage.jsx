/**
 * CheckinPage.jsx — Daily check-in with voice/state machine
 * Exact Match to Stitch Design: fixed top header with close button,
 * max-w-2xl flex-col layout, Question Header, and transcript styling.
 */

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { getMedications } from "../api/client";
import { useCheckin }     from "../hooks/useCheckin";
import { useApp }         from "../context/AppContext";

import LoadingState     from "../components/LoadingState";
import VoiceRecorder    from "../components/VoiceRecorder";
import WaveformVisualizer from "../components/WaveformVisualizer";
import TranscriptCard   from "../components/TranscriptCard";
import WoundUpload      from "../components/WoundUpload";
import MedConfirmList   from "../components/MedConfirmList";
import ProcessingState  from "../components/ProcessingState";
import RiskResultCard   from "../components/RiskResultCard";

export default function CheckinPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { currentPatient } = useApp();

  const [meds, setMeds]     = useState([]);
  const [medsLoading, setML] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const checkin = useCheckin(id);

  useEffect(() => {
    getMedications(id)
      .then((d) => setMeds(d.medications ?? []))
      .catch(() => setMeds([]))
      .finally(() => setML(false));
  }, [id]);

  // Extract symptom tags from transcript (simple keyword match for demo)
  const tags = extractTags(checkin.transcript);

  const handleDone = () => navigate(`/patient/${id}`);

  const patientFirstName = currentPatient?.name?.split(" ")[0] ?? "Patient";

  return (
    <div className="min-h-screen bg-[#fdf9f5] font-body antialiased text-on-surface selection:bg-primary/20">
      
      {/* ── Fixed Header ──────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 h-16 bg-white border-b border-outline-variant/20 z-50 flex items-center justify-between px-4">
        <button 
          onClick={handleDone}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Cancel check-in and go back"
        >
            <span className="material-symbols-outlined text-on-surface" aria-hidden="true">close</span>
        </button>
        <span className="font-bold text-on-surface">Daily Check-in</span>
        <div className="w-10"></div>
      </header>

      <main
        className="max-w-2xl mx-auto pt-24 pb-32 px-4 sm:px-6 flex flex-col gap-6 h-full min-h-[100dvh]"
        aria-label="Daily check-in form"
      >

        {/* ── PROCESSING ────────────────────────────────────────── */}
        {checkin.step === "processing" && (
          <ProcessingState onComplete={() => {}} />
        )}

        {/* ── RESULT ────────────────────────────────────────────── */}
        {checkin.step === "result" && (
          <RiskResultCard result={checkin.result} onDone={handleDone} />
        )}

        {/* ── VOICE FLOW (idle / recording / reviewing) ─────────── */}
        {(checkin.step === "idle" || checkin.step === "recording" || checkin.step === "transcribing" || checkin.step === "reviewing") && (
          <>
            {/* Question Header (hidden if reviewing) */}
            {!checkin.transcript && checkin.step !== "reviewing" && (
              <div className="text-center py-4">
                <h1 className="font-fraunces text-3xl font-bold text-on-surface mb-2">How are you feeling today?</h1>
                <p className="text-on-surface-variant">Tap the microphone and tell me about your pain levels, mobility, and any new symptoms.</p>
              </div>
            )}

            {/* Voice recorder hero */}
            {!showForm && checkin.step !== "reviewing" && (
              <VoiceRecorder
                isRecording={checkin.step === "recording"}
                onStart={checkin.startRecording}
                onStop={async () => {
                  const blob = await checkin.stopRecording();
                  if (blob) {
                    // In production: send to Sarvam STT for transcript
                    // For now: simulate transcript after stop
                    setTimeout(() => {
                      checkin.setTranscript(
                        "I'm feeling some pain around a 5 out of 10. The swelling seems to have reduced a bit. I slept reasonably well. No fever."
                      );
                    }, 1200);
                  }
                }}
              />
            )}

            {/* Waveform (recording state only) */}
            {checkin.step === "recording" && <WaveformVisualizer active />}

            {/* Form mode toggle */}
            {!checkin.transcript && checkin.step !== "recording" && (
              <div className="flex justify-center mt-auto">
                <button
                  onClick={() => setShowForm((f) => !f)}
                  className="text-sm font-bold text-primary hover:text-primary/80 transition-colors duration-200 cursor-pointer px-4 py-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary underline decoration-2 underline-offset-4"
                >
                  {showForm ? "Or try voice mode instead" : "I'd rather type my update"}
                </button>
              </div>
            )}

            {/* Form mode text input */}
            {showForm && !checkin.transcript && (
              <div className="flex-1 flex flex-col pt-8">
                <textarea
                  id="text-checkin"
                  rows={6}
                  placeholder="Tell me about your pain levels, mobility, and any new symptoms..."
                  className="w-full p-6 rounded-3xl border border-outline-variant/30 bg-white text-on-surface text-lg leading-relaxed shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 selection:bg-primary/20"
                  onChange={(e) => checkin.step === "idle" && e.target.value.length > 10 && checkin.setTranscript(e.target.value)}
                />
              </div>
            )}

            {/* Live transcript card */}
            {checkin.transcript && (
              <div className="pt-2">
                <TranscriptCard transcript={checkin.transcript} tags={tags} onRetry={checkin.reset} />
              </div>
            )}

            {/* Wound upload */}
            {(checkin.transcript || checkin.step !== "idle") && (
              <WoundUpload
                imageFile={checkin.woundImage}
                onChange={checkin.setWoundImage}
              />
            )}

            {/* Medication confirmation */}
            {!medsLoading && meds.length > 0 && (checkin.transcript || checkin.step !== "idle") && (
              <MedConfirmList
                medications={meds}
                confirmations={checkin.medConfirmations}
                onChange={checkin.setMedConfirmation}
              />
            )}

            {/* Error */}
            {checkin.error && (
              <div className="p-4 bg-error-container/50 border border-error/20 rounded-2xl flex items-center gap-3 mt-4" role="alert">
                <span className="material-symbols-outlined text-error flex-shrink-0" aria-hidden="true">error</span>
                <p className="text-sm text-on-surface font-medium">{checkin.error}</p>
              </div>
            )}

            {/* Submit CTA */}
            {checkin.transcript && checkin.step === "reviewing" && (
              <div className="pt-6 pb-8 mt-auto sticky bottom-0 bg-gradient-to-t from-[#fdf9f5] via-[#fdf9f5] to-transparent">
                <button
                  onClick={checkin.submitCheckin}
                  className="w-full py-4 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary bg-primary hover:bg-primary/90 hover:shadow-xl hover:-translate-y-1 active:scale-95 cursor-pointer"
                  aria-label="Submit check-in"
                >
                  Submit Check-in
                  <span className="material-symbols-outlined text-xl" aria-hidden="true">arrow_forward</span>
                </button>
              </div>
            )}
          </>
        )}
      </main>

    </div>
  );
}

/**
 * Extract simple symptom chips from transcript for demo purposes.
 * In production the backend returns these as structured tags.
 */
function extractTags(transcript) {
  if (!transcript) return [];
  const tags = [];
  const t = transcript.toLowerCase();

  const matchNum = t.match(/pain.*?(\d+)/);
  if (matchNum) tags.push({ label: `Pain ${matchNum[1]}/10`, sentiment: parseInt(matchNum[1]) >= 7 ? "warn" : "neutral" });
  if (t.includes("swelling")) tags.push({ label: "Swelling", sentiment: "warn" });
  if (t.includes("fever"))    tags.push({ label: t.includes("no fever") ? "Fever: No" : "Fever: Yes", sentiment: t.includes("no fever") ? "ok" : "warn" });
  if (t.includes("sleep"))    tags.push({ label: t.includes("well") ? "Sleep: Good" : "Sleep: Poor", sentiment: t.includes("well") ? "ok" : "warn" });

  return tags;
}
