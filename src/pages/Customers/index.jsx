import { useCallback, useEffect, useState } from 'react';
import { FiEdit2, FiEye, FiTrash2 } from 'react-icons/fi';
import { api } from '../../api/client';
import Button from '../../components/ui/Button';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import FloatingInput from '../../components/ui/FloatingInput';
import { IconActionButton } from '../../components/ui/IconActionButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import PageStateMessage from '../../components/ui/PageStateMessage';
import { TableActionCell, TableActionHeader, TableIndexCell, TableIndexHeader, tableTdClass, tableThClass } from '../../components/ui/TableActions';
import { useRefresh } from '../../context/RefreshContext';
import { useFormValidation } from '../../hooks/useFormValidation';
import { notifyError, notifySuccess, notifyValidationErrors } from '../../utils/toast';
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
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);

  const validate = useCallback((values) => validateCustomerForm(values), []);
  const { fieldErrors, validate: runValidation, clearErrors, touchField } = useFormValidation(validate);

  const load = () => {
    setLoading(true);
    setLoadError('');
    return api.getCustomers()
      .then((data) => {
        setCustomers(data);
        setLoadError('');
      })
      .catch((e) => {
        setLoadError(e.message);
        setCustomers([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(empty);
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
      notifyError(e.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(empty);
    clearErrors();
  };

  const setField = (field, value) => {
    const next = { ...form, [field]: value };
    setForm(next);
    touchField(next, field);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { valid, errors } = runValidation(form);
    if (!valid) {
      notifyValidationErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
      };
      if (editingId) {
        await api.updateCustomer(editingId, payload);
        notifySuccess('Customer updated successfully.');
      } else {
        await api.createCustomer(payload);
        notifySuccess('Customer added successfully.');
      }
      closeModal();
      await load();
      refresh();
    } catch (err) {
      notifyError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.deleteCustomer(deleteId);
      notifySuccess('Customer deleted successfully.');
      setDeleteId(null);
      setDetailCustomer(null);
      await load();
      refresh();
    } catch (err) {
      notifyError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="People who shop with you."
        action={
          !loadError && (
            <Button type="button" onClick={openAdd}>
              Add customer
            </Button>
          )
        }
      />

      {loading ? (
        <LoadingSpinner label="Loading customers…" />
      ) : loadError ? (
        <PageStateMessage
          variant="error"
          title="Unable to load customers"
          message={loadError}
          actionLabel="Try again"
          onAction={load}
        />
      ) : customers.length === 0 ? (
        <PageStateMessage
          variant="empty"
          title="No data available"
          message="No customers found. Add your first customer to get started."
          actionLabel="Add customer"
          onAction={openAdd}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100">
                <TableIndexHeader />
                <th className={tableThClass}>NAME</th>
                <th className={tableThClass}>EMAIL</th>
                <th className={tableThClass}>PHONE</th>
                <TableActionHeader />
              </tr>
            </thead>
            <tbody>
              {customers.map((c, idx) => (
                <tr key={c.id} className="border-b border-gray-100 transition hover:bg-gray-50/80 last:border-0">
                  <TableIndexCell index={idx + 1} />
                  <td className={`${tableTdClass} font-semibold text-gray-900`}>{c.full_name}</td>
                  <td className={`${tableTdClass} text-gray-700`}>{c.email}</td>
                  <td className={`${tableTdClass} text-gray-700`}>{c.phone || '—'}</td>
                  <TableActionCell>
                    <IconActionButton label="View customer" variant="view" onClick={() => openView(c.id)}>
                      <FiEye className="h-4 w-4" />
                    </IconActionButton>
                    <IconActionButton label="Edit customer" variant="edit" onClick={() => openEdit(c)}>
                      <FiEdit2 className="h-4 w-4" />
                    </IconActionButton>
                    <IconActionButton label="Delete customer" variant="danger" onClick={() => setDeleteId(c.id)}>
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
              <Button type="button" variant="danger" onClick={() => setDeleteId(detailCustomer.id)}>
                Delete
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmDeleteModal
        open={!!deleteId}
        title="Delete customer?"
        message="This customer will be permanently removed from your store."
        loading={deleting}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
