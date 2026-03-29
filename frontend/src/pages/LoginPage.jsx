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
    <main className="min-h-screen bg-surface flex items-center justify-center px-6 py-12 md:px-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30" style={{ background: 'radial-gradient(circle at 20% 18%, rgba(141,170,145,0.24), transparent 35%), radial-gradient(circle at 85% 80%, rgba(74,101,79,0.14), transparent 42%)' }} />
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-[2.2rem] overflow-hidden shadow-ambient border border-outline-variant/20 bg-white/80 backdrop-blur-md animate-fade-up relative z-10">
        <section className="p-10 md:p-12 bg-gradient-to-br from-[#2f3d31] via-[#3d5442] to-[#5c7a62] text-white flex flex-col justify-between gap-8">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[30px]">shield_person</span>
            </div>
            <p className="font-inter text-xs uppercase tracking-[0.2em] text-white/70">RecoverAI Staff Portal</p>
            <h1 className="font-heading text-[2.3rem] md:text-[2.8rem] leading-[1.02] mt-3">Clinical operations control panel</h1>
            <p className="font-inter text-white/80 text-base mt-4 leading-relaxed">Register patients, monitor recovery, and coordinate caregiver alerts with AI support.</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {['Patient onboarding in minutes', 'Daily risk visibility', 'Caregiver communication tracking'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span className="font-inter text-sm text-white/90">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="p-10 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <p className="font-inter text-sm uppercase tracking-[0.15em] text-primary font-semibold">Staff Login</p>
            <h2 className="font-heading text-[2rem] tracking-tight text-ink mt-1">Secure clinical access</h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

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

            <div className="flex flex-col gap-2">
              <label className="font-heading text-sm font-bold text-ink">4-Digit Clinical PIN</label>
              <input
                type="password"
                maxLength={4}
                autoComplete="off"
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter PIN"
                className={`w-full p-4 bg-white rounded-xl border outline-none transition-all duration-300 placeholder:text-ink-muted/50 ${
                  error ? 'border-error text-error animate-pulse' : 'border-outline-variant/30 focus:border-primary text-ink'
                }`}
              />
              {error && <span className="font-inter text-sm text-error font-medium">Incorrect PIN (Try 1234)</span>}
            </div>

            <button
              type="submit"
              disabled={pin.length < 4}
              className="w-full py-4 rounded-2xl font-heading font-bold text-lg text-white mt-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{
                background: 'linear-gradient(145deg, #5a7a5f, #3d5442)',
                boxShadow: '6px 6px 16px rgba(37,53,41,0.4), -3px -3px 10px rgba(141,170,145,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              Access Secure System
            </button>
          </form>

          <p className="text-left mt-6 font-inter text-xs text-ink-muted uppercase tracking-wider">
            Authorized Personnel Only · Audited by RecoverAI SecOps
          </p>
        </section>
      </div>
    </main>
  );
}
