import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute.jsx';
import GuestRoute from '../components/common/GuestRoute.jsx';
import RootLayout from '../components/layout/RootLayout.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Home from '../pages/Home.jsx';
import Products from '../pages/Products.jsx';
import ProductDetail from '../pages/ProductDetail.jsx';
import Search from '../pages/Search.jsx';
import Orders from '../pages/Orders.jsx';
import OrderDetail from '../pages/OrderDetail.jsx';
import Cart from '../pages/Cart.jsx';
import Checkout from '../pages/Checkout.jsx';
import Dashboard from '../pages/admin/Dashboard.jsx';
import AdminProducts from '../pages/admin/AdminProducts.jsx';
import AdminOrders from '../pages/admin/AdminOrders.jsx';
import AdminReports from '../pages/admin/AdminReports.jsx';

export default function AppRouter() {
  return (
    <Routes>
      {/* All routes share the root layout (navbar + notification outlet) */}
      <Route element={<RootLayout />}>

        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/search" element={<Search />} />

        {/* Guest-only routes (redirect authenticated users) */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Customer-protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
        </Route>

        {/* Admin-protected routes */}
        <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/reports" element={<AdminReports />} />
        </Route>

      </Route>
    </Routes>
  );
}
