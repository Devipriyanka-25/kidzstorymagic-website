// Backend Constants File
module.exports = {
  // App Info
  APP_NAME: 'Kidz Story Magic',
  APP_VERSION: '1.0.0',
  
  // User Roles
  ROLES: {
    USER: 'user',
    ADMIN: 'admin',
    MODERATOR: 'moderator'
  },

  // Story Status
  STORY_STATUS: {
    DRAFT: 'draft',
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed'
  },

  // Order Status
  ORDER_STATUS: {
    PENDING: 'pending',
    PAID: 'paid',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
  },

  // Payment Methods
  PAYMENT_METHODS: {
    STRIPE: 'stripe',
    PAYPAL: 'paypal',
    CREDIT_CARD: 'credit_card'
  },

  // Currencies
  CURRENCIES: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR'],
  DEFAULT_CURRENCY: 'USD',

  // File Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  UPLOAD_DIR: './uploads',

  // Pagination
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,

  // Cache TTL (in seconds)
  CACHE_TTL: {
    CURRENCY_RATES: 24 * 60 * 60, // 24 hours
    USER_PROFILE: 60 * 60, // 1 hour
    STORY_LIST: 30 * 60, // 30 minutes
    EXCHANGE_RATES: 24 * 60 * 60 // 24 hours
  },

  // JWT Settings
  JWT_EXPIRY: '7d',
  JWT_REFRESH_EXPIRY: '30d',

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100
  },

  // Email Templates
  EMAIL_TEMPLATES: {
    WELCOME: 'welcome',
    PASSWORD_RESET: 'password-reset',
    ORDER_CONFIRMATION: 'order-confirmation',
    STORY_READY: 'story-ready'
  },

  // Age Groups
  AGE_GROUPS: ['0-2', '3-5', '5-8', '8-12', '12+'],

  // Story Themes
  STORY_THEMES: [
    'family',
    'friends',
    'motivational',
    'behavioural',
    'fairytale',
    'customizable'
  ],

  // Image Processing
  IMAGE_PROCESSING: {
    BLUR_RADIUS: 25,
    WATERMARK_OPACITY: 0.3,
    COMPRESSION_QUALITY: 80,
    MAX_DIMENSIONS: { width: 2000, height: 2000 }
  },

  // Genders
  GENDERS: ['male', 'female', 'other'],

  // HTTP Status Codes for Custom Use
  SUCCESS_STATUS: 200,
  CREATED_STATUS: 201,
  BAD_REQUEST_STATUS: 400,
  UNAUTHORIZED_STATUS: 401,
  FORBIDDEN_STATUS: 403,
  NOT_FOUND_STATUS: 404,
  CONFLICT_STATUS: 409,
  ERROR_STATUS: 500
};
