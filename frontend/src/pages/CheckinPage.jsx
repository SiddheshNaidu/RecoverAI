/**
 * CheckinPage — Full 4-state check-in flow
 * idle -> recording -> processing (Sarvam->Gemini) -> result
 * PRD 4.5
 */
import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import ProxyToggle    from '../components/checkin/ProxyToggle';
import MedConfirmList from '../components/checkin/MedConfirmList';
import WoundUpload    from '../components/checkin/WoundUpload';
import PainScoreGauge from '../components/checkin/PainScoreGauge';

const PIPELINE_STEPS = [
  { icon: 'translate',  label: 'Sarvam AI',  detail: 'Detecting language and transcribing audio...' },
  { icon: 'neurology',  label: 'Gemini AI',   detail: 'Analysing symptoms and scoring pain level...' },
  { icon: 'update',     label: 'Plan Update', detail: "Generating tomorrow's adaptive protocol..." },
];

const MOCK_RESULT = {
  transcript_en:     'I have mild pain near the wound. The swelling went down compared to yesterday.',
  language_detected: 'Hindi',
  pain_score: 3,
  risk:       'LOW',
  summary:    'You are recovering well. Mild discomfort is completely normal for Day 4.',
  directive:  'Stay home and rest. Continue your prescribed medication schedule.',
  wound:      'Wound: Stable - healing as expected',
  whatsapp:   'Priya (Daughter)',
  tomorrow:   'Day 5 plan has been updated with light walking exercises.',
};

