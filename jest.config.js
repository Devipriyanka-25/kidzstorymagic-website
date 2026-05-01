const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx}',
    'components/**/*.{js,jsx}',
    'utils/**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/.next-dev/',
    '/frontend.bak/',
    '/backend/src/tests/',
  ],
  modulePathIgnorePatterns: ['<rootDir>/.next', '<rootDir>/.next-dev', '<rootDir>/frontend.bak'],
  coveragePathIgnorePatterns: ['/node_modules/', '/.next/', '/.next-dev/', '/frontend.bak/'],
  testTimeout: 10000,
};

module.exports = createJestConfig(customJestConfig);
