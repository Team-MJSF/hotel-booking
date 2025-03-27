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
  // Test patterns
  testMatch: [
    '**/src/**/*.spec.ts',
    '**/src/**/*.test.ts'
  ],
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/*.d.ts'
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
  },
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Root directory
  rootDir: '.',
  // Test timeout
  testTimeout: 10000
};

export default config; 