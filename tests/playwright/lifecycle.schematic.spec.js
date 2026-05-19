const { test, expect } = require('@playwright/test');

// Schematic behavior tests (Section A.3, deferred from B.5 dependency).
// The schematic itself lives in index.html as inline SVG, populated by
// initSchematic() in assets/lifecycle.js.

test.describe('DAG schematic — behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/index.html');
  });

  test('schematic figure is present with stable id="dag"', async ({ page }) => {
    await expect(page.locator('figure#dag.dag-schematic')).toBeVisible();
  });

  test('horizontal SVG visible at desktop; vertical SVG hidden', async ({ page }) => {
    await expect(page.locator('.dag-schematic__svg--horizontal')).toBeVisible();
    await expect(page.locator('.dag-schematic__svg--vertical')).toBeHidden();
  });

  test('all 7 nodes present in horizontal SVG with correct data-node-id', async ({ page }) => {
    const nodes = page.locator('.dag-schematic__svg--horizontal .dag-schematic__node[data-node-id]');
    await expect(nodes).toHaveCount(7);
    for (let n = 1; n <= 7; n++) {
      await expect(page.locator(`.dag-schematic__svg--horizontal .dag-schematic__node[data-node-id="${n}"]`)).toBeAttached();
    }
  });

  test('data-role populated from PO.DAG_NODES (deterministic vs probabilistic)', async ({ page }) => {
    // Nodes 4 and 6 are deterministic (det:true); others probabilistic
    for (const n of [4, 6]) {
      await expect(page.locator(`.dag-schematic__svg--horizontal .dag-schematic__node[data-node-id="${n}"]`)).toHaveAttribute('data-role', 'deterministic');
    }
    for (const n of [1, 2, 3, 5, 7]) {
      await expect(page.locator(`.dag-schematic__svg--horizontal .dag-schematic__node[data-node-id="${n}"]`)).toHaveAttribute('data-role', 'probabilistic');
    }
  });

  test('clicking a node scrolls page to corresponding lifecycle section', async ({ page }) => {
    // Capture initial scroll position
    const initialY = await page.evaluate(() => window.scrollY);
    await page.locator('.dag-schematic__svg--horizontal .dag-schematic__node[data-node-id="5"]').click();
    // Wait for scrollIntoView smooth animation
    await page.waitForFunction(() => {
      const node5 = document.getElementById('node-5');
      const r = node5.getBoundingClientRect();
      return r.top >= -10 && r.top <= 200; // node-5 near viewport top
    }, null, { timeout: 3000 });
    const finalY = await page.evaluate(() => window.scrollY);
    expect(finalY).toBeGreaterThan(initialY);
  });

  test('scrolling to a node section sets data-active on the matching schematic node (sync)', async ({ page }) => {
    // Hard scroll-to-top: sticky schematic (FIX 1, 2026-05-19) means
    // scrollIntoViewIfNeeded no longer fires the observer reliably.
    await page.evaluate(() => {
      document.getElementById('node-3').scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await page.waitForFunction(() =>
      document.querySelector('[data-lifecycle-container]')?.getAttribute('data-active-node') === '3'
    );
    await expect(page.locator('.dag-schematic__svg--horizontal .dag-schematic__node[data-node-id="3"][data-active="true"]')).toHaveCount(1);
    // No OTHER node should be active simultaneously
    const activeCount = await page.locator('.dag-schematic__svg--horizontal .dag-schematic__node[data-active="true"]').count();
    expect(activeCount).toBe(1);
  });

  test('keyboard Enter on a focused schematic node scrolls to the corresponding section', async ({ page }) => {
    const initialY = await page.evaluate(() => window.scrollY);
    await page.locator('.dag-schematic__svg--horizontal .dag-schematic__node[data-node-id="6"]').focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => {
      const node6 = document.getElementById('node-6');
      const r = node6.getBoundingClientRect();
      return r.top >= -10 && r.top <= 200;
    }, null, { timeout: 3000 });
    const finalY = await page.evaluate(() => window.scrollY);
    expect(finalY).toBeGreaterThan(initialY);
  });

  test('keyboard Space on a focused schematic node also activates', async ({ page }) => {
    const initialY = await page.evaluate(() => window.scrollY);
    await page.locator('.dag-schematic__svg--horizontal .dag-schematic__node[data-node-id="2"]').focus();
    await page.keyboard.press('Space');
    await page.waitForFunction(() => {
      const node2 = document.getElementById('node-2');
      const r = node2.getBoundingClientRect();
      return r.top >= -10 && r.top <= 200;
    }, null, { timeout: 3000 });
    const finalY = await page.evaluate(() => window.scrollY);
    expect(finalY).toBeGreaterThan(initialY);
  });

  test('figure caption present underneath', async ({ page }) => {
    await expect(page.locator('.dag-schematic__caption')).toBeVisible();
    await expect(page.locator('.dag-schematic__caption')).toContainText(/Fig\.\s*1/i);
  });

  test('all node groups have role="button" and aria-label', async ({ page }) => {
    const nodes = page.locator('.dag-schematic__svg--horizontal .dag-schematic__node[data-node-id]');
    const count = await nodes.count();
    for (let i = 0; i < count; i++) {
      const n = nodes.nth(i);
      await expect(n).toHaveAttribute('role', 'button');
      const aria = await n.getAttribute('aria-label');
      expect(aria).toBeTruthy();
      expect(aria.length).toBeGreaterThan(0);
    }
  });
});
