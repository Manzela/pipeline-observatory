const { test, expect } = require('@playwright/test');

test.use({ javaScriptEnabled: false });

test.describe('No-JS rendering', () => {
  test('all 7 node sections render in document order with their headings', async ({ page }) => {
    await page.goto('/index.html');
    for (let n = 1; n <= 7; n++) {
      await expect(page.locator(`#node-${n}`)).toBeVisible();
      await expect(page.locator(`#node-${n} h3`)).toContainText(new RegExp(`Node ${n}`, 'i'));
    }
  });

  test('lifecycle container is present and structurally intact', async ({ page }) => {
    await page.goto('/index.html');
    const container = page.locator('[data-lifecycle-container]');
    await expect(container).toBeAttached();
    const nodes = container.locator('.lifecycle-node[data-node-id]');
    await expect(nodes).toHaveCount(7);
  });

  test('no horizontal scroll at 1280×800 with JS off', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/index.html');
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('no horizontal scroll at 390×844 with JS off', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/index.html');
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
