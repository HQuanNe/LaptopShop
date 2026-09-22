import React from 'react';
import { Gamepad2, Briefcase, Palette, Feather, ArrowRight } from 'lucide-react';

export const CategorySection = ({ onSelectCategory }) => {
  const categories = [
    {
      id: 'laptop-gaming',
      title: 'Laptop Gaming Cực Đỉnh',
      desc: 'RTX 40 Series, màn hình 240Hz, tối ưu tản nhiệt cho trải nghiệm chiến game AAA mượt mà',
      icon: Gamepad2,
      badge: 'RTX 40 Series',
      highlightColor: '#f43f5e'
    },
    {
      id: 'laptop-van-phong',
      title: 'Doanh Nhân & Văn Phòng',
      desc: 'Chuẩn Intel Evo AI, thiết kế nguyên khối sang trọng, pin cả ngày 15h, bảo mật sinh trắc học',
      icon: Briefcase,
      badge: 'Intel Evo AI',
      highlightColor: '#38bdf8'
    },
    {
      id: 'laptop-do-hoa',
      title: 'Đồ Họa & Sáng Tạo',
      desc: 'Màn hình OLED 100% DCI-P3 chuẩn màu thiết kế, sức mạnh dựng phim 8K ProRes và render 3D',
      icon: Palette,
      badge: 'Chuẩn Màu DCI-P3',
      highlightColor: '#a855f7'
    },
    {
      id: 'laptop-mong-nhe',
      title: 'Ultrabook Di Động',
      desc: 'Trọng lượng siêu nhẹ dưới 1.3kg, vỏ hợp kim titan nhôm hàng không bền bỉ cho người hay di chuyển',
      icon: Feather,
      badge: 'Dưới 1.3kg',
      highlightColor: '#10b981'
    }
  ];

  return (
    <section style={{ padding: '60px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="cosmic-container">
        
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.08em' }}>
              PHÂN LOẠI CHUYÊN BIỆT
            </span>
            <h2 style={{ fontSize: '2rem', color: '#ffffff', marginTop: '4px' }}>
              Chọn Laptop Phù Hợp Mục Đích
            </h2>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '440px' }}>
            Tìm kiếm nhanh theo đúng nhu cầu sử dụng thực tế của bạn để tối ưu ngân sách và hiệu năng.
          </p>
        </div>

        {/* Categories Grid - Đảm bảo hiển thị đầy đủ 4 options */}
        <div className="category-grid">

          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="glass-card"
                style={{
                  padding: '24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  background: '#11131a',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '200px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '3px',
                      background: '#181b26',
                      border: '1px solid var(--border-medium)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: cat.highlightColor
                    }}>
                      <Icon size={20} />
                    </div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: '2px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#cbd5e1',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      {cat.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
                    {cat.title}
                  </h3>

                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5' }}>
                    {cat.desc}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '0.82rem', fontWeight: 500, marginTop: '18px' }}>
                  <span>Xem sản phẩm</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
