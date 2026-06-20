import { useEffect, useState } from 'react';
import { api } from '../api/client';
import Alert from './ui/Alert';
import FloatingInput from './ui/FloatingInput';
import Modal from './ui/Modal';
import PageHeader from './ui/PageHeader';

const empty = { full_name: '', email: '', phone: '' };

export default function Customers({ onDataChange }) {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(empty);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () =>
    api.getCustomers()
      .then(setCustomers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setForm(empty);
    setError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(empty);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.createCustomer(form);
      closeModal();
      setSuccess('Customer added successfully.');
      await load();
      onDataChange?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return;
    try {
      await api.deleteCustomer(id);
      setSuccess('Customer deleted successfully.');
      await load();
      onDataChange?.();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="People who shop with you."
        action={
          <button
            type="button"
            onClick={openAdd}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Add customer
          </button>
        }
      />

      {error && !modalOpen && <Alert type="error" message={error} onClose={() => setError('')} />}
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {loading ? (
        <p className="text-sm text-gray-500">Loading customers…</p>
      ) : customers.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-400">
          No customers yet. Add your first customer.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-2 py-2 text-left text-xs font-semibold tracking-wide text-gray-500">
                  NAME
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold tracking-wide text-gray-500">
                  EMAIL
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold tracking-wide text-gray-500">
                  PHONE
                </th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-2 py-2 font-semibold text-gray-900">{c.full_name}</td>
                  <td className="px-2 py-2 text-gray-700">{c.email}</td>
                  <td className="px-2 py-2 text-gray-700">{c.phone || '—'}</td>
                  <td className="px-2 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="font-semibold text-gray-900 hover:text-gray-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={closeModal} title="Add customer">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FloatingInput
            label="Full name"
            id="customer-name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            placeholder="Aiko Tanaka"
            required
          />
          <FloatingInput
            label="Email"
            id="customer-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            required
          />
          <FloatingInput
            label="Phone"
            id="customer-phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+1 555 0100"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Add customer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
