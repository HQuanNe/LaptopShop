import React from 'react';
import { X, SlidersHorizontal, Check, Trash2, ShoppingBag, Target, ArrowRight } from 'lucide-react';
import { useCompare } from '../../context/CompareContext';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';

export const CompareModal = ({ onSelectProduct }) => {
  const { compareItems, removeFromCompare, clearCompare, isCompareModalOpen, setIsCompareModalOpen } = useCompare();
  const { addToCart } = useCart();
  const { addToast } = useNotification();

  if (!isCompareModalOpen) return null;

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    addToast(`Đã thêm "${product.name}" vào giỏ hàng`, 'success');
  };

  const rows = [
    { label: 'Tiêu chuẩn đáp ứng', key: 'target_use', isTarget: true },
    { label: 'Giá bán chính hãng', key: 'price', format: (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v) },
    { label: 'Vi xử lý (CPU)', key: 'cpu' },
    { label: 'Card đồ họa (GPU)', key: 'gpu' },
    { label: 'Bộ nhớ RAM', key: 'ram' },
    { label: 'Ổ cứng SSD', key: 'storage' },
    { label: 'Màn hình hiển thị', key: 'screen' },
    { label: 'Pin & Sạc', key: 'battery' },
    { label: 'Trọng lượng máy', key: 'weight' },
    { label: 'Cổng kết nối', key: 'ports' },
    { label: 'Hệ điều hành', key: 'os' }
  ];

  return (
    <div className="modal-overlay" onClick={() => setIsCompareModalOpen(false)}>
      <div 
        className="glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '94%',
          maxWidth: '1100px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: '#090d24',
          border: '1px solid rgba(0, 242, 254, 0.35)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(0, 242, 254, 0.2)'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 50, 0.8)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe' }}>
              <SlidersHorizontal size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>
                Bảng So Sánh Cấu Hình & Tiêu Chuẩn Nhu Cầu Laptop
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Phân tích đối chiếu chi tiết để tìm ra chiếc máy hoàn hảo cho công việc & giải trí của bạn
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {compareItems.length > 0 && (
              <button
                onClick={clearCompare}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Trash2 size={14} /> Xóa tất cả
              </button>
            )}
            <button
              onClick={() => setIsCompareModalOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ overflowY: 'auto', padding: '24px' }}>
          {compareItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
              <SlidersHorizontal size={48} color="#00f2fe" style={{ opacity: 0.4, marginBottom: '16px' }} />
              <h3 style={{ color: '#fff', marginBottom: '8px' }}>Chưa có laptop nào trong danh sách so sánh</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
                Hãy nhấn nút biểu tượng cân chỉnh trên các thẻ sản phẩm để thêm vào so sánh tối đa 3 máy cùng lúc.
              </p>
              <button onClick={() => setIsCompareModalOpen(false)} className="btn-cosmic">
                Khám phá sản phẩm ngay
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                <thead>
                  <tr>
                    <th style={{ width: '220px', padding: '16px', textAlign: 'left', borderBottom: '2px solid rgba(56, 189, 248, 0.2)', color: '#94a3b8' }}>
                      Tiêu Chí Đối Chiếu
                    </th>
                    {compareItems.map((prod) => (
                      <th
                        key={prod.id}
                        style={{
                          padding: '16px',
                          borderBottom: '2px solid rgba(56, 189, 248, 0.2)',
                          textAlign: 'center',
                          verticalAlign: 'top',
                          position: 'relative'
                        }}
                      >
                        <button
                          onClick={() => removeFromCompare(prod.id)}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#ef4444',
                            borderRadius: '2px',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                          title="Xóa khỏi so sánh"
                        >
                          <X size={13} />
                        </button>

                        <div style={{ height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                          <img
                            src={prod.primary_image || (prod.images && prod.images[0]?.image_url)}
                            alt={prod.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80';
                            }}
                            style={{ maxHeight: '100px', maxWidth: '140px', objectFit: 'contain' }}
                          />
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: '10px' }}>
                          {prod.name}
                        </div>
                        <button
                          onClick={() => handleAddToCart(prod)}
                          className="btn-cosmic"
                          style={{ fontSize: '0.78rem', padding: '7px 12px', width: '100%', borderRadius: '2px' }}
                        >
                          <ShoppingBag size={14} /> CHỌN MUA NGAY
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr 
                      key={row.key} 
                      style={{
                        background: row.isTarget 
                          ? 'linear-gradient(90deg, rgba(0, 242, 254, 0.1) 0%, rgba(147, 51, 234, 0.15) 100%)' 
                          : idx % 2 === 0 ? 'rgba(15, 23, 48, 0.3)' : 'transparent',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
                      }}
                    >
                      <td style={{
                        padding: '14px 16px',
                        fontWeight: 600,
                        color: row.isTarget ? '#00f2fe' : '#94a3b8',
                        fontSize: '0.88rem'
                      }}>
                        {row.isTarget && <Target size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />}
                        {row.label}
                      </td>
                      {compareItems.map((prod) => {
                        const val = prod[row.key];
                        return (
                          <td
                            key={prod.id}
                            style={{
                              padding: '14px 16px',
                              textAlign: 'center',
                              fontSize: '0.88rem',
                              color: row.isTarget ? '#38bdf8' : row.key === 'price' ? '#00f2fe' : '#e2e8f0',
                              fontWeight: (row.isTarget || row.key === 'price') ? 700 : 400,
                              lineHeight: '1.5'
                            }}
                          >
                            {row.format ? row.format(val) : (val || '—')}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
