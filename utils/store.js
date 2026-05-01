// Frontend state management (Zustand store)
import { create } from 'zustand';
import { authAPI, getAuthToken } from './api';
import { DEFAULT_EXCHANGE_RATES } from './pricing';
import { STORAGE_KEYS } from './constants';

let backendDraftSaveTimer = null;
let backendDraftSaveSequence = 0;

function buildDraftSafeFormData(
  formData = {},
  { includeImagePreviews = true } = {}
) {
  const {
    photo,
    uploadedPhoto,
    uploadedImages,
    storyPreview,
    ...rest
  } = formData;

  // Preserve image previews for face swap (strip file objects to reduce storage)
  const previewImages = Array.isArray(uploadedImages)
    ? uploadedImages
        .map(img => {
          const illustrationReference = img?.illustrationReference || null;
          const preview = includeImagePreviews
            ? img?.preview || img?.data || illustrationReference
            : illustrationReference;

          return {
            id: img?.id || null,
            name: img?.name || 'Uploaded photo',
            preview: preview || null,
            illustrationReference,
          };
        })
        .filter(img => img.preview || img.illustrationReference)
    : [];

  // Preserve story preview to avoid regeneration on return from payment
  const savedPreview = Array.isArray(storyPreview)
    ? storyPreview.map(page => ({
        title: page?.title,
        text: page?.text,
        page_text: page?.page_text,
        pageType: page?.pageType,
        pageNumber: page?.pageNumber,
        illustrationPrompt: page?.illustrationPrompt,
        illustrationUrl: page?.illustrationUrl,
        faceSwappedUrl: page?.faceSwappedUrl,
      }))
    : null;

  return {
    ...rest,
    photo: null,
    uploadedPhoto: null,
    uploadedImages: previewImages,
    uploadedImagesCount: Array.isArray(uploadedImages) ? uploadedImages.length : 0,
    needsPhotoReupload: Array.isArray(uploadedImages) && uploadedImages.length > 0,
    storyPreview: savedPreview,
  };
}

function persistWizardDraft(step, formData) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(
      STORAGE_KEYS.WIZARD_DRAFT,
      JSON.stringify({
        step,
        formData: buildDraftSafeFormData(formData),
      })
    );
  } catch (err) {
    console.error('[DRAFT] Failed to save draft:', err);
  }
}

function persistWizardDraftToBackend(get, set, step, formData, { immediate = false } = {}) {
  if (typeof window === 'undefined' || !getAuthToken()) {
    return;
  }

  const runSave = async () => {
    const token = getAuthToken();
    if (!token) {
      return;
    }

    const saveSequence = ++backendDraftSaveSequence;

    try {
      const response = await fetch('/api/story/save-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          step,
          formData: buildDraftSafeFormData(formData, {
            includeImagePreviews: false,
          }),
        }),
      });

      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details.error || 'Draft backend save failed');
      }

      const data = await response.json();
      const projectId = data?.projectId || data?.draft?.id;

      if (!projectId || saveSequence < backendDraftSaveSequence) {
        return;
      }

      const currentProjectId = get().formData?.projectId;
      if (!currentProjectId) {
        const nextFormData = {
          ...get().formData,
          projectId: String(projectId),
        };
        set({ formData: nextFormData });
        persistWizardDraft(get().step, nextFormData);
      }
    } catch (error) {
      console.warn('[DRAFT] Backend draft save failed:', error.message);
    }
  };

  if (backendDraftSaveTimer) {
    window.clearTimeout(backendDraftSaveTimer);
    backendDraftSaveTimer = null;
  }

  if (immediate) {
    runSave();
    return;
  }

  backendDraftSaveTimer = window.setTimeout(runSave, 800);
}

function createInitialWizardFormData() {
  return {
    ageGroup: '',
    theme: '',
    illustrationStyle: '',
    pageCount: 10,
    childName: '',
    childAge: '',
    childGender: '',
    childInterests: '',
    childNotes: '',
    parentConsent: false,
    parentEmail: '',
    photo: null,
    projectId: null,
    uploadedPhoto: null,
    customIllustrationPrompt: '',
    uploadedImages: [],
    selectedMilestoneId: '',
    milestoneTitle: '',
    milestonePromptHint: '',
    milestoneCoverBadge: '',
    isSeries: false,
    seriesChapterNumber: 1,
    seriesOriginalTheme: '',
    seriesBundleSelected: false,
  };
}

function normalizeDraftStep(step, { maxStep } = {}) {
  const parsedStep = Number(step);
  const baseStep = Number.isFinite(parsedStep)
    ? Math.max(1, parsedStep)
    : 1;

  if (Number.isFinite(maxStep)) {
    return Math.min(baseStep, Math.max(1, Number(maxStep)));
  }

  return baseStep;
}

