import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

/**
 * Wraps routes that should only be accessible to unauthenticated users.
 * - Authenticated ADMIN → redirect to /admin/dashboard
 * - Authenticated CUSTOMER → redirect to /
 */
export default function GuestRoute() {
  const { token, role } = useAuth();

  if (token) {
    return role === 'ADMIN'
      ? <Navigate to="/admin/dashboard" replace />
      : <Navigate to="/" replace />;
  }

  return <Outlet />;
}
