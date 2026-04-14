// Environment Variables Validation
const requiredEnvVars = {
  // Database
  DB_HOST: 'PostgreSQL host',
  DB_PORT: 'PostgreSQL port',
  DB_NAME: 'Database name',
  DB_USER: 'Database user',
  DB_PASSWORD: 'Database password',
  
  // JWT
  JWT_SECRET: 'JWT secret key',
  
  // Stripe
  STRIPE_SECRET_KEY: 'Stripe secret key',
  STRIPE_PUBLISHABLE_KEY: 'Stripe publishable key',
  
  // Extras (optional but recommended)
  EXCHANGE_RATE_API_KEY: 'Exchange rate API key',
  EMAIL_USER: 'Email service user',
  EMAIL_PASSWORD: 'Email service password'
};

const optionalEnvVars = {
  NODE_ENV: 'development',
  PORT: 5000,
  CORS_ORIGIN: 'http://localhost:3000',
  LOG_LEVEL: 'info',
  UPLOAD_DIR: './uploads'
};

/**
 * Validate that all required environment variables are set
 */
function validateEnvironment() {
  const missing = [];

  for (const [key, description] of Object.entries(requiredEnvVars)) {
    if (!process.env[key]) {
      missing.push(`${key} (${description})`);
    }
  }

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(v => console.error(`  - ${v}`));
    process.exit(1);
  }

  console.log('✅ All required environment variables are set');
}

/**
 * Get environment variable with default
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
  getEnvVar,
  requiredEnvVars,
  optionalEnvVars
};
