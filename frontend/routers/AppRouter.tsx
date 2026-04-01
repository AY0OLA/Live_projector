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

export default function AppRouter() {
  const { user, loading } = useAuth();

  // Optional: show a loading state while auth is being determined
  if (loading) {
    return <div className="p-6">Checking authentication…</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public route (example) */}
        <Route path="/presentation" element={<PresentationPage />} />

        {/* Login route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected app layout and nested routes */}
        <Route
          path="/"
          element={user ? <AppLayout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<LivePage />} />
          <Route path="saved" element={<SavedPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="audience/:sessionId" element={<AudiencePage />} />
          <Route path="history" element={<HistoryPage />} />
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
