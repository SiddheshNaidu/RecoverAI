import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';

/* ────────────────────────────────────────────────────────────
   Tremor.so-inspired TopNav — sage colour scheme
   - Frosted glass strip with subtle gradient bottom border
   - Logo left · Nav links centre · User + actions right
   - Active link = filled sage pill; hover = ghost pill
   - Mobile: hamburger collapses to bottom-sheet tabs
──────────────────────────────────────────────────────────── */

export default function TopNav() {
  const { currentRole, currentPatient, logout, preferredLanguage } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const isReceptionistPath = location.pathname.startsWith('/receptionist');
  const isPatientPath = location.pathname.startsWith('/patient/');
  const isGateway = ['/', '/onboard', '/login', '/patient-login'].includes(location.pathname);
  const patientId = currentPatient?.id || 'demo-auth';

  const patientLinks = [
    { label: 'Home',         to: `/patient/${patientId}`,           match: p => p.endsWith(patientId)      },
    { label: 'Daily Check-in', to: `/patient/${patientId}/checkin`, match: p => p.includes('/checkin'),  primary: true },
    { label: 'Journal',      to: `/patient/${patientId}/history`,    match: p => p.includes('/history')    },
    { label: 'My Plan',      to: `/patient/${patientId}/plan`,       match: p => p.includes('/plan')       },
  ];

  const receptionistLinks = [
    { label: 'Dashboard',        to: '/receptionist',     match: p => p === '/receptionist' },
    { label: 'Register Patient', to: '/receptionist/new', match: p => p.includes('/new'),   primary: true },
  ];

  const gatewayLinks = [
    { label: 'Stats', hash: 'stats', match: () => false },
    { label: 'Features', hash: 'features', match: () => false },
    { label: 'Languages', hash: 'languages', match: () => false },
  ];

  const effectiveRole = currentRole || (isReceptionistPath ? 'receptionist' : isPatientPath ? 'patient' : null);

  const navLinks = effectiveRole === 'patient' ? patientLinks
    : effectiveRole === 'receptionist' ? receptionistLinks
    : [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 pointer-events-none">
      {/* Main nav strip */}
      <motion.div
        animate={{
          y: isGateway && isScrolled ? 16 : 0,
          borderRadius: isGateway && isScrolled ? '1.5rem' : '0px',
          width: isGateway && isScrolled ? 'min(calc(100% - 32px), 1200px)' : '100%',
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`flex items-center h-[68px] px-6 md:px-10 lg:px-16 pointer-events-auto origin-top mx-auto`}
        style={{
          background: isGateway && isScrolled ? 'rgba(253,250,231,0.65)' : 'rgba(253,250,231,0.82)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: isGateway && isScrolled ? '1px solid rgba(74,101,79,0.15)' : 'none',
          borderBottom: isGateway && isScrolled ? '1px solid rgba(74,101,79,0.15)' : '1px solid rgba(74,101,79,0.10)',
          boxShadow: isGateway && isScrolled 
            ? '0 12px 32px rgba(28,28,17,0.1), inset 0 1px 0 rgba(255,255,255,0.4)' 
            : '0 1px 0 rgba(74,101,79,0.06), 0 4px 24px rgba(28,28,17,0.04)',
        }}
      >
        {/* ── Brand ─────────────────────────────── */}
        <div className="flex-1 flex items-center justify-start">
          <Link
            to="/"
            className="flex items-center gap-2.5 no-underline shrink-0 group"
            aria-label="RecoverAI home"
          >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #3d5442, #6b8f71)',
              boxShadow: '0 2px 8px rgba(74,101,79,0.35)',
            }}
          >
            <span className="material-symbols-outlined text-white" style={{ fontSize: '18px' }}>
              ecg_heart
            </span>
          </div>
          <span
            className="font-heading font-extrabold tracking-tight select-none"
            style={{
              fontSize: '1.15rem',
              background: 'linear-gradient(135deg, #2e3d32 0%, #4a654f 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            RecoverAI
          </span>
          </Link>
        </div>

        {/* ── Centre Nav ────────────────────────── */}
        {((!isGateway && currentRole && navLinks.length > 0) || isGateway) && (
          <nav className="hidden md:flex items-center gap-1 justify-center shrink-0">
            {(isGateway ? gatewayLinks : navLinks).map(({ label, to, hash, match, primary }) => {
              const active = match(location.pathname);
              
              if (isGateway && hash) {
                return (
                  <button
                    key={label}
                    onClick={() => {
                      if (location.pathname !== '/') navigate('/');
                      // Slight delay to allow routing to root if not already there
                      setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }), 50);
                    }}
                    className="relative flex flex-col items-center h-9 px-4 rounded-full font-inter text-sm font-medium no-underline transition-all duration-200 text-ink-muted hover:text-ink border-0 bg-transparent cursor-pointer justify-center group"
                  >
                    {label}
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#4a654f] transition-all duration-500 ease-out group-hover:w-1/2 rounded-full"></span>
                  </button>
                );
              }

              if (primary) {
                return (
                  <Link
                    key={label}
                    to={to}
                    className="flex items-center gap-1.5 h-9 px-4 rounded-full font-inter text-sm font-semibold text-white no-underline transition-all duration-200 hover:opacity-90 active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, #3d5442, #4a654f)',
                      boxShadow: '0 2px 8px rgba(74,101,79,0.30), inset 0 1px 0 rgba(255,255,255,0.12)',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>mic</span>
                    {label}
                  </Link>
                );
              }
              return (
                <Link
                  key={label}
                  to={to}
                  className={`flex items-center h-9 px-4 rounded-full font-inter text-sm font-medium no-underline transition-all duration-200 ${
                    active
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-ink-muted hover:bg-black/5 hover:text-ink'
                  }`}
                >
                  {label}
                  {active && (
                    <span
                      className="ml-1.5 w-1.5 h-1.5 rounded-full bg-primary inline-block"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        {/* ── Right Actions ─────────────────────── */}
        <div className="flex-1 flex items-center justify-end gap-2 ml-auto md:ml-0">
          {isGateway && (
            <>
              <Link
                to="/patient-login"
                className="group relative overflow-hidden hidden sm:inline-flex items-center justify-center h-9 px-5 rounded-full font-inter text-sm font-semibold no-underline text-[#2e3d32] transition-colors duration-300 shadow-sm hover:text-white"
                style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(107, 143, 113, 0.3)',
                }}
              >
                <span 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
                  style={{
                    background: 'linear-gradient(135deg, #3d5442, #6b8f71)',
                  }}
                ></span>
                <span className="relative z-10">Patient Login</span>
              </Link>
              <Link
                to="/login"
                className="group relative overflow-hidden inline-flex items-center justify-center h-9 px-5 rounded-full font-inter text-sm font-semibold no-underline text-[#2e3d32] transition-all duration-300 shadow-sm hover:text-white hover:scale-95"
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(107, 143, 113, 0.4)',
                  boxShadow: '0 4px 12px rgba(37,53,41,0.06)',
                }}
              >
                <span 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
                  style={{
                    background: 'linear-gradient(135deg, #3d5442, #6b8f71)',
                  }}
                ></span>
                <span className="relative z-10">Staff Login</span>
              </Link>
            </>
          )}

          {/* Language badge */}
          {preferredLanguage && preferredLanguage.code !== 'en' && (
            <div
              className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-full font-inter text-xs font-medium text-ink-muted cursor-default select-none"
              style={{ background: 'rgba(74,101,79,0.07)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>language</span>
              {preferredLanguage.label}
            </div>
          )}

          {/* Vertical divider */}
          {(effectiveRole === 'patient' || effectiveRole === 'receptionist') && (
            <div className="hidden sm:block w-px h-5 bg-outline-variant/30 mx-1" />
          )}

          {/* User avatar pill */}
          {effectiveRole === 'patient' && currentPatient && (
            <div
              className="flex items-center gap-2 h-9 pl-1 pr-3 rounded-full font-inter text-sm"
              style={{ background: 'rgba(74,101,79,0.07)' }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-heading font-bold text-xs text-white"
                style={{ background: 'linear-gradient(135deg, #3d5442, #6b8f71)' }}
              >
                {currentPatient.name?.charAt(0) ?? 'P'}
              </div>
              <span className="hidden sm:block font-medium text-ink">
                {currentPatient.name?.split(' ')[0]}
              </span>
            </div>
          )}

          {effectiveRole === 'receptionist' && (
            <div
              className="flex items-center gap-2 h-9 pl-1 pr-3 rounded-full"
              style={{ background: 'rgba(74,101,79,0.07)' }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #3d5442, #6b8f71)' }}
              >
                <span className="material-symbols-outlined text-white" style={{ fontSize: '15px' }}>verified_user</span>
              </div>
              <span className="hidden sm:block font-inter text-sm font-medium text-ink">Staff</span>
            </div>
          )}

          {/* Logout icon button */}
          {(effectiveRole === 'patient' || effectiveRole === 'receptionist') && (
            <button
              onClick={handleLogout}
              className="w-9 h-9 flex items-center justify-center rounded-full text-ink-muted transition-all duration-200 hover:bg-black/6 hover:text-ink active:scale-90 cursor-pointer border-0 bg-transparent"
              aria-label="Sign out"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>logout</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Mobile bottom nav tabs (md:hidden) ─────────────────── */}
      {(!isGateway || (isGateway && gatewayLinks.length > 0)) && (effectiveRole === 'patient' || effectiveRole === 'receptionist' || isGateway) && (navLinks.length > 0 || isGateway) && (
        <nav
          className="md:hidden flex items-center justify-around h-14 border-t pointer-events-auto fixed bottom-0 w-full z-50 pb-safe"
          style={{
            background: 'rgba(253,250,231,0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderColor: 'rgba(74,101,79,0.10)',
          }}
        >
          {isGateway ? gatewayLinks.map(({ label, hash }) => (
            <button
              key={label}
              onClick={() => {
                if (location.pathname !== '/') navigate('/');
                setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }), 50);
              }}
              className="flex flex-col items-center justify-center gap-0.5 min-w-[60px] min-h-[44px] no-underline transition-all duration-200 text-ink-muted bg-transparent border-0"
            >
              <span className="font-inter text-[11px] font-medium mt-0.5">{label}</span>
            </button>
          )) : navLinks.map(({ label, to, match, primary }) => {
            const active = match(location.pathname);
            return (
              <Link
                key={label}
                to={to}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[60px] min-h-[44px] no-underline transition-all duration-200 ${
                  active ? 'text-primary' : 'text-ink-muted'
                }`}
              >
                {primary
                  ? <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3d5442, #6b8f71)' }}>
                      <span className="material-symbols-outlined text-white" style={{ fontSize: '18px' }}>mic</span>
                    </div>
                  : <span className="font-inter text-[11px] font-medium mt-0.5">{label}</span>
                }
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
