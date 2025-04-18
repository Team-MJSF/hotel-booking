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
    '!src/**/*.test.ts',
    // Exclude infrastructure files
    '!src/**/*.module.ts',
    '!src/main.ts',
    '!src/database/migrations/**',
    '!src/config/**',
    '!src/database/test-utils.ts',
    '!src/database/quick-seed.ts',
    '!src/common/filters/**',
    '!**/decorators/**',
    '!**/node_modules/**',
    // Exclude entity files from coverage
    '!src/**/*.entity.ts'
  ],
  // Coverage directory
  coverageDirectory: 'coverage',
  // Coverage reporters
  coverageReporters: ['text', 'lcov'],
  // Coverage thresholds
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    }
  },
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

// Determine which configuration to use based on test path pattern
const config = (() => {
  // Integration test specific config
  if (process.argv.includes('--testPathPattern=integration')) {
    return {
      ...baseConfig,
      testMatch: ['**/src/**/integration/**/*.spec.ts'],
      testTimeout: 30000,
    };
  }
  
  // Unit test specific config
  if (process.argv.includes('--testPathIgnorePatterns=integration')) {
    return {
      ...baseConfig,
      testMatch: ['**/src/**/*.spec.ts'],
      testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/*.d.ts',
        '**/src/**/integration/**/*.spec.ts',
        'src/main.spec.ts'
      ],
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