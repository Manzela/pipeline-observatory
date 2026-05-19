const { test, expect } = require('@playwright/test');

// Mobile responsive tests (Section A.7, deferred from B.5 schematic dependency).
// At <768px viewport, schematic switches from horizontal (Layout A) to vertical
// (Layout C). Detail legend stays inline within content (no floating sheet).

const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1440, height: 900 };

test.describe('DAG schematic — mobile (<768px)', () => {
  test.use({ viewport: MOBILE });

  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  test('vertical SVG visible at mobile; horizontal SVG hidden', async ({ page }) => {
    await expect(page.locator('.dag-schematic__svg--vertical')).toBeVisible();
    await expect(page.locator('.dag-schematic__svg--horizontal')).toBeHidden();
  });

  test('all 7 nodes present in vertical SVG', async ({ page }) => {
    const nodes = page.locator('.dag-schematic__svg--vertical .dag-schematic__node[data-node-id]');
    await expect(nodes).toHaveCount(7);
  });

  test('schematic nodes have ≥44pt touch target dimensions', async ({ page }) => {
    // Wait for layout settled
    await page.waitForLoadState('networkidle');
    const nodes = await page.locator('.dag-schematic__svg--vertical .dag-schematic__node[data-node-id] rect.dag-schematic__box').all();
    for (const rect of nodes) {
      const box = await rect.boundingBox();
      expect(box.width, `node width on mobile: ${box.width}px`).toBeGreaterThanOrEqual(44);
      expect(box.height, `node height on mobile: ${box.height}px`).toBeGreaterThanOrEqual(44);
    }
  });

  test('vertical SVG R&D handoff line uses the 50px-rhythm compression', async ({ page }) => {
    // Confirm the handoff line ends at y=850 (not 870)
    const line = page.locator('.dag-schematic__svg--vertical line[stroke-dasharray="2 4"]');
    await expect(line).toHaveAttribute('y2', '850');
  });

  test('clicking a node in vertical SVG scrolls to corresponding section', async ({ page }) => {
    const initialY = await page.evaluate(() => window.scrollY);
    await page.locator('.dag-schematic__svg--vertical .dag-schematic__node[data-node-id="4"]').click();
    await page.waitForFunction(() => {
      const node4 = document.getElementById('node-4');
      const r = node4.getBoundingClientRect();
      return r.top >= -10 && r.top <= 200;
    }, null, { timeout: 3000 });
    const finalY = await page.evaluate(() => window.scrollY);
    expect(finalY).toBeGreaterThan(initialY);
  });

  test('framing strip stacks single-column on mobile', async ({ page }) => {
    const items = page.locator('.framing-strip__item');
    await expect(items).toHaveCount(5);
    // First two items should NOT be on the same horizontal line (i.e. y0 < y1)
    const box0 = await items.nth(0).boundingBox();
    const box1 = await items.nth(1).boundingBox();
    expect(box1.y).toBeGreaterThan(box0.y + 10);
  });

  test('Node 5 deep-dive (#moe) is collapsed-by-default on mobile', async ({ page }) => {
    const dd = page.locator('details#moe');
    const isOpen = await dd.evaluate((el) => el.hasAttribute('open'));
    expect(isOpen).toBe(false);
  });

  test('top nav has touch target ≥44pt on mobile menu toggle', async ({ page }) => {
    const toggle = page.locator('#navToggle');
    await expect(toggle).toBeVisible();
    const box = await toggle.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  });
});

test.describe('DAG schematic — desktop (≥768px) sanity', () => {
  test.use({ viewport: DESKTOP });

  test('Node 5 deep-dive (#moe) is open-by-default on desktop', async ({ page }) => {
    await page.goto('/index.html');
    const dd = page.locator('details#moe');
    const isOpen = await dd.evaluate((el) => el.hasAttribute('open'));
    expect(isOpen).toBe(true);
  });

  test('framing strip lays out as horizontal grid (≥1024 = 5-col, 768-1023 = 2-col)', async ({ page }) => {
    await page.goto('/index.html');
    const items = page.locator('.framing-strip__item');
    const box0 = await items.nth(0).boundingBox();
    const box1 = await items.nth(1).boundingBox();
    // First two should be on the same horizontal line (5-col grid at 1440)
    expect(Math.abs(box1.y - box0.y)).toBeLessThan(10);
  });
});
