/**
 * Jest Configuration File
 * Configured for ES Modules support
 */

export default {
  // Indicates whether each individual test should be reported during the run
  verbose: true,
  
  // The test environment that will be used for testing
  testEnvironment: "node",
  
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,
  
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false,
  
  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",
  
  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    "/node_modules/"
  ],
  
  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: [
    "json",
    "text",
    "lcov",
    "clover"
  ],
  
  // An array of file extensions your modules use
  moduleFileExtensions: [
    "js",
    "json"
  ],
  
  // A map from regular expressions to module names or to arrays of module names
  // This helps Jest resolve ES module imports
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  
  // The glob patterns Jest uses to detect test files
  testMatch: [
    "**/tests/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],
  
  // An array of regexp pattern strings that are matched against all test paths
  testPathIgnorePatterns: [
    "/node_modules/"
  ],
  
  // This option allows the use of a custom resolver
  // resolver: undefined,
  
  // The root directory that Jest should scan for tests and modules within
  rootDir: ".",
  
  // A list of paths to directories that Jest should use to search for files in
  roots: [
    "<rootDir>/backend"
  ],
  
  // Indicates whether the @jest/globals should be available in all test environments
  injectGlobals: true,
  
  // Use this configuration option to add custom reporters to Jest
  // reporters: undefined,
  
  // Automatically reset mock state before every test
  resetMocks: false,
  
  // Reset the module registry before running each individual test
  resetModules: false,
  
  // A path to a custom resolver
  // resolver: undefined,
  
  // Allows you to use a custom runner instead of Jest's default test runner
  // runner: "jest-runner",
  
  // The paths to modules that run some code to configure or set up the testing environment
  // setupFiles: [],
  
  // A list of paths to modules that run some code to configure or set up the testing framework
  // setupFilesAfterEnv: [],
  
  // The number of seconds after which a test is considered as slow
  slowTestThreshold: 5,
  
  // A list of paths to snapshot serializer modules Jest should use
  // snapshotSerializers: [],
  
  // The test runner that will be used
  // testRunner: "jest-circus/runner",
  
  // Setting this value to "legacy" or "strict" enables strict mode
  // This can cause tests to fail if they're using features that aren't compatible with strict mode
  // Setting it to "legacy" enables some backwards compatibility features
  // Setting it to "strict" enables all strict mode features
  // Setting it to undefined leaves it up to the test runner
  // Setting it to false disables strict mode
  // Default: undefined
  // Options: "legacy" | "strict" | undefined | false
  // strictMode: undefined,
  
  // This option allows you to use a custom global setup module which exports an async function
  // globalSetup: undefined,
  
  // This option allows you to use a custom global teardown module which exports an async function
  // globalTeardown: undefined,
  
  // This option allows use of a custom test scheduler
  // testScheduler: undefined,
  
  // This option sets the URL for the jsdom environment
  // It is reflected in properties such as location.href
  // testURL: "http://localhost",
  
  // Setting this value to "fake" allows the use of fake timers for functions such as "setTimeout"
  // timers: "real",
  
  // An array of regexp pattern strings that are matched against all modules before they are loaded
  // transformIgnorePatterns: [
  //   "/node_modules/",
  //   "\\.pnp\\.[^\\/.]+$"
  // ],
  
  // Indicates whether each individual test should be reported during the run
  // verbose: undefined,
  
  // An array of regexp patterns that are matched against all source file paths before re-running tests
  // watchPathIgnorePatterns: [],
  
  // Whether to use watchman for file crawling
  // watchman: true,
  
  // Transform is set to an empty object to disable babel-jest
  // This is necessary for ES modules to work properly
  transform: {}
};