import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { loginPatientWithPin } from '../api/client';

export default function PatientLoginPage() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      const res = await loginPatientWithPin(phone, pin);
      const patient = res?.patient;
      if (!patient?.id) throw new Error('Unable to login.');
      login('patient', patient);
      navigate(`/patient/${patient.id}`);
    } catch (err) {
      setError(err?.message || 'Invalid phone or PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center px-6 py-12 md:px-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30" style={{ background: 'radial-gradient(circle at 18% 20%, rgba(141,170,145,0.25), transparent 35%), radial-gradient(circle at 85% 85%, rgba(74,101,79,0.18), transparent 45%)' }} />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-[2.2rem] overflow-hidden shadow-ambient border border-outline-variant/20 bg-white/80 backdrop-blur-md animate-fade-up relative z-10">
        <section className="p-10 md:p-12 bg-gradient-to-br from-[#2f3d31] via-[#3d5442] to-[#5c7a62] text-white flex flex-col justify-between gap-8">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[30px]">ecg_heart</span>
            </div>
            <p className="font-inter text-xs uppercase tracking-[0.2em] text-white/70">RecoverAI Secure Access</p>
            <h1 className="font-heading text-[2.3rem] md:text-[2.8rem] leading-[1.02] mt-3">Continue your recovery journey</h1>
            <p className="font-inter text-white/80 text-base mt-4 leading-relaxed">One PIN unlocks your daily adaptive plan, reminders, and check-ins in a calm workflow.</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              'Daily Gemini plan updates',
              'Medication and protocol tracking',
              'Fast check-in access with one tap',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span className="font-inter text-sm text-white/90">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="p-10 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <p className="font-inter text-sm uppercase tracking-[0.15em] text-primary font-semibold">Patient Login</p>
            <h2 className="font-heading text-[2rem] tracking-tight text-ink mt-1">Phone + Recovery PIN</h2>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-heading text-sm font-bold text-ink">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 97000 00000"
                className="w-full p-4 bg-white rounded-xl border border-outline-variant/30 focus:border-primary outline-none font-inter text-base text-ink"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-heading text-sm font-bold text-ink">Recovery PIN</label>
              <input
                type="password"
                maxLength={8}
                autoComplete="off"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 4-8 digits"
                className="w-full p-4 bg-white rounded-xl border border-outline-variant/30 focus:border-primary outline-none font-inter text-base text-ink"
              />
            </div>

            {error && <p className="font-inter text-sm text-error font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading || pin.length < 4 || !phone}
              className="w-full py-4 rounded-2xl font-heading font-bold text-lg text-white mt-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{
                background: 'linear-gradient(145deg, #5a7a5f, #3d5442)',
                boxShadow: '6px 6px 16px rgba(37,53,41,0.4), -3px -3px 10px rgba(141,170,145,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              {loading ? 'Signing in...' : 'Open My Dashboard'}
            </button>
          </form>

          <div className="flex items-center justify-between mt-6 text-sm">
            <Link to="/onboard" className="font-inter text-primary hover:underline">
              New patient? Create AI plan
            </Link>
            <Link to="/" className="font-inter text-ink-muted hover:text-ink transition-colors">
              Back home
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
