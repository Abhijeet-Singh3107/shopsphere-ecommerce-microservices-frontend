import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerEndpoint } from '../api/endpoints.js';
import { useAuth } from '../hooks/useAuth.js';
import { useNotification } from '../hooks/useNotification.js';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { notify } = useNotification();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await registerEndpoint(name, email, password);
      login(data.token);
      const decoded = JSON.parse(atob(data.token.split('.')[1]));
      navigate(decoded.role === 'ADMIN' ? '/admin/dashboard' : '/');
    } catch (err) {
      notify(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Left panel */}
      <div className="hidden flex-1 flex-col items-center justify-center bg-gradient-to-br from-cyan-500 to-sky-700 p-12 text-white lg:flex">
        <div className="max-w-sm text-center">
          <div className="mb-6 flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-sm">
            ✨
          </div>
          <h2 className="mb-3 text-3xl font-bold">Join ShopSphere</h2>
          <p className="text-sky-200">Create your free account and start shopping thousands of products today.</p>
          <ul className="mt-6 space-y-2 text-left text-sm text-sky-100">
            {['Free to join', 'Track your orders', 'Exclusive deals', 'Fast checkout'].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-sky-300">✓</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
            <p className="mt-1 text-sm text-gray-500">
              Already have one?{' '}
              <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-800">Sign in</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">Full Name</label>
              <input
                id="name" type="text" required autoComplete="name"
                value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Abhijeet Singh"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email" type="email" required autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  id="password" type={showPw ? 'text' : 'password'} required autoComplete="new-password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-11 text-sm shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {password && password.length < 8 && (
                <p className="mt-1 text-xs text-red-500">Password must be at least 8 characters</p>
              )}
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-sky-700 hover:shadow-lg disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            By registering you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