function hydrateWizardFormData(formData = {}, { clearStoryPreview = false } = {}) {
  return {
    ...createInitialWizardFormData(),
    ...formData,
    photo: null,
    uploadedPhoto: null,
    uploadedImages: Array.isArray(formData?.uploadedImages)
      ? formData.uploadedImages
      : [],
    storyPreview: clearStoryPreview ? null : formData?.storyPreview || null,
  };
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
  formData: createInitialWizardFormData(),

  setStep: (step) => {
    set({ step });
    // Save draft when step changes
    const state = get();
    persistWizardDraft(step, state.formData);
    persistWizardDraftToBackend(get, set, step, state.formData);
  },

  nextStep: () => {
    set((state) => {
      const newStep = state.step + 1;
      // Auto-save draft to localStorage when stepping
      persistWizardDraft(newStep, state.formData);
      persistWizardDraftToBackend(get, set, newStep, state.formData);
      return { step: newStep };
    });
  },

  prevStep: () => {
    set((state) => {
      const newStep = Math.max(state.step - 1, 1);
      // Auto-save draft to localStorage when stepping
      persistWizardDraft(newStep, state.formData);
      persistWizardDraftToBackend(get, set, newStep, state.formData);
      return { step: newStep };
    });
  },

  updateFormData: (field, value) =>
    set((state) => {
      const newFormData = { ...state.formData, [field]: value };
      // Auto-save draft to localStorage
      persistWizardDraft(state.step, newFormData);
      persistWizardDraftToBackend(get, set, state.step, newFormData);
      return { formData: newFormData };
    }),

  // Load draft from localStorage
  loadDraftSnapshot: (snapshot, options = {}) => {
    const {
      maxStep,
      clearStoryPreview = false,
      expectedProjectId = '',
    } = options;

    if (!snapshot || typeof snapshot !== 'object') {
      return false;
    }

    const sourceStep = Number(snapshot?.step);
    const effectiveStep = normalizeDraftStep(snapshot?.step, { maxStep });
    const draftFormData = snapshot?.formData || {};
    const draftProjectId = String(draftFormData?.projectId || '').trim();
    const normalizedExpectedProjectId = String(expectedProjectId || '').trim();

    if (
      normalizedExpectedProjectId &&
      draftProjectId &&
      draftProjectId !== normalizedExpectedProjectId
    ) {
      return false;
    }

    const shouldClearPreview =
      clearStoryPreview ||
      (Number.isFinite(maxStep) &&
        Number.isFinite(sourceStep) &&
        sourceStep > maxStep);

    set({
      step: effectiveStep,
      formData: hydrateWizardFormData(draftFormData, {
        clearStoryPreview: shouldClearPreview,
      }),
    });
    console.log('[DRAFT] Hydrated draft at step:', effectiveStep);
    return true;
  },

  // Load draft from localStorage
  loadDraft: (options = {}) => {
    if (typeof window !== 'undefined') {
      try {
        const draft = localStorage.getItem(STORAGE_KEYS.WIZARD_DRAFT);
        if (draft) {
          const parsedDraft = JSON.parse(draft);
          return get().loadDraftSnapshot(parsedDraft, options);
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
    persistWizardDraftToBackend(get, set, state.step, state.formData, {
      immediate: true,
    });
    console.log('[DRAFT] Manually saved draft at step:', state.step);
  },

  // Clear draft
  clearDraft: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEYS.WIZARD_DRAFT);
        console.log('[DRAFT] Draft cleared');
      } catch (err) {
        console.error('[DRAFT] Failed to clear draft:', err);
      }
    }
  },

  resetWizard: () =>
    set({
      step: 1,
      formData: createInitialWizardFormData(),
    })
}));

// Currency Store
export const useCurrencyStore = create((set) => ({
  selectedCurrency: 'USD',
  selectedCountry: 'United States',
  supportedCurrencies: ['USD', 'CAD', 'GBP', 'EUR', 'AUD', 'INR'],
  exchangeRates: DEFAULT_EXCHANGE_RATES,
  pricing: null,

  setCurrency: (currency) => set({ selectedCurrency: currency }),
  setCountry: (country) => set({ selectedCountry: country }),
  setExchangeRates: (exchangeRates) =>
    set({
      exchangeRates: {
        ...DEFAULT_EXCHANGE_RATES,
        ...(exchangeRates || {}),
      },
    }),
  setPricing: (pricing) => set({ pricing })
}));
