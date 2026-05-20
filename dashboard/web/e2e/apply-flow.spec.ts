import { test, expect } from '@playwright/test';

/**
 * E2E #1 — Apply flow happy path (TST-06).
 *
 * Visits /pipeline, mocks the API surface so a deterministic row is present
 * with a known URL, intercepts POST /api/actions/apply to return 200, clicks the
 * row to open the modal, clicks [Open in Chrome], asserts a success indication
 * in the UI.
 *
 * NOTE: ListingCard.onOpen on /today is decorative in v1 and does not POST to
 * /api/actions/apply per Plan 05-01. The apply flow lives inside the ListingModal
 * which is opened from /pipeline rows. This spec drives the full modal path.
 */
test.describe('apply-flow', () => {
  test('opens a listing in Chrome via the modal and shows success', async ({ page }) => {
    // 1. Mock pipeline so we have a deterministic clickable row.
    await page.route('**/api/pipeline', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              state: 'evaluated',
              num: 42,
              url: 'https://example.com/jobs/42',
              company: 'Acme Robotics',
              title: 'Senior Designer',
              score: 4.5,
              pdf: true,
              note: null,
            },
          ],
          errors: [],
        }),
      });
    });

    // 2. Mock listing fetch so the modal renders.
    await page.route('**/api/listing/42', async (route) => {
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
            pdf: true,
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

    // 3. Intercept the apply POST and assert payload shape.
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

    // 4. Drive the UI.
    await page.goto('/pipeline');
    await expect(page.getByTestId('pipeline-table-root')).toBeVisible();
    await page.getByTestId('pipeline-row-42').click();

    const modal = page.getByTestId('listing-modal');
    await expect(modal).toBeVisible();
    await expect(modal.getByTestId('modal-md-pane')).toContainText('Acme Robotics');

    await modal.getByTestId('modal-action-open').click();

    // 5. Assert /api/actions/apply was hit with the right URL, and UI shows success.
    await expect.poll(() => applyCalled, { timeout: 5_000 }).toBe(true);
    expect(applyPayload).toMatchObject({ url: 'https://example.com/jobs/42' });

    await expect(modal.getByTestId('modal-apply-message')).toHaveText(/opened in Chrome/i);
  });
});
