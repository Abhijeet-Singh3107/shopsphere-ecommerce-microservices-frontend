import { useEffect, useState } from 'react';
import { getAdminOrders, getAdminOrderById, updateOrderStatus } from '../../api/endpoints.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { useNotification } from '../../hooks/useNotification.js';
import { formatINR } from '../../utils/currency.js';

const ORDER_STATUSES = ['DRAFT', 'PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PAID: 'bg-blue-100 text-blue-700',
  PACKED: 'bg-yellow-100 text-yellow-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const { notify } = useNotification();

  const load = (status = statusFilter) => {
    setLoading(true);
    getAdminOrders(status || undefined)
      .then((data) => setOrders(data ?? []))
      .catch((err) => notify(err.message ?? 'Failed to load orders', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleFilterChange = (e) => {
    const val = e.target.value;
    setStatusFilter(val);
    setSelectedOrder(null);
    load(val);
  };

  const handleRowClick = (order) => {
    setDetailLoading(true);
    getAdminOrderById(order.id)
      .then(setSelectedOrder)
      .catch((err) => notify(err.message ?? 'Failed to load order', 'error'))
      .finally(() => setDetailLoading(false));
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      notify('Order status updated', 'success');
      // refresh detail and list
      const updated = await getAdminOrderById(orderId);
      setSelectedOrder(updated);
      load();
    } catch (err) {
      notify(err.message ?? 'Failed to update status', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Orders</h1>

      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Filter by status:</label>
        <select
          value={statusFilter}
          onChange={handleFilterChange}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-sky-500 focus:outline-none"
        >
          <option value="">All</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-6">
        {/* Orders table */}
        <div className="flex-1 overflow-hidden rounded-lg border border-gray-200">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => handleRowClick(order)}
                    className={`cursor-pointer bg-white hover:bg-sky-50 ${selectedOrder?.id === order.id ? 'bg-sky-50' : ''}`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{order.id}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatINR(order.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Order detail panel */}
        {(selectedOrder || detailLoading) && (
          <div className="w-80 shrink-0 rounded-lg border border-gray-200 bg-white p-5">
            {detailLoading ? (
              <LoadingSpinner />
            ) : (
              <OrderDetail order={selectedOrder} onStatusUpdate={handleStatusUpdate} onClose={() => setSelectedOrder(null)} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderDetail({ order, onStatusUpdate, onClose }) {
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async (e) => {
    setUpdating(true);
    try {
      await onStatusUpdate(order.id, e.target.value);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Order Detail</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <p className="mb-1 font-mono text-xs text-gray-500">{order.id}</p>
      <p className="mb-3 text-sm text-gray-700">
        <span className="font-medium">Shipping:</span> {order.shippingAddress}
      </p>

      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-gray-600">Update Status</label>
        <select
          value={order.status}
          onChange={handleUpdate}
          disabled={updating}
          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-sky-500 focus:outline-none disabled:opacity-50"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Items</h3>
      <ul className="space-y-2">
        {(order.items ?? []).map((item, i) => (
          <li key={i} className="flex justify-between text-sm text-gray-700">
            <span>{item.productName} × {item.quantity}</span>
            <span>{formatINR(item.price)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 border-t border-gray-100 pt-3 text-right text-sm font-semibold text-gray-900">
        Total: {formatINR(order.totalAmount)}
      </div>
    </div>
  );
}
