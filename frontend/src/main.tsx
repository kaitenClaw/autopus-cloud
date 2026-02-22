import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AppShell from './components/AppShell';
import LandingPage from './components/LandingPage';
import DashboardPage from './pages/DashboardPage';
import HubPage from './pages/HubPage';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';
import MarketplacePage from './pages/MarketplacePage';
import './index.css';

function AppRouter() {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

  // Subdomain routing: dashboard.autopus.cloud → app shell, hub.autopus.cloud → hub
  const isDashboardDomain = hostname === 'dashboard.autopus.cloud';
  const isHubDomain = hostname === 'hub.autopus.cloud';

  return (
    <Routes>
      {/* Landing page — on main domain. Subdomains skip to app. */}
      <Route path="/" element={
        isDashboardDomain
          ? <Navigate to="/dashboard" replace />
          : isHubDomain
            ? <Navigate to="/hub" replace />
            : <LandingPage />
      } />

      {/* App shell with nested routes */}
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/hub" element={<HubPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'}>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </GoogleOAuthProvider>
);
