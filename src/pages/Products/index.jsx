import { useCallback, useEffect, useState } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
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
import { validateProductForm } from '../../utils/validation';

const empty = { name: '', sku: '', price: '', quantity: '0' };

export default function Products() {
  const { refresh } = useRefresh();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const validate = useCallback((values) => validateProductForm(values), []);
  const { fieldErrors, validate: runValidation, clearErrors, touchField } = useFormValidation(validate);

  const load = () =>
    api.getProducts()
      .then(setProducts)
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

  const openEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      quantity: String(product.quantity),
    });
    setError('');
    clearErrors();
    setModalOpen(true);
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
        name: form.name.trim(),
        sku: form.sku.trim(),
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity, 10),
      };
      if (editingId) {
        await api.updateProduct(editingId, payload);
      } else {
        await api.createProduct(payload);
      }
      closeModal();
      setSuccess(editingId ? 'Product updated successfully.' : 'Product added successfully.');
      await load();
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.deleteProduct(id);
      setSuccess('Product deleted successfully.');
      await load();
      refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Manage your catalog."
        action={
          <Button type="button" onClick={openAdd}>
            Add product
          </Button>
        }
      />

      {error && !modalOpen && <Alert type="error" message={error} onClose={() => setError('')} />}
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {loading ? (
        <LoadingSpinner label="Loading products…" />
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center">
          <p className="text-sm font-medium text-gray-600">No products yet</p>
          <p className="mt-1 text-sm text-gray-400">Add your first product to get started.</p>
          <Button type="button" onClick={openAdd} className="mt-4">
            Add product
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold tracking-wide text-gray-500">NAME</th>
                <th className="px-5 py-3 text-left text-xs font-semibold tracking-wide text-gray-500">SKU</th>
                <th className="px-5 py-3 text-left text-xs font-semibold tracking-wide text-gray-500">PRICE</th>
                <th className="px-5 py-3 text-left text-xs font-semibold tracking-wide text-gray-500">STOCK</th>
                <TableActionHeader />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 transition hover:bg-gray-50/80 last:border-0">
                  <td className="px-5 py-4 font-semibold text-gray-900">{p.name}</td>
                  <td className="px-5 py-4 text-gray-700">{p.sku}</td>
                  <td className="px-5 py-4 text-gray-700">${Number(p.price).toFixed(2)}</td>
                  <td className="px-5 py-4 text-gray-700">{p.quantity}</td>
                  <TableActionCell>
                    <IconActionButton label="Edit product" onClick={() => openEdit(p)}>
                      <FiEdit2 className="h-4 w-4" />
                    </IconActionButton>
                    <IconActionButton label="Delete product" variant="danger" onClick={() => handleDelete(p.id)}>
                      <FiTrash2 className="h-4 w-4" />
                    </IconActionButton>
                  </TableActionCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editingId ? 'Edit product' : 'Add product'}>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FloatingInput
            label="Name"
            id="product-name"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            onBlur={() => touchField(form, 'name')}
            placeholder="Linen Shirt"
            error={fieldErrors.name}
            required
          />
          <FloatingInput
            label="SKU"
            id="product-sku"
            value={form.sku}
            onChange={(e) => setField('sku', e.target.value)}
            onBlur={() => touchField(form, 'sku')}
            placeholder="LS-001"
            error={fieldErrors.sku}
            required
          />
          <FloatingInput
            label="Price"
            id="product-price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => setField('price', e.target.value)}
            onBlur={() => touchField(form, 'price')}
            placeholder="49.00"
            error={fieldErrors.price}
            required
          />
          <FloatingInput
            label="Stock"
            id="product-stock"
            type="number"
            min="0"
            step="1"
            value={form.quantity}
            onChange={(e) => setField('quantity', e.target.value)}
            onBlur={() => touchField(form, 'quantity')}
            placeholder="24"
            error={fieldErrors.quantity}
            required
          />
          {error && <Alert type="error" message={error} />}
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
