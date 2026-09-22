import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Truck, 
  XCircle, 
  DollarSign,
  ArrowLeft,
  X,
  Target,
  Image as ImageIcon
} from 'lucide-react';

export const AdminDashboard = ({ onNavigate }) => {
  const { user, isAdmin } = useAuth();
  const { addToast } = useNotification();

  const [activeTab, setActiveTab] = useState('overview'); // overview, products, orders, users
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    brand_id: 1,
    category_id: 1,
    price: '',
    original_price: '',
    stock: 10,
    target_use: '',
    cpu: '',
    ram: '',
    storage: '',
    gpu: '',
    screen: '',
    battery: '',
    weight: '',
    ports: '',
    os: 'Windows 11 Home',
    is_featured: false,
    is_new: true,
    short_desc: '',
    description: '',
    images: [
      { image_url: '', caption: 'Góc 1: Mở màn hình chính diện' },
      { image_url: '', caption: 'Góc 2: Nghiêng cạnh bên' },
      { image_url: '', caption: 'Góc 3: Bàn phím & mặt lưng' }
    ]
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, prodsRes, ordsRes, usersRes, metaRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminProducts(),
        api.getAdminOrders(),
        api.getAdminUsers(),
        api.getMetadata()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (prodsRes.success) setProducts(prodsRes.products);
      if (ordsRes.success) setOrders(ordsRes.orders);
      if (usersRes.success) setUsersList(usersRes.users);
      if (metaRes.success) {
        setCategories(metaRes.categories);
        setBrands(metaRes.brands);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
      addToast('Lỗi tải dữ liệu quản trị', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="cosmic-container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Bạn không có quyền truy cập khu vực Quản trị viên</h2>
        <p style={{ color: '#94a3b8', marginTop: '8px' }}>Vui lòng đăng nhập với tài khoản Admin (admin / admin123).</p>
        <button onClick={() => onNavigate('login')} className="btn-cosmic" style={{ marginTop: '20px' }}>
          Đăng nhập Quản Trị
        </button>
      </div>
    );
  }

  // Open create product modal
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      brand_id: brands[0]?.id || 1,
      category_id: categories[0]?.id || 1,
      price: '',
      original_price: '',
      stock: 10,
      target_use: '',
      cpu: '',
      ram: '',
      storage: '',
      gpu: '',
      screen: '',
      battery: '',
      weight: '',
      ports: '',
      os: 'Windows 11 Home',
      is_featured: false,
      is_new: true,
      short_desc: '',
      description: '',
      images: [
        { image_url: '', caption: 'Góc 1: Mở màn hình chính diện' },
        { image_url: '', caption: 'Góc 2: Nghiêng cạnh bên' },
        { image_url: '', caption: 'Góc 3: Bàn phím & mặt lưng' }
      ]
    });
    setIsProductModalOpen(true);
  };

  // Open edit product modal
  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      brand_id: prod.brand_id,
      category_id: prod.category_id,
      price: prod.price,
      original_price: prod.original_price || '',
      stock: prod.stock || 10,
      target_use: prod.target_use || '',
      cpu: prod.cpu,
      ram: prod.ram,
      storage: prod.storage,
      gpu: prod.gpu,
      screen: prod.screen,
      battery: prod.battery || '',
      weight: prod.weight || '',
      ports: prod.ports || '',
      os: prod.os || 'Windows 11 Home',
      is_featured: !!prod.is_featured,
      is_new: !!prod.is_new,
      short_desc: prod.short_desc || '',
      description: prod.description || '',
      images: prod.images && prod.images.length > 0 ? prod.images : [
        { image_url: '', caption: 'Góc 1: Mở màn hình chính diện' },
        { image_url: '', caption: 'Góc 2: Nghiêng cạnh bên' },
        { image_url: '', caption: 'Góc 3: Bàn phím & mặt lưng' }
      ]
    });
    setIsProductModalOpen(true);
  };

  // Submit product form
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const validImages = productForm.images.filter((img) => img.image_url && img.image_url.trim());
      if (validImages.length < 1) {
        addToast('Vui lòng cung cấp ít nhất 1 link ảnh laptop (khuyến khích 3 góc chụp)', 'error');
        return;
      }

      const payload = {
        ...productForm,
        images: validImages
      };

      if (editingProduct) {
        await api.updateAdminProduct(editingProduct.id, payload);
        addToast('Cập nhật laptop thành công', 'success');
      } else {
        await api.createAdminProduct(payload);
        addToast('Thêm laptop mới vào hệ thống thành công', 'success');
      }

      setIsProductModalOpen(false);
      loadData();
    } catch (err) {
      addToast(err.message || 'Lỗi lưu thông tin sản phẩm', 'error');
    }
  };

  // Delete product
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}" khỏi hệ thống?`)) return;
    try {
      await api.deleteAdminProduct(id);
      addToast('Đã xóa laptop thành công', 'success');
      loadData();
    } catch (err) {
      addToast(err.message || 'Lỗi xóa sản phẩm', 'error');
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      addToast('Cập nhật trạng thái đơn hàng thành công', 'success');
      loadData();
    } catch (err) {
      addToast(err.message || 'Lỗi cập nhật trạng thái', 'error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '30px 0 80px 0' }}>
      <div className="cosmic-container">
        
        {/* Admin Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <button
              onClick={() => onNavigate('home')}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '0.88rem',
                marginBottom: '8px'
              }}
            >
              <ArrowLeft size={16} />
              <span>Quay lại trang chủ người dùng</span>
            </button>
            <h1 style={{ fontSize: '2.2rem', color: '#fff' }}>
              Trung Tâm Quản Trị HQuanTech
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Quản lý sản phẩm, đơn hàng, người dùng và tình hình kinh doanh
            </p>
          </div>

          {/* Navigation Tabs */}
          <div style={{
            display: 'flex',
            background: 'rgba(15, 23, 50, 0.8)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: '2px',
            padding: '4px'
          }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                padding: '8px 16px',
                borderRadius: '2px',
                border: 'none',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: activeTab === 'overview' ? 'rgba(0, 242, 254, 0.2)' : 'transparent',
                color: activeTab === 'overview' ? '#00f2fe' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <BarChart3 size={16} /> Thống Kê
            </button>
            <button
              onClick={() => setActiveTab('products')}
              style={{
                padding: '8px 16px',
                borderRadius: '2px',
                border: 'none',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: activeTab === 'products' ? 'rgba(0, 242, 254, 0.2)' : 'transparent',
                color: activeTab === 'products' ? '#00f2fe' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Package size={16} /> Laptop ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              style={{
                padding: '8px 16px',
                borderRadius: '2px',
                border: 'none',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: activeTab === 'orders' ? 'rgba(0, 242, 254, 0.2)' : 'transparent',
                color: activeTab === 'orders' ? '#00f2fe' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ShoppingBag size={16} /> Đơn Hàng ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              style={{
                padding: '8px 16px',
                borderRadius: '2px',
                border: 'none',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: activeTab === 'users' ? 'rgba(0, 242, 254, 0.2)' : 'transparent',
                color: activeTab === 'users' ? '#00f2fe' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Users size={16} /> Thành Viên ({usersList.length})
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && stats && (
          <div>
            {/* Metric Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
              marginBottom: '36px'
            }}>
              <div className="glass-card" style={{ padding: '24px', borderRadius: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase' }}>Tổng Doanh Thu</span>
                  <div style={{ padding: '8px', borderRadius: '2px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                    <DollarSign size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue)}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '6px' }}>Doanh số tích lũy đơn hợp lệ</div>
              </div>

              <div className="glass-card" style={{ padding: '24px', borderRadius: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase' }}>Tổng Đơn Hàng</span>
                  <div style={{ padding: '8px', borderRadius: '2px', background: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe' }}>
                    <ShoppingBag size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#00f2fe' }}>
                  {stats.totalOrders}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '6px' }}>Số đơn đã tiếp nhận</div>
              </div>

              <div className="glass-card" style={{ padding: '24px', borderRadius: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase' }}>Mẫu Laptop Hiện Có</span>
                  <div style={{ padding: '8px', borderRadius: '2px', background: 'rgba(147, 51, 234, 0.15)', color: '#c084fc' }}>
                    <Package size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#c084fc' }}>
                  {stats.totalProducts}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '6px' }}>Sản phẩm sẵn kho</div>
              </div>

              <div className="glass-card" style={{ padding: '24px', borderRadius: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase' }}>Thành Viên</span>
                  <div style={{ padding: '8px', borderRadius: '2px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                    <Users size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#60a5fa' }}>
                  {stats.totalUsers}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '6px' }}>Tài khoản đã đăng ký</div>
              </div>
            </div>

            {/* Recent Orders List */}
            <div className="glass-card" style={{ padding: '28px', borderRadius: '4px' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '18px' }}>Đơn Hàng Gần Đây Nhất</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', fontSize: '0.85rem' }}>
                      <th style={{ padding: '12px 14px' }}>Mã Đơn</th>
                      <th style={{ padding: '12px 14px' }}>Khách Hàng</th>
                      <th style={{ padding: '12px 14px' }}>Tổng Tiền</th>
                      <th style={{ padding: '12px 14px' }}>Trạng Thái</th>
                      <th style={{ padding: '12px 14px' }}>Thời Gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders && stats.recentOrders.map((ord) => (
                      <tr key={ord.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.9rem' }}>
                        <td style={{ padding: '14px', color: '#00f2fe', fontWeight: 600 }}>{ord.order_code}</td>
                        <td style={{ padding: '14px', color: '#fff' }}>{ord.customer_name}</td>
                        <td style={{ padding: '14px', color: '#10b981', fontWeight: 700 }}>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ord.total_amount)}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span className="badge-cosmic">{ord.status}</span>
                        </td>
                        <td style={{ padding: '14px', color: '#94a3b8', fontSize: '0.82rem' }}>
                          {new Date(ord.created_at).toLocaleString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="glass-card" style={{ padding: '28px', borderRadius: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.3rem', color: '#fff' }}>Danh Sách Laptop Kho Hàng</h2>
              <button
                onClick={handleOpenCreateModal}
                className="btn-cosmic"
                style={{ padding: '9px 18px', fontSize: '0.9rem' }}
              >
                <Plus size={18} />
                <span>Thêm Laptop Mới</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', fontSize: '0.85rem' }}>
                    <th style={{ padding: '12px' }}>Sản Phẩm</th>
                    <th style={{ padding: '12px' }}>Giá Bán</th>
                    <th style={{ padding: '12px' }}>Tồn Kho</th>
                    <th style={{ padding: '12px' }}>Tiêu Chuẩn Nhu Cầu</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => (
                    <tr key={prod.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.88rem' }}>
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={prod.image_url || prod.primary_image || (prod.images && prod.images[0]?.image_url)}
                            alt={prod.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80';
                            }}
                            style={{ width: '56px', height: '44px', objectFit: 'contain', borderRadius: '2px', background: 'rgba(10, 15, 34, 0.6)' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>{prod.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{prod.brand_name} • {prod.category_name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px', color: '#00f2fe', fontWeight: 700 }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prod.price)}
                      </td>
                      <td style={{ padding: '14px', color: prod.stock > 5 ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                        {prod.stock || 0} máy
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span className="badge-cosmic" style={{ fontSize: '0.75rem' }}>
                          {prod.target_use || 'Đa năng'}
                        </span>
                      </td>
                      <td style={{ padding: '14px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => (handleOpenProductModal ? handleOpenProductModal(prod) : handleOpenEditModal(prod))}
                            style={{
                              background: 'rgba(0, 242, 254, 0.15)',
                              border: '1px solid rgba(0, 242, 254, 0.3)',
                              color: '#00f2fe',
                              borderRadius: '2px',
                              padding: '6px 10px',
                              cursor: 'pointer'
                            }}
                            title="Sửa sản phẩm"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#ef4444',
                              borderRadius: '2px',
                              padding: '6px 10px',
                              cursor: 'pointer'
                            }}
                            title="Xóa sản phẩm"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="glass-card" style={{ padding: '28px', borderRadius: '4px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '24px' }}>
              Quản Lý Đơn Hàng ({orders.length})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  style={{
                    background: 'rgba(10, 15, 34, 0.7)',
                    border: '1px solid rgba(56, 189, 248, 0.15)',
                    borderRadius: '2px',
                    padding: '20px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Mã đơn: </span>
                      <strong style={{ color: '#00f2fe', fontSize: '1rem' }}>{ord.order_code}</strong>
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem', marginLeft: '12px' }}>
                        Người đặt: <strong style={{ color: '#fff' }}>{ord.customer_name}</strong> ({ord.customer_phone} - {ord.customer_email})
                      </span>
                    </div>

                    {/* Status Dropdown */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Trạng thái:</span>
                      <select
                        className="input-cosmic"
                        value={ord.status}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                        style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
                      >
                        <option value="pending" style={{ background: '#0a0e24' }}>⏳ Chờ xác nhận</option>
                        <option value="processing" style={{ background: '#0a0e24' }}>⚙️ Đang xử lý</option>
                        <option value="shipping" style={{ background: '#0a0e24' }}>🚚 Đang giao hàng</option>
                        <option value="delivered" style={{ background: '#0a0e24' }}>✅ Đã giao thành công</option>
                        <option value="cancelled" style={{ background: '#0a0e24' }}>❌ Đã hủy</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '12px' }}>
                    📍 Địa chỉ giao: <span style={{ color: '#f1f5f9' }}>{ord.shipping_address}</span>
                  </div>

                  {/* Order Items */}
                  <div style={{
                    background: 'rgba(15, 23, 48, 0.5)',
                    borderRadius: '2px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    {ord.items && ord.items.map((it) => (
                      <div key={it.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={it.image_url}
                            alt=""
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80';
                            }}
                            style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                          />
                          <span style={{ color: '#fff' }}>{it.product_name}</span>
                          <span style={{ color: '#94a3b8' }}>x{it.quantity}</span>
                        </div>
                        <div style={{ color: '#00f2fe', fontWeight: 600 }}>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(it.price * it.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', fontSize: '0.95rem' }}>
                    <span style={{ color: '#94a3b8', marginRight: '8px' }}>Tổng thanh toán:</span>
                    <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ord.total_amount)}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: USERS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="glass-card" style={{ padding: '28px', borderRadius: '4px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '24px' }}>
              Danh Sách Khách Hàng & Thành Viên ({usersList.length})
            </h2>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', fontSize: '0.85rem' }}>
                    <th style={{ padding: '12px' }}>ID</th>
                    <th style={{ padding: '12px' }}>Họ và Tên</th>
                    <th style={{ padding: '12px' }}>Tên Đăng Nhập</th>
                    <th style={{ padding: '12px' }}>Email</th>
                    <th style={{ padding: '12px' }}>Số Điện Thoại</th>
                    <th style={{ padding: '12px' }}>Địa Chỉ</th>
                    <th style={{ padding: '12px' }}>Vai Trò</th>
                    <th style={{ padding: '12px' }}>Đơn Hàng</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.88rem' }}>
                      <td style={{ padding: '12px', color: '#94a3b8' }}>#{u.id}</td>
                      <td style={{ padding: '12px', color: '#fff', fontWeight: 600 }}>{u.full_name}</td>
                      <td style={{ padding: '12px', color: '#38bdf8' }}>@{u.username}</td>
                      <td style={{ padding: '12px', color: '#cbd5e1' }}>{u.email}</td>
                      <td style={{ padding: '12px', color: '#94a3b8' }}>{u.phone}</td>
                      <td style={{ padding: '12px', color: '#94a3b8', maxWidth: '200px' }}>{u.address}</td>
                      <td style={{ padding: '12px' }}>
                        <span className={u.role === 'admin' ? 'badge-purple' : 'badge-cosmic'}>
                          {u.role === 'admin' ? 'Quản trị' : 'Thành viên'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#10b981', fontWeight: 700 }}>
                        {u.orders_count || 0} đơn
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* PRODUCT CREATE / EDIT MODAL (Hỗ trợ 3 góc chụp và tiêu chuẩn nhu cầu) */}
      {isProductModalOpen && (
        <div className="modal-overlay" onClick={() => setIsProductModalOpen(false)}>
          <div
            className="glass-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '850px',
              width: '95%',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              background: '#0a0e24',
              border: '1px solid rgba(0, 242, 254, 0.35)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(15, 23, 50, 0.9)'
            }}>
              <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>
                {editingProduct ? 'Chỉnh Sửa Thông Tin Laptop' : 'Thêm Siêu Phẩm Laptop Mới'}
              </h2>
              <button
                onClick={() => setIsProductModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Basic Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Tên Laptop *</label>
                  <input
                    type="text"
                    required
                    className="input-cosmic"
                    placeholder="Ví dụ: ASUS ROG Strix SCAR 18..."
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Hãng sản xuất *</label>
                  <select
                    className="input-cosmic"
                    value={productForm.brand_id}
                    onChange={(e) => setProductForm({ ...productForm, brand_id: parseInt(e.target.value, 10) })}
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id} style={{ background: '#0a0e24' }}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Dòng máy *</label>
                  <select
                    className="input-cosmic"
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: parseInt(e.target.value, 10) })}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} style={{ background: '#0a0e24' }}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Requirement: Tiêu chuẩn đáp ứng cho nhu cầu nào */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#00f2fe', marginBottom: '4px', fontWeight: 600 }}>
                  🎯 Tiêu Chuẩn Nhu Cầu Đáp Ứng (Mô tả rõ tiêu chuẩn sử dụng) *
                </label>
                <input
                  type="text"
                  required
                  className="input-cosmic"
                  placeholder="Ví dụ: Đạt chuẩn: Gaming AAA Max Settings 4K, Esport 240Hz, Streamer & Render đồ họa..."
                  value={productForm.target_use}
                  onChange={(e) => setProductForm({ ...productForm, target_use: e.target.value })}
                />
              </div>

              {/* Prices & Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Giá Bán (VND) *</label>
                  <input
                    type="number"
                    required
                    className="input-cosmic"
                    placeholder="94990000"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Giá Gốc Niêm Yết (VND)</label>
                  <input
                    type="number"
                    className="input-cosmic"
                    placeholder="104990000"
                    value={productForm.original_price}
                    onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Số lượng trong kho</label>
                  <input
                    type="number"
                    className="input-cosmic"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
              </div>

              {/* Hardware Specifications */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Vi xử lý (CPU) *</label>
                  <input
                    type="text"
                    required
                    className="input-cosmic"
                    placeholder="Intel Core i9-14900HX (24 cores)..."
                    value={productForm.cpu}
                    onChange={(e) => setProductForm({ ...productForm, cpu: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Card đồ họa (GPU) *</label>
                  <input
                    type="text"
                    required
                    className="input-cosmic"
                    placeholder="NVIDIA GeForce RTX 4090 16GB..."
                    value={productForm.gpu}
                    onChange={(e) => setProductForm({ ...productForm, gpu: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>RAM *</label>
                  <input
                    type="text"
                    required
                    className="input-cosmic"
                    placeholder="32GB hoặc 64GB DDR5..."
                    value={productForm.ram}
                    onChange={(e) => setProductForm({ ...productForm, ram: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Ổ cứng SSD *</label>
                  <input
                    type="text"
                    required
                    className="input-cosmic"
                    placeholder="1TB NVMe PCIe 4.0 SSD..."
                    value={productForm.storage}
                    onChange={(e) => setProductForm({ ...productForm, storage: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Màn hình *</label>
                  <input
                    type="text"
                    required
                    className="input-cosmic"
                    placeholder="16.0 inch 2.5K 240Hz 100% DCI-P3..."
                    value={productForm.screen}
                    onChange={(e) => setProductForm({ ...productForm, screen: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Trọng lượng & Pin</label>
                  <input
                    type="text"
                    className="input-cosmic"
                    placeholder="2.1kg | Pin 90Wh"
                    value={productForm.weight}
                    onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                  />
                </div>
              </div>

              {/* Requirement: Ít nhất 3 góc chụp */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#00f2fe', marginBottom: '8px', fontWeight: 600 }}>
                  📷 Link Hình Ảnh 3 Góc Chụp Khác Nhau Của Laptop (Ít nhất 3 góc):
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {productForm.images.map((img, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', width: '90px', flexShrink: 0 }}>
                        Góc {idx + 1}:
                      </span>
                      <input
                        type="url"
                        className="input-cosmic"
                        placeholder={`https://example.com/laptop-angle-${idx + 1}.jpg`}
                        value={img.image_url}
                        onChange={(e) => {
                          const newImgs = [...productForm.images];
                          newImgs[idx].image_url = e.target.value;
                          setProductForm({ ...productForm, images: newImgs });
                        }}
                      />
                      <input
                        type="text"
                        className="input-cosmic"
                        style={{ maxWidth: '180px' }}
                        placeholder="Mô tả góc chụp"
                        value={img.caption}
                        onChange={(e) => {
                          const newImgs = [...productForm.images];
                          newImgs[idx].caption = e.target.value;
                          setProductForm({ ...productForm, images: newImgs });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Mô tả ngắn</label>
                <input
                  type="text"
                  className="input-cosmic"
                  placeholder="Tóm tắt sức mạnh nổi bật của laptop..."
                  value={productForm.short_desc}
                  onChange={(e) => setProductForm({ ...productForm, short_desc: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>Mô tả bài viết chi tiết</label>
                <textarea
                  className="input-cosmic"
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#fff', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={productForm.is_featured}
                    onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                  />
                  <span>🌟 Sản phẩm Flagship nổi bật (Hiển thị ở Scroll Showcase)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#fff', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={productForm.is_new}
                    onChange={(e) => setProductForm({ ...productForm, is_new: e.target.checked })}
                  />
                  <span>⚡ Mẫu máy mới nhất (New 2026)</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="btn-secondary"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="btn-cosmic"
                  style={{ padding: '10px 24px' }}
                >
                  {editingProduct ? 'Cập Nhật Laptop' : 'Thêm Laptop Mới'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
