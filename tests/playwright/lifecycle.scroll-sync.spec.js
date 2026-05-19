const { test, expect } = require('@playwright/test');

// Hard scroll-to-top: with the schematic now sticky (audit FIX 1, 2026-05-19),
// scrollIntoViewIfNeeded() no longer moves the page because most sections are
// always partly visible beneath the sticky schematic. Use scrollIntoView({
// block: 'start' }) to put the section's top at the viewport top — that's
// where the rootMargin band (FIX 2: -15% top / -80% bottom) detects entry.
async function scrollSectionToTop(page, selector) {
  await page.evaluate((sel) => {
    document.querySelector(sel).scrollIntoView({ behavior: 'instant', block: 'start' });
  }, selector);
}

test.describe('Lifecycle scroll-sync', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/index.html'); });

  test('container has data-active-node attribute on load', async ({ page }) => {
    const container = page.locator('[data-lifecycle-container]');
    await expect(container).toHaveAttribute('data-active-node', /^[1-7]$/);
  });

  test('scrolling through node 4 sets data-active-node="4"', async ({ page }) => {
    await scrollSectionToTop(page, '#node-4');
    await page.waitForFunction(() => {
      const c = document.querySelector('[data-lifecycle-container]');
      return c && c.getAttribute('data-active-node') === '4';
    }, null, { timeout: 2000 });
  });

  test('each of 7 node sections sets its node id when scrolled to', async ({ page }) => {
    for (let n = 1; n <= 7; n++) {
      await scrollSectionToTop(page, `#node-${n}`);
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
    // Two instant scrolls land back-to-back; the IntersectionObserver only
    // sees the final state if we don't pause. Wait between scrolls so the
    // observer + rAF debouncer can fire for the intermediate node-3 state.
    await scrollSectionToTop(page, '#node-3');
    await page.waitForFunction(
      () => document.querySelector('[data-lifecycle-container]')?.getAttribute('data-active-node') === '3',
      null,
      { timeout: 2000 }
    );
    await scrollSectionToTop(page, '#node-5');
    await page.waitForFunction(
      () => document.querySelector('[data-lifecycle-container]')?.getAttribute('data-active-node') === '5',
      null,
      { timeout: 2000 }
    );
    const events = await page.evaluate(() => window.__events);
    expect(events).toEqual(expect.arrayContaining([3, 5]));
  });
});
