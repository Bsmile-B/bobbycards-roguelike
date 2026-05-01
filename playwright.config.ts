import { defineConfig, devices } from "playwright/test";

/**
 * Bobbycard V5.1 — Playwright config (Phase 2)
 *
 * - Le test golden-path conduit la run depuis le menu jusqu'au boss final.
 * - Le combat est avancé via le hook `window.advanceTime(ms)` pour rester
 *   déterministe et indépendant du tick interval (260ms).
 * - On ne lance que chromium (suffisant pour le smoke test).
 */
export default defineConfig({
  testDir: "./tests",
  // Le golden path peut être long (3 stages × ~10 fights). On laisse une marge généreuse.
  timeout: 120_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: "list",

  use: {
    baseURL: "http://127.0.0.1:5173",
    headless: true,
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
