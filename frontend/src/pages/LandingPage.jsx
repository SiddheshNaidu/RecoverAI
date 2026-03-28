import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const FEATURES = [
  { icon: 'mic',               label: 'Voice Check-ins',     desc: 'Hindi, Marathi, English — patients speak naturally' },
  { icon: 'psychology',        label: 'Gemini AI Analysis',  desc: 'Pain scored, plan adapted every single day'         },
  { icon: 'mark_chat_unread',  label: 'WhatsApp Alerts',     desc: 'Family gets daily updates automatically'            },
  { icon: 'monitoring',        label: 'Hospital Dashboard',  desc: 'Receptionist tracks all patients remotely'          },
];

const STATS = [
  { num: '1 in 5', label: 'patients readmitted within 30 days' },
  { num: '8+', label: 'Indian languages supported' },
  { num: '0', label: 'language barriers remaining' },
];

export default function LandingPage() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setCount(c => (c < 72 ? c + 1 : c));
    }, 28);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="min-h-screen bg-surface flex flex-col">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 md:pt-32 md:pb-28 relative overflow-hidden">

        {/* Background ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/8 rounded-full blur-3xl" />
        </div>

        {/* Eyebrow stat */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-error/10 border border-error/20 mb-8 animate-fade-up">
          <span className="w-2 h-2 rounded-full bg-error animate-pulse shrink-0" />
          <p className="font-inter text-sm font-semibold text-error">
            1 in 5 patients are readmitted within 30 days of discharge
          </p>
        </div>

        {/* Main headline */}
        <h1
          className="font-heading animate-fade-up"
          style={{
            fontSize: 'clamp(2.8rem, 7vw, 6rem)',
            lineHeight: 1.0,
            letterSpacing: '-0.03em',
            fontWeight: 800,
            color: '#1a1f1b',
            maxWidth: '820px',
          }}
        >
          RecoverAI closes<br />
          the recovery loop —<br />
          <span
            style={{
              background: 'linear-gradient(135deg, #3d5442 0%, #6b8f71 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            in their language.
          </span>
        </h1>

        <p className="font-inter text-xl text-ink-muted mt-8 max-w-xl animate-fade-up-delay leading-relaxed">
          Voice-powered AI recovery companion for post-discharge patients. Multilingual. WhatsApp-native. Trusted by hospitals.
        </p>

        {/* ── TWO DOORS ─── */}
        <div className="flex flex-col sm:flex-row gap-5 mt-12 w-full max-w-md animate-fade-up-delay">
          <Link
            to="/onboard"
            className="flex-1 flex flex-col items-center gap-3 p-7 rounded-[1.75rem] no-underline group transition-all duration-300 hover:-translate-y-1"
            style={{
              background: 'linear-gradient(145deg, #3d5442, #4a654f)',
              boxShadow: '8px 8px 24px rgba(37,53,41,0.45), -4px -4px 16px rgba(141,170,145,0.25), inset 0 1px 0 rgba(255,255,255,0.12)',
            }}
          >
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[28px]">personal_injury</span>
            </div>
            <div className="text-center">
              <p className="font-heading text-white text-xl font-bold">I'm a Patient</p>
              <p className="font-inter text-white/70 text-sm mt-1">Start my recovery plan</p>
            </div>
            <span className="material-symbols-outlined text-white/60 text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>

          <Link
            to="/login"
            className="flex-1 flex flex-col items-center gap-3 p-7 rounded-[1.75rem] no-underline group transition-all duration-300 hover:-translate-y-1 bg-white"
            style={{
              boxShadow: '0 8px 32px rgba(28,28,17,0.1)',
            }}
          >
            <div className="w-14 h-14 rounded-2xl bg-surface-low flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[28px]">local_hospital</span>
            </div>
            <div className="text-center">
              <p className="font-heading text-ink text-xl font-bold">Hospital Staff</p>
              <p className="font-inter text-ink-muted text-sm mt-1">Receptionist portal</p>
            </div>
            <span className="material-symbols-outlined text-ink-muted text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
        </div>

        {/* Live counter */}
        <div className="flex items-center gap-2 mt-10 animate-fade-up-delay-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <p className="font-inter text-sm text-ink-muted">
            <span className="font-semibold text-ink">{count} patients</span> tracked today
          </p>
        </div>
      </section>

      {/* ── STATS STRIP ─────────────────────────────────────── */}
      <section className="grid grid-cols-3 border-y border-outline-variant/15 animate-fade-up-delay">
        {STATS.map((s, i) => (
          <div key={i} className={`flex flex-col items-center py-10 px-4 text-center ${i < 2 ? 'border-r border-outline-variant/15' : ''}`}>
            <span
              className="font-heading font-extrabold text-primary"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1 }}
            >
              {s.num}
            </span>
            <p className="font-inter text-sm text-ink-muted mt-2 max-w-[120px]">{s.label}</p>
          </div>
        ))}
      </section>

      {/* ── FEATURES GRID ──────────────────────────────────── */}
      <section className="py-20 px-6 md:px-12 lg:px-24 max-w-[1100px] mx-auto w-full">
        <div className="text-center mb-14">
          <h2
            className="font-heading font-bold text-ink mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }}
          >
            The recovery loop. Finally closed.
          </h2>
          <p className="font-inter text-ink-muted text-lg max-w-lg mx-auto">
            End-to-end AI care from discharge to full recovery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="flex flex-col gap-5 p-8 rounded-[2rem] bg-white group hover:-translate-y-1 transition-all duration-300 animate-fade-up"
              style={{
                boxShadow: '0 4px 24px rgba(28,28,17,0.06)',
                animationDelay: `${i * 80}ms`,
              }}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-primary group-hover:text-white text-[28px] transition-colors">{f.icon}</span>
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-ink mb-1">{f.label}</h3>
                <p className="font-inter text-sm text-ink-muted leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LANGUAGE STRIP ─────────────────────────────────── */}
      <section className="py-12 px-6 bg-primary/4 border-y border-primary/10">
        <div className="max-w-[900px] mx-auto text-center">
          <p className="font-inter text-sm uppercase tracking-widest font-bold text-primary mb-6">
            Powered by Sarvam AI — No Language Barrier
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['हिंदी', 'मराठी', 'English', 'বাংলা', 'தமிழ்', 'తెలుగు', 'ਪੰਜਾਬੀ', 'ಕನ್ನಡ'].map(lang => (
              <span
                key={lang}
                className="px-5 py-2.5 rounded-full bg-white font-inter text-sm font-medium text-ink shadow-sm"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="py-10 text-center">
        <p className="font-inter text-sm text-ink-muted">
          RecoverAI · Built for post-discharge dignity · Hackathon 2026
        </p>
      </footer>

    </main>
  );
}
