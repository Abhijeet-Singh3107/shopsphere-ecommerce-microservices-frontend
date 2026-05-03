import { useEffect, useState, useCallback } from 'react';
import {
  getProducts, getCategories, getProductsByCategory, getProductsByPriceRange,
} from '../api/endpoints.js';
import ProductCard from '../components/common/ProductCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { useNotification } from '../hooks/useNotification.js';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const { notify } = useNotification();

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data ?? []))
      .catch((err) => notify(err.message ?? 'Failed to load categories', 'error'));
  }, []);

  const fetchProducts = useCallback(async (currentPage, categoryId) => {
    setLoading(true);
    try {
      let data;
      if (categoryId) {
        data = await getProductsByCategory(categoryId);
        setProducts(Array.isArray(data) ? data : (data?.content ?? []));
        setTotalPages(1);
      } else {
        data = await getProducts(currentPage, 10);
        setProducts(data?.content ?? data ?? []);
        setTotalPages(data?.totalPages ?? 1);
      }
    } catch (err) {
      notify(err.message ?? 'Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { fetchProducts(page, selectedCategory); }, [page, selectedCategory, fetchProducts]);

  const handleCategoryChange = (id) => { setSelectedCategory(id); setPage(0); };

  const handlePriceFilter = async (e) => {
    e.preventDefault();
    if (priceMin === '' || priceMax === '') return;
    setLoading(true);
    try {
      const data = await getProductsByPriceRange(Number(priceMin), Number(priceMax));
      setProducts(Array.isArray(data) ? data : (data?.content ?? []));
      setTotalPages(1);
      setPage(0);
      setSelectedCategory('');
    } catch (err) {
      notify(err.message ?? 'Failed to filter by price', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => { setSelectedCategory(''); setPriceMin(''); setPriceMax(''); setPage(0); };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
          <p className="mt-1 text-sm text-gray-500">Browse our full catalog</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 flex gap-8">
        {/* Sidebar filters */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-20 space-y-6">
            {/* Categories */}
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">Category</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${selectedCategory === '' ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    All Categories
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${selectedCategory === cat.id ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price range */}
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">Price Range</h3>
              <form onSubmit={handlePriceFilter} className="space-y-2">
                <input
                  type="number" min="0" value={priceMin} onChange={(e) => setPriceMin(e.target.value)}
                  placeholder="Min ₹"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                />
                <input
                  type="number" min="0" value={priceMax} onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="Max ₹"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                />
                <button type="submit" className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
                  Apply
                </button>
              </form>
            </div>

            {(selectedCategory || priceMin || priceMax) && (
              <button onClick={handleClearFilters} className="w-full rounded-lg border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Clear Filters
              </button>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Mobile filters row */}
          <div className="mb-4 flex flex-wrap items-center gap-2 lg:hidden">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            {(selectedCategory || priceMin || priceMax) && (
              <button onClick={handleClearFilters} className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600">
                Clear
              </button>
            )}
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 py-20 text-center text-gray-400">
              No products found. Try adjusting your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!selectedCategory && totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                ← Previous
              </button>
              <span className="px-4 text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
