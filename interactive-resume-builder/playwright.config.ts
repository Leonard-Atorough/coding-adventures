import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

const IS_CI = !!process.env.CI;

dotenv.config();
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: IS_CI,
  retries: IS_CI ? 2 : 0,
  workers: IS_CI ? 1 : undefined,

  reporter: [
    [IS_CI ? "github" : "list"],
    ["html", { open: "never", outputFolder: "playwright-report", outputFile: "report.html" }],
  ],
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !IS_CI,
  },
});
