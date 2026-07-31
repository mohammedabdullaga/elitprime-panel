import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuth from '../hooks/useAuth.jsx';

const navItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Hosts', to: '/hosts' },
  { label: 'Proxies', to: '/proxies' },
  { label: 'Settings', to: '/settings' },
];

function Layout() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-72 bg-slate-900 border-r border-slate-700 p-6">
          <div className="mb-10">
            <h1 className="text-2xl font-semibold text-white">IPTV Admin</h1>
            <p className="mt-2 text-sm text-slate-400">Control panel for hosts, proxies, and settings.</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? 'bg-accent text-white shadow-soft' : 'text-slate-300 hover:bg-slate-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-8 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
          >
            Logout
          </button>
        </aside>

        {/* Mobile header */}
        <div className="md:hidden w-full border-b border-slate-800 bg-slate-900 p-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">IPTV Admin</h1>
          </div>
          <button
            className="rounded-md bg-slate-800 px-3 py-2 text-sm"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            Menu
          </button>
        </div>

        {/* Mobile overlay nav */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/50">
            <div className="absolute left-0 top-0 h-full w-64 bg-slate-900 p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-white">IPTV Admin</h1>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-xl px-4 py-3 text-sm font-medium transition ${
                        isActive ? 'bg-accent text-white shadow-soft' : 'text-slate-300 hover:bg-slate-800'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="mt-8 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
