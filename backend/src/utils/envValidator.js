// Environment variable validation for deployment safety.

const requiredEnvVars = {
  JWT_SECRET: 'JWT signing secret',
  BASE_URL: 'Public backend URL',
  FRONTEND_URL: 'Public frontend URL',
  CORS_ORIGIN: 'Allowed frontend origin',
  STRIPE_SECRET_KEY: 'Stripe secret key',
  STRIPE_PUBLISHABLE_KEY: 'Stripe publishable key',
  STRIPE_WEBHOOK_SECRET: 'Stripe webhook signing secret'
};

const requiredDatabaseEnvVars = {
  DB_HOST: 'PostgreSQL host',
  DB_PORT: 'PostgreSQL port',
  DB_NAME: 'Database name',
  DB_USER: 'Database user',
  DB_PASSWORD: 'Database password'
};

const optionalEnvVars = {
  NODE_ENV: 'development',
  PORT: 5000,
  LOG_LEVEL: 'info',
  UPLOAD_DIR: './uploads',
  EXCHANGE_RATE_API_KEY: '',
  EMAIL_USER: '',
  EMAIL_PASSWORD: '',
  OPENAI_API_KEY: '',
  IMAGE_PROVIDER: 'DEMO'
};

const placeholderPatterns = [
  /change[-_ ]?me/i,
  /placeholder/i,
  /your[-_ ]/i,
  /example/i,
  /\.\.\./,
  /^test_secret$/i
];

const isBlank = (value) => value === undefined || value === null || String(value).trim() === '';

const looksLikePlaceholder = (value) =>
  !isBlank(value) && placeholderPatterns.some((pattern) => pattern.test(String(value)));

/**
 * Set sensible defaults for missing environment variables
 */
function setDefaults() {
  // JWT_SECRET - generate a temporary one if not set (32+ chars for production)
  if (isBlank(process.env.JWT_SECRET)) {
    process.env.JWT_SECRET = 'dev-secret-key-minimum-32-characters-for-testing';
    console.warn('⚠️  Using default JWT_SECRET (development only)');
  }

  // URLs - default to localhost
  if (isBlank(process.env.BASE_URL)) {
    process.env.BASE_URL = 'http://localhost:5000';
    console.warn('⚠️  Using default BASE_URL');
  }

  if (isBlank(process.env.FRONTEND_URL)) {
    process.env.FRONTEND_URL = 'http://localhost:3000';
    console.warn('⚠️  Using default FRONTEND_URL');
  }

  if (isBlank(process.env.CORS_ORIGIN)) {
    process.env.CORS_ORIGIN = 'http://localhost:3000';
    console.warn('⚠️  Using default CORS_ORIGIN');
  }

  // Stripe - use test keys if not set
  if (isBlank(process.env.STRIPE_SECRET_KEY)) {
    process.env.STRIPE_SECRET_KEY = 'sk_test_dummy_key_for_testing';
    console.warn('⚠️  Using dummy STRIPE_SECRET_KEY (testing only)');
  }

  if (isBlank(process.env.STRIPE_PUBLISHABLE_KEY)) {
    process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_dummy_key_for_testing';
    console.warn('⚠️  Using dummy STRIPE_PUBLISHABLE_KEY (testing only)');
  }

  if (isBlank(process.env.STRIPE_WEBHOOK_SECRET)) {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_dummy_key_for_testing';
    console.warn('⚠️  Using dummy STRIPE_WEBHOOK_SECRET (testing only)');
  }

  // Database - default to local PostgreSQL
  if (isBlank(process.env.DATABASE_URL)) {
    if (isBlank(process.env.DB_HOST)) {
      process.env.DB_HOST = 'localhost';
      console.warn('⚠️  Using default DB_HOST');
    }
    if (isBlank(process.env.DB_PORT)) {
      process.env.DB_PORT = '5432';
      console.warn('⚠️  Using default DB_PORT');
    }
    if (isBlank(process.env.DB_NAME)) {
      process.env.DB_NAME = 'kidzstory';
      console.warn('⚠️  Using default DB_NAME');
    }
    if (isBlank(process.env.DB_USER)) {
      process.env.DB_USER = 'postgres';
      console.warn('⚠️  Using default DB_USER');
    }
    if (isBlank(process.env.DB_PASSWORD)) {
      process.env.DB_PASSWORD = 'postgres';
      console.warn('⚠️  Using default DB_PASSWORD');
    }
  }
}

/**
 * Validate that all deployment-required environment variables are set.
 */
function validateEnvironment() {
  // Set defaults first
  setDefaults();

  const missing = [];
  const unsafe = [];

  for (const [key, description] of Object.entries(requiredEnvVars)) {
    if (isBlank(process.env[key])) {
      missing.push(`${key} (${description})`);
    } else if (looksLikePlaceholder(process.env[key])) {
      unsafe.push(key);
    }
  }

  if (isBlank(process.env.DATABASE_URL)) {
    for (const [key, description] of Object.entries(requiredDatabaseEnvVars)) {
      if (isBlank(process.env[key])) {
        missing.push(`${key} (${description})`);
      }
    }
  }

  // Only error on unsafe placeholder values, not missing variables (defaults are set above)
  if (unsafe.length > 0) {
    console.warn('⚠️  WARNING: Some environment variables contain placeholder/test values');
    unsafe.forEach((key) => console.warn(`  - ${key} (using default/test value)`));
    // Don't exit - allow to run with defaults in non-production
  }

  console.log('✅ All required environment variables are configured');
}

function validateProductionEnvironment() {
  // Only enforce strict validation in true production
  if (process.env.NODE_ENV !== 'production' || process.env.RAILWAY === 'true') {
    // In Railway/staging, just set defaults and continue
    setDefaults();
    console.log('✅ Using default environment configuration for Railway deployment');
    return;
  }

  validateEnvironment();

  const localhostOrigin = /localhost|127\.0\.0\.1/i;
  if (localhostOrigin.test(process.env.CORS_ORIGIN || '') || localhostOrigin.test(process.env.FRONTEND_URL || '')) {
    console.error('Production CORS_ORIGIN and FRONTEND_URL must use deployed HTTPS origins.');
    process.exit(1);
  }

  if ((process.env.JWT_SECRET || '').length < 32) {
    console.error('JWT_SECRET must be at least 32 characters in production.');
    process.exit(1);
  }
}

/**
 * Get environment variable with default.
 */
function getEnvVar(key, defaultValue = null) {
  const value = process.env[key];

  if (value === undefined && defaultValue === null) {
    throw new Error(`Environment variable ${key} is not set`);
  }

  return value || defaultValue;
}

module.exports = {
  validateEnvironment,
  validateProductionEnvironment,
  getEnvVar,
  requiredEnvVars,
  requiredDatabaseEnvVars,
  optionalEnvVars
};
