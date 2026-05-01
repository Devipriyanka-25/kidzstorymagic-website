// Backend Server Entry Point
const express = require('express');
// const cors = require('cors'); // NOT USING - we have custom CORS middleware
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const { validateProductionEnvironment } = require('./utils/envValidator');
validateProductionEnvironment();

const config = require('./config/config');
const pool = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth.routes');
const storyRoutes = require('./routes/story.routes');
const draftRoutes = require('./routes/drafts.routes');
const paymentRoutes = require('./routes/payment.routes');
const currencyRoutes = require('./routes/currency.routes');
const photoUploadRoutes = require('./routes/photoUpload');
const docsRoutes = require('./routes/docs.routes');
const storyGenerationRoutes = require('./routes/story-generation.routes');

const app = express();

// CORS middleware - MUST be FIRST before any other middleware
// HARDCODED whitelist - ensures CORS works regardless of environment variables
const allowedCorsOrigins = [
  'https://www.kidzstorymagic.org',
  'https://kidzstorymagic.org',
  'https://kidzstorymagic-website.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3004',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:3004'
];

// Log CORS configuration for debugging
console.log('🔐 CORS Configuration:');
console.log('   Environment:', process.env.NODE_ENV);
console.log('   Allowed Origins:', allowedCorsOrigins);

// AGGRESSIVE CORS middleware - runs FIRST and CLEANS UP any bad headers
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  console.log(`[CORS] Incoming request from: ${origin || 'none'}`);
  
  // CRITICAL: Intercept and fix headers BEFORE they're sent
  const originalSend = res.send;
  res.send = function(data) {
    // Remove any bad CORS headers that might have been set
    res.removeHeader('Access-Control-Allow-Origin');
    res.removeHeader('Access-Control-Allow-Credentials');
    res.removeHeader('Access-Control-Allow-Methods');
    res.removeHeader('Access-Control-Allow-Headers');
    
    // Set correct headers based on origin
    if (origin && allowedCorsOrigins.includes(origin)) {
      res.set('Access-Control-Allow-Origin', origin);
      res.set('Access-Control-Allow-Credentials', 'true');
      res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      console.log(`[CORS] ✅ Applied CORS for: ${origin}`);
    } else if (origin) {
      // Still set CORS for unknown origins (permissive mode)
      res.set('Access-Control-Allow-Origin', origin);
      res.set('Access-Control-Allow-Credentials', 'true');
      res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      console.log(`[CORS] ⚠️ Applied CORS for unknown origin: ${origin}`);
    }
    
    // Call original send
    return originalSend.call(this, data);
  };
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    // Clean up any bad headers
    res.removeHeader('Access-Control-Allow-Origin');
    
    // Set correct headers
    if (origin && allowedCorsOrigins.includes(origin)) {
      res.set('Access-Control-Allow-Origin', origin);
    } else if (origin) {
      res.set('Access-Control-Allow-Origin', origin);
    }
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.set('Access-Control-Max-Age', '86400');
    
    console.log(`[CORS] ✅ Handling preflight for: ${origin}`);
    return res.status(200).end();
  }
  
  next();
});

// Security middleware (AFTER CORS - but allow CORS headers)
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Stripe webhook needs the raw body for signature verification.
app.use('/api/payment/webhook', express.raw({ type: 'application/json', limit: '50mb' }));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

const redactSensitiveFields = (value) => {
  if (Buffer.isBuffer(value)) {
    return '[BINARY BODY]';
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entryValue]) => {
      if (/password|token|secret|authorization|key/i.test(key)) {
        return [key, '[REDACTED]'];
      }
      return [key, entryValue];
    })
  );
};

// Request body logging middleware for debugging
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    console.log(`[${req.method}] ${req.path}`, {
      contentType: req.headers['content-type'],
      body: redactSensitiveFields(req.body),
      timestamp: new Date().toISOString()
    });
  }
  next();
});

// Static files - serve from configured directories
app.use('/uploads', express.static(config.file.upload.uploadDir));
app.use('/pdfs', express.static(config.pdf.outputDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.app.environment
  });
});

// Database connection check
app.get('/api/health/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({
      status: 'connected',
      database: config.database.name,
      host: config.database.host,
      port: config.database.port,
      timestamp: result.rows[0].now
    });
  } catch (err) {
    console.error('[DB_CHECK] Database connection failed:', err.message);
    res.status(503).json({
      status: 'disconnected',
      error: 'Database connection failed',
      details: err.message,
      database: config.database.name,
      host: config.database.host,
      port: config.database.port
    });
  }
});

// API Routes
app.use('/api/docs', docsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/story', photoUploadRoutes); // Photo upload under /api/story/{projectId}/...
app.use('/api/story', storyRoutes);
app.use('/api/story', storyGenerationRoutes);
app.use('/api/drafts', draftRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/currency', currencyRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    status: 404
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: message,
    status: status,
    ...(config.app.environment === 'development' && { stack: err.stack })
  });
});

// Ensure upload directories exist
const fs = require('fs');
const uploadDir = config.file.upload.uploadDir;
const pdfDir = config.pdf.outputDir;

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`[INIT] Created upload directory: ${uploadDir}`);
}

if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
  console.log(`[INIT] Created PDF directory: ${pdfDir}`);
}

// Start server
const PORT = config.app.port;
app.listen(PORT, () => {
  console.log(`
    ╔══════════════════════════════════════╗
    ║   Kidz Story Magic Backend Started   ║
    ╚══════════════════════════════════════╝
    
    Environment: ${config.app.environment}
    Port: ${PORT}
    Base URL: ${config.app.baseUrl}
    
    API Documentation: ${config.app.baseUrl}/api/docs
  `);
});

module.exports = app;
