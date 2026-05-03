import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedProducts } from '../api/endpoints.js';
import ProductCard from '../components/common/ProductCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { useNotification } from '../hooks/useNotification.js';

const PERKS = [
  { icon: '🚚', title: 'Free Shipping', desc: 'On orders over $50' },
  { icon: '↩️', title: 'Easy Returns', desc: '30-day return policy' },
  { icon: '🔒', title: 'Secure Checkout', desc: 'SSL encrypted payments' },
  { icon: '💬', title: '24/7 Support', desc: "We're always here" },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notify } = useNotification();

  useEffect(() => {
    let cancelled = false;
    getFeaturedProducts()
      .then((data) => { if (!cancelled) setProducts(data ?? []); })
      .catch((err) => { if (!cancelled) notify(err.message ?? 'Failed to load featured products', 'error'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 py-24 text-white">
        <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-60 w-60 rounded-full bg-violet-400/20 blur-2xl" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <span className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-medium backdrop-blur-sm">
            New arrivals every week
          </span>
          <h1 className="mb-5 text-5xl font-extrabold tracking-tight sm:text-6xl">
            Shop smarter.<br />
            <span className="text-indigo-200">Live better.</span>
          </h1>
          <p className="mb-8 mx-auto max-w-xl text-lg text-indigo-100">
            Thousands of products, unbeatable prices, delivered to your door.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/products" className="rounded-full bg-white px-8 py-3 font-semibold text-indigo-700 shadow-lg transition-all hover:bg-indigo-50 hover:shadow-xl">
              Shop Now
            </Link>
            <Link to="/register" className="rounded-full border border-white/40 bg-white/10 px-8 py-3 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20">
              Join Free
            </Link>
          </div>
        </div>
      </section>

      {/* Perks bar */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {PERKS.map(({ icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Handpicked for you</p>
            <h2 className="mt-1 text-3xl font-bold text-gray-900">Featured Products</h2>
          </div>
          <Link to="/products" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
            View all →
          </Link>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center text-gray-400">
            No featured products available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* CTA banner */}
      <section className="mx-auto max-w-7xl px-4 pb-14">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-indigo-600 px-8 py-10 text-white sm:flex-row">
          <div>
            <h3 className="text-2xl font-bold">Ready to explore more?</h3>
            <p className="mt-1 text-indigo-200">Browse our full catalog and find exactly what you need.</p>
          </div>
          <Link to="/products" className="shrink-0 rounded-full bg-white px-6 py-3 font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors">
            Browse All Products
          </Link>
        </div>
      </section>
    </div>
  );
}
