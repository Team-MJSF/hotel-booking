import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.json',
        diagnostics: false,
      },
    ],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  verbose: true,
  // Show individual test cases
  displayName: {
    name: 'HOTEL-BOOKING',
    color: 'blue',
  },
  // Enable parallel test execution
  maxWorkers: process.env.TEST_TYPE === 'integration' ? 1 : '50%',
  // Enable caching
  cache: true,
  cacheDirectory: '.jest-cache',
  // Test patterns
  testMatch: [
    '**/src/**/*.spec.ts',
    '**/src/**/*.test.ts'
  ],
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/*.d.ts',
    'src/main.spec.ts'
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
};

export default config; 