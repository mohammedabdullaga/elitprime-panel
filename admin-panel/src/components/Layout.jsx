import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        <aside className="w-72 bg-slate-900 border-r border-slate-700 p-6">
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

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
