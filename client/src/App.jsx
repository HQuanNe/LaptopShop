import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CompareProvider } from './context/CompareContext';
import { NotificationProvider } from './context/NotificationContext';

import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { CompareModal } from './components/product/CompareModal';
import { AuthModal } from './components/common/AuthModal';

import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { useAuth } from './context/AuthContext';

import { CosmicStarfield } from './components/common/CosmicStarfield';
import { CosmicCursor } from './components/common/CosmicCursor';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [productFilters, setProductFilters] = useState({});
  const { openAuthModal } = useAuth();

  const handleNavigate = (page, params = {}) => {
    if (page === 'login' || page === 'register') {
      openAuthModal(page);
      return;
    }
    setCurrentPage(page);
    if (page === 'products') {
      setProductFilters(params);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product) => {
    setSelectedProductId(product.id);
    setCurrentPage('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
      {/* Bầu trời sao vũ trụ (Cosmic Deep-Space Starfield & Meteors) */}
      <CosmicStarfield />

      {/* Hiệu ứng con trỏ chuột thiên hà (Galaxy Stardust & Star Trail) */}
      <CosmicCursor />
      
      {/* Top Navbar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onSearchSubmit={(search) => handleNavigate('products', { search })}
      />

      {/* Main Routed Page Content */}
      <main style={{ flex: 1 }}>
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPage === 'products' && (
          <ProductsPage
            initialFilters={productFilters}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPage === 'product-detail' && (
          <ProductDetailPage
            productId={selectedProductId}
            onBack={() => handleNavigate('products')}
            onSelectProduct={handleSelectProduct}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'checkout' && (
          <CheckoutPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'profile' && (
          <ProfilePage onNavigate={handleNavigate} />
        )}

        {currentPage === 'login' && (
          <LoginPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'register' && (
          <RegisterPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'admin' && (
          <AdminDashboard onNavigate={handleNavigate} />
        )}
      </main>

      {/* Persistent Compare Modal */}
      <CompareModal onSelectProduct={handleSelectProduct} />

      {/* Persistent Sliding Cart Drawer */}
      <CartDrawer onProceedCheckout={() => handleNavigate('checkout')} />

      {/* Expanding Bloom Auth Modal (Đăng nhập / Đăng ký nở dần ra làm mờ background) */}
      <AuthModal />

      {/* Cosmic Footer */}
      {currentPage !== 'admin' && <Footer onNavigate={handleNavigate} />}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <CompareProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </CompareProvider>
      </CartProvider>
    </AuthProvider>
  );
}
