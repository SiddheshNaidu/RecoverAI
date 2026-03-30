import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Logos3 } from '../components/ui/logos3';


const WAVEFORM_BARS = [
  { h: 55 }, { h: 30 }, { h: 70 }, { h: 20 }, { h: 80 }, { h: 45 }, { h: 60 },
  { h: 25 }, { h: 75 }, { h: 35 }, { h: 65 }, { h: 15 }, { h: 85 }, { h: 40 },
  { h: 58 }, { h: 22 }, { h: 72 }, { h: 48 }, { h: 68 }, { h: 32 },
];

const WEEK_BARS = [
  { day: 'M', h: 60 }, { day: 'T', h: 75 }, { day: 'W', h: 50 },
  { day: 'T', h: 90 }, { day: 'F', h: 65 }, { day: 'S', h: 80 }, { day: 'S', h: 45 },
];

const HOW_STEPS = [
  {
    num: '01',
    icon: 'description',
    title: 'Discharge & Enroll',
    desc: 'Hospital staff registers the patient and uploads their discharge summary. Takes 2 minutes.',
  },
  {
    num: '02',
    icon: 'mic',
    title: 'Daily Voice Check-in',
    desc: 'Patient speaks in Hindi, Marathi, or Bengali. RecoverAI listens, scores pain, adapts the care plan.',
  },
  {
    num: '03',
    icon: 'family_restroom',
    title: 'Family Gets Updated',
    desc: 'WhatsApp message auto-sent to family. Hospital sees the recovery dashboard in real time.',
  },
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
    <main
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#fdfaf4', color: '#2e3d32' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500;600&family=Sora:wght@300;400;500;600;700&display=swap');

        @keyframes float-a {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }

        @keyframes float-b {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(14px); }
        }

        @keyframes travel-dot {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -160; }
        }


        .lp-lora  { font-family: 'Lora', Georgia, serif; }
        .lp-mono  { font-family: 'IBM Plex Mono', 'Courier New', monospace; }
        .lp-sora  { font-family: 'Sora', system-ui, sans-serif; }
      `}</style>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: '95vh',
          paddingTop: 140, paddingBottom: 80,
          paddingLeft: 'clamp(24px, 5vw, 64px)',
          paddingRight: 'clamp(24px, 5vw, 64px)',
          maxWidth: 1440,
          margin: '0 auto',
          width: '100%',
          position: 'relative',
          isolation: 'isolate',
        }}
        className="grid grid-cols-1 lg:grid-cols-[6fr_6fr] lg:gap-12 gap-16 items-center"
      >
        {/* Ambient blobs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
          <div style={{
            position: 'absolute', top: -100, right: -100, width: 600, height: 500,
            background: 'radial-gradient(ellipse, rgba(107,143,113,0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }} />
          <div style={{
            position: 'absolute', bottom: -50, left: -50, width: 400, height: 400,
            background: 'radial-gradient(ellipse, rgba(253,240,210,0.8) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }} />
        </div>

        {/* ── LEFT COLUMN ── */}
        <div style={{ position: 'relative', zIndex: 10 }}>

          {/* Headline */}
          <motion.h1
            className="lp-lora"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(3rem, 6.5vw, 5.5rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              fontWeight: 400,
              color: '#2e3d32',
              margin: 0,
              paddingRight: '1rem',
            }}
          >
            Every voice,
            <br />
            <em style={{ color: '#3d5442', fontStyle: 'italic', fontWeight: 600 }}>turned into care that heals.</em>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            style={{ height: 1, width: 120, background: '#3d5442', opacity: 0.3, margin: '40px 0' }}
          />

          {/* Sub-headline */}
          <motion.p
            className="lp-sora"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 18, color: '#5a6b5e', lineHeight: 1.6,
              maxWidth: 520, fontWeight: 300,
            }}
          >
            Voice check-ins in Hindi, Marathi, and Bengali.
            WhatsApp updates auto-sent to family. Real-time dashboards for the hospital.
            Closing the gap between discharge and full recovery, every single day.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 48, alignItems: 'center' }}
          >
            <Link
              to="/onboard"
              className="lp-sora"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 12,
                background: '#3d5442', color: '#fff',
                fontSize: 15, fontWeight: 500, textDecoration: 'none',
                padding: '18px 36px', borderRadius: 9999,
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 8px 24px rgba(61,84,66,0.2)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Start My Recovery
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
            </Link>

            <Link
              to="/login"
              className="lp-sora"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'transparent', color: '#3d5442',
                fontSize: 15, fontWeight: 500, textDecoration: 'none',
                padding: '16px 36px', borderRadius: 9999,
                border: '1px solid rgba(61,84,66,0.2)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(61,84,66,0.05)'; e.currentTarget.style.borderColor = 'rgba(61,84,66,0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(61,84,66,0.2)'; }}
            >
              Hospital Portal
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            style={{ marginTop: 24 }}
          >
            <Link
              to="/patient-login"
              className="lp-sora"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 14, color: '#3d5442', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.02em',
                transition: 'all 0.2s', padding: '6px 0'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#2e3d32'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#3d5442'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Existing patient? Login with PIN <span className="material-symbols-outlined" style={{ fontSize: 16 }}>east</span>
            </Link>
          </motion.div>
        </div>

        {/* ── RIGHT COLUMN — Cinematic Parallax Visuals ── */}
        <div className="relative z-[1] w-full h-[600px] hidden lg:flex items-center justify-between gap-12 lg:pl-8">
          
          {/* Ambient Glows for Depth */}
          <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-[#3d5442] opacity-[0.05] blur-[80px] rounded-full mix-blend-multiply pointer-events-none" />
          <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] bg-[#6b8f71] opacity-[0.06] blur-[90px] rounded-full mix-blend-multiply pointer-events-none" />

          {/* AI Thread Connector - HEARTBEAT PULSE */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1 }}
            className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center"
          >
            <style>{`
              @keyframes path-travel {
                0% { stroke-dashoffset: 800; }
                100% { stroke-dashoffset: 0; }
              }
              @keyframes dot-travel {
                0% { offset-distance: 0%; }
                100% { offset-distance: 100%; }
              }
            `}</style>
            <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, display: 'block', overflow: 'visible', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.05))' }}>
              <defs>
                <linearGradient id="threadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#25D366" stopOpacity="0"/>
                  <stop offset="30%" stopColor="#00a884" stopOpacity="0.8"/>
                  <stop offset="70%" stopColor="#3d5442" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#2e3d32" stopOpacity="0"/>
                </linearGradient>
              </defs>
              
              {/* Background faint path */}
              <path d="M 120 300 L 250 300 L 270 240 L 300 380 L 320 300 L 450 300 L 580 300" fill="none" stroke="rgba(61,84,66,0.1)" strokeWidth="2" strokeDasharray="4 6" style={{ animation: 'path-travel 20s linear infinite reverse' }} />
              
              {/* Main glowing beam */}
              <path d="M 120 300 L 250 300 L 270 240 L 300 380 L 320 300 L 450 300 L 580 300" fill="none" stroke="url(#threadGrad)" strokeWidth="3" strokeLinecap="round" strokeDasharray="20 400" style={{ animation: 'path-travel 2s cubic-bezier(0.4, 0, 0.2, 1) infinite' }} />
              <path d="M 120 300 L 250 300 L 270 240 L 300 380 L 320 300 L 450 300 L 580 300" fill="none" stroke="url(#threadGrad)" strokeWidth="8" opacity="0.4" strokeLinecap="round" strokeDasharray="20 400" style={{ animation: 'path-travel 2s cubic-bezier(0.4, 0, 0.2, 1) infinite', filter: 'blur(4px)' }} />
              
              {/* Traveling light particle */}
              <circle r="5" fill="#fff" style={{ offsetPath: "path('M 120 300 L 250 300 L 270 240 L 300 380 L 320 300 L 450 300 L 580 300')", animation: "dot-travel 2s cubic-bezier(0.4, 0, 0.2, 1) infinite", filter: 'drop-shadow(0 0 12px #00a884)' }} />
            </svg>
          </motion.div>

          {/* Panel A — WhatsApp Phone Mockup (Front) */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
            style={{
              zIndex: 3,
              background: '#0b141a', // WhatsApp ultra-dark mode baseline
              borderRadius: 40,
              boxShadow: '0 40px 100px -20px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.1), inset 0 0 0 6px #111b21',
              overflow: 'hidden',
              width: 320,
              flexShrink: 0,
              height: 560,
              animation: 'float-a 8s ease-in-out infinite alternate',
              WebkitFontSmoothing: 'antialiased'
            }}
          >
            {/* Glossy screen reflection */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 40%)', zIndex: 10, pointerEvents: 'none' }} />

            {/* Status bar */}
            <div style={{ height: 32, background: '#005c4b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', paddingTop: 8, zIndex: 5, position: 'relative' }}>
              <span className="lp-mono" style={{ fontSize: 11, color: '#fff', fontWeight: 600, letterSpacing: '0.05em' }}>9:41</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {['signal_cellular_alt', 'wifi', 'battery_full'].map(ic => (
                  <span key={ic} className="material-symbols-outlined" style={{ fontSize: 13, color: '#fff', opacity: 0.9 }}>{ic}</span>
                ))}
              </div>
            </div>

            {/* Header */}
            <div style={{ background: '#005c4b', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 5, position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#fff' }}>arrow_back</span>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(37,211,102,0.3)' }}>
                <span className="lp-sora" style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>R</span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div className="lp-sora" style={{ fontSize: 15, fontWeight: 600, color: '#fff', lineHeight: 1 }}>RecoverAI</div>
                <div className="lp-sora" style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>online</div>
              </div>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#fff', opacity: 0.9 }}>videocam</span>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#fff', opacity: 0.9 }}>call</span>
            </div>

            {/* Chat Body */}
            <div style={{
              background: '#0b141a',
              padding: '20px 16px',
              display: 'flex', flexDirection: 'column', gap: 16,
              height: 'calc(100% - 130px)',
              position: 'relative'
            }}>
              {/* WhatsApp Dark Pattern background - subtle */}
              <div style={{ position:'absolute', inset:0, opacity: 0.03, backgroundImage: 'radial-gradient(circle at center, #fff 1px, transparent 1px)', backgroundSize: '16px 16px', zIndex:0 }} />
              
              {/* Bubble 1 */}
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.5 }} style={{ position:'relative', zIndex:1, alignSelf: 'flex-start', maxWidth: 250, wordBreak: 'break-word', background: '#202c33', borderRadius: '0px 16px 16px 16px', padding: '10px 14px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                <div className="lp-sora" style={{ fontSize: 13, color: '#e9edef', lineHeight: 1.45 }}>🎙️ आपकी माँ ने आज चेक-इन की।</div>
                <div className="lp-mono" style={{ fontSize: 9, color: '#8696a0', textAlign: 'right', marginTop: 6 }}>10:02 AM</div>
              </motion.div>

              {/* Bubble 2 */}
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.8 }} style={{ position:'relative', zIndex:1, alignSelf: 'flex-start', maxWidth: 250, wordBreak: 'break-word', background: '#202c33', borderRadius: '4px 16px 16px 16px', padding: '10px 14px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                <div className="lp-sora" style={{ fontSize: 13, color: '#e9edef', lineHeight: 1.45 }}>दर्द स्तर: 3/10 · अच्छा सुधार 📉</div>
                <div className="lp-mono" style={{ fontSize: 9, color: '#8696a0', textAlign: 'right', marginTop: 6 }}>10:02 AM</div>
              </motion.div>

              {/* Bubble 3 */}
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.1 }} style={{ position:'relative', zIndex:1, alignSelf: 'flex-end', maxWidth: 240, wordBreak: 'break-word', background: '#005c4b', borderRadius: '16px 16px 4px 16px', padding: '10px 14px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                <div className="lp-sora" style={{ fontSize: 13, color: '#e9edef', lineHeight: 1.45 }}>Thank you 🙏 Is a hospital visit needed?</div>
                <div className="lp-mono" style={{ fontSize: 9, color: '#8696a0', textAlign: 'right', marginTop: 6 }}>10:04 AM <span style={{ color: '#53bdeb' }}>✓✓</span></div>
              </motion.div>

              {/* Bubble 4 */}
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.5 }} style={{ position:'relative', zIndex:1, alignSelf: 'flex-start', maxWidth: 260, wordBreak: 'break-word', background: '#202c33', borderRadius: '16px 16px 16px 4px', padding: '10px 14px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                <div className="lp-sora" style={{ fontSize: 11, color: '#25D366', fontWeight: 600, marginBottom: 6, letterSpacing: '0.02em' }}>RecoverAI Assistant</div>
                <div className="lp-sora" style={{ fontSize: 13, color: '#e9edef', lineHeight: 1.45 }}>No visit needed today. Next check-in is scheduled for tomorrow at 6 PM. 💚</div>
                <div className="lp-mono" style={{ fontSize: 9, color: '#8696a0', textAlign: 'right', marginTop: 6 }}>10:04 AM</div>
              </motion.div>
            </div>

            {/* Input Bar */}
            <div style={{ background: '#202c33', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, height: 60, position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 5, borderBottomLeftRadius: 36, borderBottomRightRadius: 36 }}>
              <div style={{ flex: 1, height: 40, background: '#2a3942', borderRadius: 24, display: 'flex', alignItems: 'center', paddingLeft: 16 }}>
                <span className="lp-sora" style={{ fontSize: 14, color: '#8696a0' }}>Message</span>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#00a884', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,168,132,0.4)', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#111b21', transform: 'translateX(1px)' }}>mic</span>
              </div>
            </div>
          </motion.div>

          {/* Panel B — Hospital Dashboard Card (Back) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative backdrop-blur-3xl"
            style={{
              zIndex: 2,
              background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(253,250,244,0.85) 100%)',
              borderRadius: 32,
              boxShadow: '0 40px 100px -20px rgba(46,61,50,0.15), inset 0 1px 0 rgba(255,255,255,1), 0 0 0 1px rgba(61,84,66,0.06)',
              padding: 28,
              width: 360,
              flexShrink: 0,
              animation: 'float-b 8s ease-in-out infinite alternate-reverse',
              WebkitFontSmoothing: 'antialiased'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <span className="lp-lora" style={{ fontSize: 20, fontWeight: 700, color: '#2e3d32', letterSpacing: '-0.02em' }}>Active Cases</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fef2f2', padding: '6px 12px', borderRadius: 99, border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'pulse-glow 2s infinite' }} />
                <span className="lp-mono" style={{ fontSize: 11, color: '#b91c1c', fontWeight: 600 }}>Live · 4</span>
              </div>
            </div>

            {/* Status Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { init: 'RS', name: 'Rajesh S.', desc: 'Day 7 · On track', bg: '#e6ece1', textCol: '#3d5442', prog: '72%', progCol: '#3d5442' },
                { init: 'PM', name: 'Priya M.', desc: 'Day 3 · Checked in', bg: '#fdf0dd', textCol: '#b36a00', prog: '35%', progCol: '#f59e0b' },
                { init: 'AK', name: 'Amit K.', desc: 'Day 12 · Needs review', bg: '#fae1e1', textCol: '#c94040', prog: '88%', progCol: '#ef4444' },
              ].map(p => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.03)' }}>
                    <span className="lp-sora" style={{ fontSize: 14, fontWeight: 700, color: p.textCol }}>{p.init}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                      <div className="lp-sora" style={{ fontSize: 15, fontWeight: 600, color: '#2e3d32', letterSpacing: '-0.01em' }}>{p.name}</div>
                      <div className="lp-sora" style={{ fontSize: 11, color: '#8a8a8a', fontWeight: 500 }}>{p.desc}</div>
                    </div>
                    <div style={{ width: '100%', height: 6, background: 'rgba(61,84,66,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: p.prog }} transition={{ duration: 1.5, delay: 1, ease: 'easeOut' }} style={{ height: '100%', background: p.progCol, borderRadius: 99 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px dashed rgba(61,84,66,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="lp-mono" style={{ fontSize: 10, color: '#8a8a8a', letterSpacing: '0.05em' }}>LAST SYNC: 2m</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4', padding: '4px 10px', borderRadius: 99, border: '1px solid rgba(34,197,94,0.1)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', filter: 'drop-shadow(0 0 4px rgba(34,197,94,0.4))' }} />
                <span className="lp-sora" style={{ fontSize: 11, fontWeight: 600, color: '#166534' }}>Systems Normal</span>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── STATS STRIP ─────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7 }}
        style={{
          background: '#f5f0e8',
          borderTop: '1px solid rgba(61,84,66,0.08)',
          borderBottom: '1px solid rgba(61,84,66,0.08)',
          padding: '56px 24px',
          width: '100%',
        }}
      >
        <div style={{
          maxWidth: 900, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 0,
        }}>
          {[
            { num: '1 in 5', label: 'patients readmitted within 30 days of discharge' },
            { num: '8+', label: 'Indian languages — patients speak, AI understands' },
            { num: '0', label: 'language barriers left between patient and care' },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                padding: '16px 32px',
                borderRight: i < 2 ? '1px solid rgba(61,84,66,0.10)' : 'none',
              }}
            >
              <span className="lp-lora" style={{
                fontWeight: 600, color: '#3d5442',
                fontSize: 'clamp(2.5rem, 4.5vw, 3.5rem)', lineHeight: 1,
                letterSpacing: '-0.02em',
              }}>
                {s.num}
              </span>
              <span className="lp-sora" style={{ fontSize: 13, color: '#6b8f71', fontWeight: 500, marginTop: 10, maxWidth: 160, lineHeight: 1.5 }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────── */}
      <section style={{ padding: '80px clamp(24px,5vw,48px)', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span className="lp-sora" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6b8f71', display: 'block', marginBottom: 12 }}>
            THE RECOVERY LOOP
          </span>
          <h2 className="lp-lora" style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 700,
            color: '#2e3d32', lineHeight: 1.15, margin: 0,
          }}>
            How RecoverAI closes every gap.
          </h2>
          <p className="lp-sora" style={{ fontSize: 16, color: '#6b8f71', marginTop: 12, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            From discharge slip to full recovery — in the patient's own language.
          </p>
        </div>

        {/* 3-step flow */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, position: 'relative' }}>

          {/* Connector line */}
          <div style={{
            position: 'absolute', top: 28,
            left: '16.67%', right: '16.67%',
            height: 1,
            background: 'linear-gradient(to right, transparent, rgba(61,84,66,0.2) 30%, rgba(61,84,66,0.2) 70%, transparent)',
            zIndex: 0,
          }} />

          {HOW_STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', textAlign: 'center',
                position: 'relative', zIndex: 1,
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: '#3d5442',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
              }}>
                <span className="lp-mono" style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{step.num}</span>
              </div>
              <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#3d5442', marginBottom: 16 }}>{step.icon}</span>
              <h3 className="lp-lora" style={{ fontSize: 18, fontWeight: 700, color: '#2e3d32', marginBottom: 8, margin: 0 }}>
                {step.title}
              </h3>
              <p className="lp-sora" style={{ fontSize: 14, color: '#6b8f71', lineHeight: 1.6, maxWidth: 220, marginTop: 8 }}>
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES BENTO GRID ─────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8 }}
        style={{ padding: '64px clamp(24px,5vw,48px)', maxWidth: 1100, margin: '0 auto', width: '100%' }}
      >
        <h2 className="lp-lora" style={{
          fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 700,
          color: '#2e3d32', textAlign: 'center', marginBottom: 40,
        }}>
          Everything your care team needs.
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16 }} className="bento-grid">
          <style>{`
            @media (max-width: 767px) {
              .bento-grid > * { grid-column: span 12 !important; }
            }
          `}</style>

          {/* Card 1 — Voice Check-ins LARGE */}
          <div style={{
            gridColumn: 'span 7', gridRow: 'span 1',
            background: '#e6ece1', borderRadius: 24, padding: 36,
            minHeight: 220, position: 'relative', overflow: 'hidden',
          }}>
            {/* Waveform SVG */}
            <svg
              viewBox="0 0 200 100"
              preserveAspectRatio="none"
              style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 200, height: '100%', opacity: 0.15 }}
            >
              {WAVEFORM_BARS.map((b, i) => (
                <rect key={i} x={i * 10 + 2} y={(100 - b.h) / 2} width={6} height={b.h} fill="#3d5442" rx={2} />
              ))}
            </svg>
            <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#3d5442', display: 'block', marginBottom: 16 }}>mic</span>
            <h3 className="lp-lora" style={{ fontSize: 20, fontWeight: 700, color: '#2e3d32', marginBottom: 8 }}>Voice Check-ins</h3>
            <p className="lp-sora" style={{ fontSize: 14, color: '#5a6b5e' }}>
              Hindi, Marathi, Bengali, Tamil — patients speak naturally. No app download needed.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              {['हिंदी', 'मराठी', 'বাংলা', 'தமிழ்'].map(l => (
                <span key={l} className="lp-sora" style={{
                  padding: '4px 12px', borderRadius: 9999,
                  background: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600,
                  color: '#3d5442', border: '1px solid rgba(255,255,255,0.6)',
                }}>
                  {l}
                </span>
              ))}
            </div>
          </div>

          {/* Card 2 — Gemini AI SMALL dark */}
          <div style={{
            gridColumn: 'span 5',
            background: '#2e3d32', borderRadius: 24, padding: 36, minHeight: 220,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#6b8f71', display: 'block', marginBottom: 16 }}>psychology</span>
            <h3 className="lp-lora" style={{ fontSize: 20, fontWeight: 700, color: '#fdfaf4', marginBottom: 8 }}>Gemini AI Analysis</h3>
            <p className="lp-sora" style={{ fontSize: 14, color: 'rgba(253,250,244,0.65)' }}>
              Pain scored. Plan adapted. Every single day. No human review needed for routine check-ins.
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              marginTop: 24, padding: '6px 12px', borderRadius: 9999,
              background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)',
            }}>
              <span className="lp-mono" style={{ fontSize: 11, color: '#6b8f71', fontWeight: 600 }}>99.2% check-in accuracy</span>
            </div>
          </div>

          {/* Card 3 — WhatsApp SMALL */}
          <div style={{
            gridColumn: 'span 5',
            background: '#fffef9', borderRadius: 24, padding: 36, minHeight: 200,
            border: '1px solid rgba(61,84,66,0.10)',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#3d5442', display: 'block', marginBottom: 16 }}>mark_chat_unread</span>
            <h3 className="lp-lora" style={{ fontSize: 20, fontWeight: 700, color: '#2e3d32', marginBottom: 8 }}>WhatsApp Alerts</h3>
            <p className="lp-sora" style={{ fontSize: 14, color: '#6b8f71' }}>
              Family gets automatic daily updates. No app. No login. Just WhatsApp.
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              marginTop: 20, padding: '4px 12px', borderRadius: 9999,
              background: 'rgba(37,211,102,0.10)', border: '1px solid rgba(37,211,102,0.20)',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#25D366' }}>chat</span>
              <span className="lp-sora" style={{ fontSize: 11, fontWeight: 600, color: '#128C7E' }}>WhatsApp native</span>
            </div>
          </div>

          {/* Card 4 — Hospital Dashboard LARGE */}
          <div style={{
            gridColumn: 'span 7',
            background: '#f5f0e8', borderRadius: 24, padding: 36, minHeight: 200,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#3d5442', display: 'block', marginBottom: 16 }}>monitoring</span>
            <h3 className="lp-lora" style={{ fontSize: 20, fontWeight: 700, color: '#2e3d32', marginBottom: 8 }}>Hospital Dashboard</h3>
            <p className="lp-sora" style={{ fontSize: 14, color: '#6b8f71' }}>
              Receptionist or ward staff tracks all discharged patients from one screen. Flags who needs a call.
            </p>
            {/* Mini bar chart */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: 20, height: 48 }}>
              {WEEK_BARS.map((b, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 20, height: `${b.h}%`,
                    maxHeight: 44,
                    background: i === WEEK_BARS.length - 1 ? '#3d5442' : 'rgba(61,84,66,0.15)',
                    borderRadius: '3px 3px 0 0',
                  }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── LANGUAGE CAROUSEL ───────────────────────────────────────── */}
      <section style={{
        padding: '56px 0',
        overflow: 'hidden',
        background: 'linear-gradient(to bottom, rgba(61,84,66,0.04), rgba(61,84,66,0.02))',
        borderTop: '1px solid rgba(61,84,66,0.08)',
        borderBottom: '1px solid rgba(61,84,66,0.08)',
      }}>
        <Logos3 heading="POWERED BY SARVAM AI · NO LANGUAGE BARRIER" />
      </section>

      {/* ── CTA Two Doors ───────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        style={{ padding: '80px 24px', maxWidth: 800, margin: '0 auto', width: '100%', textAlign: 'center' }}
      >
        <h2 className="lp-lora" style={{
          fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 700,
          color: '#2e3d32', lineHeight: 1.1, margin: 0,
        }}>
          Where do you fit in the loop?
        </h2>
        <p className="lp-sora" style={{
          fontSize: 15, color: '#6b8f71', marginTop: 12,
          maxWidth: 380, marginLeft: 'auto', marginRight: 'auto',
        }}>
          Two entry points. One goal: no patient left behind after discharge.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginTop: 48 }}>
          {/* Patient card */}
          <div style={{
            padding: '40px 32px', background: '#e6ece1', borderRadius: 28,
            border: '1px solid rgba(107,143,113,0.2)',
            boxShadow: '0 8px 32px rgba(37,53,41,0.06)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16, background: '#3d5442',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#fff' }}>personal_injury</span>
            </div>
            <h3 className="lp-lora" style={{ fontSize: 22, fontWeight: 700, color: '#2e3d32', margin: 0 }}>I'm a Patient</h3>
            <p className="lp-sora" style={{ fontSize: 13, color: '#5a6b5e', lineHeight: 1.6 }}>
              Get a personalized recovery plan. Daily check-ins in your language. WhatsApp updates for your family.
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={{ width: '100%' }}>
              <Link
                to="/onboard"
                className="lp-sora"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: '12px 24px',
                  background: '#3d5442', color: '#fff', textDecoration: 'none',
                  fontSize: 13, fontWeight: 600, borderRadius: 12,
                  boxSizing: 'border-box',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
                Start My Recovery Plan
              </Link>
            </motion.div>
          </div>

          {/* Hospital card */}
          <div style={{
            padding: '40px 32px', background: '#fffef9', borderRadius: 28,
            border: '1px solid rgba(28,28,17,0.07)',
            boxShadow: '0 8px 32px rgba(28,28,17,0.04)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16, background: 'rgba(46,61,50,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#3d5442' }}>local_hospital</span>
            </div>
            <h3 className="lp-lora" style={{ fontSize: 22, fontWeight: 700, color: '#2e3d32', margin: 0 }}>I'm Hospital Staff</h3>
            <p className="lp-sora" style={{ fontSize: 13, color: '#6b8f71', lineHeight: 1.6 }}>
              Receptionist or ward staff? Monitor all discharged patients from one live dashboard.
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={{ width: '100%' }}>
              <Link
                to="/login"
                className="lp-sora"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: '12px 24px',
                  background: 'transparent', color: '#3d5442', textDecoration: 'none',
                  fontSize: 13, fontWeight: 600, borderRadius: 12,
                  border: '1.5px solid rgba(61,84,66,0.3)',
                  boxSizing: 'border-box',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
                Open Hospital Portal
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer style={{
        padding: '40px 24px', textAlign: 'center',
        borderTop: '1px solid rgba(61,84,66,0.08)',
        background: '#f5f0e8',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#3d5442' }}>favorite</span>
          <span className="lp-lora" style={{ fontStyle: 'italic', fontSize: 18, color: '#3d5442', fontWeight: 600 }}>RecoverAI</span>
        </div>
        <p className="lp-sora" style={{ fontSize: 12, color: '#8a9e8f', margin: 0 }}>
          Built for post-discharge dignity · Nakshatra Hackathon 2026 · APSIT Thane
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 12 }}>
          {[
            { to: '/onboard', label: 'Patient Sign-up' },
            { to: '/login', label: 'Hospital Login' },
            { to: '/patient-login', label: 'Patient Login' },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="lp-sora"
              style={{ fontSize: 11, color: '#6b8f71', textDecoration: 'none' }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </footer>
    </main>
  );
}
