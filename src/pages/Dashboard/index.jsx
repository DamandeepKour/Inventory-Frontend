import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageHeader from '../../components/ui/PageHeader';
import PageStateMessage from '../../components/ui/PageStateMessage';
import { useRefresh } from '../../context/RefreshContext';

export default function Dashboard() {
  const { version } = useRefresh();
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const load = () => {
    setLoading(true);
    setLoadError('');
    Promise.all([api.getDashboard(), api.getProducts()])
      .then(([dashboard, products]) => {
        setStats(dashboard);
        setLowStock(products.filter((p) => p.quantity <= 5));
        setLoadError('');
      })
      .catch((e) => {
        setLoadError(e.message);
        setStats(null);
        setLowStock([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [version]);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="A snapshot of your store." />

      {loading ? (
        <LoadingSpinner label="Loading dashboard…" />
      ) : loadError ? (
        <PageStateMessage
          variant="error"
          title="Unable to load dashboard"
          message={loadError}
          actionLabel="Try again"
          onAction={load}
        />
      ) : !stats ? (
        <PageStateMessage
          variant="empty"
          title="No data available"
          message="Dashboard data could not be loaded. Check that the backend API is running."
          actionLabel="Retry"
          onAction={load}
        />
      ) : (
        <>
          <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'TOTAL PRODUCTS', value: stats.total_products },
              { label: 'TOTAL CUSTOMERS', value: stats.total_customers },
              { label: 'TOTAL ORDERS', value: stats.total_orders },
              { label: 'LOW STOCK', value: stats.low_stock_products },
            ].map((c) => (
              <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold tracking-wide text-gray-500">{c.label}</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{c.value}</p>
              </div>
            ))}
          </div>

          <div>
            <h2 className="mb-4 text-base font-semibold text-gray-900">Low stock items</h2>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {lowStock.length === 0 ? (
                <PageStateMessage
                  variant="empty"
                  title="No data available"
                  message="No low stock items at the moment."
                />
              ) : (
                lowStock.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between border-b border-gray-100 px-5 py-4 last:border-0"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{p.name}</p>
                      <p className="text-sm text-gray-500">{p.sku}</p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                      {p.quantity} left
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
