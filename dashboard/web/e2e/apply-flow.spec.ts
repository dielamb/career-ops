import { test, expect } from '@playwright/test';

/**
 * E2E #1 — Apply flow happy path (TST-06).
 *
 * Visits /pipeline (server component — renders real pipeline data), picks the
 * first visible row, intercepts GET /api/listing/* to return a deterministic
 * report, and intercepts POST /api/actions/apply to return 200. Clicks
 * [Open in Chrome] in the modal and asserts the success message.
 *
 * NOTE: /pipeline is a Next.js server component that calls parsePipeline()
 * directly — page.route cannot intercept SSR reads. We therefore work with
 * real pipeline data and mock only the client-side /api/listing/* fetch and
 * the /api/actions/apply POST.
 */
test.describe('apply-flow', () => {
  test('opens a listing in Chrome via the modal and shows success', async ({ page }) => {
    // 1. Mock ALL listing fetches with a deterministic payload.
    await page.route('**/api/listing/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          report: {
            num: 42,
            slug: 'acme-robotics',
            date: '2026-05-20',
            title: 'Senior Designer at Acme Robotics',
            score: 4.5,
            url: 'https://example.com/jobs/42',
            pdf: false,
            legitimacy: 'verified',
            blocks: {
              A: { score: 4.5, notes: 'Strong fit' },
              B: null, C: null, D: null, E: null, F: null,
            },
            body: '# Acme Robotics\nFit details.',
          },
          pdfPath: null,
        }),
      });
    });

    // 2. Intercept the apply POST and assert payload shape.
    let applyCalled = false;
    let applyPayload: unknown = null;
    await page.route('**/api/actions/apply', async (route) => {
      applyCalled = true;
      const req = route.request();
      try { applyPayload = JSON.parse(req.postData() ?? '{}'); } catch { applyPayload = null; }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    // 3. Navigate to /pipeline and click the first visible row.
    await page.goto('/pipeline');
    await expect(page.getByTestId('pipeline-table-root')).toBeVisible();

    // Pick the first data row (real pipeline data — sorted by score desc).
    const firstRow = page.locator('[data-testid^="pipeline-row-"]').first();
    await expect(firstRow).toBeVisible();
    await firstRow.click();

    // 4. Assert the modal opens with the mocked listing content.
    const modal = page.getByTestId('listing-modal');
    await expect(modal).toBeVisible();
    await expect(modal.getByTestId('modal-md-pane')).toContainText('Acme Robotics');

    // 5. Click [Open in Chrome].
    await modal.getByTestId('modal-action-open').click();

    // 6. Assert /api/actions/apply was hit and UI shows success.
    await expect.poll(() => applyCalled, { timeout: 5_000 }).toBe(true);
    expect((applyPayload as Record<string, unknown>)?.url).toBeTruthy();

    await expect(modal.getByTestId('modal-apply-message')).toHaveText(/opened in Chrome/i);
  });
});
