const express = require('express');
const router = express.Router();

// API Documentation endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    name: 'Kidz Story Magic API',
    version: '1.0.0',
    description: 'RESTful API for creating personalized children\'s stories with AI-generated illustrations',
    environment: process.env.NODE_ENV || 'development',
    baseUrl: `${req.protocol}://${req.get('host')}`,
    endpoints: {
      auth: {
        register: {
          method: 'POST',
          path: '/api/auth/register',
          description: 'Create a new user account',
          body: { name: 'string', email: 'string', password: 'string', preferredCurrency: 'string?' }
        },
        login: {
          method: 'POST',
          path: '/api/auth/login',
          description: 'Login with email and password',
          body: { email: 'string', password: 'string' }
        },
        logout: {
          method: 'POST',
          path: '/api/auth/logout',
          description: 'Logout current user'
        },
        profile: {
          method: 'GET',
          path: '/api/auth/profile',
          description: 'Get current user profile',
          auth: 'required'
        }
      },
      story: {
        createProject: {
          method: 'POST',
          path: '/api/story/create-project',
          description: 'Create a new story project',
          body: {
            child_name: 'string',
            age: 'number',
            page_count: 'number',
            theme: 'string'
          }
        },
        generateStory: {
          method: 'POST',
          path: '/api/story/:projectId/generate-story',
          description: 'Generate story content and images for a project',
          params: { projectId: 'UUID' },
          body: { customPrompt: 'string?' }
        },
        getProject: {
          method: 'GET',
          path: '/api/story/:projectId',
          description: 'Get story project details'
        },
        uploadPhoto: {
          method: 'POST',
          path: '/api/story/:projectId/upload-photo',
          description: 'Upload child photo for face swap',
          contentType: 'multipart/form-data'
        }
      },
      payment: {
        createOrder: {
          method: 'POST',
          path: '/api/payment/create-order',
          description: 'Create payment order'
        },
        verifyPayment: {
          method: 'POST',
          path: '/api/payment/verify',
          description: 'Verify payment completion'
        }
      },
      currency: {
        getRates: {
          method: 'GET',
          path: '/api/currency/rates',
          description: 'Get current currency conversion rates'
        }
      },
      health: {
        status: {
          method: 'GET',
          path: '/api/health',
          description: 'Check API health status'
        },
        database: {
          method: 'GET',
          path: '/api/health/db',
          description: 'Check database connection'
        }
      }
    },
    documentation: 'For more details, visit the GitHub repository or check individual endpoint documentation',
    support: 'https://github.com/your-repo/kidz-story-magic',
    lastUpdated: new Date().toISOString()
  });
});

module.exports = router;
