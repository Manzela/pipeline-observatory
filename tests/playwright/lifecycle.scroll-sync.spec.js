const { test, expect } = require('@playwright/test');

test.describe('Lifecycle scroll-sync', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/index.html'); });

  test('container has data-active-node attribute on load', async ({ page }) => {
    const container = page.locator('[data-lifecycle-container]');
    await expect(container).toHaveAttribute('data-active-node', /^[1-7]$/);
  });

  test('scrolling through node 4 sets data-active-node="4"', async ({ page }) => {
    await page.locator('#node-4').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => {
      const c = document.querySelector('[data-lifecycle-container]');
      return c && c.getAttribute('data-active-node') === '4';
    }, null, { timeout: 2000 });
  });

  test('each of 7 node sections sets its node id when scrolled to', async ({ page }) => {
    for (let n = 1; n <= 7; n++) {
      await page.locator(`#node-${n}`).scrollIntoViewIfNeeded();
      await page.waitForFunction(
        (nodeId) => document.querySelector('[data-lifecycle-container]')?.getAttribute('data-active-node') === String(nodeId),
        n,
        { timeout: 2000 }
      );
    }
  });

  test('po:active-node-change event fires on node transition', async ({ page }) => {
    await page.evaluate(() => {
      window.__events = [];
      document.addEventListener('po:active-node-change', (e) => window.__events.push(e.detail.nodeId));
    });
    await page.locator('#node-3').scrollIntoViewIfNeeded();
    await page.locator('#node-5').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const events = await page.evaluate(() => window.__events);
    expect(events).toEqual(expect.arrayContaining([3, 5]));
  });
});
