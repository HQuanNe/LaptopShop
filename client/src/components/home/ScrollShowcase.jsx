import React, { useState, useEffect } from 'react';
import { ShoppingBag, SlidersHorizontal, Camera, Target, Star, CheckCircle, Shield, Award, RotateCcw } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useCart } from '../../context/CartContext';
import { useCompare } from '../../context/CompareContext';
import { useNotification } from '../../context/NotificationContext';

export const ScrollShowcase = ({ products = [], onSelectProduct }) => {
  const containerRef = useScrollReveal({ threshold: 0.15 });
  const { addToCart } = useCart();
  const { addToCompare, isInCompare, removeFromCompare } = useCompare();
  const { addToast } = useNotification();

  const [selectedAngles, setSelectedAngles] = useState({});

  // Tự động chuyển góc chụp mỗi 3.2 giây cho từng sản phẩm flagship liên tục
  useEffect(() => {
    if (products.length === 0) return;

    const interval = setInterval(() => {
      setSelectedAngles((prev) => {
        const next = { ...prev };
        products.forEach((prod) => {
          const count = (prod.images && prod.images.length >= 3) ? prod.images.length : 3;
          const current = prev[prod.id] || 0;
          next[prod.id] = (current + 1) % count;
        });
        return next;
      });
    }, 3200);

    return () => clearInterval(interval);
  }, [products]);

  const handleAngleChange = (prodId, angleIdx) => {
    setSelectedAngles((prev) => ({ ...prev, [prodId]: angleIdx }));
  };

  const handleAddToCart = (prod) => {
    addToCart(prod, 1);
    addToast(`Đã thêm "${prod.name}" vào giỏ hàng`, 'success');
  };

  const handleToggleCompare = (prod) => {
    if (isInCompare(prod.id)) {
      removeFromCompare(prod.id);
      addToast('Đã bỏ laptop khỏi danh sách so sánh', 'info');
    } else {
      const res = addToCompare(prod);
      if (res.success) {
        addToast(res.message, 'success');
      } else {
        addToast(res.message, 'error');
      }
    }
  };

  return (
    <section ref={containerRef} style={{ padding: '60px 0 80px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      
      {/* Editorial Header */}
      <div className="cosmic-container" style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.08em' }}>
              HARDWARE SHOWCASE
            </span>
            <h2 style={{ fontSize: '2.2rem', color: '#ffffff', marginTop: '4px' }}>
              Tuyển Tập Flagship Mới Nhất
            </h2>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', maxWidth: '480px' }}>
            Cuộn để kiểm tra chi tiết các cỗ máy hiệu năng đỉnh cao với 3 góc chụp thực tế và phân tích tiêu chuẩn đáp ứng nhu cầu.
          </p>
        </div>
      </div>

      {/* Flagship Cards */}
      <div className="cosmic-container" style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
        {products.map((prod, index) => {
          const isEven = index % 2 === 0;
          const images = prod.images && prod.images.length >= 3 ? prod.images : [
            { image_url: prod.primary_image, caption: 'Góc chính diện mở màn hình' },
            { image_url: prod.primary_image, caption: 'Góc nghiêng cạnh bên' },
            { image_url: prod.primary_image, caption: 'Góc bàn phím & tản nhiệt' }
          ];
          const activeAngleIdx = selectedAngles[prod.id] || 0;
          const activeImg = images[activeAngleIdx] || images[0];

          return (
            <div
              key={prod.id}
              className="reveal-item glass-card"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '32px',
                padding: '28px',
                borderRadius: '4px',
                alignItems: 'center',
                border: '1px solid var(--border-medium)'
              }}
            >
              
              {/* Studio Image & Angle Picker */}
              <div style={{ order: isEven ? 1 : 2, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{
                  position: 'relative',
                  height: '300px',
                  borderRadius: '3px',
                  background: '#090a0f',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px',
                  overflow: 'hidden'
                }}>
                  {/* Layered Images with Silky Smooth Crossfade */}
                  {images.map((img, aIdx) => {
                    const isActive = aIdx === activeAngleIdx;
                    return (
                      <img
                        key={img.id || aIdx}
                        src={img.image_url}
                        alt={prod.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80';
                        }}
                        style={{
                          position: 'absolute',
                          maxWidth: '90%',
                          maxHeight: '90%',
                          objectFit: 'contain',
                          opacity: isActive ? 1 : 0,
                          transform: isActive ? 'scale(1)' : 'scale(0.96)',
                          transition: 'opacity 0.85s cubic-bezier(0.4, 0, 0.2, 1), transform 0.85s cubic-bezier(0.4, 0, 0.2, 1)',
                          filter: 'drop-shadow(0 12px 20px rgba(0, 0, 0, 0.75))',
                          pointerEvents: isActive ? 'auto' : 'none'
                        }}
                      />
                    );
                  })}
                </div>

                {/* 3 Angle Thumbnails */}
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${images.length}, 1fr)`, gap: '8px' }}>
                  {images.map((img, aIdx) => {
                    const isSel = aIdx === activeAngleIdx;
                    return (
                      <button
                        key={img.id || aIdx}
                        onClick={() => handleAngleChange(prod.id, aIdx)}
                        style={{
                          height: '58px',
                          background: isSel ? '#1a1e2d' : '#0a0c12',
                          border: isSel ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
                          borderRadius: '2px',
                          padding: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <img
                          src={img.image_url}
                          alt=""
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80';
                          }}
                          style={{ maxHeight: '34px', maxWidth: '100%', objectFit: 'contain' }}
                        />
                        <span style={{ fontSize: '0.65rem', color: isSel ? '#38bdf8' : '#94a3b8', marginTop: '2px' }}>
                          Góc {aIdx + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Product Info & Specs */}
              <div style={{ order: isEven ? 2 : 1 }}>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {prod.brand_name} • {prod.category_name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontSize: '0.82rem', fontWeight: 600 }}>
                    <Star size={14} fill="#fbbf24" />
                    <span>{parseFloat(prod.rating || 5.0).toFixed(1)}</span>
                    <span style={{ color: '#64748b' }}>({prod.review_count || 0})</span>
                  </div>
                </div>

                <h3 
                  onClick={() => onSelectProduct(prod)}
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    marginBottom: '12px',
                    cursor: 'pointer',
                    lineHeight: '1.3'
                  }}
                >
                  {prod.name}
                </h3>

                {/* Hardware Verdict (Tiêu chuẩn nhu cầu) */}
                {prod.target_use && (
                  <div className="badge-target" style={{ marginBottom: '14px', width: '100%', borderRadius: '2px' }}>
                    <Target size={16} color="#38bdf8" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.82rem' }}>{prod.target_use}</span>
                  </div>
                )}

                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '18px' }}>
                  {prod.short_desc || prod.description}
                </p>

                {/* Specs Box */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '10px',
                  background: '#0a0c12',
                  border: '1px solid var(--border-subtle)',
                  padding: '12px',
                  borderRadius: '2px',
                  marginBottom: '20px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>CPU</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc' }}>{prod.cpu ? prod.cpu.split('(')[0] : 'Intel'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>VGA</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#38bdf8' }}>{prod.gpu ? prod.gpu.split('(')[0] : 'RTX'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>RAM & SSD</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>{prod.ram} | {prod.storage ? prod.storage.split(' ')[0] : '1TB'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Màn hình</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>{prod.screen ? prod.screen.split('(')[0] : '2.5K'}</div>
                  </div>
                </div>

                {/* Price & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Giá niêm yết chính hãng:</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prod.price)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => handleToggleCompare(prod)}
                      className="btn-secondary"
                      style={{ padding: '9px 14px', fontSize: '0.85rem' }}
                    >
                      <SlidersHorizontal size={14} color="#38bdf8" />
                      <span>{isInCompare(prod.id) ? 'Đang so sánh' : 'So sánh'}</span>
                    </button>

                    <button
                      onClick={() => handleAddToCart(prod)}
                      className="btn-cosmic"
                      style={{ padding: '9px 18px', fontSize: '0.9rem' }}
                    >
                      <ShoppingBag size={15} />
                      <span>Thêm giỏ</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
};
