import React from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const CartDrawer = ({ onProceedCheckout }) => {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsCartOpen(false)}>
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '460px',
          background: '#0a0e24',
          borderLeft: '1px solid rgba(0, 242, 254, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10000,
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.8)',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 50, 0.9)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={22} color="#00f2fe" />
            <h2 style={{ fontSize: '1.2rem', color: '#fff' }}>
              Giỏ Hàng Công Nghệ ({totalItems})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Drawer Item List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto', color: '#94a3b8' }}>
              <ShoppingBag size={54} color="#00f2fe" style={{ opacity: 0.3, marginBottom: '14px' }} />
              <h3 style={{ color: '#fff', marginBottom: '8px' }}>Giỏ hàng chưa có laptop nào</h3>
              <p style={{ fontSize: '0.9rem' }}>Hãy chọn một siêu phẩm laptop từ danh mục để bắt đầu!</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  gap: '14px',
                  background: 'rgba(15, 23, 48, 0.6)',
                  border: '1px solid rgba(56, 189, 248, 0.15)',
                  borderRadius: '2px',
                  padding: '12px'
                }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '2px',
                  background: 'rgba(10, 15, 36, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px',
                  flexShrink: 0
                }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80';
                    }}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', color: '#f8fafc', marginBottom: '4px', lineHeight: '1.3' }}>
                      {item.name}
                    </h4>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      {item.cpu ? item.cpu.split('(')[0] : ''} | {item.ram}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                    <span style={{ fontWeight: 700, color: '#00f2fe', fontSize: '1rem' }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                    </span>

                    {/* Quantity controls */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'rgba(10, 15, 34, 0.8)',
                      borderRadius: '2px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      overflow: 'hidden'
                    }}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{ background: 'none', border: 'none', color: '#cbd5e1', padding: '4px 8px', cursor: 'pointer' }}
                      >
                        <Minus size={13} />
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0 6px', color: '#fff' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{ background: 'none', border: 'none', color: '#cbd5e1', padding: '4px 8px', cursor: 'pointer' }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      title="Xóa sản phẩm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer Checkout */}
        {cart.length > 0 && (
          <div style={{
            padding: '20px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(15, 23, 50, 0.95)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Tổng tiền tạm tính:</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#00f2fe' }}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
              </span>
            </div>

            <button
              onClick={() => {
                setIsCartOpen(false);
                if (onProceedCheckout) onProceedCheckout();
              }}
              className="btn-cosmic"
              style={{ width: '100%', padding: '12px', fontSize: '0.9rem', borderRadius: '2px' }}
            >
              <span>Tiến Hành Đặt Hàng</span>
              <ArrowRight size={17} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
