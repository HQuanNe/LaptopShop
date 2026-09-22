import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Laptop, Lock, User, Mail, MapPin, Phone, UserPlus } from 'lucide-react';

export const RegisterPage = ({ onNavigate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { addToast } = useNotification();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username || !password || !email || !fullName || !address || !phone) {
      addToast('Vui lòng điền đầy đủ tất cả các trường thông tin', 'error');
      return;
    }

    if (password !== confirmPassword) {
      addToast('Mật khẩu nhập lại không khớp nhau', 'error');
      return;
    }

    if (password.length < 6) {
      addToast('Mật khẩu phải từ 6 ký tự trở lên', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await register({
        username,
        password,
        email,
        full_name: fullName,
        address,
        phone
      });

      if (res.success) {
        addToast('Đăng ký tài khoản thành công! Mật khẩu đã được mã hóa an toàn.', 'success');
        onNavigate('home');
      }
    } catch (err) {
      addToast(err.message || 'Lỗi khi đăng ký', 'error');
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
          maxWidth: '520px',
          padding: '36px',
          borderRadius: '4px',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '2px',
            background: 'linear-gradient(135deg, #00f2fe 0%, #7928ca 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px auto',
            boxShadow: '0 0 18px rgba(0, 242, 254, 0.4)'
          }}>
            <Laptop size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '6px' }}>Đăng Ký Tài Khoản</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
            Tham gia cộng đồng công nghệ HQuanTech ngay hôm nay
          </p>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>
                Tên đăng nhập *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  className="input-cosmic"
                  placeholder="nguyenvan_a"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                />
                <User size={16} color="#00f2fe" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>
                Họ và tên *
              </label>
              <input
                type="text"
                required
                className="input-cosmic"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>
                Email liên hệ *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  className="input-cosmic"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                />
                <Mail size={16} color="#00f2fe" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>
                Số điện thoại *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  required
                  className="input-cosmic"
                  placeholder="0912345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                />
                <Phone size={16} color="#00f2fe" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>
              Địa chỉ nhận hàng *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                className="input-cosmic"
                placeholder="Số nhà, Phường/Xã, Quận/Huyện, Tỉnh/TP"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
              <MapPin size={16} color="#00f2fe" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>
                Mật khẩu (mã hóa bcrypt) *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  className="input-cosmic"
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                />
                <Lock size={16} color="#00f2fe" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>
                Nhập lại mật khẩu *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  className="input-cosmic"
                  placeholder="Khớp với mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                />
                <Lock size={16} color="#00f2fe" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-cosmic"
            style={{ padding: '13px', fontSize: '1rem', marginTop: '10px' }}
          >
            <UserPlus size={18} />
            <span>{loading ? 'Đang tạo tài khoản...' : 'Hoàn Tất Đăng Ký'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem', color: '#94a3b8' }}>
          Đã có tài khoản?{' '}
          <button
            onClick={() => onNavigate('login')}
            style={{ background: 'none', border: 'none', color: '#00f2fe', fontWeight: 600, cursor: 'pointer' }}
          >
            Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};
