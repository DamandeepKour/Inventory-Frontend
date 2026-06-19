import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageHeader from '../../components/ui/PageHeader';
import { useRefresh } from '../../context/RefreshContext';

export default function Dashboard() {
  const { version } = useRefresh();
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getDashboard(), api.getProducts()])
      .then(([dashboard, products]) => {
        setStats(dashboard);
        setLowStock(products.filter((p) => p.quantity <= 5));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [version]);

  if (loading) {
    return <LoadingSpinner label="Loading dashboard…" />;
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  const cards = [
    { label: 'TOTAL PRODUCTS', value: stats.total_products },
    { label: 'TOTAL CUSTOMERS', value: stats.total_customers },
    { label: 'TOTAL ORDERS', value: stats.total_orders },
    { label: 'LOW STOCK', value: stats.low_stock_products },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="A snapshot of your store." />

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
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
            <p className="px-5 py-8 text-center text-sm text-gray-400">No low stock items.</p>
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
    </div>
  );
}
