import React, { useState, useEffect } from 'react';
import { ShoppingBag, SlidersHorizontal, Star, Cpu, Zap, HardDrive, Target, Gift, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCompare } from '../../context/CompareContext';
import { useNotification } from '../../context/NotificationContext';

export const ProductCard = ({ product, onSelect }) => {
  const { addToCart } = useCart();
  const { addToCompare, isInCompare, removeFromCompare } = useCompare();
  const { addToast } = useNotification();

  const [angleIdx, setAngleIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const inCompare = isInCompare(product.id);

  const images = (product.images && product.images.length > 0)
    ? product.images
    : [{ image_url: product.primary_image || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600' }];

  // Khi rê chuột vào card, tự động lướt qua các góc chụp
  useEffect(() => {
    if (!isHovered || images.length <= 1) {
      setAngleIdx(0);
      return;
    }

    const timer = setInterval(() => {
      setAngleIdx((prev) => (prev + 1) % images.length);
    }, 1300);

    return () => clearInterval(timer);
  }, [isHovered, images.length]);

  const handleToggleCompare = (e) => {
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(product.id);
      addToast('Đã bỏ laptop khỏi danh sách so sánh', 'info');
    } else {
      const res = addToCompare(product);
      if (res.success) {
        addToast(res.message, 'success');
      } else {
        addToast(res.message, 'error');
      }
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
    addToast(`Đã thêm "${product.name}" vào giỏ hàng`, 'success');
  };

  const discountPercent = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const currentDisplayImage = images[angleIdx]?.image_url || product.primary_image || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600';

  return (
    <div 
      className="glass-card" 
      onClick={() => onSelect(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        cursor: 'pointer',
        padding: '16px',
        background: '#12141c',
        border: '1px solid var(--border-subtle)',
        borderRadius: '4px'
      }}
    >
      {/* Top Badges */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {discountPercent > 0 && (
            <span style={{
              background: '#e11d48',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '2px',
              letterSpacing: '0.04em'
            }}>
              -{discountPercent}%
            </span>
          )}
          {product.is_new === 1 && (
            <span style={{
              background: 'rgba(56, 189, 248, 0.1)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '2px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              Mẫu Mới
            </span>
          )}
        </div>

        {/* Compare Toggle */}
        <button
          onClick={handleToggleCompare}
          style={{
            background: inCompare ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: inCompare ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
            color: inCompare ? '#38bdf8' : '#94a3b8',
            borderRadius: '2px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title={inCompare ? 'Bỏ so sánh' : 'Thêm vào so sánh cấu hình'}
        >
          <SlidersHorizontal size={13} />
        </button>
      </div>

      {/* Product Image on Studio Canvas */}
      <div style={{
        width: '100%',
        height: '180px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 0',
        marginBottom: '12px',
        position: 'relative'
      }}>
        {/* Layered images with smooth crossfade */}
        {images.map((img, idx) => {
          const isActive = idx === angleIdx;
          return (
            <img
              key={img.id || idx}
              src={img.image_url || product.primary_image}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80';
              }}
              loading="lazy"
              style={{
                position: 'absolute',
                maxWidth: '92%',
                maxHeight: '92%',
                objectFit: 'contain',
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'scale(1)' : 'scale(0.96)',
                transition: 'opacity 0.65s cubic-bezier(0.4, 0, 0.2, 1), transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.6))',
                pointerEvents: isActive ? 'auto' : 'none'
              }}
            />
          );
        })}

        {/* Multi-angle indicator dots */}
        {images.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: '2px',
            display: 'flex',
            gap: '4px',
            opacity: isHovered ? 1 : 0.3,
            transition: 'opacity 0.2s ease'
          }}>
            {images.map((_, idx) => (
              <span
                key={idx}
                style={{
                  width: angleIdx === idx ? '14px' : '4px',
                  height: '3px',
                  borderRadius: '1px',
                  background: angleIdx === idx ? '#38bdf8' : 'rgba(255, 255, 255, 0.25)',
                  transition: 'all 0.25s ease'
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Brand & Rating */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase' }}>
          {product.brand_name || 'HQuanTech'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#fbbf24', fontSize: '0.75rem', fontWeight: 600 }}>
          <Star size={12} fill="#fbbf24" />
          <span>{parseFloat(product.rating || 5.0).toFixed(1)}</span>
          <span style={{ color: '#64748b' }}>({product.review_count || 0})</span>
        </div>
      </div>

      {/* Laptop Name */}
      <h3 style={{
        fontSize: '0.98rem',
        fontWeight: 600,
        color: '#f8fafc',
        marginBottom: '8px',
        lineHeight: '1.4',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        minHeight: '2.8em'
      }}>
        {product.name}
      </h3>

      {/* Target Use Standard */}
      {product.target_use && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '2px',
          padding: '5px 8px',
          fontSize: '0.72rem',
          color: '#cbd5e1',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflow: 'hidden'
        }}>
          <Target size={13} color="#38bdf8" style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {product.target_use}
          </span>
        </div>
      )}

      {/* Specs Badges Minimal */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4px',
        background: '#0a0c12',
        border: '1px solid var(--border-subtle)',
        padding: '6px 8px',
        borderRadius: '2px',
        fontSize: '0.72rem',
        color: '#94a3b8',
        marginBottom: '10px'
      }}>
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <span style={{ color: '#cbd5e1' }}>CPU:</span> {product.cpu ? product.cpu.split('(')[0] : 'Intel'}
        </div>
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <span style={{ color: '#38bdf8' }}>GPU:</span> {product.gpu ? product.gpu.split('(')[0] : 'RTX'}
        </div>
        <div>
          <span style={{ color: '#cbd5e1' }}>RAM:</span> {product.ram ? product.ram.split(' ')[0] : '16GB'}
        </div>
        <div>
          <span style={{ color: '#cbd5e1' }}>SSD:</span> {product.storage ? product.storage.split(' ')[0] : '512GB'}
        </div>
      </div>

      {/* Bonus Perk Notice */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: '#10b981', marginBottom: '12px' }}>
        <Gift size={13} />
        <span>Tặng Balo + Chuột không dây chính hãng</span>
      </div>

      {/* Pricing & CTA Button */}
      <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
          </span>
          {product.original_price && (
            <span style={{ fontSize: '0.8rem', color: '#64748b', textDecoration: 'line-through' }}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.original_price)}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          className="btn-cosmic"
          style={{ width: '100%', padding: '9px 12px', fontSize: '0.82rem', borderRadius: '2px' }}
        >
          <ShoppingBag size={14} />
          <span>Thêm vào giỏ</span>
        </button>
      </div>
    </div>
  );
};
