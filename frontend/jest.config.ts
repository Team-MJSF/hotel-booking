import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig: Config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases (if you use them in the project)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  verbose: true,
  displayName: {
    name: 'HOTEL-BOOKING-FRONTEND',
    color: 'magenta',
  },
  // Enable caching for better performance
  cache: true,
  cacheDirectory: '.jest-cache',
  // Test files pattern
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  // Files and directories to ignore in tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/out/',
    '/.vercel/',
    '/coverage/',
    '/public/'
  ],
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    // Exclude test files
    '!src/**/*.{spec,test}.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    // Exclude type definitions
    '!src/**/*.d.ts',
    // Exclude infrastructure files
    '!src/app/layout.tsx',
    '!src/app/providers.tsx',
    '!src/app/loading.tsx',
    '!src/app/error.tsx',
    '!src/app/not-found.tsx',
    '!src/app/global-error.tsx',
    // Exclude utility files
    '!src/lib/test-utils/**',
    '!src/lib/test-data/**',
    '!src/types/**',
    // Exclude build configuration
    '!**/node_modules/**',
    '!**/.next/**',
    // Exclude generated or third-party code
    '!**/public/**',
    '!**/styles/globals.css',
    // Exclude mock data
    '!**/__mocks__/**',
    '!**/mocks/**',
  ],
  // Coverage directory
  coverageDirectory: 'coverage',
  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html'],
  // Coverage thresholds
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    }
  },
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  // Test timeout
  testTimeout: 10000,
  // Additional performance optimizations
  bail: process.env.CI ? 1 : 0,
  watchPathIgnorePatterns: ['node_modules', '.next', '.jest-cache'],
  // Transformations
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },
};

// Create different configurations for unit and integration tests
const customConfigForIntegration: Config = {
  ...customJestConfig,
  testMatch: ['**/src/**/*.integration.{spec,test}.[jt]s?(x)'],
  testTimeout: 30000,
};

const customConfigForUnit: Config = {
  ...customJestConfig,
  testMatch: ['**/src/**/*.{spec,test}.[jt]s?(x)'],
  testPathIgnorePatterns: [
    ...(customJestConfig.testPathIgnorePatterns as string[]),
    '**/*.integration.{spec,test}.[jt]s?(x)'
  ],
};

// Create the appropriate config based on command line arguments
let config = customJestConfig;
if (process.argv.includes('--testPathPattern=integration')) {
  config = customConfigForIntegration;
} else if (process.argv.includes('--testPathIgnorePatterns=integration')) {
  config = customConfigForUnit;
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config); 