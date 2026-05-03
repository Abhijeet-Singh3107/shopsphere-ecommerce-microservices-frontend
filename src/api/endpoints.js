import apiClient from './client.js';

// ─── Auth ────────────────────────────────────────────────────────────────────

export const register = (name, email, password) =>
  apiClient({ method: 'POST', path: '/auth/register', body: { name, email, password, role: 'CUSTOMER' } });

export const login = (email, password) =>
  apiClient({ method: 'POST', path: '/auth/login', body: { email, password } });

// ─── Catalog ─────────────────────────────────────────────────────────────────

export const getFeaturedProducts = () =>
  apiClient({ path: '/catalog/products/featured' });

export const getProducts = (page = 0, size = 10) =>
  apiClient({ path: '/catalog/products', params: { page, size } });

export const getProductById = (id) =>
  apiClient({ path: `/catalog/products/${id}` });

export const searchProducts = (keyword, page = 0, size = 10) =>
  apiClient({ path: '/catalog/products/search', params: { keyword, page, size } });

export const getProductsByCategory = (categoryId) =>
  apiClient({ path: `/catalog/products/category/${categoryId}` });

export const getProductsByPriceRange = (min, max) =>
  apiClient({ path: '/catalog/products/price-range', params: { min, max } });

export const getCategories = () =>
  apiClient({ path: '/catalog/categories' });

// ─── Cart ─────────────────────────────────────────────────────────────────────

export const getCart = () =>
  apiClient({ path: '/order/cart' });

export const addCartItem = (productId, quantity) =>
  apiClient({ method: 'POST', path: '/order/cart/items', body: { productId, quantity } });

export const updateCartItem = (itemId, quantity) =>
  apiClient({ method: 'PUT', path: `/order/cart/items/${itemId}`, body: { quantity } });

export const removeCartItem = (itemId) =>
  apiClient({ method: 'DELETE', path: `/order/cart/items/${itemId}` });

export const clearCart = () =>
  apiClient({ method: 'DELETE', path: '/order/cart' });

// ─── Orders ──────────────────────────────────────────────────────────────────

export const getOrders = () =>
  apiClient({ path: '/order/orders' });

export const getOrderById = (id) =>
  apiClient({ path: `/order/orders/${id}` });

export const checkout = (shippingAddress) =>
  apiClient({ method: 'POST', path: '/order/orders/checkout', body: { shippingAddress } });

export const cancelOrder = (id) =>
  apiClient({ method: 'DELETE', path: `/order/orders/${id}/cancel` });

// ─── Admin ───────────────────────────────────────────────────────────────────

export const getDashboard = () =>
  apiClient({ path: '/admin/dashboard' });

export const getAdminProducts = (page = 0, size = 10) =>
  apiClient({ path: '/admin/products', params: { page, size } });

export const createProduct = (data) =>
  apiClient({ method: 'POST', path: '/admin/products', body: data });

export const updateProduct = (id, data) =>
  apiClient({ method: 'PUT', path: `/admin/products/${id}`, body: data });

export const deleteProduct = (id) =>
  apiClient({ method: 'DELETE', path: `/admin/products/${id}` });

export const getAdminOrders = (status) =>
  apiClient({ path: '/admin/orders', params: status ? { status } : undefined });

export const getAdminOrderById = (id) =>
  apiClient({ path: `/admin/orders/${id}` });

export const updateOrderStatus = (id, status) =>
  apiClient({ method: 'PUT', path: `/admin/orders/${id}/status`, body: { status } });

export const getReports = () =>
  apiClient({ path: '/admin/reports' });
