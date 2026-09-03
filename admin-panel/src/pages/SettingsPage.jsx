import { useEffect, useState } from 'react';
import api from '../api';

function SettingsPage() {
  const [tmdbApiKey, setTmdbApiKey] = useState('');
  const [updateVersionCode, setUpdateVersionCode] = useState('');
  const [updateVersionName, setUpdateVersionName] = useState('');
  const [updateReleaseNotes, setUpdateReleaseNotes] = useState('');
  const [updateForceUpdate, setUpdateForceUpdate] = useState(false);
  const [updateDownloadUrl, setUpdateDownloadUrl] = useState('');
  const [updateSha256, setUpdateSha256] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        setTmdbApiKey(data.tmdb_api_key || '');
        setUpdateVersionCode(data.update_version_code || '');
        setUpdateVersionName(data.update_version_name || '');
        setUpdateReleaseNotes(data.update_release_notes || '');
        setUpdateForceUpdate(data.update_force_update === 'true');
        setUpdateDownloadUrl(data.update_download_url || '');
        setUpdateSha256(data.update_sha256 || '');
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
      await api.put('/settings', {
        tmdb_api_key: tmdbApiKey,
        update_version_code: updateVersionCode,
        update_version_name: updateVersionName,
        update_release_notes: updateReleaseNotes,
        update_force_update: updateForceUpdate,
        update_download_url: updateDownloadUrl,
        update_sha256: updateSha256,
      });
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

          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-lg font-semibold text-white">Android update</h3>
            <p className="mt-2 text-sm text-slate-400">The download URL and SHA-256 are managed manually.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-300">Version code</label>
              <input type="number" min="0" value={updateVersionCode} onChange={(e) => setUpdateVersionCode(e.target.value)} className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100" placeholder="12" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Version name</label>
              <input value={updateVersionName} onChange={(e) => setUpdateVersionName(e.target.value)} className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100" placeholder="2.1.0" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300">APK download URL</label>
            <input type="url" value={updateDownloadUrl} onChange={(e) => setUpdateDownloadUrl(e.target.value)} className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100" placeholder="https://cdn.example.com/app-release.apk" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300">APK SHA-256</label>
            <input value={updateSha256} onChange={(e) => setUpdateSha256(e.target.value)} className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100" placeholder="64-character SHA-256 hash" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300">Release notes</label>
            <textarea value={updateReleaseNotes} onChange={(e) => setUpdateReleaseNotes(e.target.value)} rows="4" className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100" placeholder="What changed in this release?" />
          </div>

          <label className="flex items-center gap-3 text-sm font-medium text-slate-300">
            <input type="checkbox" checked={updateForceUpdate} onChange={(e) => setUpdateForceUpdate(e.target.checked)} className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-accent" />
            Force update
          </label>

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
