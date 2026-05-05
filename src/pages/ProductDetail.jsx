import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, addCartItem } from '../api/endpoints.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { useNotification } from '../hooks/useNotification.js';
import { useCart } from '../hooks/useCart.js';
import { useAuth } from '../hooks/useAuth.js';
import { formatINR } from '../utils/currency.js';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const { notify } = useNotification();
  const { refreshCount } = useCart();
  const { token } = useAuth();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProductById(id)
      .then((data) => { if (!cancelled) setProduct(data); })
      .catch((err) => { if (!cancelled) notify(err.message ?? 'Failed to load product', 'error'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await addCartItem(product.id, 1);
      await refreshCount();
      notify('Added to cart', 'success');
    } catch (err) {
      notify(err.message ?? 'Failed to add to cart', 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!product) return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="text-gray-500">Product not found.</p>
      <Link to="/products" className="mt-4 inline-block text-sm text-sky-600 hover:underline">Back to products</Link>
    </div>
  );

  const formattedPrice = formatINR(product.price);
  const inStock = product.stock > 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-4 py-3 text-sm text-gray-500">
          <Link to="/" className="hover:text-sky-600">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-sky-600">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800 font-medium">{product.name}</span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex flex-col md:flex-row">
            {/* Image */}
            <div className="relative md:w-1/2">
              <div className="aspect-square w-full overflow-hidden bg-gray-100">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              {product.featured && (
                <span className="absolute top-4 left-4 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-900">
                  Featured
                </span>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-1 flex-col p-8 md:p-10">
              {product.categoryName && (
                <span className="mb-2 text-xs font-bold uppercase tracking-widest text-sky-500">
                  {product.categoryName}
                </span>
              )}
              <h1 className="mb-4 text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>

              <div className="mb-6 flex items-baseline gap-3">
                <span className="text-4xl font-extrabold text-gray-900">{formattedPrice}</span>
              </div>

              {product.description && (
                <p className="mb-6 text-gray-600 leading-relaxed">{product.description}</p>
              )}

              {/* Stock indicator */}
              <div className="mb-6 flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-400'}`} />
                <span className={`text-sm font-medium ${inStock ? 'text-green-700' : 'text-red-600'}`}>
                  {inStock ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              <div className="mt-auto space-y-3">
                {token ? (
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart || !inStock}
                    className="w-full rounded-full bg-sky-600 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-sky-700 hover:shadow-lg disabled:opacity-50"
                  >
                    {addingToCart ? 'Adding…' : 'Add to Cart'}
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="block w-full rounded-full bg-sky-600 py-3.5 text-center font-semibold text-white shadow-md transition-all hover:bg-sky-700"
                  >
                    Sign in to Add to Cart
                  </Link>
                )}
                <Link
                  to="/products"
                  className="block w-full rounded-full border border-gray-200 py-3 text-center text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  ← Back to Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