export default function CheckinPage() {
  const { currentPatient } = useApp();
  const navigate = useNavigate();
  const { id } = useParams();

  const [phase, setPhase]           = useState('idle');
  const [reporter, setReporter]     = useState('self');
  const [waveActive, setWaveActive] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput]   = useState('');
  const [useText, setUseText]       = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [medsTaken, setMedsTaken]   = useState({});
  const [woundFile, setWoundFile]   = useState(null);
  const [result, setResult]         = useState(null);

  const patientName = currentPatient?.name?.split(' ')[0] || 'Patient';
  const checkinId   = id || 'demo123';

  const startRecording = () => {
    setPhase('recording');
    setWaveActive(true);
    const words = ['thoda', 'dard', 'hai', '...', 'ghav', 'ke', 'paas'];
    let i = 0;
    const t = setInterval(() => {
      if (i >= words.length) return clearInterval(t);
      setTranscript(prev => prev + ' ' + words[i++]);
    }, 500);
  };

  const stopRecording = () => {
    setWaveActive(false);
    runPipeline();
  };

  const submitText = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    runPipeline();
  };

  const runPipeline = () => {
    setPhase('processing');
    setPipelineStep(0);
    const advance = (step) => {
      setPipelineStep(step);
      if (step < PIPELINE_STEPS.length - 1) {
        setTimeout(() => advance(step + 1), 1800);
      } else {
        setTimeout(() => {
          setResult(MOCK_RESULT);
          setPhase('result');
        }, 1800);
      }
    };
    setTimeout(() => advance(0), 400);
  };

  return (
    <main className="min-h-screen bg-surface flex flex-col pt-8 pb-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-[720px] mx-auto w-full flex flex-col flex-1 gap-10">

        <header className="flex items-center gap-4 animate-fade-up">
          <Link to={`/patient/${checkinId}`} className="w-10 h-10 rounded-full bg-surface-high flex items-center justify-center hover:bg-surface-dim transition-colors">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div>
            <h1 className="font-heading text-[2rem] md:text-[2.5rem] tracking-tight text-ink">Daily Check-in</h1>
            <p className="font-inter text-ink-muted text-sm">Voice to Sarvam AI to Gemini AI to Recovery Plan</p>
          </div>
        </header>

        {/* IDLE */}
        {phase === 'idle' && (
          <div className="flex flex-col gap-8 animate-fade-up-delay">
            <ProxyToggle patientName={patientName} value={reporter} onChange={setReporter} />
            <div className="bg-white rounded-[2rem] p-8 shadow-sm">
              <MedConfirmList onChange={setMedsTaken} />
            </div>
            <div className="bg-white rounded-[2rem] p-8 shadow-sm">
              <WoundUpload onUpload={setWoundFile} />
            </div>

            {!useText ? (
              <div className="flex flex-col items-center gap-6">
                <button
                  onClick={startRecording}
                  className="flex items-center justify-center w-32 h-32 rounded-full cursor-pointer border-0 outline-none"
                  style={{
                    background: 'linear-gradient(145deg, #5a7a5f, #3d5442)',
                    boxShadow: '6px 6px 16px rgba(37,53,41,0.4), -3px -3px 10px rgba(141,170,145,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
                  }}
                  onMouseDown={e => (e.currentTarget.style.boxShadow = '2px 2px 6px rgba(37,53,41,0.5), inset 0 2px 4px rgba(0,0,0,0.2)')}
                  onMouseUp={e => (e.currentTarget.style.boxShadow = '6px 6px 16px rgba(37,53,41,0.4), -3px -3px 10px rgba(141,170,145,0.3), inset 0 1px 0 rgba(255,255,255,0.15)')}
                >
                  <span className="material-symbols-outlined text-white text-[48px] pointer-events-none">mic</span>
                </button>
                <p className="font-inter text-ink-muted text-center">Tap to speak - Sarvam AI supports Hindi, Marathi and English</p>
                <button onClick={() => setUseText(true)} className="font-inter text-sm text-ink-muted underline underline-offset-4">
                  Prefer to type instead
                </button>
              </div>
            ) : (
              <form onSubmit={submitText} className="flex flex-col gap-4">
                <textarea
                  autoFocus
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
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
                    style={{ boxShadow: '4px 4px 12px rgba(37,53,41,0.35), -2px -2px 6px rgba(141,170,145,0.25), inset 0 1px 0 rgba(255,255,255,0.15)' }}
                  >
                    Submit to AI
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* RECORDING */}
        {phase === 'recording' && (
          <div className="flex flex-col items-center gap-10 animate-fade-up-delay">
            <div className="flex items-end gap-1 h-16">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 bg-primary rounded-full"
                  style={{
                    height: waveActive ? `${20 + ((i * 23) % 40)}%` : '20%',
                    transition: `height 0.15s ease ${i * 0.04}s`,
                    animation: waveActive ? `wave-bar 0.6s ${i * 0.07}s ease-in-out infinite alternate` : 'none',
                  }}
                />
              ))}
            </div>
            {transcript && (
              <div className="bg-white rounded-2xl px-6 py-4 shadow-sm max-w-md text-center">
                <p className="font-inter text-ink text-lg leading-relaxed">{transcript.trim()}</p>
                <p className="font-inter text-xs text-primary mt-2 uppercase tracking-widest">Sarvam AI - Live Transcript</p>
              </div>
            )}
            <button
              onClick={stopRecording}
              className="w-24 h-24 rounded-full flex items-center justify-center cursor-pointer border-0"
              style={{
                background: 'linear-gradient(145deg, #e53e3e, #9b1c1c)',
                boxShadow: '6px 6px 16px rgba(155,28,28,0.4), -3px -3px 10px rgba(252,129,129,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              <span className="material-symbols-outlined text-white text-[36px]">stop</span>
            </button>
            <p className="font-inter text-ink-muted">Tap to stop recording</p>
          </div>
        )}

        {/* PROCESSING */}
        {phase === 'processing' && (
          <div className="flex flex-col items-center gap-12 py-16 animate-fade-up">
            <div className="flex flex-col gap-6 w-full max-w-sm">
              {PIPELINE_STEPS.map((step, i) => {
                const isDone   = i < pipelineStep;
                const isActive = i === pipelineStep;
                return (
                  <div key={i} className={`flex items-center gap-5 transition-all duration-500 ${i > pipelineStep ? 'opacity-30' : 'opacity-100'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${isDone ? 'bg-primary' : isActive ? 'bg-primary/20 animate-pulse' : 'bg-surface-high'}`}>
                      {isDone
                        ? <span className="material-symbols-outlined text-white text-[22px]">check</span>
                        : <span className={`material-symbols-outlined text-[22px] ${isActive ? 'text-primary animate-spin' : 'text-ink-muted'}`}>{isActive ? 'progress_activity' : step.icon}</span>
                      }
                    </div>
                    <div>
                      <p className={`font-heading font-bold text-base ${isActive ? 'text-primary' : isDone ? 'text-ink' : 'text-ink-muted'}`}>{step.label}</p>
                      <p className="font-inter text-sm text-ink-muted">{step.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* RESULT */}
        {phase === 'result' && result && (
          <div className="flex flex-col gap-6 animate-fade-up">
            <div className="bg-white rounded-2xl p-6 flex flex-col gap-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">translate</span>
                <span className="font-inter text-xs uppercase tracking-widest font-bold text-primary">
                  Detected: {result.language_detected} - Translated to English
                </span>
              </div>
              <p className="font-inter text-ink text-base leading-relaxed italic">"{result.transcript_en}"</p>
            </div>

            <div className="bg-white rounded-[2rem] p-10 flex flex-col items-center gap-6 shadow-sm">
              <PainScoreGauge score={result.pain_score} />
              <p className="font-inter text-ink text-center text-lg max-w-sm leading-relaxed">{result.summary}</p>
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
              <span className="material-symbols-outlined text-[#16a34a] text-[24px]">whatsapp</span>
              <p className="font-inter text-[#14532d] font-medium">
                Daily update sent to {result.whatsapp} via WhatsApp
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
                background: 'linear-gradient(145deg, #5a7a5f, #3d5442)',
                boxShadow: '6px 6px 16px rgba(37,53,41,0.4), -3px -3px 10px rgba(141,170,145,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
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
