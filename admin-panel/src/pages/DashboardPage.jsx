function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-soft">
        <h2 className="text-3xl font-semibold text-white">Dashboard</h2>
        <p className="mt-3 text-slate-400">Manage IPTV hosts, Shadowsocks proxies, and app settings from one place.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-soft">
          <p className="text-sm text-slate-400">Quick actions</p>
          <h3 className="mt-3 text-xl font-semibold text-white">Hosts</h3>
          <p className="mt-2 text-slate-400">View and manage your IPTV server host list.</p>
        </div>

        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-soft">
          <p className="text-sm text-slate-400">Proxy host</p>
          <h3 className="mt-3 text-xl font-semibold text-white">Proxies</h3>
          <p className="mt-2 text-slate-400">Add or update the proxy host URL used by the Android app.</p>
        </div>

        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-soft">
          <p className="text-sm text-slate-400">App integration</p>
          <h3 className="mt-3 text-xl font-semibold text-white">Settings</h3>
          <p className="mt-2 text-slate-400">Store your TMDB API key for the Android app.</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
