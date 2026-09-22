import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { ShoppingBag, CheckCircle, Tag, Truck, ArrowLeft, ShieldCheck, CreditCard } from 'lucide-react';

export const CheckoutPage = ({ onNavigate }) => {
  const { cart, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useNotification();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Voucher discount calculation
  let discount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.type === 'percent') {
      discount = Math.round(totalPrice * (appliedVoucher.value / 100));
    } else if (appliedVoucher.type === 'fixed') {
      discount = appliedVoucher.value;
    }
  }
  const finalTotal = Math.max(0, totalPrice - discount);

  const handleApplyVoucher = (e) => {
    e.preventDefault();
    const code = voucherCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'HQUANTECH' || code === 'COSMIC10') {
      setAppliedVoucher({ code, type: 'percent', value: 10, label: 'Giảm 10% tổng đơn' });
      addToast('Áp dụng mã giảm giá 10% thành công!', 'success');
    } else if (code === 'GAMING500') {
      setAppliedVoucher({ code, type: 'fixed', value: 500000, label: 'Giảm 500.000đ' });
      addToast('Áp dụng voucher giảm 500.000đ thành công!', 'success');
    } else {
      addToast('Mã voucher không hợp lệ hoặc đã hết hạn', 'error');
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !address) {
      addToast('Vui lòng điền đầy đủ họ tên, email, số điện thoại và địa chỉ giao hàng', 'error');
      return;
    }

    if (cart.length === 0) {
      addToast('Giỏ hàng của bạn đang trống', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const orderPayload = {
        customer_name: fullName,
        customer_email: email,
        customer_phone: phone,
        shipping_address: address,
        payment_method: paymentMethod,
        voucher_code: appliedVoucher ? appliedVoucher.code : null,
        notes,
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          image_url: item.image
        }))
      };

      const res = await api.createOrder(orderPayload);
      if (res.success) {
        // Trigger celebratory confetti!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        clearCart();
        setOrderSuccess(res.order);
      }
    } catch (err) {
      addToast(err.message || 'Lỗi xử lý đơn hàng', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order Success Modal View
  if (orderSuccess) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div 
          className="glass-card"
          style={{
            maxWidth: '520px',
            width: '100%',
            padding: '40px',
            textAlign: 'center',
            borderRadius: '4px',
            border: '1px solid rgba(0, 242, 254, 0.4)',
            boxShadow: '0 0 40px rgba(0, 242, 254, 0.25)'
          }}
        >
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '2px',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto'
          }}>
            <CheckCircle size={40} />
          </div>

          <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '8px' }}>
            Đặt Hàng Thành Công!
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '24px' }}>
            Cảm ơn bạn đã lựa chọn HQuanTech. Đơn hàng của bạn đã được tiếp nhận và nhân viên sẽ liên hệ trong ít phút.
          </p>

          <div style={{
            background: 'rgba(10, 15, 34, 0.8)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: '2px',
            padding: '20px',
            marginBottom: '28px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Mã đơn hàng:</span>
              <strong style={{ color: '#00f2fe' }}>{orderSuccess.order_code}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Tổng thanh toán:</span>
              <strong style={{ color: '#10b981' }}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderSuccess.total_amount)}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Trạng thái:</span>
              <span className="badge-cosmic">Đang chờ xác nhận</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
            <button
              onClick={() => onNavigate('home')}
              className="btn-secondary"
              style={{ padding: '12px 24px' }}
            >
              Về Trang Chủ
            </button>
            <button
              onClick={() => onNavigate('profile')}
              className="btn-cosmic"
              style={{ padding: '12px 24px' }}
            >
              Xem Lịch Sử Đơn
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '40px 0 90px 0' }}>
      <div className="cosmic-container">
        
        <button
          onClick={() => onNavigate('products')}
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
          <span>Tiếp tục mua hàng</span>
        </button>

        <h1 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '32px' }}>
          Thông Tin Giao Hàng & Đặt Hàng
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '40px',
          alignItems: 'flex-start'
        }}>
          
          {/* Column 1: Customer Form */}
          <form 
            onSubmit={handleCreateOrder}
            className="glass-card"
            style={{ padding: '32px', borderRadius: '4px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <Truck size={22} color="#00f2fe" />
              <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>Địa Chỉ Nhận Hàng</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
                  Họ và tên người nhận *
                </label>
                <input
                  type="text"
                  required
                  className="input-cosmic"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    className="input-cosmic"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    required
                    className="input-cosmic"
                    placeholder="0912345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
                  Địa chỉ giao hàng chi tiết *
                </label>
                <input
                  type="text"
                  required
                  className="input-cosmic"
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
                  Ghi chú đơn hàng (Tùy chọn)
                </label>
                <textarea
                  className="input-cosmic"
                  rows={2}
                  placeholder="Ví dụ: Giao vào giờ hành chính, gọi trước khi giao..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Payment Methods */}
              <div style={{ marginTop: '10px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '10px' }}>
                  Phương thức thanh toán
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    background: paymentMethod === 'cod' ? 'rgba(0, 242, 254, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                    border: paymentMethod === 'cod' ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                    />
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>Thanh toán khi nhận hàng (COD)</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Kiểm tra hàng rồi thanh toán tiền mặt cho shipper</div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    background: paymentMethod === 'bank' ? 'rgba(0, 242, 254, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                    border: paymentMethod === 'bank' ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={paymentMethod === 'bank'}
                      onChange={() => setPaymentMethod('bank')}
                    />
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>Chuyển khoản Ngân hàng / QR Code</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Quét mã QR VietQR chuyển khoản nhanh 24/7</div>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || cart.length === 0}
                className="btn-cosmic"
                style={{ padding: '14px', fontSize: '1.05rem', marginTop: '16px' }}
              >
                <ShieldCheck size={20} />
                <span>{isSubmitting ? 'Đang Xử Lý Đơn Hàng...' : 'Xác Nhận Đặt Hàng Ngay'}</span>
              </button>

            </div>
          </form>

          {/* Column 2: Order Items & Voucher */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Voucher Box */}
            <div 
              className="glass-card" 
              style={{ padding: '24px', borderRadius: '4px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Tag size={20} color="#00f2fe" />
                <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Mã Khuyến Mãi (Voucher)</h3>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  className="input-cosmic"
                  placeholder="Nhập mã: HQUANTECH hoặc COSMIC10"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleApplyVoucher}
                  className="btn-outline-cyan"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Áp Dụng
                </button>
              </div>

              {appliedVoucher && (
                <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
                  ✓ Đã áp dụng mã {appliedVoucher.code}: {appliedVoucher.label}
                </div>
              )}
            </div>

            {/* Order Items Table */}
            <div 
              className="glass-card" 
              style={{ padding: '24px', borderRadius: '4px' }}
            >
              <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '16px' }}>
                Chi Tiết Đơn Hàng ({cart.length} món)
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {cart.map((item) => (
                  <div 
                    key={item.id} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      paddingBottom: '12px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80';
                      }}
                      style={{ width: '50px', height: '50px', objectFit: 'contain', borderRadius: '2px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.88rem', color: '#f8fafc', fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Số lượng: {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#00f2fe', fontSize: '0.95rem' }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Tạm tính:</span>
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 600 }}>
                    <span>Giảm giá voucher:</span>
                    <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Phí vận chuyển:</span>
                  <span style={{ color: '#10b981' }}>Miễn phí toàn quốc</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '1.25rem',
                  fontWeight: 800
                }}>
                  <span style={{ color: '#fff' }}>Tổng thanh toán:</span>
                  <span style={{ color: '#00f2fe' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalTotal)}
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
