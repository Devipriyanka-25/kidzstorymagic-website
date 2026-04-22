// Frontend Interceptor for API Calls
import axios from 'axios';

// FORCE /api in production - this is the proxy route that forwards to Railway
// In development (localhost), use local backend
const IS_PRODUCTION = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const API_BASE_URL = IS_PRODUCTION ? '/api' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');

console.log('🚀 [API_CLIENT_INTERCEPTOR] Initialized with baseURL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        window.location.href = '/auth/login';
      }
    }

    // Handle errors
    return Promise.reject(error);
  }
);

export default apiClient;

// Specific API endpoints
export const endpoints = {
  // Auth
  auth: {
    register: (data) => apiClient.post('/auth/register', data),
    login: (data) => apiClient.post('/auth/login', data),
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
      return Promise.resolve();
    },
    me: () => apiClient.get('/auth/me'),
    updateProfile: (data) => apiClient.put('/auth/me', data),
    forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => apiClient.post('/auth/reset-password', { token, password })
  },

  // Stories
  stories: {
    list: (params) => apiClient.get('/story', { params }),
    get: (id) => apiClient.get(`/story/${id}`),
    create: (data) => apiClient.post('/story/create', data),
    update: (id, data) => apiClient.put(`/story/${id}`, data),
    delete: (id) => apiClient.delete(`/story/${id}`),
    uploadPhoto: (projectId, formData) => apiClient.post(
      `/story/${projectId}/upload-photo`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),
    generate: (projectId) => apiClient.post(`/story/${projectId}/generate-story`, {})
  },

  // Payments
  payment: {
    checkout: (data) => apiClient.post('/payment/checkout', data),
    confirmPayment: (data) => apiClient.post('/payment/confirm-payment', data),
    getOrder: (orderId) => apiClient.get(`/payment/order/${orderId}`),
    listOrders: (params) => apiClient.get('/payment/user/orders', { params })
  },

  // Currency
  currency: {
    supported: () => apiClient.get('/currency/supported'),
    rates: (params) => apiClient.get('/currency/rates', { params }),
    convert: (from, to, amount) => apiClient.post('/currency/convert', { from, to, amount }),
    pricing: (currency) => apiClient.post('/currency/pricing', { currency }),
    detect: () => apiClient.get('/currency/detect')
  }
};
