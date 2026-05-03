import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkout } from '../api/endpoints.js';
import { useNotification } from '../hooks/useNotification.js';
import { useCart } from '../hooks/useCart.js';

export default function Checkout() {
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const { notify } = useNotification();
  const { refreshCount } = useCart();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      notify('Please enter a shipping address', 'error');
      return;
    }
    setLoading(true);
    try {
      await checkout(shippingAddress.trim());
      await refreshCount();
      notify('Order placed successfully!', 'success');
      navigate('/orders');
    } catch (err) {
      notify(err.message ?? 'Failed to place order', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-1 text-sm text-gray-500">Complete your order</p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">Shipping Information</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label htmlFor="shippingAddress" className="mb-1.5 block text-sm font-medium text-gray-700">
                Shipping Address
              </label>
              <textarea
                id="shippingAddress"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows={4}
                placeholder="123 Main St, City, State, ZIP"
                required
                disabled={loading}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-indigo-600 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg disabled:opacity-60"
            >
              {loading ? 'Placing order…' : 'Place Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
