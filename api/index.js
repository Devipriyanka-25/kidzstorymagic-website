/**
 * Vercel Serverless Function Handler for Backend API
 * Handles all /api/* routes
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Health check endpoint
  if (req.url === '/api/health') {
    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      region: process.env.VERCEL_REGION || 'unknown'
    });
  }

  // Route based on the path
  const path = req.url.replace('/api', '');

  try {
    // TODO: Route requests to appropriate handlers
    // For now, return a placeholder
    return res.status(501).json({
      error: 'Not Implemented',
      message: `Endpoint ${path} is being set up`,
      hint: 'Try /api/health'
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}
