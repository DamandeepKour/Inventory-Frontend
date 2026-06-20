import { useCallback, useEffect, useState } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
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
import { validateProductForm } from '../../utils/validation';

const empty = { name: '', sku: '', price: '', quantity: '0' };

export default function Products() {
  const { refresh } = useRefresh();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);

  const validate = useCallback((values) => validateProductForm(values), []);
  const { fieldErrors, validate: runValidation, clearErrors, touchField } = useFormValidation(validate);

  const load = () => {
    setLoading(true);
    setLoadError('');
    return api.getProducts()
      .then((data) => {
        setProducts(data);
        setLoadError('');
      })
      .catch((e) => {
        setLoadError(e.message);
        setProducts([]);
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

  const openEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      quantity: String(product.quantity),
    });
    clearErrors();
    setModalOpen(true);
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
        name: form.name.trim(),
        sku: form.sku.trim(),
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity, 10),
      };
      if (editingId) {
        await api.updateProduct(editingId, payload);
        notifySuccess('Product updated successfully.');
      } else {
        await api.createProduct(payload);
        notifySuccess('Product added successfully.');
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
      await api.deleteProduct(deleteId);
      notifySuccess('Product deleted successfully.');
      setDeleteId(null);
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
        title="Products"
        subtitle="Manage your catalog."
        action={
          !loadError && (
            <Button type="button" onClick={openAdd}>
              Add product
            </Button>
          )
        }
      />

      {loading ? (
        <LoadingSpinner label="Loading products…" />
      ) : loadError ? (
        <PageStateMessage
          variant="error"
          title="Unable to load products"
          message={loadError}
          actionLabel="Try again"
          onAction={load}
        />
      ) : products.length === 0 ? (
        <PageStateMessage
          variant="empty"
          title="No data available"
          message="No products found. Add your first product to get started."
          actionLabel="Add product"
          onAction={openAdd}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100">
                <TableIndexHeader />
                <th className={tableThClass}>NAME</th>
                <th className={tableThClass}>SKU</th>
                <th className={tableThClass}>PRICE</th>
                <th className={tableThClass}>STOCK</th>
                <TableActionHeader />
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => (
                <tr key={p.id} className="border-b border-gray-100 transition hover:bg-gray-50/80 last:border-0">
                  <TableIndexCell index={idx + 1} />
                  <td className={`${tableTdClass} font-semibold text-gray-900`}>{p.name}</td>
                  <td className={`${tableTdClass} text-gray-700`}>{p.sku}</td>
                  <td className={`${tableTdClass} text-gray-700`}>${Number(p.price).toFixed(2)}</td>
                  <td className={`${tableTdClass} text-gray-700`}>{p.quantity}</td>
                  <TableActionCell>
                    <IconActionButton label="Edit product" variant="edit" onClick={() => openEdit(p)}>
                      <FiEdit2 className="h-4 w-4" />
                    </IconActionButton>
                    <IconActionButton label="Delete product" variant="danger" onClick={() => setDeleteId(p.id)}>
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

      <ConfirmDeleteModal
        open={!!deleteId}
        title="Delete product?"
        message="This product will be permanently removed from your catalog."
        loading={deleting}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
