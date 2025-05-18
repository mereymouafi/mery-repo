// React is imported for JSX support in the component tree
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/layout/Layout';
import AdminLayout from './components/admin/AdminLayout';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrdersAdminPage from './pages/OrdersAdminPage';
import CategoriesAdminPage from './pages/CategoriesAdminPage';
import ProductsAdminPage from './pages/ProductsAdminPage';
import BrandsAdminPage from './pages/BrandsAdminPage';
import AdminLoginPage from './pages/AdminLoginPage';
import NotFoundPage from './pages/NotFoundPage';
import SearchResultsPage from './pages/SearchResultsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ShippingReturnsPage from './pages/ShippingReturnsPage';
import FAQPage from './pages/FAQPage';
import TermsPage from './pages/TermsPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Main Site Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="shop" element={<ShopPage />} />
              <Route path="shop/:category" element={<ShopPage />} />
              <Route path="product/:id" element={<ProductDetailPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="shipping" element={<ShippingReturnsPage />} />
              <Route path="faq" element={<FAQPage />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="order-tracking" element={<OrderTrackingPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="order-confirmation/:orderId" element={<OrderConfirmation />} />
              <Route path="search" element={<SearchResultsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            
            {/* Protected Admin Routes with AdminLayout */}
            <Route path="/admin" element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="orders" element={<OrdersAdminPage />} />
                <Route path="categories" element={<CategoriesAdminPage />} />
                <Route path="products" element={<ProductsAdminPage />} />
                <Route path="brands" element={<BrandsAdminPage />} />
                {/* Add more admin routes here as needed */}
              </Route>
            </Route>
          </Routes>
        </AnimatePresence>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;