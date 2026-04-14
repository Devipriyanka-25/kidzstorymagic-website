// Backend configuration file
module.exports = {
  app: {
    name: 'Kidz Story Magic',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    baseUrl: process.env.BASE_URL || 'http://localhost:5000'
  },
  database: {
    // Cloud database connection string (takes precedence)
    connectionUrl: process.env.DATABASE_URL,
    
    // Local database configuration (fallback if DATABASE_URL not provided)
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'kidz_story_magic',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    pool: {
      min: 2,
      max: 10
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
  },
  currency: {
    defaultCurrency: 'USD',
    supportedCurrencies: ['USD', 'CAD', 'GBP', 'EUR', 'AUD', 'INR'],
    exchangeRateApiKey: process.env.EXCHANGE_RATE_API_KEY,
    exchangeRateProvider: 'exchangerate-api.com' // or fixer.io
  },
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3Bucket: process.env.AWS_S3_BUCKET || 'kidz-story-magic'
  },
  file: {
    upload: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      uploadDir: process.env.UPLOAD_DIR || require('path').join(__dirname, '../../uploads')
    }
  },
  imageProcessing: {
    faceDetection: {
      enabled: true,
      provider: 'face-api' // or aws-rekognition
    },
    watermark: {
      enabled: true,
      text: 'PREVIEW - WATERMARK',
      opacity: 0.3
    },
    blur: {
      enabled: true,
      radius: 25
    }
  },
  pdf: {
    generator: 'puppeteer', // or wkhtmltopdf
    outputDir: './pdfs',
    chromePath: process.env.CHROMIUM_PATH
  },
  email: {
    from: process.env.EMAIL_FROM || 'noreply@kidzstorymagic.com',
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'combined'
  },
  pricing: {
    base: 9.99,
    currency: 'USD',
    premium: 14.99
  }
};
