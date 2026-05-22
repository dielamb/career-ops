import { test, expect } from '@playwright/test';

/**
 * E2E — Billing upgrade affordance on /pipeline when free user hits the limit.
 *
 * Mocks /api/billing/status to return {evalCount:5, limit:5, evalsRemaining:0}.
 * Asserts that /pipeline shows SOMETHING that lets the user upgrade — a banner,
 * link to /billing, "limit reached" text, or "upgrade" CTA. The exact UI shape
 * is intentionally not pinned so the implementation can evolve.
 *
 * If no affordance is present at all, this test fails — that's the signal that
 * the UI is missing the gate. Fix it in a follow-up plan, not here.
 */
test.describe('billing-upgrade', () => {
  test('free user at eval limit sees an upgrade affordance on /pipeline', async ({ page }) => {
    // 1. Mock billing status to "limit reached".
    await page.route('**/api/billing/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          isPro: false,
          proUntil: null,
          evalCount: 5,
          limit: 5,
          hasApiKey: false,
          evalsRemaining: 0,
        }),
      });
    });

    // 2. Navigate to /pipeline.
    await page.goto('/pipeline');
    await expect(page.getByTestId('pipeline-table-root')).toBeVisible({ timeout: 10_000 });

    // 3. Assert SOME upgrade affordance is reachable from this page.
    //    We OR three signals so the test does not pin implementation details.
    const upgradeAffordance = page.locator([
      'text=/limit reached/i',
      'text=/upgrade/i',
      'a[href="/billing"]',
      'a[href*="/billing"]',
    ].join(', '));

    await expect(upgradeAffordance.first()).toBeVisible({ timeout: 10_000 });
  });
});
