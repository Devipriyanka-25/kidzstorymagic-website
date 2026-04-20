// Frontend Error Handler Utility
export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
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
  constructor(message = 'Network error') {
    super(message, 0);
    this.name = 'NetworkError';
  }
}

/**
 * Handle API errors and return user-friendly messages
 */
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    return {
      statusCode: status,
      message: data.message || data.error || 'An error occurred',
      errors: data.errors || null
    };
  } else if (error.request) {
    // Request made but no response
    return {
      statusCode: 0,
      message: 'Network error. Please check your connection.',
      errors: null
    };
  } else {
    // Something else
    return {
      statusCode: 0,
      message: error.message || 'An unexpected error occurred',
      errors: null
    };
  }
};

/**
 * Retry failed API calls with exponential backoff
 */
export const retryWithBackoff = async (
  fn,
  maxRetries = 3,
  initialDelay = 1000
) => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};
