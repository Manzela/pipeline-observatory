const { test, expect } = require('@playwright/test');

test.describe('Detail Legend', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/index.html'); });

  test('detail legend element is present and visible on load', async ({ page }) => {
    const legend = page.locator('[data-detail-legend]');
    await expect(legend).toBeVisible();
  });

  test('on load, legend shows Node 1 (City DNA) data', async ({ page }) => {
    const legend = page.locator('[data-detail-legend]');
    // Wait for initial event fire to populate the legend
    await expect(legend.locator('[data-legend-node-name]')).toContainText(/City DNA/i);
    await expect(legend.locator('[data-legend-gate-name]')).toContainText(/Locale Resolver/i);
    await expect(legend.locator('[data-legend-agent-name]')).toContainText(/Grounded Search/i);
  });

  test('scrolling to Node 5 updates legend to Writer / Template Selector / Content Generator', async ({ page }) => {
    await page.locator('#node-5').scrollIntoViewIfNeeded();
    const legend = page.locator('[data-detail-legend]');
    await expect(legend.locator('[data-legend-node-name]')).toContainText(/Writer/i);
    await expect(legend.locator('[data-legend-gate-name]')).toContainText(/Template Selector/i);
    await expect(legend.locator('[data-legend-agent-name]')).toContainText(/Content Generator/i);
  });

  test('scrolling to Node 6 (Validator, deterministic) updates legend to det role + O-R-A-V engine', async ({ page }) => {
    await page.locator('#node-6').scrollIntoViewIfNeeded();
    const legend = page.locator('[data-detail-legend]');
    await expect(legend.locator('[data-legend-node-name]')).toContainText(/Validator/i);
    await expect(legend.locator('[data-legend-agent-name]')).toContainText(/O-R-A-V Engine/i);
    await expect(legend.locator('[data-legend-role]')).toContainText(/Deterministic/i);
  });

  test('legend includes intent line for active node', async ({ page }) => {
    await page.locator('#node-3').scrollIntoViewIfNeeded();
    const legend = page.locator('[data-detail-legend]');
    await expect(legend.locator('[data-legend-intent]')).toContainText(/locale-aware keyword variants/i);
  });

  test('legend includes trace pattern for active node', async ({ page }) => {
    await page.locator('#node-4').scrollIntoViewIfNeeded();
    const legend = page.locator('[data-detail-legend]');
    await expect(legend.locator('[data-legend-trace]')).toContainText(/Set → API Query → Math Ranking/i);
  });
});

test.describe('lifecycle.js idempotence + bubbles fixes (A.6 back-port)', () => {
  test('calling initLifecycle twice does not double-fire events', async ({ page }) => {
    await page.goto('/index.html');
    const eventCount = await page.evaluate(async () => {
      window.__doubleFireCount = 0;
      document.addEventListener('po:active-node-change', () => window.__doubleFireCount++);
      // Try to re-init
      if (window.PO && window.PO.initLifecycle) {
        window.PO.initLifecycle();
        window.PO.initLifecycle();
      }
      // Trigger a scroll
      document.getElementById('node-4').scrollIntoView();
      // Wait for events to flush
      await new Promise((r) => setTimeout(r, 600));
      return window.__doubleFireCount;
    });
    // Single observer = single event per node change (we scrolled once, so at most a few transitions)
    // If double observer were created, we'd see 2x events. Reasonable cap: <= 4.
    expect(eventCount).toBeLessThanOrEqual(4);
  });

  test('po:active-node-change bubbles so listeners on container also receive it', async ({ page }) => {
    await page.goto('/index.html');
    // Attach the container listener BEFORE scrolling so we capture the next
    // setActive transition. Use Playwright's scrollIntoViewIfNeeded() (instant,
    // not smooth) to avoid relying on <html class="scroll-smooth"> animation
    // landing within a fixed wall-clock window.
    await page.evaluate(() => {
      window.__onContainer = false;
      const container = document.querySelector('[data-lifecycle-container]');
      container.addEventListener('po:active-node-change', () => { window.__onContainer = true; });
    });
    await page.locator('#node-3').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => window.__onContainer === true, null, { timeout: 2000 });
    const received = await page.evaluate(() => window.__onContainer);
    expect(received).toBe(true);
  });
});
