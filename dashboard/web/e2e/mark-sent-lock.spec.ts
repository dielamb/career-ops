import { test, expect } from '@playwright/test';

/**
 * E2E #2 — Mark-sent lock contention (TST-06).
 *
 * Mocks /api/actions/mark-sent to return 423 Locked and asserts the modal
 * surfaces "Locked, try again" inline (modal MUST stay open).
 */
test.describe('mark-sent-lock', () => {
  test('shows "Locked, try again" inline when mark-sent returns 423', async ({ page }) => {
    // 1. Mock pipeline with a deterministic row.
    await page.route('**/api/pipeline', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              state: 'evaluated',
              num: 17,
              url: 'https://example.com/jobs/17',
              company: 'LockCorp',
              title: 'Lead Engineer',
              score: 4.2,
              pdf: false,
              note: null,
            },
          ],
          errors: [],
        }),
      });
    });

    // 2. Mock listing fetch.
    await page.route('**/api/listing/17', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          report: {
            num: 17,
            slug: 'lockcorp',
            date: '2026-05-20',
            title: 'Lead Engineer at LockCorp',
            score: 4.2,
            url: 'https://example.com/jobs/17',
            pdf: false,
            legitimacy: null,
            blocks: { A: null, B: null, C: null, D: null, E: null, F: null },
            body: 'Body.',
          },
          pdfPath: null,
        }),
      });
    });

    // 3. Mock mark-sent → 423.
    let markCalled = false;
    let markPayload: unknown = null;
    await page.route('**/api/actions/mark-sent', async (route) => {
      markCalled = true;
      try { markPayload = JSON.parse(route.request().postData() ?? '{}'); } catch { markPayload = null; }
      await route.fulfill({
        status: 423,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Locked' }),
      });
    });

    // 4. Drive UI.
    await page.goto('/pipeline');
    await page.getByTestId('pipeline-row-17').click();

    const modal = page.getByTestId('listing-modal');
    await expect(modal).toBeVisible();
    await modal.getByTestId('modal-action-mark-applied').click();

    // 5. Assert request was made AND modal stays open with locked message.
    await expect.poll(() => markCalled, { timeout: 5_000 }).toBe(true);
    expect(markPayload).toMatchObject({ id: '17', status: 'Applied' });

    await expect(modal.getByTestId('modal-mark-message')).toHaveText(/Locked, try again/i);
    await expect(modal).toBeVisible(); // Still mounted — did not auto-close.
  });
});
