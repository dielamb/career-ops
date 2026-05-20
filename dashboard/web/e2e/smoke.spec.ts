import { test, expect } from "@playwright/test";

test("home page renders 'Today.' hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Today.")).toBeVisible();
});
