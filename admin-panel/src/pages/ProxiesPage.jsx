import { useEffect, useState } from 'react';
import api from '../api';
import Modal from '../components/Modal';

const emptyProxy = { host: '' };

function ProxiesPage() {
  const [proxies, setProxies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeProxy, setActiveProxy] = useState(emptyProxy);
  const [editId, setEditId] = useState(null);

  const loadProxies = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/proxies');
      setProxies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProxies();
  }, []);

  const openAdd = () => {
    setEditId(null);
    setActiveProxy(emptyProxy);
    setModalOpen(true);
  };

  const openEdit = (proxy) => {
    setEditId(proxy.id);
    setActiveProxy({ host: proxy.host });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this proxy?')) return;
    await api.delete(`/proxies/${id}`);
    loadProxies();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!activeProxy.host) return;

    if (editId) {
      await api.put(`/proxies/${editId}`, activeProxy);
    } else {
      await api.post('/proxies', activeProxy);
    }

    setModalOpen(false);
    loadProxies();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Proxies</h2>
          <p className="mt-2 text-slate-400">Manage the proxy host URL for the Android app.</p>
        </div>
        <button type="button" onClick={openAdd} className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500">
          Add Proxy Host
        </button>
      </div>

      <div className="rounded-3xl border border-slate-700 bg-slate-900 shadow-soft">
        {/* Mobile stacked cards */}
        <div className="md:hidden space-y-4 p-4">
          {proxies.map((proxy) => (
            <div key={proxy.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm text-slate-400">Proxy Host</div>
                  <div className="mt-1 text-sm text-slate-100 break-words">{proxy.host}</div>
                </div>
                <div className="ml-4 flex-shrink-0 flex flex-col gap-2">
                  <button onClick={() => openEdit(proxy)} className="rounded-xl bg-slate-800 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(proxy.id)} className="rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500">
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
                <th className="px-6 py-4 text-sm font-semibold text-slate-300">Proxy Host</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="2" className="px-6 py-8 text-center text-slate-400">Loading proxies...</td>
                </tr>
              ) : proxies.length === 0 ? (
                <tr>
                  <td colSpan="2" className="px-6 py-8 text-center text-slate-400">No proxy host configured yet.</td>
                </tr>
              ) : (
                proxies.map((proxy) => (
                  <tr key={proxy.id} className="hover:bg-slate-950/50">
                    <td className="px-6 py-4 text-sm text-slate-200">{proxy.host}</td>
                    <td className="px-6 py-4 text-sm text-slate-200">
                      <button type="button" onClick={() => openEdit(proxy)} className="mr-2 rounded-xl bg-slate-800 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700">
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDelete(proxy.id)} className="rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500">
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

      <Modal isOpen={modalOpen} title={editId ? 'Edit Proxy Host' : 'Add Proxy Host'} onClose={() => setModalOpen(false)}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-300">Proxy Host URL</label>
            <input
              value={activeProxy.host}
              onChange={(e) => setActiveProxy({ host: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100"
              placeholder="https://proxy.example.com"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800">
              Cancel
            </button>
            <button type="submit" className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500">
              Save Proxy Host
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ProxiesPage;
