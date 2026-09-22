import React, { useState, useEffect } from 'react';
import { ProductGallery } from '../components/product/ProductGallery';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useCompare } from '../context/CompareContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  ShoppingBag, 
  SlidersHorizontal, 
  Star, 
  Target, 
  Cpu, 
  Zap, 
  HardDrive, 
  Monitor, 
  BatteryCharging, 
  Weight, 
  Layers, 
  ShieldCheck, 
  ArrowLeft,
  MessageSquare,
  Lock,
  Send
} from 'lucide-react';

export const ProductDetailPage = ({ productId, onBack, onSelectProduct, onNavigate }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { addToCompare, isInCompare, removeFromCompare, setIsCompareModalOpen } = useCompare();
  const { isAuthenticated, user, openAuthModal } = useAuth();
  const { addToast } = useNotification();

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await api.getProductDetails(productId);
      if (res.success) {
        setProduct(res.product);
      }
    } catch (err) {
      console.error('Error fetching product detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [productId]);

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f2fe' }}>
        <p>Đang tải chi tiết laptop...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="cosmic-container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Không tìm thấy sản phẩm</h2>
        <button onClick={onBack} className="btn-cosmic" style={{ marginTop: '20px' }}>
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const inCompare = isInCompare(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    addToast(`Đã thêm ${quantity} "${product.name}" vào giỏ hàng`, 'success');
  };

  const handleToggleCompare = () => {
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

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      addToast('Vui lòng nhập nhận xét của bạn', 'error');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await api.addReview({
        product_id: product.id,
        rating: reviewRating,
        comment: reviewComment
      });

      if (res.success) {
        addToast(res.message, 'success');
        setReviewComment('');
        fetchProduct(); // Reload reviews & updated rating
      }
    } catch (err) {
      addToast(err.message || 'Lỗi khi gửi đánh giá', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const specsList = [
    { label: 'Vi xử lý (CPU)', val: product.cpu, icon: Cpu },
    { label: 'Card đồ họa (GPU)', val: product.gpu, icon: Zap },
    { label: 'Bộ nhớ RAM', val: product.ram, icon: HardDrive },
    { label: 'Ổ cứng SSD', val: product.storage, icon: HardDrive },
    { label: 'Màn hình hiển thị', val: product.screen, icon: Monitor },
    { label: 'Dung lượng Pin', val: product.battery, icon: BatteryCharging },
    { label: 'Trọng lượng máy', val: product.weight, icon: Weight },
    { label: 'Cổng kết nối', val: product.ports, icon: Layers },
    { label: 'Hệ điều hành', val: product.os, icon: ShieldCheck }
  ];

  return (
    <div style={{ minHeight: '100vh', padding: '30px 0 90px 0' }}>
      <div className="cosmic-container">
        
        {/* Back navigation */}
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            marginBottom: '24px'
          }}
        >
          <ArrowLeft size={18} />
          <span>Quay lại danh sách sản phẩm</span>
        </button>

        {/* Top Product Hero: Gallery + Primary Info */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '40px',
          marginBottom: '50px'
        }}>
          
          {/* Column 1: Multi-angle Image Gallery (Ít nhất 3 ảnh góc chụp khác nhau) */}
          <div>
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Column 2: Details & Buying Actions */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            
            {/* Brand & Rating */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span className="badge-cosmic">
                {product.brand_name} • {product.category_name}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontSize: '0.9rem', fontWeight: 600 }}>
                <Star size={17} fill="#fbbf24" />
                <span>{parseFloat(product.rating || 5.0).toFixed(1)}</span>
                <span style={{ color: '#64748b' }}>({product.reviews ? product.reviews.length : 0} đánh giá)</span>
              </div>
            </div>

            {/* Product Title */}
            <h1 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '16px', lineHeight: '1.25' }}>
              {product.name}
            </h1>

            {/* Crucial Requirement: Tiêu chuẩn đáp ứng cho nhu cầu nào */}
            {product.target_use && (
              <div 
                className="glass-card"
                style={{
                  padding: '16px',
                  background: 'linear-gradient(90deg, rgba(0, 242, 254, 0.12) 0%, rgba(147, 51, 234, 0.16) 100%)',
                  border: '1px solid rgba(0, 242, 254, 0.35)',
                  borderRadius: '2px',
                  marginBottom: '20px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '2px',
                  background: 'rgba(0, 242, 254, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00f2fe',
                  flexShrink: 0
                }}>
                  <Target size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#00f2fe', fontWeight: 700, letterSpacing: '0.05em' }}>
                    Phân tích tiêu chuẩn nhu cầu sử dụng
                  </div>
                  <div style={{ fontSize: '0.95rem', color: '#f1f5f9', fontWeight: 600, marginTop: '2px' }}>
                    {product.target_use}
                  </div>
                </div>
              </div>
            )}

            {/* Price Box */}
            <div style={{
              background: 'rgba(15, 23, 50, 0.8)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '4px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#00f2fe' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                </span>
                {product.original_price && (
                  <span style={{ fontSize: '1.1rem', color: '#64748b', textDecoration: 'line-through' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.original_price)}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#10b981', marginTop: '6px' }}>
                ✓ Đã bao gồm thuế VAT và bảo hành chính hãng 24 tháng toàn quốc
              </div>
            </div>

            {/* Quantity & CTAs */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
              {/* Quantity */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(10, 15, 34, 0.8)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '2px',
                padding: '4px'
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', padding: '8px 14px', cursor: 'pointer' }}
                >
                  -
                </button>
                <span style={{ padding: '0 12px', fontWeight: 700, color: '#fff' }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', padding: '8px 14px', cursor: 'pointer' }}
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="btn-cosmic"
                style={{ flex: 1, padding: '14px 24px', fontSize: '1rem' }}
              >
                <ShoppingBag size={19} />
                <span>Thêm Vào Giỏ Hàng</span>
              </button>

              {/* Compare Button */}
              <button
                onClick={handleToggleCompare}
                className="btn-secondary"
                style={{ padding: '14px 20px', fontSize: '0.95rem' }}
                title="Thêm vào bảng so sánh cấu hình"
              >
                <SlidersHorizontal size={18} color="#00f2fe" />
                <span>{inCompare ? 'Đang so sánh' : 'So sánh'}</span>
              </button>
            </div>

            {/* Description Paragraph */}
            <div style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.7', marginTop: 'auto' }}>
              {product.description || product.short_desc}
            </div>

          </div>

        </div>

        {/* Technical Specs Table */}
        <div 
          className="glass-card"
          style={{ padding: '32px', borderRadius: '4px', marginBottom: '50px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{ padding: '8px', borderRadius: '2px', background: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe' }}>
              <Cpu size={22} />
            </div>
            <h2 style={{ fontSize: '1.4rem', color: '#fff' }}>Thông Số Kỹ Thuật Chi Tiết</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {specsList.map((spec, sIdx) => {
              const Icon = spec.icon;
              return (
                <div
                  key={sIdx}
                  style={{
                    background: 'rgba(10, 15, 34, 0.6)',
                    border: '1px solid rgba(56, 189, 248, 0.12)',
                    borderRadius: '2px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}
                >
                  <div style={{ color: '#00f2fe', marginTop: '2px' }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                      {spec.label}
                    </div>
                    <div style={{ fontSize: '0.92rem', color: '#f1f5f9', fontWeight: 600, marginTop: '2px' }}>
                      {spec.val || 'Đang cập nhật'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews Section: With Strict Purchase Requirement */}
        <div 
          className="glass-card"
          style={{ padding: '32px', borderRadius: '4px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', borderRadius: '2px', background: 'rgba(147, 51, 234, 0.15)', color: '#c084fc' }}>
                <MessageSquare size={22} />
              </div>
              <h2 style={{ fontSize: '1.4rem', color: '#fff' }}>Đánh Giá & Nhận Xét Từ Khách Hàng</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.1rem', color: '#fbbf24', fontWeight: 700 }}>
              <Star size={20} fill="#fbbf24" />
              <span>{parseFloat(product.rating || 5.0).toFixed(1)} / 5.0</span>
            </div>
          </div>

          {/* Conditional Review Form: ONLY ALLOWED IF PURCHASED */}
          <div style={{ marginBottom: '36px' }}>
            {product.canReview ? (
              <form 
                onSubmit={handleSubmitReview}
                style={{
                  background: 'rgba(15, 23, 50, 0.8)',
                  border: '1px solid rgba(0, 242, 254, 0.3)',
                  borderRadius: '2px',
                  padding: '24px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>✓ ĐÃ XÁC THỰC MUA HÀNG</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>— Bạn có thể gửi đánh giá cho sản phẩm này:</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Số sao hài lòng:</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: star <= reviewRating ? '#fbbf24' : '#475569',
                          padding: '2px'
                        }}
                      >
                        <Star size={24} fill={star <= reviewRating ? '#fbbf24' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <textarea
                    className="input-cosmic"
                    rows={3}
                    placeholder="Chia sẻ trải nghiệm thực tế về hiệu năng, màn hình, tản nhiệt của chiếc laptop này..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-cosmic"
                  style={{ padding: '10px 24px' }}
                >
                  <Send size={16} />
                  <span>{submittingReview ? 'Đang gửi...' : 'Gửi Nhận Xét'}</span>
                </button>
              </form>
            ) : (
              <div style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '2px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '2px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ef4444',
                  flexShrink: 0
                }}>
                  <Lock size={20} />
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>
                    Quy Định Đánh Giá Minh Bạch
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '2px' }}>
                    {isAuthenticated 
                      ? 'Chỉ khách hàng đã từng đặt mua mẫu laptop này tại HQuanTech mới có quyền viết đánh giá để đảm bảo tính khách quan và trung thực.'
                      : 'Vui lòng đăng nhập bằng tài khoản đã mua sản phẩm này để gửi đánh giá.'}
                  </div>
                  {!isAuthenticated && (
                    <button
                      type="button"
                      onClick={() => openAuthModal('login')}
                      className="btn-outline-cyan"
                      style={{ marginTop: '8px', padding: '4px 14px', fontSize: '0.8rem' }}
                    >
                      Đăng nhập ngay
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Review List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    background: 'rgba(10, 15, 34, 0.6)',
                    border: '1px solid rgba(56, 189, 248, 0.12)',
                    borderRadius: '2px',
                    padding: '18px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '2px',
                        background: 'linear-gradient(135deg, #00f2fe, #3b82f6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                      }}>
                        {rev.user_name ? rev.user_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>{rev.user_name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>✓ Khách hàng đã mua tại HQuanTech</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={15}
                          fill={s <= rev.rating ? '#fbbf24' : 'none'}
                          color={s <= rev.rating ? '#fbbf24' : '#475569'}
                        />
                      ))}
                    </div>
                  </div>

                  <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.6' }}>
                    {rev.comment}
                  </p>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên trải nghiệm và chia sẻ!
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
