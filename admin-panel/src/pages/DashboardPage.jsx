import { useEffect, useState } from 'react';
import api from '../api';

function DashboardPage() {
  const [hosts, setHosts] = useState([]);
  const [proxies, setProxies] = useState([]);
  const [tmdbApiKey, setTmdbApiKey] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [hRes, pRes, sRes] = await Promise.all([api.get('/hosts'), api.get('/proxies'), api.get('/settings')]);
        setHosts(hRes.data || []);
        setProxies(pRes.data || []);
        setTmdbApiKey(sRes.data?.tmdb_api_key || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-soft">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white">Dashboard</h2>
        <p className="mt-2 text-slate-400">Overview of hosts, proxy configuration, and app settings.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Hosts</p>
              <h3 className="mt-1 text-xl font-semibold text-white">{hosts.length}</h3>
            </div>
            <div className="text-sm text-slate-400">{loading ? 'Loading...' : 'Updated'}</div>
          </div>

          {hosts.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-400">
                    <th className="px-2 py-2">URL</th>
                    <th className="px-2 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {hosts.slice(0, 4).map((h) => (
                    <tr key={h.id} className="border-t border-slate-800">
                      <td className="px-2 py-3 text-slate-100 break-words max-w-xs">{h.url}</td>
                      <td className="px-2 py-3 text-slate-100">{h.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-4 shadow-soft">
          <p className="text-sm text-slate-400">Proxy hosts</p>
          <h3 className="mt-1 text-xl font-semibold text-white">{proxies.length}</h3>

          {proxies.length > 0 ? (
            <ul className="mt-4 space-y-2 text-sm">
              {proxies.slice(0, 4).map((p) => (
                <li key={p.id} className="text-slate-100 break-words">{p.host}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-slate-400">No proxy host configured.</p>
          )}
        </div>

        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-4 shadow-soft">
          <p className="text-sm text-slate-400">TMDB API Key</p>
          <h3 className="mt-1 text-xl font-semibold text-white">{tmdbApiKey ? 'Configured' : 'Not set'}</h3>
          {tmdbApiKey ? (
            <p className="mt-3 text-sm text-slate-200 break-words max-w-full">{tmdbApiKey}</p>
          ) : (
            <p className="mt-3 text-sm text-slate-400">Set the TMDB key in Settings.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
