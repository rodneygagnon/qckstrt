const nextJest = require("next/jest");

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const config = {
  preset: "ts-jest",
  testEnvironment: "jest-environment-jsdom",
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  verbose: true,
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  modulePathIgnorePatterns: ["<rootDir>/.next"],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(config);
