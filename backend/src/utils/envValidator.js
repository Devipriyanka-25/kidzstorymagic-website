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
 * Validate that all deployment-required environment variables are set.
 */
function validateEnvironment() {
  const missing = [];

  for (const [key, description] of Object.entries(requiredEnvVars)) {
    if (isBlank(process.env[key])) {
      missing.push(`${key} (${description})`);
    }
  }

  if (isBlank(process.env.DATABASE_URL)) {
    for (const [key, description] of Object.entries(requiredDatabaseEnvVars)) {
      if (isBlank(process.env[key])) {
        missing.push(`${key} (${description})`);
      }
    }
  }

  if (missing.length > 0) {
    console.error('Missing required environment variables:');
    missing.forEach((value) => console.error(`  - ${value}`));
    process.exit(1);
  }

  const unsafe = [
    'DATABASE_URL',
    'DB_PASSWORD',
    'JWT_SECRET',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'BASE_URL',
    'FRONTEND_URL',
    'CORS_ORIGIN'
  ]
    .filter((key) => looksLikePlaceholder(process.env[key]));

  if (unsafe.length > 0) {
    console.error('Environment variables still contain placeholder values:');
    unsafe.forEach((key) => console.error(`  - ${key}`));
    process.exit(1);
  }

  console.log('All required environment variables are set');
}

function validateProductionEnvironment() {
  if (process.env.NODE_ENV !== 'production') {
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
