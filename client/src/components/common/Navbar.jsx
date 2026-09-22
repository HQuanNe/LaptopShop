import React, { useState } from 'react';
import { 
  Laptop, 
  ShoppingBag, 
  SlidersHorizontal, 
  User, 
  Search, 
  ShieldCheck, 
  LogOut, 
  Package, 
  Sparkles,
  ChevronRight,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useCompare } from '../../context/CompareContext';

export const Navbar = ({ onNavigate, currentPage, onSearchSubmit }) => {
  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const { compareItems, setIsCompareModalOpen } = useCompare();

  const [searchTerm, setSearchTerm] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(searchTerm);
    }
    onNavigate('products', { search: searchTerm });
  };

  return (
    <>
      {/* Top Commercial Announcement Ticker */}
      <div className="promo-ticker">
        <span>⚡ <strong>Ưu Đãi Đặc Biệt:</strong> Tặng combo quà 2.500.000đ khi mua Laptop RTX 40 Series</span>
        <span style={{ opacity: 0.4 }}>•</span>
        <span>Trả góp 0% lãi suất</span>
        <span style={{ opacity: 0.4 }}>•</span>
        <span>Bảo hành chính hãng 24T tận nơi</span>
        <span style={{ opacity: 0.4 }}>•</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <PhoneCall size={12} color="#38bdf8" /> Hotline: <strong style={{ color: '#38bdf8' }}>1900 8899</strong>
        </span>
      </div>

      <header className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
        <div className="cosmic-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px', gap: '24px' }}>
          
          {/* Luxury Brand Logo */}
          <div 
            onClick={() => onNavigate('home')} 
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', textDecoration: 'none' }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#181b26',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Laptop size={20} color="#f8fafc" />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                HQuan<span style={{ color: '#38bdf8' }}>Tech</span>
              </div>
              <div style={{ fontSize: '0.62rem', color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
                High Performance Laptops
              </div>
            </div>
          </div>

          {/* Clean E-Commerce Search Bar */}
          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '440px', position: 'relative' }}>
            <input
              type="text"
              className="input-cosmic"
              placeholder="Tìm theo model, CPU, RTX 4080, MacBook M3..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '38px', paddingRight: '14px', height: '40px', fontSize: '0.88rem' }}
            />
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '13px', top: '12px' }} />
          </form>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button 
              onClick={() => onNavigate('home')}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: currentPage === 'home' ? '#ffffff' : '#94a3b8', 
                fontWeight: currentPage === 'home' ? 600 : 500, 
                fontSize: '0.9rem', 
                cursor: 'pointer'
              }}
            >
              Trang Chủ
            </button>

            <button 
              onClick={() => onNavigate('products')}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: currentPage === 'products' ? '#ffffff' : '#94a3b8', 
                fontWeight: currentPage === 'products' ? 600 : 500, 
                fontSize: '0.9rem', 
                cursor: 'pointer' 
              }}
            >
              Tất Cả Laptop
            </button>

            {/* Compare Button */}
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="btn-secondary"
              style={{ position: 'relative', padding: '6px 12px', fontSize: '0.82rem', borderRadius: '2px' }}
              title="So sánh cấu hình laptop"
            >
              <SlidersHorizontal size={14} color="#38bdf8" />
              <span>So sánh</span>
              {compareItems.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: '#0284c7',
                  color: '#fff',
                  borderRadius: '2px',
                  padding: '1px 5px',
                  fontSize: '0.68rem',
                  fontWeight: 700
                }}>
                  {compareItems.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="btn-secondary"
              style={{ position: 'relative', padding: '6px 14px', fontSize: '0.82rem', borderColor: 'rgba(56, 189, 248, 0.3)', borderRadius: '2px' }}
            >
              <ShoppingBag size={15} color="#38bdf8" />
              <span>Giỏ hàng</span>
              {totalItems > 0 && (
                <span style={{
                  background: '#f43f5e',
                  color: '#fff',
                  borderRadius: '2px',
                  padding: '1px 6px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  marginLeft: '4px'
                }}>
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Profile / Auth Modal Trigger */}
            {isAuthenticated ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  style={{
                    background: '#141620',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '2px',
                    padding: '6px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '2px',
                    background: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.78rem'
                  }}>
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                    {user.full_name || user.username}
                  </span>
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div 
                    className="glass-card" 
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '44px',
                      width: '210px',
                      padding: '6px',
                      borderRadius: '4px',
                      background: '#0d0f17',
                      border: '1px solid var(--border-medium)',
                      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.8)',
                      zIndex: 100
                    }}
                  >
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '4px' }}>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#fff' }}>{user.full_name || user.username}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{user.email}</div>
                    </div>

                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('admin');
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          background: 'rgba(56, 189, 248, 0.1)',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                          borderRadius: '2px',
                          color: '#38bdf8',
                          fontWeight: 600,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          marginBottom: '4px'
                        }}
                      >
                        <ShieldCheck size={15} />
                        Dashboard Quản Trị
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('profile');
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        background: 'none',
                        border: 'none',
                        borderRadius: '2px',
                        color: '#cbd5e1',
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <Package size={15} color="#94a3b8" />
                      Lịch sử đơn hàng
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                        onNavigate('home');
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        background: 'none',
                        border: 'none',
                        borderRadius: '2px',
                        color: '#f43f5e',
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        borderTop: '1px solid var(--border-subtle)',
                        marginTop: '4px'
                      }}
                    >
                      <LogOut size={15} />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => openAuthModal('login')}
                  style={{
                    background: 'transparent',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.75)',
                    padding: '7px 18px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  LOGIN
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  style={{
                    background: '#ffffff',
                    color: '#08090d',
                    border: '1px solid #ffffff',
                    padding: '7px 18px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
                >
                  ĐĂNG KÝ
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>
    </>
  );
};
