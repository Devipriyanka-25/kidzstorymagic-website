import { STORAGE_KEYS } from '@/utils/constants';
import { useAuthStore, useWizardStore } from '@/utils/store';

jest.mock('@/utils/api', () => ({
  authAPI: {
    getCurrentUser: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    updateProfile: jest.fn(),
  },
  getAuthToken: jest.fn(),
}));

describe('auth session flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
    });
    useAuthStore.setState({
      user: { id: 7, name: 'Priya', email: 'priya@example.com' },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      isInitializing: false,
    });
    useWizardStore.setState({
      step: 5,
      formData: {
        childName: 'Niru',
        projectId: '123',
        uploadedImages: [{ preview: 'data:image/png;base64,test' }],
      },
      selectedPhotoIndex: 2,
      lastGeneratedPhotoIndex: 2,
      photoIllustrationCache: {
        2: {
          1: 'https://example.com/page.png',
        },
      },
      generationInProgress: true,
    });
  });

  it('clears auth, local wizard draft, and in-memory wizard state on logout', () => {
    useAuthStore.getState().logout();

    expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN);
    expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.USER);
    expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.WIZARD_DRAFT);
    expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.WIZARD_FORM);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useWizardStore.getState().step).toBe(1);
    expect(useWizardStore.getState().formData.projectId).toBeNull();
    expect(useWizardStore.getState().formData.uploadedImages).toEqual([]);
    expect(useWizardStore.getState().selectedPhotoIndex).toBe(-1);
    expect(useWizardStore.getState().photoIllustrationCache).toEqual({});
    expect(useWizardStore.getState().generationInProgress).toBe(false);
  });
});
