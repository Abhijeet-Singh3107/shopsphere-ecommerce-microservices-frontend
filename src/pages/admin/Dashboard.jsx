import { useEffect, useState } from 'react';
import { getDashboard } from '../../api/endpoints.js';
import StatCard from '../../components/admin/StatCard.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { useNotification } from '../../hooks/useNotification.js';
import { formatINR } from '../../utils/currency.js';

const STATS = [
  { key: 'totalOrders',     label: 'Total Orders' },
  { key: 'totalProducts',   label: 'Total Products' },
  { key: 'totalRevenue',    label: 'Total Revenue', currency: true },
  { key: 'paidOrders',      label: 'Paid Orders' },
  { key: 'pendingOrders',   label: 'Pending Orders' },
  { key: 'shippedOrders',   label: 'Shipped Orders' },
  { key: 'deliveredOrders', label: 'Delivered Orders' },
  { key: 'cancelledOrders', label: 'Cancelled Orders' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { notify } = useNotification();

  const load = () => {
    setLoading(true);
    getDashboard()
      .then(setStats)
      .catch((err) => notify(err.message ?? 'Failed to load dashboard', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={load}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map(({ key, label, currency }) => (
            <StatCard
              key={key}
              label={label}
              value={currency ? formatINR(stats?.[key] ?? 0) : (stats?.[key] ?? 0)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
