import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Laptop, Lock, User, Mail, MapPin, Phone, LogIn, UserPlus, X } from 'lucide-react';

export const AuthModal = () => {
  const { 
    isAuthModalOpen, 
    authModalMode, 
    setAuthModalMode, 
    closeAuthModal, 
    login, 
    register 
  } = useAuth();
  const { addToast } = useNotification();

  // Login Form States
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form States
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPhone, setRegPhone] = useState('');

  const [loading, setLoading] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      addToast('Vui lòng điền đầy đủ tên đăng nhập và mật khẩu', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await login(loginUsername, loginPassword);
      if (res.success) {
        addToast(`Xin chào mừng ${res.user.full_name || res.user.username}!`, 'success');
        closeAuthModal();
      }
    } catch (err) {
      addToast(err.message || 'Đăng nhập không thành công', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!regUsername || !regPassword || !regEmail || !regFullName || !regAddress || !regPhone) {
      addToast('Vui lòng điền đầy đủ thông tin đăng ký', 'error');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      addToast('Mật khẩu nhập lại không khớp', 'error');
      return;
    }

    if (regPassword.length < 6) {
      addToast('Mật khẩu phải từ 6 ký tự trở lên', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await register({
        username: regUsername,
        password: regPassword,
        email: regEmail,
        full_name: regFullName,
        address: regAddress,
        phone: regPhone
      });

      if (res.success) {
        addToast('Đăng ký tài khoản thành công! Mật khẩu đã được mã hóa an toàn.', 'success');
        closeAuthModal();
      }
    } catch (err) {
      addToast(err.message || 'Lỗi khi đăng ký tài khoản', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for demo testing
  const quickFill = (user, pass) => {
    setLoginUsername(user);
    setLoginPassword(pass);
  };

  return (
    <div className="modal-overlay" onClick={closeAuthModal}>
      <div
        className="glass-card modal-bloom"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: authModalMode === 'login' ? '420px' : '520px',
          maxHeight: '92vh',
          background: '#11131a',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '2px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            cursor: 'pointer',
            zIndex: 10
          }}
          title="Đóng (Esc)"
        >
          <X size={15} />
        </button>

        {/* Modal Header */}
        <div style={{ padding: '28px 28px 12px 28px', textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '3px',
            background: '#181b26',
            border: '1px solid var(--border-medium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto'
          }}>
            <Laptop size={20} color="#f8fafc" />
          </div>

          <h2 style={{ fontSize: '1.35rem', color: '#ffffff', marginBottom: '4px', fontWeight: 800 }}>
            HQuan<span style={{ color: '#38bdf8' }}>Tech</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
            {authModalMode === 'login'
              ? 'Đăng nhập vào tài khoản để quản lý đơn hàng'
              : 'Đăng ký tài khoản khách hàng chính hãng'}
          </p>

          {/* Mode Switcher Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: '#0a0c12',
            border: '1px solid var(--border-subtle)',
            borderRadius: '2px',
            padding: '3px',
            marginTop: '16px'
          }}>
            <button
              type="button"
              onClick={() => setAuthModalMode('login')}
              style={{
                padding: '7px',
                borderRadius: '2px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                background: authModalMode === 'login' ? '#1c1f2e' : 'transparent',
                color: authModalMode === 'login' ? '#ffffff' : '#94a3b8',
                transition: 'all 0.2s ease'
              }}
            >
              ĐĂNG NHẬP
            </button>
            <button
              type="button"
              onClick={() => setAuthModalMode('register')}
              style={{
                padding: '7px',
                borderRadius: '2px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                background: authModalMode === 'register' ? '#1c1f2e' : 'transparent',
                color: authModalMode === 'register' ? '#ffffff' : '#94a3b8',
                transition: 'all 0.2s ease'
              }}
            >
              ĐĂNG KÝ
            </button>
          </div>
        </div>

        {/* Modal Form Content */}
        <div style={{ padding: '0 28px 28px 28px', overflowY: 'auto' }}>
          {authModalMode === 'login' ? (
            /* FORM ĐĂNG NHẬP */
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
                  Tên đăng nhập hoặc Email
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    className="input-cosmic"
                    placeholder="admin hoặc khachhang1..."
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    style={{ paddingLeft: '36px' }}
                  />
                  <User size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
                  Mật khẩu
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    required
                    className="input-cosmic"
                    placeholder="Nhập mật khẩu..."
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{ paddingLeft: '36px' }}
                  />
                  <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                </div>
              </div>

              {/* Demo Accounts Quick-fill */}
              <div style={{
                background: '#0a0c12',
                border: '1px solid var(--border-subtle)',
                borderRadius: '2px',
                padding: '8px 10px',
                fontSize: '0.75rem',
                color: '#94a3b8'
              }}>
                <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '4px', letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.7rem' }}>Tài khoản demo:</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => quickFill('admin', 'admin123')}
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '2px',
                      padding: '3px 8px',
                      color: '#cbd5e1',
                      fontSize: '0.72rem',
                      cursor: 'pointer'
                    }}
                  >
                    Admin: admin / admin123
                  </button>
                  <button
                    type="button"
                    onClick={() => quickFill('khachhang1', 'user123')}
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '2px',
                      padding: '3px 8px',
                      color: '#cbd5e1',
                      fontSize: '0.72rem',
                      cursor: 'pointer'
                    }}
                  >
                    Khách: khachhang1 / user123
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-cosmic"
                style={{ padding: '11px', fontSize: '0.86rem', marginTop: '4px', borderRadius: '2px' }}
              >
                <LogIn size={15} />
                <span>{loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP'}</span>
              </button>
            </form>
          ) : (
            /* FORM ĐĂNG KÝ */
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '3px' }}>
                    Tên đăng nhập *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-cosmic"
                    placeholder="username"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '3px' }}>
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-cosmic"
                    placeholder="Nguyễn Văn A"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '3px' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    className="input-cosmic"
                    placeholder="email@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '3px' }}>
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    required
                    className="input-cosmic"
                    placeholder="0912345678"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '3px' }}>
                  Địa chỉ nhận hàng *
                </label>
                <input
                  type="text"
                  required
                  className="input-cosmic"
                  placeholder="Số nhà, Đường, Phường/Xã, Tỉnh/TP"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '3px' }}>
                    Mật khẩu *
                  </label>
                  <input
                    type="password"
                    required
                    className="input-cosmic"
                    placeholder=">= 6 ký tự"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '3px' }}>
                    Nhập lại mật khẩu *
                  </label>
                  <input
                    type="password"
                    required
                    className="input-cosmic"
                    placeholder="Khớp mật khẩu"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-cosmic"
                style={{ padding: '11px', fontSize: '0.86rem', marginTop: '6px', borderRadius: '2px' }}
              >
                <UserPlus size={15} />
                <span>{loading ? 'Đang tạo tài khoản...' : 'HOÀN TẤT ĐĂNG KÝ'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
