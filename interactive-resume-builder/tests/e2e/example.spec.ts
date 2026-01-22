import { test, expect } from "@playwright/test";

// Visual and end-to-end tests for user workflows
test.describe("Resume Builder E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("placeholder test", async ({ page }) => {
    expect(await page.title()).toBeDefined();
  });
});
