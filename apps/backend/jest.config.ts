import type { Config } from 'jest';
// import { defaults } from 'jest-config';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  verbose: true,
  rootDir: '.',
  modulePathIgnorePatterns: ['<rootDir>/dist'],
};

export default config;
