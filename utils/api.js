// Frontend API client
import axios from 'axios';
import { retryWithBackoff, handleApiError } from './advancedErrorHandler';

// Get auth token
export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Get API base URL dynamically at RUNTIME, not at build time
// This ensures environment variables and window detection work correctly
function getAPIBaseURL() {
  // Use local /api routes (Next.js serverless functions)
  // This works for both localhost and production
  return '/api';
}

function buildLoginRedirectUrl() {
  if (typeof window === 'undefined') {
    return '/auth/login';
  }

  const nextPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (!nextPath || nextPath.startsWith('/auth/login')) {
    return '/auth/login';
  }

  return `/auth/login?next=${encodeURIComponent(nextPath)}`;
}

// Create API client dynamically at runtime
function createAPIClient() {
  const baseURL = getAPIBaseURL();
  
  // DEBUG: Log which API URL is being used
  if (typeof window !== 'undefined') {
    console.log('🔍 [createAPIClient] API Base URL:', baseURL);
  }
  
  const apiClient = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 30000 // 30 seconds
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
      
      // Handle 401 (Unauthorized) - redirect to login
      if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          window.location.href = buildLoginRedirectUrl();
        }
      }
      
      return Promise.reject(error);
    }
  );

  return apiClient;
}

// Auth APIs
export const authAPI = {
  register: (data) => createAPIClient().post('/auth/register', data),
  login: (data) => createAPIClient().post('/auth/login', data),
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

  generateStory: (
    projectId,
    customPrompt = null,
    storyLanguage = 'en',
    storyData = {},
    options = {}
  ) =>
    retryWithBackoff(
      () => createAPIClient().post(`/story/${projectId}/generate-story`, {
        ...storyData,
        customPrompt,
        storyLanguage,
        forceRegenerate: Boolean(options.forceRegenerate),
      }, {
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

  getLatestDraft: () =>
    createAPIClient().get('/story/latest-draft'),

  sendPreviewEmail: (payload) =>
    createAPIClient().post('/story/send-email', payload),

  getMagicPreview: (token) =>
    createAPIClient().get('/story/preview', { params: { token } }),
  
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
  
  verifyPayment: (sessionId, projectId = null) => 
    createAPIClient().get(`/payment/verify/${sessionId}`, {
      params: projectId ? { projectId } : undefined,
    }),
  
  getOrder: (orderId) => 
    createAPIClient().get(`/payment/order/${orderId}`),
  
  getUserOrders: () => 
    createAPIClient().get('/payment/user/orders'),

  getAllOrders: () =>
    createAPIClient().get('/payment/admin/orders'),
  
  getPDF: (projectId) => 
    createAPIClient().get(`/payment/pdf/${projectId}`, {
      responseType: 'blob'
    }),

  // NEW: Check payment status for a specific story
  getStoryPaymentStatus: (storyId) =>
    createAPIClient().get(`/payment/story-status/${storyId}`),

  // NEW: Get story preview with payment details
  getStoryPreviewWithPayment: (storyId) =>
    createAPIClient().get(`/story/preview-with-payment/${storyId}`)
};

export const emailAPI = {
  requestPreviewEmail: (data) =>
    retryWithBackoff(
      () =>
        createAPIClient().post('/email/preview-request', data, {
          timeout: 30000,
        }),
      2,
      1500
    ),
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

// Face Swap API - FIXED BUG 2: Added missing swapFaceDeepAI method
export const faceSwapAPI = {
  detectFace: (photo, childName, userId, storyId) => {
    const formData = new FormData();
    formData.append('photo', photo);
    formData.append('childName', childName);
    formData.append('userId', userId);
    if (storyId) formData.append('storyId', storyId);
    
    return createAPIClient().post('/photos/detect-face', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // FIXED BUG 2: This was the missing method Step 6 was calling
  // Maps to /api/photos/face-swap endpoint which uses Replicate API
  swapFaceDeepAI: (faceImageUrl, illustrationImageUrl, options = {}) => 
    createAPIClient().post('/photos/face-swap', {
      faceImageUrl,
      illustrationImageUrl,
      ...options
    }, {
      timeout: 120000 // Face swap can take up to 2 minutes
    }),
  
  performFaceSwap: (params) => 
    createAPIClient().post('/photos/face-swap', params),
  
  saveFaceSwap: (params) => 
    retryWithBackoff(() => createAPIClient().post('/photos/save-face-swap', params), 2, 1000),
  
  getFaceSwapResults: (storyId) => 
    createAPIClient().get(`/photos/face-swap-results/${storyId}`),
  
  deleteFaceSwap: (resultId) => 
    createAPIClient().delete(`/photos/face-swap/${resultId}`)
};

// Note: Default export removed since apiClient no longer exists at module level
// Use the named exports (authAPI, storyAPI, paymentAPI, faceSwapAPI, etc.) instead
