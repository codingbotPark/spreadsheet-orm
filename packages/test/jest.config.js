const useBuilt = process.env.USE_BUILT === 'true';

export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  roots: ['<rootDir>'], 
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts',
    './index.ts'
  ],
  moduleNameMapper: {
    // Dynamically map based on USE_BUILT env var
    '^spreadsheet-orm$': useBuilt
      ? '<rootDir>/../main/dist/index.js'
      : '<rootDir>/../main/src/index.ts',
    '^spreadsheet-orm/(.*)$': useBuilt
      ? '<rootDir>/../main/dist/$1'
      : '<rootDir>/../main/src/$1',
  },
  transform: {
    '^.+\.ts$': ['ts-jest', {
      useESM: true,
      tsconfig: 'tsconfig.json' // Explicitly use the tsconfig.json in the test package
    }]
  },
  collectCoverageFrom: [
    '../main/src/**/*.ts',
    '!../main/src/**/*.d.ts',
  ]
};
