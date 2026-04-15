// Backend Jest setup file
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'kidz_story_magic_test';
process.env.DB_USER = 'postgres';
process.env.JWT_SECRET = 'test_secret';

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
