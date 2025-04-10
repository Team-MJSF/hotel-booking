import type { JestConfigWithTsJest } from 'ts-jest';

// Base configuration shared by all test types
const baseConfig: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        diagnostics: false,
      },
    ],
  },
  verbose: true,
  // Show individual test cases
  displayName: {
    name: 'HOTEL-BOOKING',
    color: 'blue',
  },
  // Enable caching
  cache: true,
  cacheDirectory: '.jest-cache',
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/*.d.ts',
  ],
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts'
  ],
  // Coverage directory
  coverageDirectory: 'coverage',
  // Coverage reporters
  coverageReporters: ['text', 'lcov'],
  // Test environment setup
  testEnvironmentOptions: {
    url: 'http://localhost',
    enableProcessManagement: false,
  },
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Root directory
  rootDir: '.',
  // Test timeout
  testTimeout: 10000,
  // Additional performance optimizations
  bail: process.env.CI ? 1 : 0,
  detectOpenHandles: false,
  errorOnDeprecated: false,
  detectLeaks: false,
  // Optimize module resolution
  moduleDirectories: ['node_modules'],
  // Add selective test running
  watchPathIgnorePatterns: ['node_modules', 'dist', '.jest-cache']
} as const;

// Determine which configuration to use based on TEST_TYPE environment variable
const config = (() => {
  // Integration test specific config
  if (process.env.TEST_TYPE === 'integration') {
    return {
      ...baseConfig,
      // Only run integration tests
      testMatch: ['**/src/**/integration/**/*.spec.ts'],
      // Set longer timeout for integration tests
      testTimeout: 30000,
    };
  }
  
  // Unit test specific config
  if (process.env.TEST_TYPE === 'unit') {
    return {
      ...baseConfig,
      // Exclude integration tests, only run unit tests
      testMatch: ['**/src/**/*.spec.ts'],
      testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/*.d.ts',
        '**/src/**/integration/**/*.spec.ts',
        'src/main.spec.ts'
      ],
      // Run unit tests in parallel
      maxWorkers: '50%',
    };
  }
  
  // Default config (run all tests)
  return {
    ...baseConfig,
    testMatch: [
      '**/src/**/*.spec.ts',
      '**/src/**/*.test.ts'
    ],
    testPathIgnorePatterns: [
      '/node_modules/',
      '/dist/',
      '/*.d.ts',
      'src/main.spec.ts'
    ],
  };
})();

export default config; 