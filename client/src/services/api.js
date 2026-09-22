const rawApiUrl = import.meta.env.VITE_API_URL;
const API_BASE = rawApiUrl ? `${rawApiUrl.replace(/\/$/, '')}/api` : '/api';


const getAuthHeaders = () => {
  const token = localStorage.getItem('hquantech_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  };

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({ success: false, message: 'Lỗi phản hồi máy chủ' }));

  if (!response.ok) {
    throw new Error(data.message || 'Đã có lỗi xảy ra');
  }

  return data;
}

export const api = {
  // Auth
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getProfile: () => request('/auth/profile'),
  updateProfile: (profileData) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),

  // Products
  getMetadata: () => request('/products/metadata'),
  getFeatured: () => request('/products/featured'),
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') query.append(key, val);
    });
    return request(`/products?${query.toString()}`);
  },
  getProductDetails: (idOrSlug) => request(`/products/${idOrSlug}`),
  compareProducts: (ids) => request(`/products/compare?ids=${ids.join(',')}`),

  // Orders
  createOrder: (orderData) => request('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  getMyOrders: () => request('/orders/my-orders'),
  getOrderByCode: (orderCode) => request(`/orders/${orderCode}`),

  // Reviews
  addReview: (reviewData) => request('/reviews', { method: 'POST', body: JSON.stringify(reviewData) }),

  // Admin
  getAdminStats: () => request('/admin/stats'),
  getAdminProducts: () => request('/admin/products'),
  createAdminProduct: (prodData) => request('/admin/products', { method: 'POST', body: JSON.stringify(prodData) }),
  updateAdminProduct: (id, prodData) => request(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(prodData) }),
  deleteAdminProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
  getAdminOrders: (status) => request(`/admin/orders${status ? `?status=${status}` : ''}`),
  updateOrderStatus: (id, status) => request(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getAdminUsers: () => request('/admin/users')
};
