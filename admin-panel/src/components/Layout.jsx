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
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top navbar (mobile-first) */}
      <header className="w-full border-b border-slate-800 bg-slate-900 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden rounded-lg bg-slate-800 px-3 py-2 text-base"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              ☰
            </button>
            <div>
              <h1 className="text-lg font-semibold">IPTV Admin</h1>
              <p className="text-xs text-slate-400">Control panel for hosts, proxies, and settings.</p>
            </div>
          </div>

          <nav className="hidden md:flex md:items-center md:gap-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-accent text-white shadow-soft' : 'text-slate-300 hover:bg-slate-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="md:hidden mt-2 w-full border-t border-slate-800 bg-slate-900">
            <div className="max-w-5xl mx-auto flex flex-col p-3 gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-3 text-base font-medium transition ${
                      isActive ? 'bg-accent text-white shadow-soft' : 'text-slate-300 hover:bg-slate-800'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="mt-2 w-full rounded-lg bg-red-600 px-4 py-3 text-base font-semibold text-white hover:bg-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
