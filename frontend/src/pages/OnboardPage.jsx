/**
 * OnboardPage.jsx — Multi-step onboarding + role selector
 * Exact Match to Stitch Design: floating max-w-2xl card with segmented
 * horizontal progress bar, scrollable middle section, and fixed footer block.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPatient } from "../api/client";
import { SURGERY_TYPE_KEYS, SURGERY_TYPES } from "../constants/surgeryTypes";

const TOTAL_STEPS = 3;

/**
 * Stitch segmented progress bar
 */
function StepPills({ step }) {
  return (
    <div className="flex items-center gap-2 mt-2">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={`h-2 flex-1 rounded-full transition-all duration-300 ${
            i <= step ? "bg-primary" : "bg-surface-container-high"
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default function OnboardPage() {
  const navigate = useNavigate();
  const [step,     setStep]     = useState(0);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const [form, setForm] = useState({
    name:          "",
    surgery_type:  "",
    discharge_date:"",
    caregiver_phone:"",
    family_phone:  "",
    language:      "English",
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const goNext = () => {
    setError(null);
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
  };

  const goBack = () => {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  };

  const goNurse = () => navigate("/dashboard");

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const patient = await createPatient({
        ...form,
        metadata: { language: form.language },
      });
      navigate(`/patient/${patient.id}`);
    } catch (err) {
      setError(err.message ?? "Failed to create patient. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container flex items-center justify-center p-4 sm:p-6 overflow-hidden relative">
      
      {/* Decorative blurry background elements matching Stitch style */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px] pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[100px] pointer-events-none" aria-hidden="true" />

      <main className="w-full max-w-2xl bg-[#fdf9f5] border border-outline-variant/20 rounded-[2rem] shadow-2xl overflow-hidden relative z-10 flex flex-col">
        
        {/* Progress Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-fraunces text-2xl font-bold text-primary tracking-tight">recoverAI</h1>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
              Step {step + 1} of {TOTAL_STEPS}
            </span>
          </div>
          <StepPills step={step} />
        </div>

        {/* Scrollable Step Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 200px)" }}>
          
          {/* ── STEP 0: Surgery type ───────────────────────────────── */}
          {step === 0 && (
             <div className="space-y-6">
              <div>
                <h2 className="font-fraunces text-2xl font-bold text-on-surface mb-2">Surgery Details</h2>
                <p className="text-on-surface-variant text-sm mb-6">Let's set up your personalized recovery timeline.</p>
              </div>

              {/* Surgery Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SURGERY_TYPE_KEYS.map((key) => {
                  const s = SURGERY_TYPES[key];
                  const sel = form.surgery_type === key;
                  return (
                    <button
                      key={key}
                      onClick={() => set("surgery_type", key)}
                      className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                        sel 
                          ? "border-primary bg-primary-container/10 text-primary" 
                          : "border-outline-variant/20 bg-white hover:border-primary/50 hover:bg-surface-container text-on-surface-variant"
                      }`}
                    >
                      <span className={`material-symbols-outlined text-4xl mb-3 ${sel ? "filled" : ""}`} style={{ fontVariationSettings: sel ? "'FILL' 1" : "'FILL' 0" }}>
                        {s.icon}
                      </span>
                      <span className={`font-bold ${sel ? "text-primary" : "text-on-surface"}`}>{s.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-4 bg-white p-5 rounded-2xl border border-outline-variant/20 shadow-sm mt-6">
                <div className="space-y-1.5">
                  <label htmlFor="patient-name" className="text-xs font-bold text-on-surface-variant uppercase tracking-widest pl-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">person</span>
                    <input
                      id="patient-name"
                      type="text"
                      placeholder="e.g. Ramesh Patil"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="discharge-date" className="text-xs font-bold text-on-surface-variant uppercase tracking-widest pl-1">
                    Discharge Date
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">event</span>
                    <input
                      id="discharge-date"
                      type="date"
                      value={form.discharge_date}
                      onChange={(e) => set("discharge_date", e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 1: Family caregiver ───────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-fraunces text-2xl font-bold text-on-surface mb-2">Caregiver Setup</h2>
                <p className="text-on-surface-variant text-sm mb-6">Add contacts to keep your family updated on your recovery.</p>
              </div>

              <div className="space-y-4 bg-white p-5 rounded-2xl border border-outline-variant/20 shadow-sm mt-6">
                <div className="space-y-1.5">
                  <label htmlFor="caregiver-phone" className="text-xs font-bold text-on-surface-variant uppercase tracking-widest pl-1">
                    Caregiver WhatsApp
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">phone_iphone</span>
                    <input
                      id="caregiver-phone"
                      type="tel"
                      placeholder="+91 90000 00000"
                      value={form.caregiver_phone}
                      onChange={(e) => set("caregiver_phone", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="family-phone" className="text-xs font-bold text-on-surface-variant uppercase tracking-widest pl-1">
                    Your Phone Number
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">smartphone</span>
                    <input
                      id="family-phone"
                      type="tel"
                      placeholder="+91 80000 00000"
                      value={form.family_phone}
                      onChange={(e) => set("family_phone", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-outline-variant/40 bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-center text-on-surface-variant italic">Both numbers are optional right now.</p>
            </div>
          )}

          {/* ── STEP 2: Language + Confirm ─────────────────────────── */}
          {step === 2 && (
             <div className="space-y-6">
              <div>
                <h2 className="font-fraunces text-2xl font-bold text-on-surface mb-2">Communication</h2>
                <p className="text-on-surface-variant text-sm mb-6">Select your preferred language for daily check-ins.</p>
              </div>

               <div className="flex flex-wrap gap-3">
                {["English", "Hindi", "Marathi", "Telugu", "Tamil"].map((lang) => {
                  const sel = form.language === lang;
                  return (
                    <button
                      key={lang}
                      onClick={() => set("language", lang)}
                      className={`px-5 py-2.5 rounded-full text-sm font-bold cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-primary outline-none tracking-wide ${
                        sel 
                          ? "bg-primary text-white shadow-md" 
                          : "bg-white border border-outline-variant/20 text-on-surface hover:bg-surface-container hover:border-outline-variant/40 shadow-sm"
                      }`}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>

              {form.surgery_type && (
                <div className="mt-8 bg-secondary-container/20 border border-secondary-container/40 p-5 rounded-2xl text-center">
                  <span className="material-symbols-outlined text-secondary text-4xl mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                  <h3 className="font-fraunces text-lg font-semibold text-on-surface mb-1">Ready for Recovery</h3>
                  <p className="text-on-surface-variant text-sm px-4">Your personalized AI check-in flow for {SURGERY_TYPES[form.surgery_type]?.label} is beautifully prepared.</p>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-error-container/50 border border-error/20 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-error">error</span>
              <p className="text-sm text-error font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="p-6 bg-white border-t border-outline-variant/20 flex flex-col sm:flex-row gap-3 mt-auto shrink-0">
          
          <button
             onClick={goNurse}
             className="w-full sm:w-auto px-5 py-4 border border-outline-variant/30 text-on-surface-variant font-bold rounded-xl hover:bg-surface-container transition-all flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-primary order-2 sm:order-1"
             aria-label="Switch to Nurse Dashboard"
          >
            I'm a Nurse
          </button>

          <div className="flex-1 flex gap-3 order-1 sm:order-2">
            {step > 0 && (
              <button
                onClick={goBack}
                className="flex-1 sm:flex-none px-6 py-4 bg-surface-container-lowest border border-outline-variant/30 text-on-surface font-bold rounded-xl hover:bg-surface-container transition-all flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
              >
                Back
              </button>
            )}

            {step < TOTAL_STEPS - 1 ? (
              <button
                onClick={goNext}
                disabled={step === 0 && (!form.surgery_type || !form.name || !form.discharge_date)}
                className="flex-[2] py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                 className="flex-[2] py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary outline-none disabled:opacity-50 disabled:cursor-wait"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin" aria-hidden="true">progress_activity</span>
                    Processing
                  </>
                ) : (
                  <>
                    Start Recovery
                    <span className="material-symbols-outlined text-xl">check_circle</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
