import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/product/ProductCard';
import { api } from '../services/api';
import { Filter, SlidersHorizontal, Search, RotateCcw, Sparkles } from 'lucide-react';

export const ProductsPage = ({ initialFilters = {}, onSelectProduct }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || '');
  const [selectedBrand, setSelectedBrand] = useState(initialFilters.brand || '');
  const [selectedRam, setSelectedRam] = useState('');
  const [search, setSearch] = useState(initialFilters.search || '');
  const [sort, setSort] = useState('newest');
  const [priceRange, setPriceRange] = useState('all'); // all, under50, 50to75, above75

  // Load Metadata (Categories and Brands)
  useEffect(() => {
    api.getMetadata().then((res) => {
      if (res.success) {
        setCategories(res.categories);
        setBrands(res.brands);
      }
    });
  }, []);

  // Update when initialFilters change
  useEffect(() => {
    if (initialFilters.category !== undefined) setSelectedCategory(initialFilters.category);
    if (initialFilters.brand !== undefined) setSelectedBrand(initialFilters.brand);
    if (initialFilters.search !== undefined) setSearch(initialFilters.search);
  }, [initialFilters]);

  // Load Products with filters
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const params = {
          sort,
          limit: 30
        };

        if (selectedCategory) params.category = selectedCategory;
        if (selectedBrand) params.brand = selectedBrand;
        if (selectedRam) params.ram = selectedRam;
        if (search.trim()) params.search = search.trim();

        if (priceRange === 'under50') {
          params.maxPrice = 50000000;
        } else if (priceRange === '50to75') {
          params.minPrice = 50000000;
          params.maxPrice = 75000000;
        } else if (priceRange === 'above75') {
          params.minPrice = 75000000;
        }

        const res = await api.getProducts(params);
        if (res.success) {
          setProducts(res.products);
        }
      } catch (err) {
        console.error('Error fetching filtered products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [selectedCategory, selectedBrand, selectedRam, search, sort, priceRange]);

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedRam('');
    setSearch('');
    setPriceRange('all');
    setSort('newest');
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 0 80px 0' }}>
      <div className="cosmic-container">
        
        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <div className="badge-cosmic" style={{ marginBottom: '10px' }}>
            <Sparkles size={14} />
            <span>KHO VŨ TRỤ LAPTOP HQUANTECH</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', color: '#fff', marginBottom: '8px' }}>
            Danh Sách Laptop Cao Cấp
          </h1>
          <p style={{ color: '#94a3b8' }}>
            Tìm kiếm, đối chiếu và sở hữu ngay các dòng máy tính xách tay cấu hình cao nhất với giá ưu đãi.
          </p>
        </div>

        {/* Filters Top Bar */}
        <div 
          className="glass-card"
          style={{
            padding: '20px',
            marginBottom: '36px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {/* Row 1: Search & Sort */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
              <input
                type="text"
                className="input-cosmic"
                placeholder="Tìm theo tên máy, chip Core i9/Ultra, RTX 4080..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
              <Search size={18} color="#00f2fe" style={{ position: 'absolute', left: '14px', top: '13px' }} />
            </div>

            {/* Sort Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.88rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>Sắp xếp:</span>
              <select
                className="input-cosmic"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{ width: 'auto', padding: '10px 14px', cursor: 'pointer' }}
              >
                <option value="newest" style={{ background: '#0a0e24' }}>⚡ Mới nhất & Flagship</option>
                <option value="price_asc" style={{ background: '#0a0e24' }}>💰 Giá: Thấp đến Cao</option>
                <option value="price_desc" style={{ background: '#0a0e24' }}>💎 Giá: Cao đến Thấp</option>
                <option value="rating" style={{ background: '#0a0e24' }}>⭐ Đánh giá cao nhất</option>
              </select>
            </div>

            {/* Reset Button */}
            {(selectedCategory || selectedBrand || selectedRam || search || priceRange !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="btn-secondary"
                style={{ padding: '10px 14px', fontSize: '0.85rem', color: '#ef4444' }}
              >
                <RotateCcw size={15} />
                <span>Xóa bộ lọc</span>
              </button>
            )}
          </div>

          {/* Row 2: Category Filter Pills */}
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
              Dòng máy theo nhu cầu:
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedCategory('')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '2px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  border: selectedCategory === '' ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: selectedCategory === '' ? 'rgba(0, 242, 254, 0.2)' : 'rgba(15, 23, 42, 0.5)',
                  color: selectedCategory === '' ? '#00f2fe' : '#94a3b8'
                }}
              >
                Tất cả dòng máy
              </button>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.slug || selectedCategory === String(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(isSelected ? '' : cat.slug)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '2px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      border: isSelected ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: isSelected ? 'rgba(0, 242, 254, 0.2)' : 'rgba(15, 23, 42, 0.5)',
                      color: isSelected ? '#00f2fe' : '#94a3b8'
                    }}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: Brands & Price Range */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Brands */}
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
                Hãng sản xuất:
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {brands.map((b) => {
                  const isBSelected = selectedBrand === b.slug || selectedBrand === String(b.id);
                  return (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBrand(isBSelected ? '' : b.slug)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '2px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: isBSelected ? '1px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: isBSelected ? 'rgba(147, 51, 234, 0.25)' : 'rgba(15, 23, 42, 0.5)',
                        color: isBSelected ? '#c084fc' : '#94a3b8'
                      }}
                    >
                      {b.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Segment */}
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
                Mức giá:
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setPriceRange('all')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '2px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    background: priceRange === 'all' ? 'rgba(0, 242, 254, 0.2)' : 'rgba(15, 23, 42, 0.5)',
                    color: priceRange === 'all' ? '#00f2fe' : '#94a3b8',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  Tất cả giá
                </button>
                <button
                  onClick={() => setPriceRange('under50')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '2px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    background: priceRange === 'under50' ? 'rgba(0, 242, 254, 0.2)' : 'rgba(15, 23, 42, 0.5)',
                    color: priceRange === 'under50' ? '#00f2fe' : '#94a3b8',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  Dưới 50 Triệu
                </button>
                <button
                  onClick={() => setPriceRange('50to75')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '2px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    background: priceRange === '50to75' ? 'rgba(0, 242, 254, 0.2)' : 'rgba(15, 23, 42, 0.5)',
                    color: priceRange === '50to75' ? '#00f2fe' : '#94a3b8',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  50 - 75 Triệu
                </button>
                <button
                  onClick={() => setPriceRange('above75')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '2px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    background: priceRange === 'above75' ? 'rgba(0, 242, 254, 0.2)' : 'rgba(15, 23, 42, 0.5)',
                    color: priceRange === 'above75' ? '#00f2fe' : '#94a3b8',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  Trên 75 Triệu
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Results Count & Product Grid */}
        <div style={{ marginBottom: '20px', color: '#94a3b8', fontSize: '0.9rem' }}>
          Hiển thị <strong style={{ color: '#00f2fe' }}>{products.length}</strong> mẫu laptop phù hợp:
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#00f2fe' }}>
            <Sparkles size={40} className="animate-float" />
            <p style={{ marginTop: '16px', color: '#94a3b8' }}>Đang nạp dữ liệu laptop...</p>
          </div>
        ) : products.length === 0 ? (
          <div 
            className="glass-card" 
            style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', maxWidth: '600px', margin: '40px auto' }}
          >
            <Search size={48} color="#00f2fe" style={{ opacity: 0.4, marginBottom: '16px' }} />
            <h3 style={{ color: '#fff', marginBottom: '8px' }}>Không tìm thấy mẫu laptop nào khớp</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
              Hãy thử điều chỉnh lại mức giá hoặc từ khóa tìm kiếm của bạn.
            </p>
            <button onClick={handleResetFilters} className="btn-cosmic">
              Xem tất cả sản phẩm
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {products.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
