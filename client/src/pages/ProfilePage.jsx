import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import { User, Package, Clock, CheckCircle2, Truck, AlertCircle, Edit3, Save } from 'lucide-react';

export const ProfilePage = ({ onNavigate }) => {
  const { user, updateProfile, isAuthenticated } = useAuth();
  const { addToast } = useNotification();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setAddress(user.address || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    async function loadOrders() {
      if (!isAuthenticated) return;
      try {
        setLoadingOrders(true);
        const res = await api.getMyOrders();
        if (res.success) {
          setOrders(res.orders);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadOrders();
  }, [isAuthenticated]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const res = await updateProfile({ full_name: fullName, address, phone });
      if (res.success) {
        addToast('Cập nhật thông tin cá nhân thành công', 'success');
        setIsEditing(false);
      }
    } catch (err) {
      addToast(err.message || 'Lỗi cập nhật', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge-cosmic"><Clock size={12} /> Chờ xác nhận</span>;
      case 'processing':
        return <span className="badge-purple"><Clock size={12} /> Đang xử lý</span>;
      case 'shipping':
        return <span style={{ padding: '4px 10px', borderRadius: '2px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Truck size={12} /> Đang giao hàng</span>;
      case 'delivered':
        return <span style={{ padding: '4px 10px', borderRadius: '2px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12} /> Đã giao thành công</span>;
      case 'cancelled':
        return <span style={{ padding: '4px 10px', borderRadius: '2px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={12} /> Đã hủy</span>;
      default:
        return <span>{status}</span>;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="cosmic-container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Vui lòng đăng nhập để xem thông tin tài khoản</h2>
        <button onClick={() => onNavigate('login')} className="btn-cosmic" style={{ marginTop: '20px' }}>
          Đăng Nhập Ngay
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '40px 0 90px 0' }}>
      <div className="cosmic-container">
        
        <h1 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '32px' }}>
          Hồ Sơ Cá Nhân & Lịch Sử Mua Hàng
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '36px',
          alignItems: 'flex-start'
        }}>
          
          {/* Profile Details Box */}
          <div 
            className="glass-card" 
            style={{ padding: '30px', borderRadius: '4px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '2px',
                  background: 'linear-gradient(135deg, #00f2fe, #7928ca)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#fff'
                }}>
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>{user.full_name || user.username}</h3>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>@{user.username} • {user.role === 'admin' ? '🛡️ Quản trị viên' : 'Thành viên'}</div>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                <Edit3 size={14} />
                <span>{isEditing ? 'Hủy' : 'Chỉnh sửa'}</span>
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Họ và tên</label>
                  <input
                    type="text"
                    className="input-cosmic"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Số điện thoại</label>
                  <input
                    type="tel"
                    className="input-cosmic"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Địa chỉ nhận hàng</label>
                  <input
                    type="text"
                    className="input-cosmic"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={updating}
                  className="btn-cosmic"
                  style={{ marginTop: '10px' }}
                >
                  <Save size={16} />
                  <span>{updating ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
                <div style={{ paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Email liên hệ</div>
                  <div style={{ color: '#fff', fontWeight: 500, marginTop: '2px' }}>{user.email}</div>
                </div>
                <div style={{ paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Số điện thoại</div>
                  <div style={{ color: '#fff', fontWeight: 500, marginTop: '2px' }}>{user.phone || 'Chưa cập nhật'}</div>
                </div>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Địa chỉ mặc định</div>
                  <div style={{ color: '#fff', fontWeight: 500, marginTop: '2px' }}>{user.address || 'Chưa cập nhật'}</div>
                </div>
              </div>
            )}
          </div>

          {/* Orders History List */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Package size={22} color="#00f2fe" />
              <h2 style={{ fontSize: '1.4rem', color: '#fff' }}>Đơn Hàng Của Bạn ({orders.length})</h2>
            </div>

            {loadingOrders ? (
              <div style={{ color: '#94a3b8', padding: '20px 0' }}>Đang tải lịch sử đơn hàng...</div>
            ) : orders.length === 0 ? (
              <div 
                className="glass-card" 
                style={{ padding: '40px', textAlign: 'center', borderRadius: '4px', color: '#94a3b8' }}
              >
                <Package size={40} color="#00f2fe" style={{ opacity: 0.3, marginBottom: '12px' }} />
                <h3 style={{ color: '#fff', marginBottom: '6px' }}>Bạn chưa có đơn hàng nào</h3>
                <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>Khám phá ngay các dòng laptop mới nhất để đặt hàng!</p>
                <button onClick={() => onNavigate('products')} className="btn-cosmic">
                  Mua sắm ngay
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="glass-card"
                    style={{ padding: '22px', borderRadius: '4px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Mã đơn: </span>
                        <strong style={{ color: '#00f2fe', fontSize: '0.95rem' }}>{ord.order_code}</strong>
                        <span style={{ color: '#64748b', fontSize: '0.8rem', marginLeft: '12px' }}>
                          {new Date(ord.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div>{getStatusBadge(ord.status)}</div>
                    </div>

                    {/* Order Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                      {ord.items && ord.items.map((it) => (
                        <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={it.image_url}
                            alt={it.product_name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80';
                            }}
                            style={{ width: '42px', height: '42px', objectFit: 'contain', borderRadius: '2px', background: 'rgba(10, 15, 34, 0.7)' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.88rem', color: '#f8fafc', fontWeight: 500 }}>{it.product_name}</div>
                            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>x{it.quantity}</div>
                          </div>
                          <div style={{ color: '#38bdf8', fontWeight: 600, fontSize: '0.9rem' }}>
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(it.price * it.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      fontSize: '0.92rem'
                    }}>
                      <span style={{ color: '#94a3b8' }}>Tổng cộng:</span>
                      <strong style={{ color: '#00f2fe', fontSize: '1.15rem' }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ord.total_amount)}
                      </strong>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
