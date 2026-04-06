import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LivePage from "../features/lives/pages/LivePage";
import PresentationPage from "../features/presentation/PresentationPage";
import SavedPage from "../features/saved/SavedPage";
import SettingsPage from "../features/settings/SettingsPage";
import AppLayout from "../layout/AppLayout";
import AudiencePage from "../features/audience/AudiencePage";
import useAuth from "../features/auth/useAuth";
import LoginPage from "../features/auth/LoginPage";
import HistoryPage from "../features/history/HistoryPage";
import SuccessPage from "../features/payment/SuccessPage";
import CancelPage from "../features/payment/CancelPage";
import AnalyticsPage from "../features/analytics/AnalyticsPage";
import LandingPage from "../src/pages/LandingPage";

export default function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6">Checking authentication…</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/presentation" element={<PresentationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancel" element={<CancelPage />} />

        {/* Protected app layout and nested routes */}
        <Route
          path="/"
          element={user ? <AppLayout /> : <Navigate to="/login" replace />}
        >
          {/* LandingPage is now the default for "/" */}
          <Route index element={<LandingPage />} />
          <Route path="live" element={<LivePage />} />
          <Route path="saved" element={<SavedPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="audience/:sessionId" element={<AudiencePage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to={user ? "/" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
