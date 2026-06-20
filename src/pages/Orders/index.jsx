import { useEffect, useMemo, useState } from 'react';
import { FiEye, FiTrash2 } from 'react-icons/fi';
import { api } from '../../api/client';
import Button from '../../components/ui/Button';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import FieldError from '../../components/ui/FieldError';
import FloatingInput from '../../components/ui/FloatingInput';
import FloatingSelect from '../../components/ui/FloatingSelect';
import { IconActionButton } from '../../components/ui/IconActionButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import PageStateMessage from '../../components/ui/PageStateMessage';
import { TableActionCell, TableActionHeader, TableIndexCell, TableIndexHeader, tableTdClass, tableThClass } from '../../components/ui/TableActions';
import { useRefresh } from '../../context/RefreshContext';
import { notifyError, notifySuccess, notifyValidationErrors } from '../../utils/toast';
import { hasErrors, validateOrderForm } from '../../utils/validation';

export default function Orders() {
  const { refresh } = useRefresh();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [o, c, p] = await Promise.all([
        api.getOrders(),
        api.getCustomers(),
        api.getProducts(),
      ]);
      setOrders(o);
      setCustomers(c);
      setProducts(p);
      if (c.length && !customerId) setCustomerId(c[0].id);
      setLoadError('');
    } catch (e) {
      setLoadError(e.message);
      setOrders([]);
      setCustomers([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) return sum;
      return sum + Number(product.price) * item.quantity;
    }, 0);
  }, [items, products]);

  const productName = (id) => products.find((p) => p.id === id)?.name || '—';

  const productSku = (id) => products.find((p) => p.id === id)?.sku || '—';

  const orderSkus = (order) => {
    if (!order.items?.length) return '—';
    const skus = order.items
      .map((item) => products.find((p) => p.id === item.product_id)?.sku)
      .filter(Boolean);
    return skus.length ? skus.join(', ') : '—';
  };

  const revalidate = (nextCustomerId, nextItems) => {
    const errors = validateOrderForm(nextCustomerId, nextItems, products);
    setFormErrors(errors);
    return !hasErrors(errors);
  };

  const addItem = () => {
    if (!products.length) return;
    const nextItems = [...items, { product_id: products[0].id, quantity: 1 }];
    setItems(nextItems);
    revalidate(customerId, nextItems);
  };

  const updateItem = (idx, field, value) => {
    const nextItems = items.map((it, i) => (i === idx ? { ...it, [field]: value } : it));
    setItems(nextItems);
    revalidate(customerId, nextItems);
  };

  const removeItem = (idx) => {
    const nextItems = items.filter((_, i) => i !== idx);
    setItems(nextItems);
    revalidate(customerId, nextItems);
  };

  const resetForm = () => {
    setItems([]);
    setFormErrors({});
    if (customers.length) setCustomerId(customers[0].id);
  };

  const openDetail = async (orderId) => {
    setDetailLoading(true);
    setDetailOrder(null);
    try {
      const order = await api.getOrder(orderId);
      setDetailOrder(order);
    } catch (e) {
      notifyError(e.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.deleteOrder(deleteId);
      notifySuccess('Order deleted successfully.');
      setDeleteId(null);
      setDetailOrder(null);
      await load();
      refresh();
    } catch (e) {
      notifyError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateOrderForm(customerId, items, products);
    setFormErrors(errors);
    if (hasErrors(errors)) {
      notifyValidationErrors(errors);
      return;
    }

    setSaving(true);
    try {
      await api.createOrder({
        customer_id: customerId,
        items: items.map((it) => ({
          product_id: it.product_id,
          quantity: parseInt(it.quantity, 10),
        })),
      });
      resetForm();
      notifySuccess('Order created successfully.');
      await load();
      refresh();
    } catch (err) {
      notifyError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading orders…" />;
  }

  if (loadError) {
    return (
      <div>
        <PageHeader title="Orders" subtitle="Create and view customer orders." />
        <PageStateMessage
          variant="error"
          title="Unable to load orders"
          message={loadError}
          actionLabel="Try again"
          onAction={load}
        />
      </div>
    );
  }

  const itemFieldErrors = formErrors.itemErrors || {};

  return (
    <div>
      <PageHeader title="Orders" subtitle="Create and view customer orders." />

      <div className="max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Create order</h2>

        {customers.length === 0 ? (
          <PageStateMessage
            variant="empty"
            title="No data available"
            message="Add a customer before creating an order."
          />
        ) : products.length === 0 ? (
          <PageStateMessage
            variant="empty"
            title="No data available"
            message="Add products before creating an order."
          />
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <FloatingSelect
              label="Customer"
              id="order-customer"
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                revalidate(e.target.value, items);
              }}
              error={formErrors.customer_id}
              required
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </FloatingSelect>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-xs font-semibold tracking-wide text-gray-500">ITEMS</p>
              <button
                type="button"
                onClick={addItem}
                className="text-sm font-semibold text-gray-900 transition hover:text-gray-600"
              >
                + Add item
              </button>
            </div>

            {formErrors.items && (
              <div className="mt-2">
                <FieldError message={formErrors.items} />
              </div>
            )}

            {items.length === 0 ? (
              <div className="mt-3 rounded-xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-400">
                No items added. Click &ldquo;Add item&rdquo; to begin.
              </div>
            ) : (
              <div className="mt-3 space-y-4">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-gray-100 bg-gray-50/50 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                      <div className="flex-1">
                        <FloatingSelect
                          label="Product"
                          id={`order-product-${idx}`}
                          value={item.product_id}
                          onChange={(e) => updateItem(idx, 'product_id', e.target.value)}
                          error={itemFieldErrors[idx]?.product_id}
                          required
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} — ${Number(p.price).toFixed(2)} (stock: {p.quantity})
                            </option>
                          ))}
                        </FloatingSelect>
                      </div>
                      <div className="w-full sm:w-28">
                        <FloatingInput
                          label="Qty"
                          id={`order-qty-${idx}`}
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                          error={itemFieldErrors[idx]?.quantity}
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="self-center text-sm font-medium text-gray-500 transition hover:text-red-600 sm:mt-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="font-medium text-gray-700">Total</span>
              <span className="text-lg font-semibold text-gray-900">${total.toFixed(2)}</span>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={resetForm}>
                Clear
              </Button>
              <Button type="submit" disabled={saving || items.length === 0}>
                {saving ? 'Creating…' : 'Create order'}
              </Button>
            </div>
          </form>
        )}
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Recent orders</h2>
        {orders.length === 0 ? (
          <PageStateMessage
            variant="empty"
            title="No data available"
            message="No orders yet. Create your first order above."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-100">
                  <TableIndexHeader />
                  <th className={tableThClass}>SKU</th>
                  <th className={tableThClass}>CUSTOMER</th>
                  <th className={tableThClass}>TOTAL</th>
                  <th className={tableThClass}>DATE</th>
                  <TableActionHeader />
                </tr>
              </thead>
              <tbody>
                {orders.map((o, idx) => {
                  const customer = customers.find((c) => c.id === o.customer_id);
                  return (
                    <tr key={o.id} className="border-b border-gray-100 transition hover:bg-gray-50/80 last:border-0">
                      <TableIndexCell index={idx + 1} />
                      <td className={`${tableTdClass} font-medium text-gray-900`}>{orderSkus(o)}</td>
                      <td className={`${tableTdClass} text-gray-700`}>{customer?.full_name || '—'}</td>
                      <td className={`${tableTdClass} text-gray-700`}>${Number(o.total_amount).toFixed(2)}</td>
                      <td className={`${tableTdClass} text-gray-700`}>{new Date(o.created_at).toLocaleDateString()}</td>
                      <TableActionCell>
                        <IconActionButton label="View order" variant="view" onClick={() => openDetail(o.id)}>
                          <FiEye className="h-4 w-4" />
                        </IconActionButton>
                        <IconActionButton label="Delete order" variant="danger" onClick={() => setDeleteId(o.id)}>
                          <FiTrash2 className="h-4 w-4" />
                        </IconActionButton>
                      </TableActionCell>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={detailLoading || !!detailOrder} onClose={() => setDetailOrder(null)} title="Order details">
        {detailLoading ? (
          <LoadingSpinner label="Loading order…" />
        ) : detailOrder ? (
          <div className="space-y-4 text-sm">
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold tracking-wide text-gray-500">CUSTOMER</p>
              <p className="mt-1 font-medium text-gray-900">
                {customers.find((c) => c.id === detailOrder.customer_id)?.full_name || '—'}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold tracking-wide text-gray-500">DATE</p>
              <p className="mt-1 text-gray-700">{new Date(detailOrder.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500">ITEMS</p>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                {detailOrder.items?.map((item, idx) => (
                  <div key={item.id} className="flex items-center justify-between border-b border-gray-100 px-4 py-3 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">
                        <span className="text-gray-500">#{idx + 1}</span>{' '}
                        {productName(item.product_id)}
                      </p>
                      <p className="text-gray-500">
                        SKU: {productSku(item.product_id)} · Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-gray-900">${(Number(item.price) * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-lg font-semibold text-gray-900">${Number(detailOrder.total_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setDetailOrder(null)}>
                Close
              </Button>
              <Button type="button" variant="danger" onClick={() => setDeleteId(detailOrder.id)}>
                Delete order
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmDeleteModal
        open={!!deleteId}
        title="Delete order?"
        message="This order will be cancelled and stock will be restored to inventory."
        loading={deleting}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
