import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { email: payload.email ?? null, role: payload.role ?? null };
  } catch {
    return { email: null, role: null };
  }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [email, setEmail] = useState(() => {
    const t = localStorage.getItem('token');
    return t ? decodeToken(t).email : null;
  });
  const [role, setRole] = useState(() => {
    const t = localStorage.getItem('token');
    return t ? decodeToken(t).role : null;
  });

  const login = useCallback((newToken) => {
    localStorage.setItem('token', newToken);
    const { email: decodedEmail, role: decodedRole } = decodeToken(newToken);
    setToken(newToken);
    setEmail(decodedEmail);
    setRole(decodedRole);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setEmail(null);
    setRole(null);
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const handleAuthLogout = () => logout();
    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ token, email, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export default AuthContext;
