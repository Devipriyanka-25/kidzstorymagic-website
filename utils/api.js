// Frontend API client
import axios from 'axios';
import { retryWithBackoff, handleApiError } from './advancedErrorHandler';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Request timeout (30 seconds)
const REQUEST_TIMEOUT = 30000;

// Get auth token
export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// API client instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: REQUEST_TIMEOUT
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('[API_REQUEST_ERROR]', error);
  return Promise.reject(error);
});

// Handle response errors and logging
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log(`[API_SUCCESS] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
    }
    return response;
  },
  (error) => {
    // Handle different error scenarios
    const errorInfo = handleApiError(error);
    
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.error('[API_ERROR]', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: errorInfo.message,
        data: error.response?.data
      });
    }
    
    // Handle 401 (Unauthorized) - redirect to login
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        window.location.href = '/auth/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => apiClient.post('/auth/reset-password', { token, password }),
  getCurrentUser: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/me', data),
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }
};

// Story APIs with enhanced error handling
export const storyAPI = {
  createProject: (data) => 
    retryWithBackoff(() => apiClient.post('/story/create', data), 3, 1000),
  
  getProjects: (limit = 10, offset = 0) => 
    apiClient.get('/story', { params: { limit, offset } }),
  
  listStories: (limit = 10, offset = 0) => 
    apiClient.get('/story', { params: { limit, offset } }),
  
  getProject: (projectId) => 
    apiClient.get(`/story/${projectId}`),
  
  updateProject: (projectId, data) => 
    apiClient.put(`/story/${projectId}`, data),
  
  deleteProject: (projectId) => 
    apiClient.delete(`/story/${projectId}`),
  
  uploadPhoto: (projectId, file) => {
    const formData = new FormData();
    formData.append('photo', file);
    return retryWithBackoff(
      () => apiClient.post(`/story/${projectId}/upload-photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000 // Longer timeout for file upload
      }),
      3,
      1000
    );
  },
  
  generateStory: (projectId, customPrompt = null, storyLanguage = 'en') => 
    retryWithBackoff(
      () => apiClient.post(`/story/${projectId}/generate-story`, { customPrompt, storyLanguage }, {
        timeout: 120000 // Very long timeout for AI generation
      }),
      2,
      2000
    ),
  
  getStoryContent: (projectId) => 
    apiClient.get(`/story/${projectId}/content`),
  
  generateStoryFromImages: (payload) => 
    retryWithBackoff(
      () => apiClient.post('/story/generate-from-images', payload, {
        timeout: 120000
      }),
      2,
      2000
    ),
  
  saveDraft: (payload) => 
    apiClient.post('/story/save-draft', payload),
  
  regenerateStory: (storyId, options) => 
    retryWithBackoff(
      () => apiClient.post(`/story/${storyId}/regenerate`, options, {
        timeout: 120000
      }),
      2,
      2000
    ),
  
  getStory: (storyId) => 
    apiClient.get(`/story/${storyId}`)
};

// Draft Stories APIs
export const draftAPI = {
  getDraftStories: () => apiClient.get('/drafts/user'),
  getDraft: (draftId) => apiClient.get(`/drafts/${draftId}`),
  createDraft: (data) => apiClient.post('/drafts', data),
  updateDraft: (draftId, data) => apiClient.put(`/drafts/${draftId}`, data),
  deleteDraft: (draftId) => apiClient.delete(`/drafts/${draftId}`),
  publishDraft: (draftId) => apiClient.post(`/drafts/${draftId}/publish`),
  saveDraftProgress: (draftId, data) => apiClient.put(`/drafts/${draftId}`, data)
};

// Add draft methods to storyAPI for convenience
storyAPI.getDraftStories = draftAPI.getDraftStories;
storyAPI.getDraft = draftAPI.getDraft;
storyAPI.createDraft = draftAPI.createDraft;
storyAPI.updateDraft = draftAPI.updateDraft;
storyAPI.deleteDraft = draftAPI.deleteDraft;
storyAPI.publishDraft = draftAPI.publishDraft;
storyAPI.saveDraftProgress = draftAPI.saveDraftProgress;

// Payment APIs with retry logic for reliability
export const paymentAPI = {
  createCheckout: (data) => 
    retryWithBackoff(
      () => apiClient.post('/payment/checkout', data),
      3,
      1000
    ),
  
  confirmPayment: (data) => 
    retryWithBackoff(
      () => apiClient.post('/payment/confirm-payment', data),
      3,
      1000
    ),
  
  verifyPayment: (sessionId) => 
    apiClient.get(`/payment/verify/${sessionId}`),
  
  getOrder: (orderId) => 
    apiClient.get(`/payment/order/${orderId}`),
  
  getUserOrders: () => 
    apiClient.get('/payment/user/orders'),
  
  getPDF: (projectId) => 
    apiClient.get(`/payment/pdf/${projectId}`, {
      responseType: 'blob'
    })
};

// Currency APIs
export const currencyAPI = {
  getSupportedCurrencies: () => apiClient.get('/currency/supported'),
  
  getExchangeRates: (from = 'USD', to = null) => 
    apiClient.get('/currency/rates', { params: { from, to } }),
  
  convertCurrency: (data) => 
    apiClient.post('/currency/convert', data),
  
  getPricing: (data) => 
    apiClient.post('/currency/pricing', data),
  
  detectCurrency: () => 
    apiClient.get('/currency/detect'),
  
  refreshRates: () => 
    retryWithBackoff(() => apiClient.post('/currency/refresh-rates'), 2, 1000)
};

export default apiClient;
