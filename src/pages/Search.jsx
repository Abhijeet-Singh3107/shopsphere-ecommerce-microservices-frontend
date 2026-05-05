import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchProducts } from '../api/endpoints.js';
import ProductCard from '../components/common/ProductCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { useNotification } from '../hooks/useNotification.js';

export default function Search() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('q') ?? '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { notify } = useNotification();

  useEffect(() => {
    if (!keyword.trim()) { setProducts([]); return; }
    let cancelled = false;
    setLoading(true);
    searchProducts(keyword, 0, 10)
      .then((data) => {
        if (!cancelled) setProducts(Array.isArray(data) ? data : (data?.content ?? []));
      })
      .catch((err) => { if (!cancelled) notify(err.message ?? 'Search failed', 'error'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [keyword]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">Search</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            {keyword ? (
              <>Results for <span className="text-sky-600">"{keyword}"</span></>
            ) : (
              'Search Products'
            )}
          </h1>
          {!loading && keyword && (
            <p className="mt-1 text-sm text-gray-500">
              {products.length} {products.length === 1 ? 'result' : 'results'} found
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10">
        {loading ? (
          <LoadingSpinner />
        ) : !keyword.trim() ? (
          <div className="rounded-2xl border border-dashed border-gray-300 py-20 text-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <p className="text-sm">Use the search bar above to find products.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 py-20 text-center text-gray-400">
            <p className="text-lg font-semibold text-gray-700">No results for "{keyword}"</p>
            <p className="mt-2 text-sm">Try a different keyword or browse all products.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
