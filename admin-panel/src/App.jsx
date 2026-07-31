import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import useAuth from './hooks/useAuth.jsx';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import HostsPage from './pages/HostsPage.jsx';
import ProxiesPage from './pages/ProxiesPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  const auth = useAuth();

  const router = useMemo(
    () => (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="hosts" element={<HostsPage />} />
          <Route path="proxies" element={<ProxiesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to={auth.isAuthenticated ? '/dashboard' : '/login'} replace />} />
      </Routes>
    ),
    [auth.isAuthenticated],
  );

  return router;
}

export default App;
