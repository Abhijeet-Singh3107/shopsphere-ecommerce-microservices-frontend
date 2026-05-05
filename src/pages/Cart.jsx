import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCart, updateCartItem, removeCartItem, clearCart } from '../api/endpoints.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { useNotification } from '../hooks/useNotification.js';
import { useCart } from '../hooks/useCart.js';
import { formatINR } from '../utils/currency.js';

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { notify } = useNotification();
  const { refreshCount } = useCart();

  const fetchCart = async () => {
    try {
      const data = await getCart();
      setCart(data);
    } catch (err) {
      notify(err.message ?? 'Failed to load cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const handleQuantityChange = async (itemId, qty) => {
    if (qty < 1) return;
    setUpdating(true);
    try {
      await updateCartItem(itemId, qty);
      await fetchCart();
      await refreshCount();
    } catch (err) {
      notify(err.message ?? 'Failed to update item', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async (itemId) => {
    setUpdating(true);
    try {
      await removeCartItem(itemId);
      await fetchCart();
      await refreshCount();
    } catch (err) {
      notify(err.message ?? 'Failed to remove item', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Clear all items from your cart?')) return;
    setUpdating(true);
    try {
      await clearCart();
      await fetchCart();
      await refreshCount();
    } catch (err) {
      notify(err.message ?? 'Failed to clear cart', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const items = cart?.items ?? [];
  const totalAmount = cart?.totalAmount ?? 0;
  const formattedTotal = formatINR(totalAmount);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          {items.length > 0 && <p className="mt-1 text-sm text-gray-500">{items.length} {items.length === 1 ? 'item' : 'items'}</p>}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 py-20 text-center">
            <p className="mb-2 text-lg font-semibold text-gray-700">Your cart is empty</p>
            <p className="mb-6 text-sm text-gray-500">Add some products to get started.</p>
            <Link to="/products" className="inline-block rounded-full bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 transition-colors">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* Items */}
            <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Product</th>
                    <th className="px-5 py-4 text-center">Qty</th>
                    <th className="px-5 py-4 text-right">Price</th>
                    <th className="px-5 py-4 text-right">Subtotal</th>
                    <th className="px-5 py-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <CartRow key={item.id} item={item} disabled={updating} onQuantityChange={handleQuantityChange} onRemove={handleRemove} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:w-72 shrink-0">
              <h2 className="mb-4 text-base font-semibold text-gray-900">Order Summary</h2>
              <div className="mb-4 flex justify-between text-sm text-gray-600">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-semibold text-gray-900">{formattedTotal}</span>
              </div>
              <div className="mb-6 flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
              <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="mb-6 border-t border-gray-100 pt-4 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span className="text-lg font-bold text-sky-600">{formattedTotal}</span>
              </div>
              <Link to="/checkout" className="block w-full rounded-full bg-sky-600 py-3 text-center text-sm font-semibold text-white hover:bg-sky-700 transition-colors">
                Proceed to Checkout
              </Link>
              <button
                onClick={handleClearCart}
                disabled={updating}
                className="mt-3 block w-full rounded-full border border-gray-200 py-2.5 text-center text-sm text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Clear Cart
              </button>
              <Link
                to="/products"
                aria-label="Continue shopping"
                className="mt-3 block w-full rounded-full border border-sky-200 py-2.5 text-center text-sm font-semibold text-sky-600 hover:bg-sky-50 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CartRow({ item, disabled, onQuantityChange, onRemove }) {
  const subtotal = formatINR(item.price * item.quantity);
  const unitPrice = formatINR(item.price);

  return (
    <tr className="bg-white hover:bg-gray-50">
      <td className="px-5 py-4 font-medium text-gray-900">{item.productName}</td>
      <td className="px-5 py-4 text-center">
        <div className="inline-flex items-center gap-1">
          <button
            onClick={() => onQuantityChange(item.id, item.quantity - 1)}
            disabled={disabled || item.quantity <= 1}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
          <button
            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
            disabled={disabled}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
          >
            +
          </button>
        </div>
      </td>
      <td className="px-5 py-4 text-right text-gray-500">{unitPrice}</td>
      <td className="px-5 py-4 text-right font-semibold text-gray-900">{subtotal}</td>
      <td className="px-5 py-4 text-right">
        <button onClick={() => onRemove(item.id)} disabled={disabled} className="text-sm text-red-400 hover:text-red-600 disabled:opacity-50">
          Remove
        </button>
      </td>
    </tr>
  );
}
