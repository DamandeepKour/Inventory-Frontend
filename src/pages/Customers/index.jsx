import { useCallback, useEffect, useState } from 'react';
import { FiEdit2, FiEye, FiTrash2 } from 'react-icons/fi';
import { api } from '../../api/client';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import FloatingInput from '../../components/ui/FloatingInput';
import { IconActionButton } from '../../components/ui/IconActionButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import { TableActionCell, TableActionHeader } from '../../components/ui/TableActions';
import { useRefresh } from '../../context/RefreshContext';
import { useFormValidation } from '../../hooks/useFormValidation';
import { validateCustomerForm } from '../../utils/validation';

const empty = { full_name: '', email: '', phone: '' };

export default function Customers() {
  const { refresh } = useRefresh();
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailCustomer, setDetailCustomer] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const validate = useCallback((values) => validateCustomerForm(values), []);
  const { fieldErrors, validate: runValidation, clearErrors, touchField } = useFormValidation(validate);

  const load = () =>
    api.getCustomers()
      .then(setCustomers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(empty);
    setError('');
    clearErrors();
    setModalOpen(true);
  };

  const openEdit = (customer) => {
    setEditingId(customer.id);
    setForm({
      full_name: customer.full_name,
      email: customer.email,
      phone: customer.phone || '',
    });
    setError('');
    clearErrors();
    setModalOpen(true);
  };

  const openView = async (id) => {
    setDetailLoading(true);
    setDetailCustomer(null);
    try {
      const customer = await api.getCustomer(id);
      setDetailCustomer(customer);
    } catch (e) {
      setError(e.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(empty);
    setError('');
    clearErrors();
  };

  const setField = (field, value) => {
    const next = { ...form, [field]: value };
    setForm(next);
    touchField(next, field);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!runValidation(form)) return;

    setSaving(true);
    setError('');
    try {
      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
      };
      if (editingId) {
        await api.updateCustomer(editingId, payload);
        setSuccess('Customer updated successfully.');
      } else {
        await api.createCustomer(payload);
        setSuccess('Customer added successfully.');
      }
      closeModal();
      await load();
      refresh();
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
      setDetailCustomer(null);
      await load();
      refresh();
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
          <Button type="button" onClick={openAdd}>
            Add customer
          </Button>
        }
      />

      {error && !modalOpen && !detailCustomer && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {loading ? (
        <LoadingSpinner label="Loading customers…" />
      ) : customers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center">
          <p className="text-sm font-medium text-gray-600">No customers yet</p>
          <p className="mt-1 text-sm text-gray-400">Add your first customer to get started.</p>
          <Button type="button" onClick={openAdd} className="mt-4">
            Add customer
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold tracking-wide text-gray-500">NAME</th>
                <th className="px-5 py-3 text-left text-xs font-semibold tracking-wide text-gray-500">EMAIL</th>
                <th className="px-5 py-3 text-left text-xs font-semibold tracking-wide text-gray-500">PHONE</th>
                <TableActionHeader />
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 transition hover:bg-gray-50/80 last:border-0">
                  <td className="px-5 py-4 font-semibold text-gray-900">{c.full_name}</td>
                  <td className="px-5 py-4 text-gray-700">{c.email}</td>
                  <td className="px-5 py-4 text-gray-700">{c.phone || '—'}</td>
                  <TableActionCell>
                    <IconActionButton label="View customer" onClick={() => openView(c.id)}>
                      <FiEye className="h-4 w-4" />
                    </IconActionButton>
                    <IconActionButton label="Edit customer" onClick={() => openEdit(c)}>
                      <FiEdit2 className="h-4 w-4" />
                    </IconActionButton>
                    <IconActionButton label="Delete customer" variant="danger" onClick={() => handleDelete(c.id)}>
                      <FiTrash2 className="h-4 w-4" />
                    </IconActionButton>
                  </TableActionCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editingId ? 'Edit customer' : 'Add customer'}>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FloatingInput
            label="Full name"
            id="customer-name"
            value={form.full_name}
            onChange={(e) => setField('full_name', e.target.value)}
            onBlur={() => touchField(form, 'full_name')}
            placeholder="Aiko Tanaka"
            error={fieldErrors.full_name}
            required
          />
          <FloatingInput
            label="Email"
            id="customer-email"
            type="email"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            onBlur={() => touchField(form, 'email')}
            placeholder="you@example.com"
            error={fieldErrors.email}
            required
          />
          <FloatingInput
            label="Phone"
            id="customer-phone"
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
            onBlur={() => touchField(form, 'phone')}
            placeholder="+1 555 0100"
            error={fieldErrors.phone}
          />
          {error && <Alert type="error" message={error} />}
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add customer'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={detailLoading || !!detailCustomer}
        onClose={() => setDetailCustomer(null)}
        title="Customer details"
      >
        {detailLoading ? (
          <LoadingSpinner label="Loading customer…" />
        ) : detailCustomer ? (
          <div className="space-y-4 text-sm">
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold tracking-wide text-gray-500">FULL NAME</p>
              <p className="mt-1 font-medium text-gray-900">{detailCustomer.full_name}</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold tracking-wide text-gray-500">EMAIL</p>
              <p className="mt-1 text-gray-700">{detailCustomer.email}</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold tracking-wide text-gray-500">PHONE</p>
              <p className="mt-1 text-gray-700">{detailCustomer.phone || '—'}</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold tracking-wide text-gray-500">JOINED</p>
              <p className="mt-1 text-gray-700">
                {new Date(detailCustomer.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <Button type="button" variant="secondary" onClick={() => setDetailCustomer(null)}>
                Close
              </Button>
              <Button
                type="button"
                onClick={() => {
                  openEdit(detailCustomer);
                  setDetailCustomer(null);
                }}
              >
                Edit
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
