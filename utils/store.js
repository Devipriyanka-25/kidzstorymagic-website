// Frontend state management (Zustand store)
import { create } from 'zustand';
import { authAPI, getAuthToken } from './api';

function buildDraftSafeFormData(formData = {}) {
  const {
    photo,
    uploadedPhoto,
    uploadedImages,
    ...rest
  } = formData;

  return {
    ...rest,
    photo: null,
    uploadedPhoto: null,
    uploadedImages: [],
    uploadedImagesCount: Array.isArray(uploadedImages) ? uploadedImages.length : 0,
    needsPhotoReupload: Array.isArray(uploadedImages) && uploadedImages.length > 0,
  };
}

function persistWizardDraft(step, formData) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(
      'wizardDraft',
      JSON.stringify({
        step,
        formData: buildDraftSafeFormData(formData),
      })
    );
  } catch (err) {
    console.error('[DRAFT] Failed to save draft:', err);
  }
}

// Auth Store
export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitializing: true,

  // Initialize auth from token
  initAuth: async () => {
    if (typeof window !== 'undefined') {
      const token = getAuthToken();
      if (token) {
        try {
          console.log('[INITAUTH] Found token in localStorage, verifying...');
          const response = await authAPI.getCurrentUser();
          console.log('[INITAUTH] Token verified, setting authenticated state');
          set({
            user: response.data.user,
            isAuthenticated: true,
            isInitializing: false,
          });
        } catch (err) {
          console.log('[INITAUTH] Token verification failed:', err.message);
          localStorage.removeItem('authToken');
          set({ isAuthenticated: false, isInitializing: false });
        }
      } else {
        console.log('[INITAUTH] No token in localStorage');
        set({ isInitializing: false });
      }
    }
  },

  // Register
  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register(data);
      
      // If backend returns token, save it and mark as authenticated
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        set({ 
          user: response.data.user, 
          isAuthenticated: true 
        });
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.details?.[0]?.msg ||
                          'Registration failed';
      set({ error: errorMessage });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // Login
  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      console.log('[LOGIN] Sending login request with data:', data);
      const response = await authAPI.login(data);
      console.log('[LOGIN] Login successful, token received');
      localStorage.setItem('authToken', response.data.token);
      set({ user: response.data.user, isAuthenticated: true });
      return response.data;
    } catch (err) {
      console.error('[LOGIN] Login error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      set({ error: err.response?.data?.error || 'Login failed' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    set({ user: null, isAuthenticated: false });
  },

  // Update profile
  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.updateProfile(data);
      set({ user: response.data.user });
      return response.data;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Update failed' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  }
}));

// Story Projects Store
export const useStoryStore = create((set) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  // Fetch projects
  fetchProjects: async (limit = 10, offset = 0) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/story?limit=${limit}&offset=${offset}`);
      const data = await response.json();
      set({ projects: data.projects });
      return data;
    } catch (err) {
      set({ error: 'Failed to fetch projects' });
    } finally {
      set({ isLoading: false });
    }
  },

  // Set current project
  setCurrentProject: (project) => set({ currentProject: project }),

  // Clear current project
  clearCurrentProject: () => set({ currentProject: null })
}));

// Wizard Store (for multi-step form)
export const useWizardStore = create((set, get) => ({
  step: 1,
  formData: {
    ageGroup: '',
    theme: '',
    illustrationStyle: '',
    pageCount: 10,
    childName: '',
    childGender: '',
    childInterests: '',
    childNotes: '',
    photo: null,
    projectId: null,
    uploadedPhoto: null,
    customIllustrationPrompt: '',
    uploadedImages: []
  },

  setStep: (step) => {
    set({ step });
    // Save draft when step changes
    const state = get();
    persistWizardDraft(step, state.formData);
  },

  nextStep: () => {
    set((state) => {
      const newStep = state.step + 1;
      // Auto-save draft to localStorage when stepping
      persistWizardDraft(newStep, state.formData);
      return { step: newStep };
    });
  },

  prevStep: () => {
    set((state) => {
      const newStep = Math.max(state.step - 1, 1);
      // Auto-save draft to localStorage when stepping
      persistWizardDraft(newStep, state.formData);
      return { step: newStep };
    });
  },

  updateFormData: (field, value) =>
    set((state) => {
      const newFormData = { ...state.formData, [field]: value };
      // Auto-save draft to localStorage
      persistWizardDraft(state.step, newFormData);
      return { formData: newFormData };
    }),

  // Load draft from localStorage
  loadDraft: () => {
    if (typeof window !== 'undefined') {
      try {
        const draft = localStorage.getItem('wizardDraft');
        if (draft) {
          const { step, formData } = JSON.parse(draft);
          set({
            step,
            formData: {
              ...formData,
              photo: null,
              uploadedPhoto: null,
              uploadedImages: [],
            },
          });
          console.log('[DRAFT] Loaded draft at step:', step);
          return true;
        }
      } catch (err) {
        console.error('[DRAFT] Failed to load draft:', err);
      }
    }
    return false;
  },

  // Save current state to draft
  saveDraft: () => {
    const state = get();
    persistWizardDraft(state.step, state.formData);
    console.log('[DRAFT] Manually saved draft at step:', state.step);
  },

  // Clear draft
  clearDraft: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('wizardDraft');
        console.log('[DRAFT] Draft cleared');
      } catch (err) {
        console.error('[DRAFT] Failed to clear draft:', err);
      }
    }
  },

  resetWizard: () => set({
    step: 1,
    formData: {
      ageGroup: '',
      theme: '',
      illustrationStyle: '',
      pageCount: 10,
      childName: '',
      childGender: '',
      childInterests: '',
      childNotes: '',
      photo: null,
      projectId: null,
      uploadedPhoto: null,
      customIllustrationPrompt: '',
      uploadedImages: []
    }
  })
}));

// Currency Store
export const useCurrencyStore = create((set) => ({
  selectedCurrency: 'USD',
  supportedCurrencies: ['USD', 'CAD', 'GBP', 'EUR', 'AUD', 'INR'],
  exchangeRates: {},
  pricing: null,

  setCurrency: (currency) => set({ selectedCurrency: currency }),
  setPricing: (pricing) => set({ pricing })
}));
