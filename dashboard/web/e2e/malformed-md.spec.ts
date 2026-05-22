/**
 * E2E #3 — Malformed MD error boundary (TST-06).
 *
 * Temporarily replaces data/applications.md with a malformed fixture that
 * produces parseErrors[].length > 0 from parseApplications. Visits /today and
 * asserts:
 *   1. The parse-errors-banner is visible.
 *   2. The page does NOT crash to the Next.js error boundary (Today. heading
 *      still renders).
 *
 * Pattern: snapshot-restore around beforeAll/afterAll.
 * Workers: 1 (guaranteed by playwright.config.ts) — file-swap is safe.
 *
 * Path resolution: this file lives at dashboard/web/e2e/malformed-md.spec.ts.
 * __dirname = <repo>/dashboard/web/e2e
 * path.resolve(__dirname, '../../..') = <repo>
 */

import { test, expect } from '@playwright/test';
import { promises as fs } from 'node:fs';
import path from 'node:path';

// Resolve paths relative to this spec file's location.
const REPO_ROOT = path.resolve(__dirname, '../../..');
const APPLICATIONS_REAL = path.join(REPO_ROOT, 'data/applications.md');
const APPLICATIONS_BACKUP = path.join(REPO_ROOT, 'data/applications.md.e2e-bak');
const FIXTURE_PATH = path.join(__dirname, 'fixtures/applications-malformed.md');

test.describe('malformed-md', () => {
  test.beforeAll(async () => {
    // Snapshot the real file and substitute the malformed fixture.
    try {
      await fs.copyFile(APPLICATIONS_REAL, APPLICATIONS_BACKUP);
      const fixture = await fs.readFile(FIXTURE_PATH, 'utf8');
      await fs.writeFile(APPLICATIONS_REAL, fixture, 'utf8');
    } catch (e) {
      throw new Error(`malformed-md setup failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  });

  test.afterAll(async () => {
    // Restore the snapshot, even if the test failed.
    try {
      await fs.copyFile(APPLICATIONS_BACKUP, APPLICATIONS_REAL);
      await fs.unlink(APPLICATIONS_BACKUP);
    } catch (e) {
      // Surface but don't throw — test result must not depend on cleanup.
      console.error('malformed-md cleanup warning:', e);
    }
  });

  test('shows parse-errors-banner without crashing', async ({ page }) => {
    await page.goto('/');

    // Today. heading must still render (page did not crash).
    await expect(page.getByTestId('today-hero-heading')).toHaveText(/Today\./);

    // The parse-errors banner is visible.
    const banner = page.getByTestId('parse-errors-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText(/parse error/i);

    // No Next.js error boundary signature visible.
    await expect(page.locator('text=Application error: a server-side exception')).toHaveCount(0);
  });
});
