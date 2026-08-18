import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const { token } = JSON.parse(userInfo);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // Ignored
      }
    }
  }
  return config;
});

// Response interceptor to map _id to id and handle token refresh
api.interceptors.response.use(
  (response) => {
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
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && typeof window !== 'undefined') {
      originalRequest._retry = true;
      const userInfoStr = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
      if (userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr);
          const { refreshToken } = userInfo;
          if (refreshToken) {
            const refreshResponse = await axios.post('/api/auth/refresh', { refreshToken });
            if (refreshResponse.data?.token) {
              const newToken = refreshResponse.data.token;
              const newRefreshToken = refreshResponse.data.refreshToken || refreshToken;
              const updatedUserInfo = {
                ...userInfo,
                token: newToken,
                refreshToken: newRefreshToken,
              };
              localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
              if (sessionStorage.getItem('userInfo')) {
                sessionStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
              }
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return api(originalRequest);
            }
          }
        } catch (refreshError) {
          console.error('Failed to auto-refresh auth token:', refreshError);
          localStorage.removeItem('userInfo');
          sessionStorage.removeItem('userInfo');
          if (window.location.pathname !== '/auth/login') {
            window.location.href = '/auth/login?expired=true';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export const productApi = {
  getProducts: (params?: Record<string, string | number | boolean | undefined>) => api.get('/products', { params }),
  getFeaturedProducts: () => api.get('/products/featured'),
  getTrendingProducts: () => api.get('/products/trending'),
  getProductById: (id: string) => api.get(`/products/${id}`),
  getProductReviews: (id: string) => api.get(`/products/${id}/reviews`),
  addProductReview: (id: string, review: Record<string, unknown>) => api.post(`/products/${id}/reviews`, review),
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
  returnOrder: (id: string, reason: string) => api.post(`/orders/${id}/return`, { reason }),
};

export const userApi = {
  getWishlist: () => api.get('/users/wishlist'),
  toggleWishlist: (productId: string) => api.post('/users/wishlist/toggle', { productId }),
  getWallet: () => api.get('/users/wallet'),
  addWalletMoney: (amount: number) => api.post('/users/wallet', { amount }),
};

export const supportApi = {
  getTickets: () => api.get('/support/tickets'),
  createTicket: (ticketData: Record<string, unknown>) => api.post('/support/tickets', ticketData),
};

export default api;
