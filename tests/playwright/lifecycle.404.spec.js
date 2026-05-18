const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const REDIRECT_MAP = [
  { from: '/architecture.html',            to: '/#dag' },
  { from: '/architecture.html#dag-h',      to: '/#dag' },
  { from: '/architecture.html#moe-h',      to: '/#moe' },
  { from: '/architecture.html#orav-h',     to: '/#orav' },
  { from: '/architecture.html#flow-h',     to: '/#flywheel' },
  { from: '/architecture.html#tenants-h',  to: '/#multi-tenant' },
];

// Simulate Task C.1's deletion of architecture.html: rename it aside so the
// dev server serves 404.html for /architecture.html requests, which is exactly
// what GitHub Pages will do after the file is removed. Restore on teardown so
// the working tree is unchanged for other tests / commits.
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const ARCH_LIVE = path.join(REPO_ROOT, 'architecture.html');
const ARCH_BAK  = path.join(REPO_ROOT, 'architecture.html.bak-404test');

test.describe('404.html smart redirect', () => {
  test.beforeAll(() => {
    if (fs.existsSync(ARCH_LIVE)) {
      fs.renameSync(ARCH_LIVE, ARCH_BAK);
    }
  });

  test.afterAll(() => {
    if (fs.existsSync(ARCH_BAK)) {
      fs.renameSync(ARCH_BAK, ARCH_LIVE);
    }
  });

  for (const { from, to } of REDIRECT_MAP) {
    test(`${from} -> ${to}`, async ({ page }) => {
      await page.goto(from, { waitUntil: 'networkidle' });
      const finalPath = await page.evaluate(() => location.pathname + location.hash);
      expect(finalPath).toBe(to);
    });
  }

  test('unknown path falls back to / with explanatory text', async ({ page }) => {
    await page.goto('/some-totally-bogus-path');
    await expect(page.locator('body')).toContainText(/now part of Pipeline/i);
    await expect(page.locator('a[href="/"]').first()).toBeVisible();
  });
});
