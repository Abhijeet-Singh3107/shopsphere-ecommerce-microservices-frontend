import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useCart } from '../../hooks/useCart.js';

export default function Navbar() {
  const { role, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  const linkCls = 'text-sm font-medium text-gray-600 hover:text-sky-600 transition-colors';
  const activeCls = 'text-sky-600';

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white font-bold text-sm">S</span>
            <span className="text-lg font-bold text-gray-900">ShopSphere</span>
          </Link>

          {/* Search bar — storefront only */}
          {role !== 'ADMIN' && (
            <form onSubmit={handleSearch} className="hidden flex-1 max-w-sm sm:flex">
              <div className="relative w-full">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products…"
                  className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-4 pr-10 text-sm focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sky-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                </button>
              </div>
            </form>
          )}

          {/* Desktop nav links */}
          <div className="hidden items-center gap-5 sm:flex">
            {!role && (
              <>
                <NavLink to="/products" className={({ isActive }) => `${linkCls} ${isActive ? activeCls : ''}`}>Products</NavLink>
                <NavLink to="/login" className={({ isActive }) => `${linkCls} ${isActive ? activeCls : ''}`}>Login</NavLink>
                <Link to="/register" className="rounded-full bg-sky-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-sky-700 transition-colors">
                  Register
                </Link>
              </>
            )}

            {role === 'CUSTOMER' && (
              <>
                <NavLink to="/products" className={({ isActive }) => `${linkCls} ${isActive ? activeCls : ''}`}>Products</NavLink>
                <NavLink to="/orders" className={({ isActive }) => `${linkCls} ${isActive ? activeCls : ''}`}>Orders</NavLink>
                <NavLink to="/cart" className={({ isActive }) => `relative ${linkCls} ${isActive ? activeCls : ''}`}>
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    {cartCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">
                        {cartCount}
                      </span>
                    )}
                  </span>
                </NavLink>
                <button onClick={logout} className="text-sm font-medium text-gray-500 hover:text-red-500 transition-colors">Logout</button>
              </>
            )}

            {role === 'ADMIN' && (
              <>
                <NavLink to="/admin/dashboard" className={({ isActive }) => `${linkCls} ${isActive ? activeCls : ''}`}>Dashboard</NavLink>
                <NavLink to="/admin/products" className={({ isActive }) => `${linkCls} ${isActive ? activeCls : ''}`}>Products</NavLink>
                <NavLink to="/admin/orders" className={({ isActive }) => `${linkCls} ${isActive ? activeCls : ''}`}>Orders</NavLink>
                <NavLink to="/admin/reports" className={({ isActive }) => `${linkCls} ${isActive ? activeCls : ''}`}>Reports</NavLink>
                <button onClick={logout} className="text-sm font-medium text-gray-500 hover:text-red-500 transition-colors">Logout</button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMenuOpen((o) => !o)} className="sm:hidden p-2 text-gray-500 hover:text-sky-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 sm:hidden space-y-2">
          {role !== 'ADMIN' && (
            <form onSubmit={handleSearch} className="mb-3">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 px-4 text-sm focus:outline-none"
              />
            </form>
          )}
          {!role && <>
            <MobileLink to="/products" onClick={() => setMenuOpen(false)}>Products</MobileLink>
            <MobileLink to="/login" onClick={() => setMenuOpen(false)}>Login</MobileLink>
            <MobileLink to="/register" onClick={() => setMenuOpen(false)}>Register</MobileLink>
          </>}
          {role === 'CUSTOMER' && <>
            <MobileLink to="/products" onClick={() => setMenuOpen(false)}>Products</MobileLink>
            <MobileLink to="/cart" onClick={() => setMenuOpen(false)}>Cart {cartCount > 0 && `(${cartCount})`}</MobileLink>
            <MobileLink to="/orders" onClick={() => setMenuOpen(false)}>My Orders</MobileLink>
            <button onClick={logout} className="block w-full text-left py-2 text-sm text-red-500">Logout</button>
          </>}
          {role === 'ADMIN' && <>
            <MobileLink to="/admin/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</MobileLink>
            <MobileLink to="/admin/products" onClick={() => setMenuOpen(false)}>Products</MobileLink>
            <MobileLink to="/admin/orders" onClick={() => setMenuOpen(false)}>Orders</MobileLink>
            <MobileLink to="/admin/reports" onClick={() => setMenuOpen(false)}>Reports</MobileLink>
            <button onClick={logout} className="block w-full text-left py-2 text-sm text-red-500">Logout</button>
          </>}
        </div>
      )}
    </nav>
  );
}

function MobileLink({ to, onClick, children }) {
  return (
    <Link to={to} onClick={onClick} className="block py-2 text-sm font-medium text-gray-700 hover:text-sky-600">
      {children}
    </Link>
  );
}
