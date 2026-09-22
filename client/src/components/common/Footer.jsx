import React from 'react';
import { Laptop, ShieldCheck, Truck, RotateCcw, Headphones, Heart } from 'lucide-react';

export const Footer = ({ onNavigate }) => {
  return (
    <footer 
      className="cosmic-footer"
      style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        marginTop: 'auto',
        background: 'linear-gradient(180deg, #070a18 0%, #03050c 100%)',
        borderTop: '1px solid rgba(56, 189, 248, 0.2)',
        paddingTop: '60px',
        paddingBottom: '30px'
      }}
    >

      <div className="cosmic-container">

        {/* Value Propositions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
          paddingBottom: '40px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0, 242, 254, 0.1)', color: '#00f2fe' }}>
              <ShieldCheck size={26} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff' }}>100% Chính Hãng</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Bảo hành vũ trụ 24 tháng</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(147, 51, 234, 0.15)', color: '#c084fc' }}>
              <Truck size={26} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff' }}>Giao Hàng Siêu Tốc</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Hỏa tốc 2H tại nội thành</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', color: '#38bdf8' }}>
              <RotateCcw size={26} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff' }}>Đổi Trả Linh Hoạt</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>1 đổi 1 trong 30 ngày đầu</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' }}>
              <Headphones size={26} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff' }}>Hỗ Trợ Kỹ Thuật 24/7</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Đội ngũ kỹ sư tận tâm</div>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          paddingTop: '40px',
          paddingBottom: '40px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #00f2fe 0%, #7928ca 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Laptop size={20} color="#fff" />
              </div>
              <span className="font-brand" style={{ fontSize: '1.25rem', fontWeight: 800 }}>HQuan<span style={{ color: '#00f2fe' }}>Tech</span></span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.7', marginBottom: '16px' }}>
              Hệ thống bán lẻ laptop cao cấp hàng đầu thế giới công nghệ. Cam kết trải nghiệm mượt mà, cấu hình đỉnh cao và dịch vụ chu đáo nhất.
            </p>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
              Hotline: <strong style={{ color: '#00f2fe' }}>1900 8899 (8:00 - 22:00)</strong>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '18px' }}>Dòng Laptop Hot</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#94a3b8' }}>
              <li style={{ cursor: 'pointer' }} onClick={() => onNavigate('products', { category: 'laptop-gaming' })}>
                ⚡ Laptop Gaming Cực Đỉnh
              </li>
              <li style={{ cursor: 'pointer' }} onClick={() => onNavigate('products', { category: 'laptop-van-phong' })}>
                💼 Laptop Doanh Nhân & Văn Phòng
              </li>
              <li style={{ cursor: 'pointer' }} onClick={() => onNavigate('products', { category: 'laptop-do-hoa' })}>
                🎨 Laptop Đồ Họa & Render 3D
              </li>
              <li style={{ cursor: 'pointer' }} onClick={() => onNavigate('products', { category: 'laptop-mong-nhe' })}>
                🪶 Ultrabook Mỏng Nhẹ Di Động
              </li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '18px' }}>Thương Hiệu Hàng Đầu</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#94a3b8' }}>
              <li style={{ cursor: 'pointer' }} onClick={() => onNavigate('products', { brand: 'asus' })}>ASUS ROG Gaming</li>
              <li style={{ cursor: 'pointer' }} onClick={() => onNavigate('products', { brand: 'apple' })}>Apple MacBook Pro / Air</li>
              <li style={{ cursor: 'pointer' }} onClick={() => onNavigate('products', { brand: 'dell' })}>Dell XPS & Alienware</li>
              <li style={{ cursor: 'pointer' }} onClick={() => onNavigate('products', { brand: 'lenovo' })}>Lenovo Legion & ThinkPad</li>
              <li style={{ cursor: 'pointer' }} onClick={() => onNavigate('products', { brand: 'acer' })}>Acer Predator Gaming</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '18px' }}>Địa Chỉ Showroom</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.7', marginBottom: '12px' }}>
              Trụ sở: Tản Hồng, Ba Vì, TP. Hà Nội
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.7' }}>
              Email: <span style={{ color: '#38bdf8' }}>support@hquantech.com</span>
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div style={{
          paddingTop: '25px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          fontSize: '0.85rem',
          color: '#64748b'
        }}>
          <div>
            © {new Date().getFullYear()} HQuanTech Inc. Vũ Trụ Công Nghệ. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Được phát triển với niềm đam mê công nghệ</span>
            <Heart size={14} color="#ef4444" fill="#ef4444" />
          </div>
        </div>

      </div>
    </footer>
  );
};
