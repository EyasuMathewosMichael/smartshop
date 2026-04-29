'use strict';

/** @type {import('jest').Config} */
const config = {
  // Use the Node.js environment (no DOM needed for backend tests)
  testEnvironment: 'node',

  // Discover test files in __tests__ directories and *.test.js files
  testMatch: [
    '**/__tests__/**/*.js',
    '**/*.test.js',
  ],

  // Ignore node_modules and the frontend package
  testPathIgnorePatterns: [
    '/node_modules/',
    '../frontend/',
  ],

  // Collect coverage from source files (excluding config bootstrapping)
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',          // Entry point — not unit-testable in isolation
    '!src/config/db.js',       // Requires live MongoDB
    '!src/scripts/**/*.js',    // Utility scripts
  ],

  // Enforce 80 % coverage thresholds across all dimensions
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Output coverage in multiple formats
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',

  // Run tests serially to avoid port / DB conflicts in integration tests
  // (individual test files can still use --runInBand via the npm script)
  maxWorkers: 1,

  // Increase timeout for async / integration tests
  testTimeout: 30000,

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,

  // Verbose output for CI
  verbose: true,
};

module.exports = config;
