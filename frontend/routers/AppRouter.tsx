import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LivePage from "../features/lives/pages/LivePage";
import PresentationPage from "../features/presentation/PresentationPage";
import SavedPage from "../features/saved/SavedPage";
import SettingsPage from "../features/settings/SettingsPage";
import AppLayout from "../layout/AppLayout";
import AudiencePage from "../features/audience/AudiencePage";
import useAuth from "../features/auth/useAuth";
import LoginPage from "../features/auth/LoginPage";
import SignupPage from "../features/auth/SignupPage";
import HistoryPage from "../features/history/HistoryPage";
import SuccessPage from "../features/payment/SuccessPage";
import CancelPage from "../features/payment/CancelPage";
import AnalyticsPage from "../features/analytics/AnalyticsPage";
import LandingPage from "../src/pages/LandingPage";
import useIsDesktop from "../src/hooks/useIsDesktop";
import DesktopOnly from "../src/components/DesktopOnly";
import ProjectorPage from "../features/lives/pages/ProjectorPage"

// ...imports unchanged

export default function AppRouter() {
  const { user, loading } = useAuth();
  const isDesktop = useIsDesktop();

  if (!isDesktop) {
    return <DesktopOnly />;
  }

  if (loading) {
    return <div className="p-6">Checking authentication…</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/presentation" element={<PresentationPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancel" element={<CancelPage />} />
        <Route
          path="/app"
          element={user ? <AppLayout /> : <Navigate to="/login" replace />}
        >
          <Route path="live" element={<LivePage />} />
          <Route path="projector/:sessionId" element={<ProjectorPage />} />
          <Route path="saved" element={<SavedPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="audience/:sessionId" element={<AudiencePage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>

        <Route
          path="*"
          element={<Navigate to={user ? "/app/live" : "/"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
