/**
 * App.jsx — RecoverAI Router
 * Sets up all routes and wraps everything in AppProvider.
 * 
 * Routes:
 *   /                     → OnboardPage (patient setup / role selector)
 *   /patient/:id          → PatientHomePage
 *   /patient/:id/checkin  → CheckinPage
 *   /dashboard            → NurseDashboardPage
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";

// Pages — lazy loaded for performance
import { lazy, Suspense } from "react";

const OnboardPage         = lazy(() => import("./pages/OnboardPage"));
const PatientHomePage     = lazy(() => import("./pages/PatientHomePage"));
const CheckinPage         = lazy(() => import("./pages/CheckinPage"));
const ReceptionistDashboardPage = lazy(() => import("./pages/ReceptionistDashboardPage"));

/** Full-screen centered loading fallback */
function PageLoader() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span
          className="material-symbols-outlined text-primary animate-spin"
          style={{ fontSize: 40 }}
        >
          progress_activity
        </span>
        <p className="text-on-surface-variant text-sm font-medium">Loading…</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"                      element={<OnboardPage />} />
            <Route path="/patient/:id"           element={<PatientHomePage />} />
            <Route path="/patient/:id/checkin"   element={<CheckinPage />} />
            <Route path="/receptionist"          element={<ReceptionistDashboardPage />} />
            {/* Catch-all → redirect home */}
            <Route path="*"                      element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProvider>
  );
}
