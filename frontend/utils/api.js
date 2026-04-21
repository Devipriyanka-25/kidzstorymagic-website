// Frontend API client
import axios from 'axios';
import { retryWithBackoff, handleApiError } from './advancedErrorHandler';

// Get the API base URL dynamically to ensure runtime evaluation
function getAPIBaseURL() {
  if (typeof window === 'undefined') {
    console.log('[getAPIBaseURL] Server-side rendering - returning /api');
    return '/api';
  }
  
  const hostname = window.location.hostname;
  console.log('[getAPIBaseURL] Hostname:', hostname);
  
  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168')) {
    console.log('[getAPIBaseURL] Local development detected - returning http://localhost:5000/api');
    return 'http://localhost:5000/api';
  }
  
  // Production: use /api to route through Vercel proxy
  console.log('[getAPIBaseURL] Production detected - returning /api');
  return '/api';
}

// Create API client with dynamic baseURL
function createAPIClient() {
  const baseURL = getAPIBaseURL();
  
  console.log('[createAPIClient] Creating axios instance with baseURL:', baseURL);
  
  const apiClient = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 30000
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
      if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
        console.log(`[API_SUCCESS] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
      }
      return response;
    },
    (error) => {
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
      
      if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          window.location.href = '/auth/login';
        }
      }
      
      return Promise.reject(error);
    }
  );

  return apiClient;
}

// Request timeout (30 seconds)
const REQUEST_TIMEOUT = 30000;

// Get auth token
export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Auth APIs
export const authAPI = {
  register: (data) => {
    console.log('[authAPI.register] Called - creating client');
    const client = createAPIClient();
    console.log('[authAPI.register] Client created, posting to /auth/register');
    return client.post('/auth/register', data);
  },
  login: (data) => {
    console.log('[authAPI.login] Called - creating client');
    const client = createAPIClient();
    console.log('[authAPI.login] Client created, posting to /auth/login');
    return client.post('/auth/login', data);
  },
  forgotPassword: (email) => createAPIClient().post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => createAPIClient().post('/auth/reset-password', { token, password }),
  getCurrentUser: () => createAPIClient().get('/auth/me'),
  updateProfile: (data) => createAPIClient().put('/auth/me', data),
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }
};

// Story APIs with enhanced error handling
export const storyAPI = {
  createProject: (data) => 
    retryWithBackoff(() => createAPIClient().post('/story/create', data), 3, 1000),
  
  getProjects: (limit = 10, offset = 0) => 
    createAPIClient().get('/story', { params: { limit, offset } }),
  
  listStories: (limit = 10, offset = 0) => 
    createAPIClient().get('/story', { params: { limit, offset } }),
  
  getProject: (projectId) => 
    createAPIClient().get(`/story/${projectId}`),
  
  updateProject: (projectId, data) => 
    createAPIClient().put(`/story/${projectId}`, data),
  
  deleteProject: (projectId) => 
    createAPIClient().delete(`/story/${projectId}`),
  
  uploadPhoto: (projectId, file) => {
    const formData = new FormData();
    formData.append('photo', file);
    return retryWithBackoff(
      () => createAPIClient().post(`/story/${projectId}/upload-photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000
      }),
      3,
      1000
    );
  },
  
  generateStory: (projectId, customPrompt = null, storyLanguage = 'en') => 
    retryWithBackoff(
      () => createAPIClient().post(`/story/${projectId}/generate-story`, { customPrompt, storyLanguage }, {
        timeout: 120000
      }),
      2,
      2000
    ),
  
  getStoryContent: (projectId) => 
    createAPIClient().get(`/story/${projectId}/content`),
  
  generateStoryFromImages: (payload) => 
    retryWithBackoff(
      () => createAPIClient().post('/story/generate-from-images', payload, {
        timeout: 120000
      }),
      2,
      2000
    ),
  
  saveDraft: (payload) => 
    createAPIClient().post('/story/save-draft', payload),
  
  regenerateStory: (storyId, options) => 
    retryWithBackoff(
      () => createAPIClient().post(`/story/${storyId}/regenerate`, options, {
        timeout: 120000
      }),
      2,
      2000
    ),
  
  getStory: (storyId) => 
    createAPIClient().get(`/story/${storyId}`)
};

// Draft Stories APIs
export const draftAPI = {
  getDraftStories: () => createAPIClient().get('/drafts/user'),
  getDraft: (draftId) => createAPIClient().get(`/drafts/${draftId}`),
  createDraft: (data) => createAPIClient().post('/drafts', data),
  updateDraft: (draftId, data) => createAPIClient().put(`/drafts/${draftId}`, data),
  deleteDraft: (draftId) => createAPIClient().delete(`/drafts/${draftId}`),
  publishDraft: (draftId) => createAPIClient().post(`/drafts/${draftId}/publish`),
  saveDraftProgress: (draftId, data) => createAPIClient().put(`/drafts/${draftId}`, data)
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
      () => createAPIClient().post('/payment/checkout', data),
      3,
      1000
    ),
  
  confirmPayment: (data) => 
    retryWithBackoff(
      () => createAPIClient().post('/payment/confirm-payment', data),
      3,
      1000
    ),
  
  verifyPayment: (sessionId) => 
    createAPIClient().get(`/payment/verify/${sessionId}`),
  
  getOrder: (orderId) => 
    createAPIClient().get(`/payment/order/${orderId}`),
  
  getUserOrders: () => 
    createAPIClient().get('/payment/user/orders'),
  
  getPDF: (projectId) => 
    createAPIClient().get(`/payment/pdf/${projectId}`, {
      responseType: 'blob'
    })
};

// Currency APIs
export const currencyAPI = {
  getSupportedCurrencies: () => createAPIClient().get('/currency/supported'),
  
  getExchangeRates: (from = 'USD', to = null) => 
    createAPIClient().get('/currency/rates', { params: { from, to } }),
  
  convertCurrency: (data) => 
    createAPIClient().post('/currency/convert', data),
  
  getPricing: (data) => 
    createAPIClient().post('/currency/pricing', data),
  
  detectCurrency: () => 
    createAPIClient().get('/currency/detect'),
  
  refreshRates: () => 
    retryWithBackoff(() => createAPIClient().post('/currency/refresh-rates'), 2, 1000)
};

export default apiClient;
