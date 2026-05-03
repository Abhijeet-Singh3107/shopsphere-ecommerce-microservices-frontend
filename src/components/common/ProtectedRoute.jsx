import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function ProtectedRoute({ requiredRole }) {
  const { token, role } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'ADMIN' && role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
