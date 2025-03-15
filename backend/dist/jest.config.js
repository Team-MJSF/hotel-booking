const config = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                useESM: true,
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
};
export default config;
