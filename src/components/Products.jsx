import { useEffect, useState } from 'react';
import { api } from '../api/client';
import Alert from './ui/Alert';
import FloatingInput from './ui/FloatingInput';
import Modal from './ui/Modal';
import PageHeader from './ui/PageHeader';

const empty = { name: '', sku: '', price: '', quantity: '0' };

export default function Products({ onDataChange }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(empty);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        sku: form.sku,
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
      onDataChange?.();
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
      onDataChange?.();
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
          <button
            type="button"
            onClick={openAdd}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Add product
          </button>
        }
      />

      {error && !modalOpen && <Alert type="error" message={error} onClose={() => setError('')} />}
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {loading ? (
        <p className="text-sm text-gray-500">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-400">
          No products yet. Add your first product.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-white">
                <th className="px-2 py-2 text-left text-xs font-semibold tracking-wide text-gray-500">
                  NAME
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold tracking-wide text-gray-500">
                  SKU
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold tracking-wide text-gray-500">
                  PRICE
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold tracking-wide text-gray-500">
                  STOCK
                </th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-2 py-2 font-semibold text-gray-900">{p.name}</td>
                  <td className="px-2 py-2 text-gray-700">{p.sku}</td>
                  <td className="px-2 py-2 text-gray-700">${Number(p.price).toFixed(0)}</td>
                  <td className="px-2 py-2 text-gray-700">{p.quantity}</td>
                  <td className="px-2 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      className="mr-4 font-semibold text-gray-900 hover:text-gray-600"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
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

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId ? 'Edit product' : 'Add product'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FloatingInput
            label="Name"
            id="product-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Linen Shirt"
            required
          />
          <FloatingInput
            label="SKU"
            id="product-sku"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            placeholder="LS-001"
            required
          />
          <FloatingInput
            label="Price"
            id="product-price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="49"
            required
          />
          <FloatingInput
            label="Stock"
            id="product-stock"
            type="number"
            min="0"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            placeholder="24"
            required
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
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
