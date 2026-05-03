import { Link } from 'react-router-dom';
import { formatINR } from '../../utils/currency.js';

export default function ProductCard({ product }) {
  const { id, name, price, categoryName, imageUrl, featured, stock } = product;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {featured && (
          <span className="absolute top-2 left-2 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-amber-900">
            Featured
          </span>
        )}
        {stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <span className="rounded-full bg-gray-800 px-3 py-1 text-xs font-semibold text-white">Out of stock</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        {categoryName && (
          <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-indigo-500">
            {categoryName}
          </span>
        )}
        <h3 className="mb-3 flex-1 text-sm font-semibold leading-snug text-gray-900 line-clamp-2">
          {name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">{formatINR(price)}</span>
          <Link
            to={`/products/${id}`}
            className="rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
