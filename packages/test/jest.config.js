export default {
    preset: 'ts-jest/presets/default-esm',
    extensionsToTreatAsEsm: ['.ts'],
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    moduleNameMapping: {
      // 환경변수로 소스/빌드 코드 전환
      '^@core/(.*)$': process.env.USE_BUILT 
        ? '<rootDir>/../core/dist/$1'
        : '<rootDir>/../core/src/$1',
      '^@core$': process.env.USE_BUILT
        ? '<rootDir>/../core/dist/index.js'
        : '<rootDir>/../core/src/index.ts'
    },
    transform: {
      '^.+\\.ts$': ['ts-jest', {
        useESM: true,
        tsconfig: {
          module: 'ESNext',
          target: 'ESNext',
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true
        }
      }]
    },
    collectCoverageFrom: [
      '../core/src/**/*.ts',
      '!../core/src/**/*.d.ts',
      '!../core/src/**/*.test.ts',
      '!../core/src/**/*.spec.ts'
    ]
  };