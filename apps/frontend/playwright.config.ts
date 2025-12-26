import { defineConfig, devices } from "@playwright/test";

// In CI, use production build (port 3000). Locally, use dev server (port 3200).
const isCI = !!process.env.CI;
const port = isCI ? 3000 : 3200;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // In CI, use standalone server (Next.js output: standalone). Locally, use dev server.
    command: isCI ? "node .next/standalone/server.js" : "pnpm run dev",
    url: baseURL,
    reuseExistingServer: !isCI,
  },
});
