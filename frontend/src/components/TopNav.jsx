import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

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

  const effectiveRole = currentRole || (isReceptionistPath ? 'receptionist' : isPatientPath ? 'patient' : null);

  const navLinks = effectiveRole === 'patient' ? patientLinks
    : effectiveRole === 'receptionist' ? receptionistLinks
    : [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Main nav strip */}
      <div
        className="flex items-center h-[68px] px-6 md:px-10 lg:px-16"
        style={{
          background: 'rgba(253,250,231,0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(74,101,79,0.10)',
          boxShadow: '0 1px 0 rgba(74,101,79,0.06), 0 4px 24px rgba(28,28,17,0.04)',
        }}
      >
        {/* ── Brand ─────────────────────────────── */}
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

        {/* ── Centre Nav ────────────────────────── */}
        {!isGateway && currentRole && navLinks.length > 0 && (
          <nav className="hidden md:flex items-center gap-1 mx-auto">
            {navLinks.map(({ label, to, match, primary }) => {
              const active = match(location.pathname);
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

        {/* If gateway page — spacer to push right items to edge */}
        {isGateway && <span className="flex-1" />}

        {/* ── Right Actions ─────────────────────── */}
        <div className="flex items-center gap-2 ml-auto md:ml-0">
          {isGateway && (
            <>
              <Link
                to="/patient-login"
                className="hidden sm:inline-flex items-center h-9 px-4 rounded-full font-inter text-sm font-semibold no-underline text-ink hover:bg-black/5 transition-colors"
              >
                Patient Login
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center h-9 px-4 rounded-full font-inter text-sm font-semibold no-underline text-white transition-all duration-200 hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #3d5442, #4a654f)',
                  boxShadow: '0 2px 8px rgba(74,101,79,0.30), inset 0 1px 0 rgba(255,255,255,0.12)',
                }}
              >
                Staff Login
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
      </div>

      {/* ── Mobile bottom nav tabs (md:hidden) ─────────────────── */}
      {!isGateway && (effectiveRole === 'patient' || effectiveRole === 'receptionist') && navLinks.length > 0 && (
        <nav
          className="md:hidden flex items-center justify-around h-14 border-t"
          style={{
            background: 'rgba(253,250,231,0.95)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(74,101,79,0.10)',
          }}
        >
          {navLinks.map(({ label, to, match, primary }) => {
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
