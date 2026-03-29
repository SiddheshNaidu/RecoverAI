/**
 * App.jsx — RecoverAI Complete Router
 * All routes from PRD §11 are wired here.
 */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { lazy, Suspense } from "react";
import TopNav from "./components/TopNav";

// ── Patient flow ──────────────────────────────────────────────────────────
const LandingPage = lazy(() => import("./pages/LandingPage"));
const OnboardPage = lazy(() => import("./pages/OnboardPage"));
const PatientLoginPage = lazy(() => import("./pages/PatientLoginPage"));
const PatientHomePage = lazy(() => import("./pages/PatientHomePage"));
const RecoveryPlanPage = lazy(() => import("./pages/RecoveryPlanPage"));
const CheckinPage = lazy(() => import("./pages/CheckinPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const SOSPage = lazy(() => import("./pages/SOSPage"));

// ── Receptionist flow ─────────────────────────────────────────────────────
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ReceptionistDashboardPage = lazy(() => import("./pages/ReceptionistDashboardPage"));
const RegisterPatientPage = lazy(() => import("./pages/RegisterPatientPage"));
const ReceptionistPatientView = lazy(() => import("./pages/ReceptionistPatientView"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <span className="material-symbols-outlined text-primary text-[40px] animate-spin">
        progress_activity
      </span>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <div className="flex flex-col min-h-screen">
            <TopNav />
            <main className="flex-1 flex flex-col">
              <Routes>
                {/* Public */}
                <Route path="/" element={<LandingPage />} />

                {/* Patient flow */}
                <Route path="/onboard" element={<OnboardPage />} />
                <Route path="/patient-login" element={<PatientLoginPage />} />
                <Route path="/patient/:publicId" element={<PatientHomePage />} />
                <Route path="/patient/:publicId/plan" element={<RecoveryPlanPage />} />
                <Route path="/patient/:publicId/checkin" element={<CheckinPage />} />
                <Route path="/patient/:publicId/history" element={<HistoryPage />} />
                <Route path="/patient/:publicId/sos" element={<SOSPage />} />

                {/* Receptionist flow */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/receptionist" element={<ReceptionistDashboardPage />} />
                <Route path="/receptionist/new" element={<RegisterPatientPage />} />
                <Route path="/receptionist/patient/:publicId" element={<ReceptionistPatientView />} />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Suspense>
      </BrowserRouter>
    </AppProvider>
  );
}
