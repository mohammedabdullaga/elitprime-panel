import { useEffect, useState } from 'react';
import api from '../api';

function SettingsPage() {
  const [tmdbApiKey, setTmdbApiKey] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        setTmdbApiKey(data.tmdb_api_key || '');
      } catch (err) {
        console.error(err);
      }
    };
    loadSettings();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('');
    try {
      await api.put('/settings', { tmdb_api_key: tmdbApiKey });
      setStatus('Settings saved successfully.');
    } catch (err) {
      setStatus('Unable to save settings.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-soft">
        <h2 className="text-2xl font-semibold text-white">Settings</h2>
        <p className="mt-2 text-slate-400">Store your TMDB API key for the Android IPTV app.</p>
      </div>

      <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-soft sm:w-2/3">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300">TMDB API Key</label>
            <input
              value={tmdbApiKey}
              onChange={(e) => setTmdbApiKey(e.target.value)}
              className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100"
              placeholder="Enter your TMDB API key"
            />
          </div>

          <button type="submit" className="rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500">
            Save Settings
          </button>

          {status && <p className="text-sm text-slate-300">{status}</p>}
        </form>
      </div>
    </div>
  );
}

export default SettingsPage;
