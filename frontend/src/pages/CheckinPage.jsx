/**
 * CheckinPage — Voice/text check-in: Sarvam STT + Gemini via backend
 */
import { useState, useRef, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { Link, useParams } from "react-router-dom";
import ProxyToggle from "../components/checkin/ProxyToggle";
import MedConfirmList from "../components/checkin/MedConfirmList";
import WoundUpload from "../components/checkin/WoundUpload";
import PainScoreGauge from "../components/checkin/PainScoreGauge";
import {
  processAudioCheckin,
  processTextCheckin,
  generateContent,
  parseModelJsonString,
  buildPainCheckinPrompt,
  deliverWhatsApp,
  adaptDailyPlanAfterCheckin,
} from "../api/client";

const PIPELINE_VOICE = [
  { icon: "translate", label: "Sarvam AI", detail: "Detecting language and transcribing audio..." },
  { icon: "neurology", label: "Gemini AI", detail: "Analysing symptoms and scoring pain level..." },
  { icon: "update", label: "Plan Update", detail: "Generating today's guidance..." },
];

const PIPELINE_TEXT = [
  { icon: "edit_note", label: "Check-in", detail: "Structuring your typed message..." },
  { icon: "neurology", label: "Gemini AI", detail: "Analysing symptoms and scoring pain level..." },
  { icon: "update", label: "Plan Update", detail: "Generating today's guidance..." },
];

function mapGenToResult(transcriptRaw, parsed) {
  if (!parsed) return null;
  return {
    transcript_en: String(parsed.transcript_en ?? transcriptRaw),
    language_detected: String(parsed.language_detected ?? "—"),
    pain_score: Math.min(10, Math.max(0, Number(parsed.pain_score ?? 0))),
    risk: String(parsed.risk ?? "LOW"),
    summary: String(parsed.summary ?? ""),
    directive: String(parsed.directive ?? ""),
    wound: parsed.wound ? String(parsed.wound) : "",
    whatsapp: String(parsed.whatsapp ?? "caregiver"),
    tomorrow: String(parsed.tomorrow ?? ""),
    alert_caregiver: Boolean(parsed.alert_caregiver),
    caregiver_message: String(parsed.caregiver_message ?? ""),
  };
}

export default function CheckinPage() {
  const { currentPatient, preferredLanguage } = useApp();
  const { id } = useParams();

  const [phase, setPhase] = useState("idle");
  const [reporter, setReporter] = useState("self");
  const [waveActive, setWaveActive] = useState(false);
  const [liveTranscriptHint, setLiveTranscriptHint] = useState("");
  const [textInput, setTextInput] = useState("");
  const [useText, setUseText] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [medsTaken, setMedsTaken] = useState({});
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [pipelineSteps, setPipelineSteps] = useState(PIPELINE_VOICE);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const patientName = currentPatient?.name?.split(" ")[0] || "Patient";
  const checkinId = id || currentPatient?.id || "demo123";
  const recoveryDay = currentPatient?.recovery_day ?? 4;
  const surgeryType = currentPatient?.condition || "appendectomy recovery";
  const caregiverPhone = currentPatient?.phone
    ? String(currentPatient.phone).replace(/\s/g, "")
    : null;

  const medsLine =
    Object.keys(medsTaken).length > 0
      ? Object.entries(medsTaken)
          .filter(([, v]) => v)
          .map(([k]) => k)
          .join(", ") || "medications as prescribed"
      : "medications as prescribed";

  const runPipeline = useCallback(
    async (source) => {
      const { audioBlob, text } = source;
      setApiError(null);
      setPhase("processing");
      setPipelineStep(0);
      setResult(null);

      try {
        let transcript = "";

        if (audioBlob && audioBlob.size > 0) {
          setPipelineSteps(PIPELINE_VOICE);
          const audioRes = await processAudioCheckin(audioBlob, preferredLanguage.sarvam);
          transcript = String(audioRes.transcript || "").trim();
          setPipelineStep(1);
        } else if (text && text.trim()) {
          setPipelineSteps(PIPELINE_TEXT);
          transcript = text.trim();
          await processTextCheckin(transcript);
          setPipelineStep(1);
        } else {
          throw new Error("No voice recording or text to send.");
        }

        if (!transcript) {
          throw new Error(
            "Empty transcript. Check microphone access and SARVAM_API_KEY, or type your symptoms."
          );
        }

        const prompt = buildPainCheckinPrompt({
          transcript,
          recoveryDay,
          surgeryType,
          medicationsLine: medsLine,
          doctorNotes: "follow wound care, medications, and gradual mobilisation",
        });
        const gen = await generateContent(prompt);
        setPipelineStep(2);

        const parsed = parseModelJsonString(gen.result);
        const ui = mapGenToResult(transcript, parsed);
        if (!ui) {
          throw new Error("AI returned invalid JSON. Please try again.");
        }

        if (
          ui.alert_caregiver &&
          caregiverPhone &&
          /^\+[1-9]\d{1,14}$/.test(caregiverPhone) &&
          ui.caregiver_message
        ) {
          try {
            await deliverWhatsApp(
              caregiverPhone,
              `RecoverAI Update: ${ui.caregiver_message}`
            );
          } catch {
            /* optional */
          }
        }

        try {
          await adaptDailyPlanAfterCheckin(checkinId, {
            summary: ui.summary,
            pain_score: ui.pain_score,
            risk: ui.risk,
          });
        } catch {
          // Non-blocking: check-in result should still be shown
        }

        setResult(ui);
        setPhase("result");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Check-in failed.";
        const fromAudio = Boolean(audioBlob && audioBlob.size > 0);
        if (fromAudio) {
          setUseText(true);
        }
        setApiError(
          fromAudio
            ? `${msg} You can continue instantly using typed check-in below.`
            : msg
        );
        setPhase("idle");
      }
    },
    [
      preferredLanguage.sarvam,
      recoveryDay,
      surgeryType,
      medsLine,
      caregiverPhone,
    ]
  );

  const startRecording = async () => {
    setApiError(null);
    setLiveTranscriptHint("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(250);
      setPhase("recording");
      setWaveActive(true);
    } catch {
      setApiError("Microphone access denied. Allow the mic or use text instead.");
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;

    setWaveActive(false);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setLiveTranscriptHint("Transcribing with Sarvam…");
      runPipeline({ audioBlob: blob, text: null });
    };
    recorder.stop();
  };

  const submitText = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    setLiveTranscriptHint("");
    runPipeline({ audioBlob: null, text: textInput });
  };

  return (
    <main className="min-h-screen bg-surface flex flex-col pt-8 pb-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-[720px] mx-auto w-full flex flex-col flex-1 gap-10">
        <header className="flex items-center gap-4 animate-fade-up">
          <Link
            to={`/patient/${checkinId}`}
            className="w-10 h-10 rounded-full bg-surface-high flex items-center justify-center hover:bg-surface-dim transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div>
            <h1 className="font-heading text-[2rem] md:text-[2.5rem] tracking-tight text-ink">Daily Check-in</h1>
            <p className="font-inter text-ink-muted text-sm">Voice to Sarvam AI to Gemini AI to Recovery Plan</p>
          </div>
        </header>

        {apiError && phase === "idle" && (
          <div
            className="rounded-2xl p-4 border border-error/30 bg-error/5 text-error text-sm font-inter"
            role="alert"
          >
            {apiError}
            {useText && (
              <p className="mt-2 text-ink-muted">
                Tip: write 1-2 lines about pain level, wound status, and any symptoms.
              </p>
            )}
          </div>
        )}

        {/* IDLE */}
        {phase === "idle" && (
          <div className="flex flex-col gap-8 animate-fade-up-delay">
            <ProxyToggle patientName={patientName} value={reporter} onChange={setReporter} />
            <div className="bg-white rounded-[2rem] p-8 shadow-sm">
              <MedConfirmList onChange={setMedsTaken} />
            </div>
            <div className="bg-white rounded-[2rem] p-8 shadow-sm">
              <WoundUpload />
            </div>

            {!useText ? (
              <div className="flex flex-col items-center gap-6">
                <button
                  type="button"
                  onClick={startRecording}
                  className="flex items-center justify-center w-32 h-32 rounded-full cursor-pointer border-0 outline-none"
                  style={{
                    background: "linear-gradient(145deg, #5a7a5f, #3d5442)",
                    boxShadow:
                      "6px 6px 16px rgba(37,53,41,0.4), -3px -3px 10px rgba(141,170,145,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                  }}
                  onMouseDown={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "2px 2px 6px rgba(37,53,41,0.5), inset 0 2px 4px rgba(0,0,0,0.2)")
                  }
                  onMouseUp={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "6px 6px 16px rgba(37,53,41,0.4), -3px -3px 10px rgba(141,170,145,0.3), inset 0 1px 0 rgba(255,255,255,0.15)")
                  }
                >
                  <span className="material-symbols-outlined text-white text-[48px] pointer-events-none">mic</span>
                </button>
                <p className="font-inter text-ink-muted text-center">
                  Tap to speak — language: {preferredLanguage.label} ({preferredLanguage.sarvam})
                </p>
                <button
                  type="button"
                  onClick={() => setUseText(true)}
                  className="font-inter text-sm text-ink-muted underline underline-offset-4"
                >
                  Prefer to type instead
                </button>
              </div>
            ) : (
              <form onSubmit={submitText} className="flex flex-col gap-4">
                <textarea
                  autoFocus
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Describe how you are feeling today..."
                  className="w-full p-6 bg-white rounded-2xl border border-outline-variant/30 focus:border-primary outline-none font-inter text-lg resize-none min-h-[140px] transition-colors"
                />
                <div className="flex gap-3 justify-between">
                  <button type="button" onClick={() => setUseText(false)} className="font-inter text-sm text-ink-muted">
                    Use voice instead
                  </button>
                  <button
                    type="submit"
                    disabled={!textInput.trim()}
                    className="btn-gradient px-8 py-4 disabled:opacity-50"
                    style={{
                      boxShadow:
                        "4px 4px 12px rgba(37,53,41,0.35), -2px -2px 6px rgba(141,170,145,0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
                    }}
                  >
                    Submit to AI
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* RECORDING */}
        {phase === "recording" && (
          <div className="flex flex-col items-center gap-10 animate-fade-up-delay">
            <div className="flex items-end gap-1 h-16">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 bg-primary rounded-full"
                  style={{
                    height: waveActive ? `${20 + ((i * 23) % 40)}%` : "20%",
                    transition: `height 0.15s ease ${i * 0.04}s`,
                    animation: waveActive
                      ? `wave-bar 0.6s ${i * 0.07}s ease-in-out infinite alternate`
                      : "none",
                  }}
                />
              ))}
            </div>
            <p className="font-inter text-ink-muted text-center text-sm">Recording… tap stop when finished.</p>
            <button
              type="button"
              onClick={stopRecording}
              className="w-24 h-24 rounded-full flex items-center justify-center cursor-pointer border-0"
              style={{
                background: "linear-gradient(145deg, #e53e3e, #9b1c1c)",
                boxShadow:
                  "6px 6px 16px rgba(155,28,28,0.4), -3px -3px 10px rgba(252,129,129,0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              <span className="material-symbols-outlined text-white text-[36px]">stop</span>
            </button>
          </div>
        )}

        {/* PROCESSING */}
        {phase === "processing" && (
          <div className="flex flex-col items-center gap-12 py-16 animate-fade-up">
            {liveTranscriptHint && (
              <p className="font-inter text-sm text-primary text-center">{liveTranscriptHint}</p>
            )}
            <div className="flex flex-col gap-6 w-full max-w-sm">
              {pipelineSteps.map((step, i) => {
                const isDone = i < pipelineStep;
                const isActive = i === pipelineStep;
                return (
                  <div
                    key={step.label}
                    className={`flex items-center gap-5 transition-all duration-500 ${i > pipelineStep ? "opacity-30" : "opacity-100"}`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isDone ? "bg-primary" : isActive ? "bg-primary/20 animate-pulse" : "bg-surface-high"
                      }`}
                    >
                      {isDone ? (
                        <span className="material-symbols-outlined text-white text-[22px]">check</span>
                      ) : (
                        <span
                          className={`material-symbols-outlined text-[22px] ${isActive ? "text-primary animate-spin" : "text-ink-muted"}`}
                        >
                          {isActive ? "progress_activity" : step.icon}
                        </span>
                      )}
                    </div>
                    <div>
                      <p
                        className={`font-heading font-bold text-base ${
                          isActive ? "text-primary" : isDone ? "text-ink" : "text-ink-muted"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="font-inter text-sm text-ink-muted">{step.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* RESULT */}
        {phase === "result" && result && (
          <div className="flex flex-col gap-6 animate-fade-up">
            <div className="bg-white rounded-2xl p-6 flex flex-col gap-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">translate</span>
                <span className="font-inter text-xs uppercase tracking-widest font-bold text-primary">
                  Detected: {result.language_detected} — English summary
                </span>
              </div>
              <p className="font-inter text-ink text-base leading-relaxed italic">"{result.transcript_en}"</p>
            </div>

            <div className="bg-white rounded-[2rem] p-10 flex flex-col items-center gap-6 shadow-sm">
              <PainScoreGauge score={result.pain_score} />
              <p className="font-inter text-ink text-center text-lg max-w-sm leading-relaxed">{result.summary}</p>
              <p className="font-inter text-xs text-ink-muted uppercase tracking-wider">Risk: {result.risk}</p>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex gap-4 items-start">
              <span className="material-symbols-outlined text-primary text-[24px]">home_health</span>
              <div>
                <p className="font-heading font-bold text-ink">Clinical Directive</p>
                <p className="font-inter text-ink-muted mt-1">{result.directive}</p>
              </div>
            </div>

            {result.wound && (
              <div className="bg-white rounded-2xl p-5 flex gap-4 items-center shadow-sm">
                <span className="material-symbols-outlined text-primary text-[24px]">bandage</span>
                <p className="font-inter text-ink">{result.wound}</p>
              </div>
            )}

            <div className="bg-[#dcfce7] rounded-2xl p-5 flex gap-4 items-center">
              <span className="material-symbols-outlined text-[#16a34a] text-[24px]">chat</span>
              <p className="font-inter text-[#14532d] font-medium">
                {result.alert_caregiver
                  ? `Caregiver alert prepared for ${result.whatsapp}${caregiverPhone ? " (WhatsApp sent if Twilio is configured)" : " — add a valid +E.164 phone on the patient profile to deliver"}`
                  : `No WhatsApp alert for ${result.whatsapp} — status stable or not requested`}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 flex gap-4 items-start shadow-sm">
              <span className="material-symbols-outlined text-primary text-[24px]">update</span>
              <p className="font-inter text-ink">{result.tomorrow}</p>
            </div>

            <Link
              to={`/patient/${checkinId}`}
              className="w-full text-center py-5 rounded-2xl font-heading font-bold text-lg text-white"
              style={{
                background: "linear-gradient(145deg, #5a7a5f, #3d5442)",
                boxShadow:
                  "6px 6px 16px rgba(37,53,41,0.4), -3px -3px 10px rgba(141,170,145,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              Return to Dashboard
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes wave-bar {
          0%   { height: 20%; }
          100% { height: 80%; }
        }
      `}</style>
    </main>
  );
}
