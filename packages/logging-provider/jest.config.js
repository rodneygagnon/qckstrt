/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        diagnostics: { ignoreCodes: [151002] },
      },
    ],
  },
  collectCoverageFrom: ["src/**/*.(t|j)s", "!src/index.ts"],
  coverageDirectory: "./coverage",
  testEnvironment: "node",
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
