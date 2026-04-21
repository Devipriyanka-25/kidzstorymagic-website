// Backend Jest setup file
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'kidz_story_magic_test';
process.env.DB_USER = 'postgres';
process.env.JWT_SECRET = 'test_secret';

// Provide mock values for API keys if not set (for CI/CD without secrets)
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test_mock_key';
process.env.AZURE_VISION_KEY = process.env.AZURE_VISION_KEY || 'test_mock_key';
process.env.AZURE_VISION_ENDPOINT = process.env.AZURE_VISION_ENDPOINT || 'https://test.cognitiveservices.azure.com/';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';
process.env.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || 'test_mock_key';
process.env.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || 'test_mock_key';

// Suppress console output during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
};

// Setup timeout
jest.setTimeout(10000);

// Mock database if needed
jest.mock('./src/config/database', () => ({
  query: jest.fn(),
  pool: {
    query: jest.fn(),
  },
}));
