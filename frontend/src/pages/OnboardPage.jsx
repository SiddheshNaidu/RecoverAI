import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function OnboardPage() {
  const navigate = useNavigate();
  const { login, preferredLanguage } = useApp();
  
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState(null); // 'manual' or 'upload'
  
  // Comprehensive Form State for AI Generation
  const [formData, setFormData] = useState({
    condition: '',
    date: '',
    age: '',
    gender: '',
    activityLevel: '',
    comorbidities: [],
    restrictions: '',
    supportSystem: '',
    baselinePain: 5
  });

  const [manualSubStep, setManualSubStep] = useState(1);

  const handleSimulateAI = (e) => {
    e?.preventDefault();
    setStep(3); // Processing step
    setTimeout(() => {
      login('patient', { id: 'demo123', name: 'Sarah Jenkins', condition: formData.condition || 'General Recovery' });
      navigate('/patient/demo123');
    }, 4000);
  };

  const nextManualStep = () => setManualSubStep(prev => prev + 1);
  const prevManualStep = () => setManualSubStep(prev => Math.max(1, prev - 1));

  return (
    <main className="min-h-screen bg-surface flex flex-col pt-8 pb-24 px-6 md:px-12 lg:px-24 overflow-hidden relative">
      <div className="max-w-[1024px] mx-auto w-full flex flex-col flex-1 relative z-10">
        
        {/* Main Progress Bar (Only show in phase 1 or 3, hide during manual wizard to avoid confusion) */}
        {(step === 1 || step === 3 || mode === 'upload') && (
          <div className="w-full flex items-center gap-2 mb-16 lg:mb-24 animate-fade-up">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                  step >= i ? 'bg-primary flex-1' : 'bg-surface-high w-16'
                }`}
              />
            ))}
          </div>
        )}

        <div className="flex-1 flex flex-col justify-center">
          
          {/* STEP 1: Select Mode */}
          {step === 1 && (
            <section className="animate-fade-up">
              <h1 className="font-heading text-[2.5rem] md:text-[4rem] leading-[1.1] tracking-tight text-ink mb-12 lg:mb-16">
                How should we build <br/>
                <span className="text-primary italic">your recovery plan?</span>
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {/* Smart Upload */}
                <button
                  onClick={() => { setMode('upload'); setStep(2); }}
                  className="group flex flex-col p-10 md:p-12 bg-white rounded-[2rem] text-left transition-all duration-300 hover:shadow-ambient hover:-translate-y-2 touch-target border-0 cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-full bg-surface-low flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary-fixed transition-all duration-300">
                    <span className="material-symbols-outlined text-primary text-[28px]">document_scanner</span>
                  </div>
                  <h2 className="font-heading text-[1.75rem] md:text-[2rem] font-medium text-ink mb-3">
                    Smart Analysis
                  </h2>
                  <p className="font-inter text-ink-muted text-base md:text-lg">
                    Upload your hospital discharge summary. Gemini will extract everything automatically.
                  </p>
                </button>

                {/* Manual Setup */}
                <button
                  onClick={() => { setMode('manual'); setStep(2); }}
                  className="group flex flex-col p-10 md:p-12 bg-surface-high rounded-[2rem] text-left transition-all duration-300 hover:bg-[#dfdcc8] hover:-translate-y-2 touch-target border-0 cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-full bg-white/50 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                    <span className="material-symbols-outlined text-ink text-[28px]">assignment</span>
                  </div>
                  <h2 className="font-heading text-[1.75rem] md:text-[2rem] font-medium text-ink mb-3">
                    Guided Interview
                  </h2>
                  <p className="font-inter text-ink-muted text-base md:text-lg">
                    Answer a comprehensive clinical questionnaire to build your highly personalized profile.
                  </p>
                </button>
              </div>
            </section>
          )}

          {/* STEP 2: Comprehensive Manual Interview (Wizard) */}
          {step === 2 && mode === 'manual' && (
            <section className="w-full max-w-3xl mx-auto flex flex-col h-full justify-center animate-fade-up">
              
              {/* Wizard Progress Mini */}
              <div className="flex items-center gap-2 mb-12">
                {[1, 2, 3, 4].map(idx => (
                  <div key={idx} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${manualSubStep >= idx ? 'bg-primary' : 'bg-surface-high'}`} />
                ))}
              </div>

              <div className="min-h-[400px] flex flex-col justify-center">
                
                {/* SubStep 1: The Core Event */}
                {manualSubStep === 1 && (
                  <div className="animate-fade-up flex flex-col gap-10">
                    <div>
                      <h2 className="font-heading text-[2rem] md:text-[3rem] tracking-tight text-ink mb-4 leading-tight">
                        What brings you to <br/><span className="text-primary italic">RecoverAI?</span>
                      </h2>
                      <p className="font-inter text-ink-muted text-lg">Your primary diagnosis dictates the foundation of your protocol.</p>
                    </div>

                    <div className="flex flex-col gap-8">
                      <div className="flex flex-col gap-3">
                        <label className="font-heading text-lg font-bold text-ink">Primary Condition or Surgery</label>
                        <input 
                          type="text" 
                          autoFocus
                          value={formData.condition}
                          onChange={e => setFormData({...formData, condition: e.target.value})}
                          placeholder="e.g., Total Knee Replacement, Bypass Surgery"
                          className="w-full p-4 md:p-5 bg-white rounded-xl border border-outline-variant/30 focus:border-primary outline-none transition-colors font-inter text-lg"
                        />
                      </div>
                      <div className="flex flex-col gap-3">
                        <label className="font-heading text-lg font-bold text-ink">Date of Procedure / Discharge</label>
                        <input 
                          type="date" 
                          value={formData.date}
                          onChange={e => setFormData({...formData, date: e.target.value})}
                          className="w-full p-4 md:p-5 bg-white rounded-xl border border-outline-variant/30 focus:border-primary outline-none transition-colors font-inter text-lg text-ink"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SubStep 2: Demographics & Baseline */}
                {manualSubStep === 2 && (
                  <div className="animate-fade-up flex flex-col gap-10">
                    <div>
                      <h2 className="font-heading text-[2rem] md:text-[3rem] tracking-tight text-ink mb-4 leading-tight">
                        Tell us about <br/><span className="text-primary italic">yourself.</span>
                      </h2>
                      <p className="font-inter text-ink-muted text-lg">A 30-year-old athlete recovers differently than a 75-year-old.</p>
                    </div>

                    <div className="flex flex-col gap-8">
                      <div className="flex gap-4">
                        <div className="flex-1 flex flex-col gap-3">
                          <label className="font-heading text-lg font-bold text-ink">Age</label>
                          <input type="number" placeholder="Years" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full p-4 bg-white rounded-xl border border-outline-variant/30 focus:border-primary outline-none font-inter text-lg" />
                        </div>
                        <div className="flex-1 flex flex-col gap-3">
                          <label className="font-heading text-lg font-bold text-ink">Gender</label>
                          <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full p-4 bg-white rounded-xl border border-outline-variant/30 focus:border-primary outline-none font-inter text-lg bg-none">
                            <option value="">Select...</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <label className="font-heading text-lg font-bold text-ink">Prior Activity Level</label>
                        <div className="grid grid-cols-3 gap-4">
                          {['Sedentary', 'Moderate', 'Athletic'].map(level => (
                            <button 
                              key={level}
                              onClick={() => setFormData({...formData, activityLevel: level})}
                              className={`p-4 rounded-xl border text-center transition-all ${formData.activityLevel === level ? 'bg-primary/5 border-primary text-primary font-bold' : 'bg-white border-outline-variant/30 text-ink hover:border-primary/50'}`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SubStep 3: Medical Context */}
                {manualSubStep === 3 && (
                  <div className="animate-fade-up flex flex-col gap-10">
                    <div>
                      <h2 className="font-heading text-[2rem] md:text-[3rem] tracking-tight text-ink mb-4 leading-tight">
                        Medical <span className="text-primary italic">context.</span>
                      </h2>
                      <p className="font-inter text-ink-muted text-lg">These details prevent AI from suggesting unsafe exercises or diets.</p>
                    </div>

                    <div className="flex flex-col gap-8">
                      <div className="flex flex-col gap-3">
                        <label className="font-heading text-lg font-bold text-ink">Existing Conditions (Comorbidities)</label>
                        <div className="flex flex-wrap gap-3">
                          {['Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'Osteoporosis', 'None'].map(condition => {
                            const isSelected = formData.comorbidities.includes(condition);
                            return (
                              <button 
                                key={condition}
                                onClick={() => {
                                  if (condition === 'None') setFormData({...formData, comorbidities: ['None']});
                                  else {
                                    const next = isSelected ? formData.comorbidities.filter(c => c !== condition) : [...formData.comorbidities.filter(c=>c!=='None'), condition];
                                    setFormData({...formData, comorbidities: next});
                                  }
                                }}
                                className={`px-5 py-2.5 rounded-full border transition-all ${isSelected ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white border-outline-variant/30 text-ink hover:border-primary/50'}`}
                              >
                                {condition}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <label className="font-heading text-lg font-bold text-ink">Explicit Doctor Restrictions</label>
                        <textarea 
                          value={formData.restrictions}
                          onChange={e => setFormData({...formData, restrictions: e.target.value})}
                          placeholder="e.g., Non-weight bearing for 2 weeks, no lifting over 10 lbs..."
                          className="w-full p-4 md:p-5 bg-white rounded-xl border border-outline-variant/30 focus:border-primary outline-none transition-colors font-inter text-lg min-h-[100px] resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SubStep 4: Status & Support */}
                {manualSubStep === 4 && (
                  <div className="animate-fade-up flex flex-col gap-10">
                    <div>
                      <h2 className="font-heading text-[2rem] md:text-[3rem] tracking-tight text-ink mb-4 leading-tight">
                        Current <span className="text-primary italic">status.</span>
                      </h2>
                      <p className="font-inter text-ink-muted text-lg">Establish your baseline so we can track improvement.</p>
                    </div>

                    <div className="flex flex-col gap-8">
                      
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between">
                          <label className="font-heading text-lg font-bold text-ink">Baseline Pain Level</label>
                          <span className="font-inter font-bold text-primary text-xl">{formData.baselinePain}/10</span>
                        </div>
                        <input 
                          type="range" min="0" max="10" 
                          value={formData.baselinePain}
                          onChange={e => setFormData({...formData, baselinePain: parseInt(e.target.value)})}
                          className="w-full accent-primary"
                        />
                        <div className="flex justify-between text-xs font-inter text-ink-muted font-medium uppercase tracking-widest">
                          <span>0 - None</span>
                          <span className="text-error">10 - Severe</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <label className="font-heading text-lg font-bold text-ink">Caregiver Support</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { id: 'full', label: 'Full Support', desc: 'Someone is with me 24/7' },
                            { id: 'partial', label: 'Partial Support', desc: 'Someone checks on me daily' },
                            { id: 'alone', label: 'Living Alone', desc: 'I am managing entirely alone' }
                          ].map(sup => (
                            <button 
                              key={sup.id}
                              onClick={() => setFormData({...formData, supportSystem: sup.id})}
                              className={`p-5 rounded-2xl border text-left transition-all ${formData.supportSystem === sup.id ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white border-outline-variant/30 hover:border-primary/50'}`}
                            >
                              <div className={`font-heading font-bold text-lg mb-1 ${formData.supportSystem === sup.id ? 'text-primary' : 'text-ink'}`}>{sup.label}</div>
                              <div className="font-inter text-sm text-ink-muted">{sup.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Controls */}
              <div className="flex justify-between items-center mt-12 pt-8 border-t border-[rgba(194,200,192,0.15)]">
                <button 
                  type="button" 
                  onClick={() => manualSubStep === 1 ? setStep(1) : prevManualStep()} 
                  className="font-inter text-ink font-medium hover:text-primary transition-colors px-4 py-2 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Back
                </button>
                
                {manualSubStep < 4 ? (
                  <button 
                    type="button"
                    disabled={manualSubStep === 1 && !formData.condition}
                    onClick={nextManualStep} 
                    className="btn-secondary px-8 py-3 disabled:opacity-50"
                  >
                    Continue
                  </button>
                ) : (
                  <button 
                    onClick={handleSimulateAI} 
                    className="btn-gradient px-8 py-4 text-lg shadow-orb animate-pulse-slow"
                  >
                    Generate AI Protocol
                    <span className="material-symbols-outlined ml-2">auto_awesome</span>
                  </button>
                )}
              </div>
            </section>
          )}

          {/* STEP 2: Smart Upload */}
          {step === 2 && mode === 'upload' && (
            <section className="animate-fade-up w-full max-w-2xl mx-auto text-center">
              <h2 className="font-heading text-[2.5rem] md:text-[3rem] tracking-tight text-ink mb-4">
                Discharge Summary
              </h2>
              <p className="font-inter text-ink-muted text-lg mb-10">
                Let Gemini extract your diagnosis, medications, and restrictions instantly.
              </p>
              
              <div className="border-2 border-dashed border-primary/30 rounded-[2rem] p-12 md:p-20 flex flex-col items-center justify-center bg-white/50 hover:bg-white hover:border-primary/60 transition-colors duration-300 cursor-pointer group">
                <div className="w-24 h-24 bg-surface-low rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-fixed transition-all duration-500 shadow-sm">
                  <span className="material-symbols-outlined text-primary text-[48px]">cloud_upload</span>
                </div>
                <h3 className="font-heading text-2xl font-bold text-ink mb-2">Tap to browse files</h3>
                <p className="font-inter text-ink-muted">PDF, JPG, or PNG from your hospital</p>
              </div>

              <div className="flex justify-between items-center mt-12">
                <button type="button" onClick={() => setStep(1)} className="font-inter text-ink font-medium hover:text-primary transition-colors px-4 py-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back
                </button>
                <button onClick={handleSimulateAI} className="btn-gradient px-10 py-4 text-lg">
                  Submit to AI
                  <span className="material-symbols-outlined ml-2">auto_awesome</span>
                </button>
              </div>
            </section>
          )}

          {/* STEP 3: Processing */}
          {step === 3 && (
            <section className="flex flex-col items-center justify-center text-center animate-fade-up h-[50vh]">
              <div className="w-32 h-32 rounded-full bg-primary-fixed flex items-center justify-center mb-10 animate-orb-breathe shadow-orb relative">
                <div className="absolute inset-0 rounded-full border-[6px] border-primary/20 border-t-primary animate-spin" />
                <span className="material-symbols-outlined text-primary text-[48px]">
                  neurology
                </span>
              </div>
              <h2 className="font-heading text-[2.5rem] md:text-[3rem] tracking-tight text-ink mb-4 max-w-lg mx-auto leading-tight">
                Synthesizing Protocol
              </h2>
              <p className="font-inter text-ink-muted text-lg max-w-md mx-auto leading-relaxed">
                Gemini is securely reading your massive medical profile to tailor a highly specific, adaptive daily recovery plan.
              </p>
            </section>
          )}

        </div>
      </div>
      
      {/* Ambient background blur for wizard focus */}
      {step === 2 && mode === 'manual' && (
         <div className="fixed top-[-50%] left-[-10%] w-[100vw] h-[100vh] bg-[radial-gradient(ellipse_at_top_left,_rgba(141,170,145,0.15),_transparent_70%)] pointer-events-none -z-10" />
      )}
    </main>
  );
}
