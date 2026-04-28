// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep dev and production build artifacts separate so a local `npm run build`
  // does not break an already-running `next dev` session.
  distDir: process.env.NODE_ENV === 'production' ? '.next' : '.next-dev',
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'your-domain.com'],
  },
  env: {
    // Force API URL to /api for production (proxy routes)
    // In dev, this will use http://localhost:5000/api from .env.local
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || (
      process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api'
    ),
    NEXT_PUBLIC_STRIPE_KEY: process.env.NEXT_PUBLIC_STRIPE_KEY,
  },
};

module.exports = nextConfig;
