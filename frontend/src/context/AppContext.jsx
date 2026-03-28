import { createContext, useContext, useState, useCallback } from "react";

const AppContext = createContext(null);

// Supported languages for the Sarvam AI multilingual flow
export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English",    sarvam: "en-IN" },
  { code: "hi", label: "हिन्दी",      sarvam: "hi-IN" },
  { code: "mr", label: "मराठी",       sarvam: "mr-IN" },
  { code: "ta", label: "தமிழ்",       sarvam: "ta-IN" },
  { code: "te", label: "తెలుగు",      sarvam: "te-IN" },
  { code: "kn", label: "ಕನ್ನಡ",      sarvam: "kn-IN" },
  { code: "gu", label: "ગુજરાતી",    sarvam: "gu-IN" },
  { code: "bn", label: "বাংলা",       sarvam: "bn-IN" },
];

export function AppProvider({ children }) {
  // 'patient' | 'receptionist' | null
  const [currentRole, setCurrentRole] = useState(null);

  // Stores patient data when patient is logged in
  const [currentPatient, setCurrentPatient] = useState(null);

  // Global preferred language — persists across the entire app and drives
  // Sarvam AI STT language and onboarding/check-in prompt translations.
  const [preferredLanguage, setPreferredLanguage] =
    useState(SUPPORTED_LANGUAGES[0]); // default: English

  const login = useCallback((role, data) => {
    setCurrentRole(role);
    if (role === "patient") {
      setCurrentPatient(data);
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentRole(null);
    setCurrentPatient(null);
  }, []);

  const value = {
    currentRole,
    currentPatient,
    setCurrentPatient,
    login,
    logout,
    // Multilingual
    preferredLanguage,
    setPreferredLanguage,
    SUPPORTED_LANGUAGES,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
