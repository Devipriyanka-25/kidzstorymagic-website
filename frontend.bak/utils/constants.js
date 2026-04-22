// Constants File for Frontend
export const APP_NAME = 'Kidz Story Magic';
export const APP_VERSION = '1.0.0';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Age Groups
export const AGE_GROUPS = [
  { value: '0-2', label: '0-2 Years', description: 'Infants and toddlers' },
  { value: '3-5', label: '3-5 Years', description: 'Preschoolers' },
  { value: '5-8', label: '5-8 Years', description: 'Early Elementary' },
  { value: '8-12', label: '8-12 Years', description: 'Middle Elementary' },
  { value: '12+', label: '12+ Years', description: 'Teens' }
];

// Story Themes
export const STORY_THEMES = [
  {
    id: 'family',
    name: 'Family Adventures',
    description: 'Stories featuring the whole family',
    icon: '👨‍👩‍👧‍👦',
    color: '#FF6B6B'
  },
  {
    id: 'friends',
    name: 'Friends & Fun',
    description: 'Stories about friendship and play',
    icon: '👯',
    color: '#4ECDC4'
  },
  {
    id: 'motivational',
    name: 'Motivational Tales',
    description: 'Inspiring and uplifting stories',
    icon: '⭐',
    color: '#FFE66D'
  },
  {
    id: 'behavioural',
    name: 'Behavioral Lessons',
    description: 'Stories teaching good behavior',
    icon: '🎓',
    color: '#95E1D3'
  },
  {
    id: 'fairytale',
    name: 'Fairytales',
    description: 'Classic and magical stories',
    icon: '✨',
    color: '#C7CEEA'
  },
  {
    id: 'customizable',
    name: 'Custom Stories',
    description: 'Create your own story',
    icon: '📖',
    color: '#FC9F5B'
  }
];

// Page Counts
export const PAGE_COUNTS = [10, 15, 20, 25, 30, 40, 50];

// Currencies
export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' }
];

// Pricing
export const PRICING = {
  BASE_PRICE: 9.99,
  PREMIUM_PRICE: 14.99,
  CURRENCY: 'USD'
};

// Genders
export const GENDERS = [
  { value: 'male', label: 'Boy' },
  { value: 'female', label: 'Girl' },
  { value: 'other', label: 'Prefer not to say' }
];

// Common Interests
export const INTERESTS = [
  'Sports',
  'Reading',
  'Drawing',
  'Music',
  'Science',
  'History',
  'Nature',
  'Technology',
  'Magic',
  'Adventure',
  'Animals',
  'Space'
];

// API Error Messages
export const API_ERRORS = {
  NETWORK: 'Network connection error. Please check your internet.',
  TIMEOUT: 'Request timed out. Please try again.',
  UNAUTHORIZED: 'You need to sign in first.',
  FORBIDDEN: 'You do not have permission to access this.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION: 'Please check your input and try again.',
  SERVER: 'Server error. Please try again later.',
  UNKNOWN: 'Something went wrong. Please try again.'
};

// Toast Message Types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER: 'user',
  CURRENCY: 'selectedCurrency',
  THEME: 'appTheme',
  WIZARD_FORM: 'wizardFormData'
};

// Form Validation Rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_PATTERN: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50
};

// API Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};
