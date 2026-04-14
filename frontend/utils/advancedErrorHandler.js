/**
 * Advanced Error Handler with Retry Logic and Recovery
 */

export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
    this.timestamp = new Date().toISOString();
  }
}

export class ValidationError extends AppError {
  constructor(message, fields = {}) {
    super(message, 400, fields);
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'You do not have permission to access this resource') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Network error. Please check your connection.') {
    super(message, 0);
    this.name = 'NetworkError';
  }
}

export class ServerError extends AppError {
  constructor(message = 'Server error. Please try again later.') {
    super(message, 500);
    this.name = 'ServerError';
  }
}

export class TimeoutError extends AppError {
  constructor(message = 'Request timeout. Please try again.') {
    super(message, 408);
    this.name = 'TimeoutError';
  }
}

/**
 * Handle API errors and return user-friendly messages
 */
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    const errorMessage = data?.message || data?.error || 'An error occurred';
    
    return {
      statusCode: status,
      message: errorMessage,
      errors: data?.errors || null,
      details: data?.details || null,
      userFriendlyMessage: getUserFriendlyErrorMessage(status, errorMessage)
    };
  } else if (error.request) {
    // Request made but no response received
    return {
      statusCode: 0,
      message: 'Network error. Please check your connection.',
      errors: null,
      userFriendlyMessage: 'Network error. Please check your internet connection and try again.'
    };
  } else if (error.name === 'TimeoutError' || error.code === 'ECONNABORTED') {
    // Request timeout
    return {
      statusCode: 408,
      message: 'Request timeout',
      errors: null,
      userFriendlyMessage: 'The request took too long. Please check your connection and try again.'
    };
  } else {
    // Something else happened during the request setup
    return {
      statusCode: 0,
      message: error.message || 'An unexpected error occurred',
      errors: null,
      userFriendlyMessage: error.message || 'An unexpected error occurred. Please try again.'
    };
  }
};

/**
 * Get user-friendly error message based on status code
 */
export const getUserFriendlyErrorMessage = (statusCode, originalMessage) => {
  const messages = {
    400: 'Invalid input. Please check your information and try again.',
    401: 'Please log in to continue.',
    403: 'You do not have permission to access this resource.',
    404: 'The requested resource was not found.',
    408: 'The request took too long. Please try again.',
    409: 'This resource already exists. Please use a different value.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'Server error. Our team has been notified. Please try again later.',
    502: 'Service temporarily unavailable. Please try again.',
    503: 'Service maintenance in progress. Please try again later.',
    504: 'Request timeout. Please check your connection and try again.'
  };

  return messages[statusCode] || originalMessage || 'An error occurred. Please try again.';
};

/**
 * Retry failed API calls with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} initialDelay - Initial delay in milliseconds
 * @param {Array} retryableStatuses - HTTP status codes that should trigger retry
 */
export const retryWithBackoff = async (
  fn,
  maxRetries = 3,
  initialDelay = 1000,
  retryableStatuses = [408, 429, 500, 502, 503, 504]
) => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const status = error.response?.status;
      const shouldRetry = i < maxRetries - 1 && retryableStatuses.includes(status);

      if (shouldRetry) {
        const delay = initialDelay * Math.pow(2, i) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }

  throw lastError;
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  return {
    valid: password.length >= 8,
    errors: [
      password.length < 8 && 'Password must be at least 8 characters long'
    ].filter(Boolean)
  };
};

/**
 * Validate file size (in MB)
 */
export const validateFileSize = (file, maxSizeMB = 5) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Validate file type
 */
export const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/webp']) => {
  return allowedTypes.includes(file.type);
};

/**
 * Debounce function for performance optimization
 */
export const debounce = (fn, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Throttle function for performance optimization
 */
export const throttle = (fn, limit = 300) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Safe JSON parse with fallback
 */
export const safeJsonParse = (jsonString, fallback = null) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('[JSON_PARSE_ERROR]', error);
    return fallback;
  }
};

/**
 * Safe localStorage access
 */
export const safeLocalStorage = {
  getItem: (key, fallback = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (error) {
      console.warn(`[STORAGE] Error reading ${key}:`, error);
      return fallback;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`[STORAGE] Error writing ${key}:`, error);
      return false;
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`[STORAGE] Error removing ${key}:`, error);
      return false;
    }
  }
};

/**
 * Format error for display
 */
export const formatErrorMessage = (error, defaultMessage = 'An error occurred') => {
  if (!error) return defaultMessage;
  
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  if (error.error) return error.error;
  if (error.details) return error.details;
  
  return defaultMessage;
};

/**
 * Log error to backend (for production monitoring)
 */
export const logErrorToBackend = async (error, context = {}) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      const errorData = {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
      };
      
      // Send to your error logging service
      // await axios.post('/api/logs/errors', errorData);
    }
  } catch (err) {
    console.warn('[ERROR_LOG_FAILED]', err);
  }
};

/**
 * Create error context for debugging
 */
export const createErrorContext = (componentName, action) => {
  return {
    component: componentName,
    action,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : 'unknown'
  };
};
