import React, { useState, useEffect } from 'react';
import { HeroBanner } from '../components/home/HeroBanner';
import { ScrollShowcase } from '../components/home/ScrollShowcase';
import { CategorySection } from '../components/home/CategorySection';
import { ProductCard } from '../components/product/ProductCard';
import { api } from '../services/api';
import { Sparkles, ArrowRight, Filter, Flame } from 'lucide-react';

export const HomePage = ({ onNavigate, onSelectProduct }) => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [featuredRes, productsRes] = await Promise.all([
          api.getFeatured(),
          api.getProducts({ limit: 8 })
        ]);

        if (featuredRes.success) {
          setFeaturedProducts(featuredRes.products);
        }
        if (productsRes.success) {
          setAllProducts(productsRes.products);
        }
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleCategoryClick = (catSlug) => {
    onNavigate('products', { category: catSlug });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. Cosmic Hero Banner */}
      <HeroBanner onExploreClick={() => onNavigate('products')} />

      {/* 2. Scroll Showcase (Cuộn đến đâu nổi dần lên đến đó với các mẫu laptop mới nhất + 3 góc ảnh) */}
      <ScrollShowcase 
        products={featuredProducts.length > 0 ? featuredProducts : allProducts.slice(0, 4)} 
        onSelectProduct={onSelectProduct} 
      />

      {/* 3. Phân loại laptop (Gaming, Văn phòng, Đồ họa, Mỏng nhẹ) */}
      <CategorySection onSelectCategory={handleCategoryClick} />

      {/* 4. Toàn Bộ Siêu Phẩm Bán Chạy */}
      <section style={{ padding: '60px 0 90px 0', position: 'relative' }}>
        <div className="cosmic-container">
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '10px', borderRadius: '2px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                <Flame size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.8rem', color: '#fff' }}>Sản Phẩm Được Săn Đón Nhất</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Các dòng laptop cấu hình khủng đang sẵn hàng tại showroom</p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('products')}
              className="btn-outline-cyan"
              style={{ padding: '9px 18px', fontSize: '0.9rem' }}
            >
              <span>Xem tất cả laptop</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#00f2fe' }}>
              <Sparkles size={36} className="animate-float" />
              <p style={{ marginTop: '12px', color: '#94a3b8' }}>Đang kết nối vũ trụ dữ liệu HQuanTech...</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              {allProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          )}

        </div>
      </section>

    </div>
  );
};
