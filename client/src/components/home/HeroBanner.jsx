import React from 'react';
import { ArrowRight, SlidersHorizontal, ShieldCheck, Truck, RefreshCw, Award, Zap } from 'lucide-react';
import { useCompare } from '../../context/CompareContext';

export const HeroBanner = ({ onExploreClick }) => {
  const { setIsCompareModalOpen } = useCompare();

  return (
    <section style={{
      position: 'relative',
      paddingTop: '40px',
      paddingBottom: '60px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'linear-gradient(180deg, rgba(14, 16, 23, 0.4) 0%, rgba(8, 9, 13, 0.9) 100%)'
    }}>
      <div className="cosmic-container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '40px',
          alignItems: 'center'
        }}>
          
          {/* Left Column: Authentic Commercial Editorial */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '2px', padding: '4px 10px', fontSize: '0.74rem', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '18px' }}>
              <Zap size={13} />
              <span>FLAGSHIP HARDWARE 2026</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
              lineHeight: '1.15',
              fontWeight: 800,
              color: '#ffffff',
              marginBottom: '18px',
              letterSpacing: '-0.03em'
            }}>
              Sức Mạnh Phần Cứng <br />
              <span className="text-titanium">Tối Thượng & Chuẩn Xác</span>
            </h1>

            <p style={{ color: '#94a3b8', fontSize: '1.02rem', lineHeight: '1.6', marginBottom: '28px', maxWidth: '520px' }}>
              Trải nghiệm các dòng máy trạm và cỗ máy gaming hàng đầu từ <strong>Intel Core Ultra 9, NVIDIA RTX 4090</strong> và <strong>Apple M3 Max</strong>. Tuyển chọn chính hãng, cam kết hiệu năng thực tế.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '36px' }}>
              <button
                onClick={onExploreClick}
                className="btn-cosmic"
                style={{ padding: '12px 24px', fontSize: '0.88rem', borderRadius: '2px' }}
              >
                <span>Khám Phá Sản Phẩm</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="btn-secondary"
                style={{ padding: '12px 20px', fontSize: '0.88rem', borderRadius: '2px' }}
              >
                <SlidersHorizontal size={15} color="#38bdf8" />
                <span>So Sánh Cấu Hình</span>
              </button>
            </div>

            {/* Value Guarantees */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#cbd5e1' }}>
                <ShieldCheck size={16} color="#38bdf8" />
                <span>100% Chính hãng VAT</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#cbd5e1' }}>
                <RefreshCw size={16} color="#38bdf8" />
                <span>1 Đổi 1 trong 30 ngày</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#cbd5e1' }}>
                <Truck size={16} color="#38bdf8" />
                <span>Giao hỏa tốc 2 giờ</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#cbd5e1' }}>
                <Award size={16} color="#38bdf8" />
                <span>Bảo hành tận nhà 24T</span>
              </div>
            </div>

          </div>

          {/* Right Column: Studio Spotlight Card */}
          <div style={{ position: 'relative' }}>
            <div 
              className="glass-card"
              style={{
                background: 'radial-gradient(circle at center, #181b28 0%, #0d0f16 100%)',
                border: '1px solid var(--border-medium)',
                borderRadius: '4px',
                padding: '28px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Product Spotlight Tag */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.08em' }}>
                    SPOTLIGHT
                  </span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                    ASUS ROG Strix SCAR 18
                  </div>
                </div>
                <span className="badge-perk">SẴN HÀNG TẠI SHOWROOM</span>
              </div>

              {/* Hardware Photo with clean studio shadow */}
              <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '10px 0' }}>
                <img
                  src="https://dlcdnwebimgs.asus.com/gain/4B54DA05-C385-4DC3-84B9-C608EB78B6FE/w1000/h750"
                  alt="ASUS ROG Strix SCAR 18"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80';
                  }}
                  style={{
                    maxHeight: '100%',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 15px 25px rgba(0, 0, 0, 0.8))'
                  }}
                />
              </div>

              {/* Specs Pills Bar */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '8px',
                background: 'rgba(8, 9, 13, 0.7)',
                padding: '10px 14px',
                borderRadius: '2px',
                border: '1px solid var(--border-subtle)',
                textAlign: 'center',
                fontSize: '0.78rem'
              }}>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.7rem' }}>CPU</div>
                  <strong style={{ color: '#fff' }}>i9-14900HX</strong>
                </div>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.7rem' }}>GPU</div>
                  <strong style={{ color: '#38bdf8' }}>RTX 4090 16GB</strong>
                </div>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.7rem' }}>DISPLAY</div>
                  <strong style={{ color: '#fff' }}>18" 2.5K 240Hz</strong>
                </div>
              </div>

              {/* Price & Action */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Giá ưu đãi đặc biệt:</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>
                    94.990.000₫
                  </div>
                </div>
                <button onClick={onExploreClick} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  Xem chi tiết
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
