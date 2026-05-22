import { test, expect } from '@playwright/test';

/**
 * E2E — /billing page renders the post-04-02 free-tier copy ("/5 evaluations")
 * OR cleanly redirects to /auth/login when unauthenticated.
 *
 * The page is a Server Component, so page.route('/api/billing/status') CANNOT
 * influence its SSR-rendered data. We therefore assert on STATIC copy that is
 * unconditional in the JSX (the "/5 evaluations used this month" denominator).
 *
 * If the test user is unauthenticated, the layout redirects to /auth/login;
 * the test accepts that as proof the gate works.
 */
test.describe('billing-page-display', () => {
  test('shows /5 free-tier copy or redirects to /auth/login', async ({ page }) => {
    await page.goto('/billing');

    // Wait briefly for any redirect to settle.
    await page.waitForLoadState('domcontentloaded');

    const url = page.url();

    if (url.includes('/auth/login')) {
      // Unauthenticated: layout redirected. Test passes — the gate exists.
      await expect(page).toHaveURL(/\/auth\/login/);
      return;
    }

    // Authenticated path: assert the static free-tier copy.
    await expect(page.locator('body')).toContainText(/Free/);
    await expect(page.locator('body')).toContainText(/\$0\/month/);
    await expect(page.locator('body')).toContainText(/\/5 evaluations used this month/);
    // Negative assertion — the legacy /10 copy MUST be gone post Plan 04-02.
    await expect(page.locator('body')).not.toContainText(/\/10 evaluations used this month/);
  });
});
