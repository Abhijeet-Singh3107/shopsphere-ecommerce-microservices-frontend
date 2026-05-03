import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../api/endpoints.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { useNotification } from '../hooks/useNotification.js';
import { formatINR } from '../utils/currency.js';

const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PAID: 'bg-blue-100 text-blue-700',
  PACKED: 'bg-yellow-100 text-yellow-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notify } = useNotification();

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch((err) => notify(err.message ?? 'Failed to load orders', 'error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-1 text-sm text-gray-500">Track and manage your purchases</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {loading ? (
          <LoadingSpinner />
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 py-20 text-center">
            <p className="mb-2 text-lg font-semibold text-gray-700">No orders yet</p>
            <p className="mb-6 text-sm text-gray-500">Start shopping to see your orders here.</p>
            <Link to="/products" className="inline-block rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-4">Order ID</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Total</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => {
                  const formattedTotal = formatINR(order.totalAmount);
                  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                  return (
                    <tr key={order.id} className="bg-white hover:bg-gray-50">
                      <td className="px-5 py-4 font-mono text-xs text-gray-500">#{order.id}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-gray-900">{formattedTotal}</td>
                      <td className="px-5 py-4 text-gray-500">{formattedDate}</td>
                      <td className="px-5 py-4 text-right">
                        <Link to={`/orders/${order.id}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
