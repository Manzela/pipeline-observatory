const { test, expect } = require('@playwright/test');

// NOTE: Playwright 1.60 + this repo's playwright.config.js (no `projects` block,
// `use` without contextOptions) does NOT propagate top-level `reducedMotion`
// from test.use() to the default page fixture. Using contextOptions.reducedMotion
// is the documented alternative that DOES propagate — see Playwright docs:
// https://playwright.dev/docs/api/class-testoptions#test-options-context-options
test.use({ contextOptions: { reducedMotion: 'reduce' } });

test.describe('Reduced motion', () => {
  test('container data-active-node is "static" under reduced motion', async ({ page }) => {
    await page.goto('/index.html');
    const container = page.locator('[data-lifecycle-container]');
    await expect(container).toHaveAttribute('data-active-node', 'static');
  });

  test('scrolling does not toggle data-active-node away from "static"', async ({ page }) => {
    await page.goto('/index.html');
    await page.locator('#node-4').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const value = await page.locator('[data-lifecycle-container]').getAttribute('data-active-node');
    expect(value).toBe('static');
  });

  test('detail legend still populates with Node 1 data (initial fire happens before short-circuit)', async ({ page }) => {
    await page.goto('/index.html');
    // The initial-fire from A.6 dispatches po:active-node-change for Node 1
    // EVEN under reduced motion, so the legend reflects the initial state.
    const legend = page.locator('[data-detail-legend]');
    await expect(legend.locator('[data-legend-node-name]')).toContainText(/City DNA/i);
  });

  test('po:active-node-change does NOT fire on scroll under reduced motion (only the initial-fire)', async ({ page }) => {
    await page.goto('/index.html');
    // Listen AFTER initial fire — only count events from now on
    const eventCount = await page.evaluate(async () => {
      window.__rmEvents = 0;
      document.addEventListener('po:active-node-change', () => window.__rmEvents++);
      document.getElementById('node-4').scrollIntoView();
      await new Promise((r) => setTimeout(r, 600));
      document.getElementById('node-7').scrollIntoView();
      await new Promise((r) => setTimeout(r, 600));
      return window.__rmEvents;
    });
    expect(eventCount).toBe(0);
  });
});
