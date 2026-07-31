import { useEffect, useState } from 'react';
import api from '../api';
import Modal from '../components/Modal';

const emptyHost = { url: '', status: 'active', priority: 0 };

function HostsPage() {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeHost, setActiveHost] = useState(emptyHost);
  const [editId, setEditId] = useState(null);

  const loadHosts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/hosts');
      setHosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHosts();
  }, []);

  const openAdd = () => {
    setEditId(null);
    setActiveHost(emptyHost);
    setModalOpen(true);
  };

  const openEdit = (host) => {
    setEditId(host.id);
    setActiveHost({ url: host.url, status: host.status, priority: host.priority });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this host?')) return;
    await api.delete(`/hosts/${id}`);
    loadHosts();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!activeHost.url) return;

    if (editId) {
      await api.put(`/hosts/${editId}`, activeHost);
    } else {
      await api.post('/hosts', activeHost);
    }

    setModalOpen(false);
    loadHosts();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Hosts</h2>
          <p className="mt-2 text-slate-400">Manage IPTV server hosts in priority order.</p>
        </div>
        <button type="button" onClick={openAdd} className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500">
          Add Host
        </button>
      </div>

      <div className="rounded-3xl border border-slate-700 bg-slate-900 shadow-soft">
        {/* Mobile stacked cards */}
        <div className="md:hidden space-y-4 p-4">
          {hosts.map((host) => (
            <div key={host.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm text-slate-400">URL</div>
                  <div className="mt-1 text-sm text-slate-100 break-words">{host.url}</div>
                  <div className="mt-2 text-sm text-slate-400">Status</div>
                  <div className="mt-1 text-sm text-slate-100">{host.status}</div>
                  <div className="mt-2 text-sm text-slate-400">Priority</div>
                  <div className="mt-1 text-sm text-slate-100">{host.priority}</div>
                </div>
                <div className="ml-4 flex-shrink-0 flex flex-col gap-3 w-36 sm:w-auto">
                  <button onClick={() => openEdit(host)} className="w-full sm:w-auto rounded-xl bg-slate-800 px-3 py-3 text-base font-medium text-slate-100 hover:bg-slate-700">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(host.id)} className="w-full sm:w-auto rounded-xl bg-red-600 px-3 py-3 text-base font-medium text-white hover:bg-red-500">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700 text-left">
          <thead className="bg-slate-950/80">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-300">URL</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-300">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-300">Priority</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-slate-400">Loading hosts...</td>
              </tr>
            ) : hosts.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-slate-400">No hosts configured yet.</td>
              </tr>
            ) : (
              hosts.map((host) => (
                <tr key={host.id} className="hover:bg-slate-950/50">
                  <td className="px-6 py-4 text-sm text-slate-200">{host.url}</td>
                  <td className="px-6 py-4 text-sm text-slate-200">{host.status}</td>
                  <td className="px-6 py-4 text-sm text-slate-200">{host.priority}</td>
                  <td className="px-6 py-4 text-sm text-slate-200">
                    <button type="button" onClick={() => openEdit(host)} className="mr-2 rounded-xl bg-slate-800 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(host.id)} className="rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} title={editId ? 'Edit Host' : 'Add Host'} onClose={() => setModalOpen(false)}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-300">URL</label>
            <input
              value={activeHost.url}
              onChange={(e) => setActiveHost({ ...activeHost, url: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100"
              placeholder="https://example.com/playlist.m3u"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-300">Status</label>
              <select
                value={activeHost.status}
                onChange={(e) => setActiveHost({ ...activeHost, status: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100"
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300">Priority</label>
              <input
                type="number"
                value={activeHost.priority}
                onChange={(e) => setActiveHost({ ...activeHost, priority: Number(e.target.value) })}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="w-full sm:w-auto rounded-2xl border border-slate-700 px-5 py-3 text-base font-semibold text-slate-200 hover:bg-slate-800">
              Cancel
            </button>
            <button type="submit" className="w-full sm:w-auto rounded-2xl bg-accent px-5 py-3 text-base font-semibold text-white hover:bg-blue-500">
              Save Host
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default HostsPage;
