import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to map _id to id
api.interceptors.response.use((response) => {
  const mapId = (obj: unknown): unknown => {
    if (obj && typeof obj === 'object') {
      const record = obj as Record<string, unknown>;
      if (record._id && !record.id) {
        record.id = record._id;
      }
      Object.keys(record).forEach(key => mapId(record[key]));
    }
    return obj;
  };
  
  if (response.data) {
    if (Array.isArray(response.data)) {
      response.data = response.data.map(item => mapId(item));
    } else {
      response.data = mapId(response.data);
    }
  }
  return response;
});

export const productApi = {
  getProducts: (params?: Record<string, string | number | boolean | undefined>) => api.get('/products', { params }),
  getFeaturedProducts: () => api.get('/products/featured'),
  getTrendingProducts: () => api.get('/products/trending'),
  getProductById: (id: string) => api.get(`/products/${id}`),
};

export const authApi = {
  login: (credentials: Record<string, string>) => api.post('/auth/login', credentials),
  register: (userData: Record<string, string>) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

export const orderApi = {
  createOrder: (orderData: Record<string, unknown>) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders/myorders'),
  getOrderById: (id: string) => api.get(`/orders/${id}`),
};

export const userApi = {
  getWishlist: () => api.get('/users/wishlist'),
  toggleWishlist: (productId: string) => api.post('/users/wishlist/toggle', { productId }),
};

export default api;
