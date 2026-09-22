import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Laptop, Lock, User, LogIn, ArrowRight } from 'lucide-react';

export const LoginPage = ({ onNavigate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { addToast } = useNotification();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      addToast('Vui lòng điền đầy đủ tên đăng nhập và mật khẩu', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await login(username, password);
      if (res.success) {
        addToast(`Xin chào mừng ${res.user.full_name || res.user.username}!`, 'success');
        if (res.user.role === 'admin') {
          onNavigate('admin');
        } else {
          onNavigate('home');
        }
      }
    } catch (err) {
      addToast(err.message || 'Đăng nhập không thành công', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px'
    }}>
      <div 
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '40px',
          borderRadius: '4px',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '2px',
            background: 'linear-gradient(135deg, #00f2fe 0%, #7928ca 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 0 20px rgba(0, 242, 254, 0.4)'
          }}>
            <Laptop size={30} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '8px' }}>Đăng Nhập HQuanTech</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
            Truy cập vũ trụ laptop cao cấp và quản lý đơn hàng
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
              Tên đăng nhập hoặc Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                className="input-cosmic"
                placeholder="Ví dụ: admin hoặc khachhang1"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '42px' }}
              />
              <User size={18} color="#00f2fe" style={{ position: 'absolute', left: '14px', top: '13px' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
              Mật khẩu bảo mật
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                className="input-cosmic"
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '42px' }}
              />
              <Lock size={18} color="#00f2fe" style={{ position: 'absolute', left: '14px', top: '13px' }} />
            </div>
          </div>

          {/* Quick Demo Accounts Hint */}
          <div style={{
            background: 'rgba(10, 15, 34, 0.8)',
            border: '1px solid rgba(56, 189, 248, 0.15)',
            borderRadius: '2px',
            padding: '10px 14px',
            fontSize: '0.78rem',
            color: '#94a3b8',
            lineHeight: '1.5'
          }}>
            <div>⭐ <strong>Admin:</strong> <code>admin</code> / pass: <code>admin123</code></div>
            <div>⭐ <strong>Khách hàng:</strong> <code>khachhang1</code> / pass: <code>user123</code></div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-cosmic"
            style={{ padding: '13px', fontSize: '1rem', marginTop: '6px' }}
          >
            <LogIn size={18} />
            <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem', color: '#94a3b8' }}>
          Chưa có tài khoản?{' '}
          <button
            onClick={() => onNavigate('register')}
            style={{ background: 'none', border: 'none', color: '#00f2fe', fontWeight: 600, cursor: 'pointer' }}
          >
            Đăng ký ngay
          </button>
        </div>
      </div>
    </div>
  );
};
