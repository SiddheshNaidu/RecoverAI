import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

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

const TRUST_BADGES = [
  { icon: 'verified_user', label: 'Clinical-grade guidance' },
  { icon: 'encrypted', label: 'Secure by design' },
  { icon: 'monitoring', label: 'Daily adaptive monitoring' },
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
      <motion.section 
        id="hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 md:pt-32 md:pb-28 relative overflow-hidden"
      >

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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-5 mt-12 w-full max-w-md"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
            <Link
              to="/onboard"
              className="flex flex-col items-center h-full gap-3 p-7 rounded-[1.75rem] no-underline group transition-all duration-300"
              style={{
                background: '#e6ece1',
                border: '1px solid rgba(107, 143, 113, 0.2)',
                boxShadow: '0 4px 20px rgba(37,53,41,0.04)',
              }}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#3d5442] text-[28px] font-bold">personal_injury</span>
              </div>
              <div className="text-center">
                <p className="font-heading text-[#2e3d32] text-xl font-bold">I'm a Patient</p>
                <p className="font-inter text-[#4a654f] text-sm mt-1 font-medium">Start my recovery plan</p>
              </div>
              <span className="material-symbols-outlined text-[#4a654f] text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
            <Link
              to="/login"
              className="flex flex-col items-center h-full gap-3 p-7 rounded-[1.75rem] no-underline group transition-all duration-300"
              style={{
                background: '#fcfbf7',
                border: '1px solid rgba(28, 28, 17, 0.05)',
                boxShadow: '0 4px 20px rgba(28,28,17,0.03)',
              }}
            >
              <div className="w-14 h-14 rounded-2xl bg-[#3d5442]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#3d5442] text-[28px] font-bold">local_hospital</span>
              </div>
              <div className="text-center">
                <p className="font-heading text-ink text-xl font-bold">Hospital Staff</p>
                <p className="font-inter text-ink-muted text-sm mt-1 font-medium">Receptionist portal</p>
              </div>
              <span className="material-symbols-outlined text-ink-muted text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-6">
          <Link
            to="/patient-login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full no-underline font-inter text-sm font-semibold transition-colors"
            style={{
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              color: '#2e3d32',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          >
            <span className="material-symbols-outlined text-[18px] text-[#4a654f]">login</span>
            Existing patient? Login with PIN
          </Link>
        </motion.div>

        {/* Live counter */}
        <div className="flex items-center gap-2 mt-10 animate-fade-up-delay-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <p className="font-inter text-sm text-ink-muted">
            <span className="font-semibold text-ink">{count} patients</span> tracked today
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-8 flex flex-wrap justify-center gap-3 animate-fade-up-delay-2"
        >
          {TRUST_BADGES.map((b) => (
            <div
              key={b.label}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm"
            >
              <span className="material-symbols-outlined text-[#3d5442] text-[18px]">{b.icon}</span>
              <span className="font-inter text-sm text-[#2e3d32] font-semibold">{b.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* ── STATS STRIP ─────────────────────────────────────── */}
      <motion.section 
        id="stats"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="grid grid-cols-3 border-y border-outline-variant/15 scroll-mt-24"
      >
        {STATS.map((s, i) => (
          <div key={i} className={`flex flex-col items-center py-10 px-4 text-center ${i < 2 ? 'border-r border-outline-variant/15' : ''}`}>
            <span
              className="font-heading font-extrabold text-[#3d5442]"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1 }}
            >
              {s.num}
            </span>
            <p className="font-inter text-sm text-ink-muted mt-2 max-w-[120px] font-medium">{s.label}</p>
          </div>
        ))}
      </motion.section>

      {/* ── FEATURES GRID ──────────────────────────────────── */}
      <motion.section 
        id="features"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-20 px-6 md:px-12 lg:px-24 max-w-[1100px] mx-auto w-full relative scroll-mt-24"
      >
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
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="flex flex-col gap-5 p-8 rounded-[2rem] group transition-all duration-300"
              style={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 8px 32px rgba(28,28,17,0.06)',
              }}
            >
              <div className="w-14 h-14 rounded-2xl bg-[#3d5442]/10 flex items-center justify-center group-hover:bg-[#4a654f] transition-all duration-300">
                <span className="material-symbols-outlined text-[#3d5442] group-hover:text-white text-[28px] transition-colors">{f.icon}</span>
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-ink mb-1">{f.label}</h3>
                <p className="font-inter text-sm text-ink-muted leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── LANGUAGE STRIP ─────────────────────────────────── */}
      <motion.section 
        id="languages"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="py-16 px-6 bg-gradient-to-b from-[#3d5442]/5 to-transparent border-y border-[#3d5442]/10 scroll-mt-24"
      >
        <div className="max-w-[900px] mx-auto text-center">
          <p className="font-inter text-sm uppercase tracking-widest font-bold text-[#3d5442] mb-8">
            Powered by Sarvam AI — No Language Barrier
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['हिंदी', 'मराठी', 'English', 'বাংলা', 'தமிழ்', 'తెలుగు', 'ਪੰਜਾਬੀ', 'ಕನ್ನಡ'].map((lang, i) => (
              <motion.span
                key={lang}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="px-6 py-3 rounded-full font-inter text-sm font-semibold text-[#2e3d32] shadow-sm select-none cursor-default"
                style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                }}
              >
                {lang}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="py-10 text-center">
        <p className="font-inter text-sm text-ink-muted">
          RecoverAI · Built for post-discharge dignity · Hackathon 2026
        </p>
      </footer>

    </main>
  );
}
