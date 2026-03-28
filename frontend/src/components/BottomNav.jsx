import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function BottomNav() {
  const { currentRole, currentPatient } = useApp();
  const location = useLocation();

  if (!currentRole || ['/', '/onboard', '/login'].includes(location.pathname)) return null;

  const patientId = currentPatient?.id || 'demo-auth';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 nav-glass border-t border-[rgba(194,200,192,0.15)] pb-safe">
      <div className="max-w-screen-xl mx-auto px-6 h-[68px] flex items-center justify-around">

        {currentRole === 'patient' && (
          <>
            <NavItem
              icon="home"
              label="Home"
              to={`/patient/${patientId}`}
              active={location.pathname.startsWith('/patient') && !location.pathname.includes('/checkin')}
            />
            {/* Primary CTA Check-in button */}
            <Link
              to={`/patient/${patientId}/checkin`}
              className="flex flex-col items-center justify-center -mt-6 cursor-pointer group min-w-[64px]"
              aria-label="Daily Check-in"
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-orb transition-transform duration-200 group-active:scale-95"
                   style={{ background: 'linear-gradient(135deg, #4a654f, #8daa91)' }}>
                <span className="material-symbols-outlined text-white text-[26px]" aria-hidden="true">mic</span>
              </div>
              <span className="text-[10px] font-inter font-semibold mt-1" style={{ color: '#4a654f' }}>
                Check-in
              </span>
            </Link>
            <NavItem
              icon="history_edu"
              label="Journal"
              to="/history"
              active={location.pathname === '/history'}
            />
          </>
        )}

        {currentRole === 'receptionist' && (
          <>
            <NavItem
              icon="dashboard"
              label="Dashboard"
              to="/receptionist"
              active={location.pathname === '/receptionist'}
            />
            <NavItem
              icon="person_add"
              label="Register"
              to="/register-patient"
              active={location.pathname === '/register-patient'}
            />
          </>
        )}

      </div>
    </nav>
  );
}

function NavItem({ icon, label, to, active }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] cursor-pointer transition-colors duration-200 no-underline touch-target group"
      style={{ color: active ? '#4a654f' : '#424842' }}
      aria-label={label}
    >
      <span className="material-symbols-outlined transition-colors duration-200 text-[24px] group-hover:opacity-80" aria-hidden="true">
        {icon}
      </span>
      <span className="font-inter font-medium tracking-wide text-[10px]">
        {label}
      </span>
    </Link>
  );
}
