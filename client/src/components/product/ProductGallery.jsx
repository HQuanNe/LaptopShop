import React, { useState, useEffect } from 'react';
import { Camera, ZoomIn, RotateCcw } from 'lucide-react';

export const ProductGallery = ({ images = [], productName = '' }) => {
  const [activeIdx, setActiveIdx] = useState(0);

  // Fallback if no images provided
  const displayImages = images.length > 0 ? images : [
    { image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800', caption: 'Góc chính diện' },
    { image_url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800', caption: 'Góc nghiêng cạnh bên' },
    { image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800', caption: 'Góc bàn phím' }
  ];

  // Tự động chuyển góc chụp mỗi 3.2 giây liên tục (không tạm dừng khi rê chuột)
  useEffect(() => {
    if (displayImages.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % displayImages.length);
    }, 3200);

    return () => clearInterval(interval);
  }, [displayImages.length]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Main Large Image View with Smooth Cinematic Crossfade */}
      <div 
        className="glass-card"
        style={{
          position: 'relative',
          height: '420px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          overflow: 'hidden',
          background: 'radial-gradient(circle at center, rgba(15, 23, 50, 0.9) 0%, rgba(6, 8, 19, 0.95) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: '4px'
        }}
      >
        {/* Layered Images with Silky Smooth Crossfade */}
        {displayImages.map((img, index) => {
          const isActive = index === activeIdx;
          return (
            <img
              key={img.id || index}
              src={img.image_url}
              alt={`${productName} - ${img.caption || ''}`}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80';
              }}
              style={{
                position: 'absolute',
                maxWidth: '92%',
                maxHeight: '92%',
                objectFit: 'contain',
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'scale(1)' : 'scale(0.96)',
                transition: 'opacity 0.85s cubic-bezier(0.4, 0, 0.2, 1), transform 0.85s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.7))',
                pointerEvents: isActive ? 'auto' : 'none'
              }}
            />
          );
        })}
      </div>

      {/* Thumbnails Row (Ít nhất 3 ảnh góc chụp) */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${displayImages.length}, 1fr)`, gap: '12px' }}>
        {displayImages.map((img, index) => {
          const isActive = index === activeIdx;
          return (
            <div
              key={img.id || index}
              onClick={() => setActiveIdx(index)}
              style={{
                height: '84px',
                borderRadius: '2px',
                border: isActive ? '2px solid #00f2fe' : '1px solid rgba(56, 189, 248, 0.15)',
                background: isActive ? 'rgba(0, 242, 254, 0.1)' : 'rgba(15, 23, 42, 0.6)',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                boxShadow: isActive ? '0 0 15px rgba(0, 242, 254, 0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <img
                src={img.image_url}
                alt={img.caption || `Góc ${index + 1}`}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80';
                }}
                style={{
                  maxWidth: '100%',
                  maxHeight: '52px',
                  objectFit: 'contain'
                }}
              />
              <span style={{
                fontSize: '0.68rem',
                color: isActive ? '#00f2fe' : '#94a3b8',
                fontWeight: isActive ? 700 : 500,
                marginTop: '2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '90%'
              }}>
                Góc {index + 1}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
