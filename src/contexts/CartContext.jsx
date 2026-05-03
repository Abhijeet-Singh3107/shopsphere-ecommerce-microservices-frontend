import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart } from '../api/endpoints.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { token } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const refreshCount = useCallback(async () => {
    if (!token) {
      setCartCount(0);
      return;
    }
    try {
      const cart = await getCart();
      setCartCount(cart?.items?.length ?? 0);
    } catch {
      setCartCount(0);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      refreshCount();
    } else {
      setCartCount(0);
    }
  }, [token, refreshCount]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}

export default CartContext;
