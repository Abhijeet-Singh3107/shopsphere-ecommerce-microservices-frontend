import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrderById, cancelOrder } from '../api/endpoints.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { useNotification } from '../hooks/useNotification.js';
import { formatINR } from '../utils/currency.js';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const { notify } = useNotification();

  useEffect(() => {
    getOrderById(id)
      .then(setOrder)
      .catch((err) => notify(err.message ?? 'Failed to load order', 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelOrder(id);
      setOrder((prev) => ({ ...prev, status: 'CANCELLED' }));
      notify('Order cancelled successfully', 'success');
    } catch (err) {
      notify(err.message ?? 'Failed to cancel order', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!order) return <p className="p-8 text-center text-gray-500">Order not found.</p>;

  const formattedTotal = formatINR(order.totalAmount);

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Order Details</h1>

      {/* Order summary */}
      <div className="mb-6 rounded-lg border border-gray-200 p-6">
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Order ID</dt>
            <dd className="mt-1 font-mono text-xs text-gray-700">{order.id}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status</dt>
            <dd className="mt-1">
              <StatusBadge status={order.status} />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total</dt>
            <dd className="mt-1 font-semibold text-gray-900">{formattedTotal}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Date</dt>
            <dd className="mt-1 text-gray-700">{formattedDate}</dd>
          </div>
        </dl>

        {order.shippingAddress && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Shipping Address</dt>
            <dd className="mt-1 text-sm text-gray-700">{order.shippingAddress}</dd>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="mb-6 overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3 text-center">Qty</th>
              <th className="px-4 py-3 text-right">Unit Price</th>
              <th className="px-4 py-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(order.items ?? []).map((item, idx) => {
              const unitPrice = formatINR(item.price);
              const subtotal = formatINR(item.price * item.quantity);
              return (
                <tr key={item.productId ?? idx} className="bg-white">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.productName}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{unitPrice}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{subtotal}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cancel button — only shown for DRAFT orders */}
      {order.status === 'DRAFT' && (
        <div className="flex justify-end">
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {cancelling ? 'Cancelling…' : 'Cancel Order'}
          </button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    DRAFT: 'bg-gray-100 text-gray-700',
    PAID: 'bg-blue-100 text-blue-700',
    PACKED: 'bg-yellow-100 text-yellow-700',
    SHIPPED: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${colors[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}
