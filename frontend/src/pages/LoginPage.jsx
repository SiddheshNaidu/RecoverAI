import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const HOSPITALS = ['City Hospital', 'Apollo Clinic', 'AIIMS Regional', 'Kokilaben Dhirubhai', 'Fortis Medical'];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [hospital, setHospital] = useState('City Hospital');
  const [staffName, setStaffName] = useState('');
  const [pin, setPin]     = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === '1234') {
      login('receptionist', { id: 'staff_1', name: staffName || 'Priya Sharma', hospital });
      navigate('/receptionist');
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <main className="min-h-screen bg-surface-container-low flex flex-col items-center justify-center pt-12 pb-24 px-6 md:px-12">
      <div className="w-full max-w-md animate-fade-up">

        {/* Icon + title */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-primary text-[32px]">shield_person</span>
          </div>
          <h1 className="font-heading text-[2.5rem] tracking-tight text-ink">Staff Portal</h1>
          <p className="font-inter text-ink-muted text-lg mt-2">Clinical Receptionist Access</p>
        </div>

        {/* Form card */}
        <div className="glass-frosted rounded-[2rem] p-10 md:p-12 shadow-ambient border-t border-white/50">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Hospital selector */}
            <div className="flex flex-col gap-2">
              <label className="font-heading text-sm font-bold text-ink">Hospital</label>
              <select
                value={hospital}
                onChange={e => setHospital(e.target.value)}
                className="w-full p-4 bg-white rounded-xl border border-outline-variant/30 focus:border-primary outline-none font-inter text-base text-ink"
              >
                {HOSPITALS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            {/* Staff name */}
            <div className="flex flex-col gap-2">
              <label className="font-heading text-sm font-bold text-ink">Your Name</label>
              <input
                type="text"
                placeholder="e.g. Priya Sharma"
                value={staffName}
                onChange={e => setStaffName(e.target.value)}
                className="w-full p-4 bg-white rounded-xl border border-outline-variant/30 focus:border-primary outline-none font-inter text-base text-ink"
              />
            </div>

            {/* PIN input */}
            <div className="flex flex-col gap-2 items-center">
              <label className="font-heading text-sm font-bold text-ink self-start">4-Digit Clinical PIN</label>
              <input
                type="password"
                maxLength={4}
                autoComplete="off"
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className={`w-full max-w-[200px] text-center font-mono text-[3rem] tracking-[1rem] p-4 bg-transparent border-b-2 outline-none transition-all duration-300 placeholder:text-ink-muted/30 ${
                  error ? 'border-error text-error animate-pulse' : 'border-outline-variant focus:border-primary text-ink'
                }`}
              />
              {error && <span className="font-inter text-sm text-error font-medium animate-fade-up">Incorrect PIN (Try 1234)</span>}
            </div>

            {/* 3D Submit button */}
            <button
              type="submit"
              disabled={pin.length < 4}
              className="w-full py-4 rounded-2xl font-heading font-bold text-lg text-white mt-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{
                background: 'linear-gradient(145deg, #5a7a5f, #3d5442)',
                boxShadow: '6px 6px 16px rgba(37,53,41,0.4), -3px -3px 10px rgba(141,170,145,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              Access Secure System
            </button>
          </form>
        </div>

        <p className="text-center mt-8 font-inter text-sm text-ink-muted">
          Authorized Personnel Only · Audited by RecoverAI SecOps
        </p>
      </div>
    </main>
  );
}
