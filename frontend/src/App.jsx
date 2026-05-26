import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ======================= CONTEXT GLOBAL =======================
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// ======================= PHÂN VÙNG USER (KHÁCH HÀNG) =======================
import Layout from './components/user/Layout';
import Home from './pages/user/Home';
import Login from './pages/user/Login';
import Register from './pages/user/Register';
import WarrantyPolicy from './pages/user/WarrantyPolicy';
import Products from './pages/user/Products';
import ProductDetail from './pages/user/ProductDetail';
import Category from './pages/user/Category';
import Posts from './pages/user/Posts';
import PostDetail from './pages/user/PostDetail';
import Cart from './pages/user/Cart';
import OrderSuccess from './pages/user/OrderSuccess';
import Profile from './pages/user/Profile';
import MyOrders from './pages/user/MyOrders';
import Checkout from './pages/user/Checkout';
import PaymentQR from './pages/user/PaymentQR';

// ======================= PHÂN VÙNG ADMIN (QUẢN TRỊ) =======================
import AdminLogin from './pages/admin/AdminLogin'; 
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ManageProducts from './pages/admin/ManageProducts'; 
import ManageCategories from './pages/admin/ManageCategories';
import ManageUsers from './pages/admin/ManageUsers';
import ManageOrders from './pages/admin/ManageOrders';
import ManagePosts from './pages/admin/ManagePosts';
import ManageReviews from './pages/admin/ManageReviews';
import ManageSettings from './pages/admin/ManageSettings';

// 🌟 Component bọc trung gian để kẹp CartProvider riêng cho Client, 
// giúp code gọn gàng không cần copy-paste thẻ <CartProvider> lặp đi lặp lại
const ClientSection = ({ children }) => {
  return <CartProvider>{children}</CartProvider>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={2000} />

        <Routes>
          {/* ========================================================
              SECTION 1: ROUTE KHÁCH HÀNG (CÓ CARTPROVIDER VÀ LAYOUT)
              ======================================================== */}
          <Route path="/" element={<ClientSection><Layout><Home /></Layout></ClientSection>} />
          <Route path="/login" element={<ClientSection><Layout><Login /></Layout></ClientSection>} />
          <Route path="/register" element={<ClientSection><Layout><Register /></Layout></ClientSection>} />
          <Route path="/products" element={<ClientSection><Layout><Products /></Layout></ClientSection>} />
          <Route path="/product/:slug" element={<ClientSection><Layout><ProductDetail /></Layout></ClientSection>} />
          <Route path="/categories/:slug" element={<ClientSection><Layout><Category /></Layout></ClientSection>} />
          <Route path="/posts" element={<ClientSection><Layout><Posts /></Layout></ClientSection>} />
          <Route path="/post/:slug" element={<ClientSection><Layout><PostDetail /></Layout></ClientSection>} />
          <Route path="/cart" element={<ClientSection><Layout><Cart /></Layout></ClientSection>} />
          <Route path="/order-success" element={<ClientSection><Layout><OrderSuccess /></Layout></ClientSection>} />
          <Route path="/chinh-sach-bao-hanh" element={<ClientSection><Layout><WarrantyPolicy /></Layout></ClientSection>} />
          <Route path="/profile" element={<ClientSection><Layout><Profile /></Layout></ClientSection>} />
          <Route path="/my-orders" element={<ClientSection><Layout><MyOrders /></Layout></ClientSection>} />
          <Route path="/checkout" element={<ClientSection><Layout><Checkout /></Layout></ClientSection>} />
          <Route path="/payment-qr" element={<ClientSection><Layout><PaymentQR /></Layout></ClientSection>} />

          {/* ========================================================
              SECTION 2: ROUTE ADMIN (CẮT BỎ HOÀN TOÀN CARTPROVIDER)
              ======================================================== */}
          {/* Trang đăng nhập riêng */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Vùng quản trị */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} /> 
            <Route path="products" element={<ManageProducts />} />
            <Route path="categories" element={<ManageCategories />} />
            <Route path="orders" element={<ManageOrders />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="posts" element={<ManagePosts />} />
            <Route path="reviews" element={<ManageReviews />} />
            <Route path="settings" element={<ManageSettings />} />
          </Route>

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;