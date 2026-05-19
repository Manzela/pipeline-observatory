const { test, expect } = require('@playwright/test');

// Gate spec: runs at the end of Section B / Section C to verify the merged
// page is internally consistent. EXPECTED TO FAIL ON FIRST COMMIT — the
// anchors don't exist yet (they land in Section B). When this passes, the
// merged page's anchor surface is complete.
//
// See spec Appendix A (anchor inventory) for the required anchor list.

test.describe('Link integrity (gate)', () => {
  test('all in-page anchor links resolve to an element on the page', async ({ page }) => {
    await page.goto('/index.html');
    const anchors = await page.$$eval('a[href^="#"]', (els) =>
      els.map((e) => e.getAttribute('href')).filter((h) => h && h !== '#')
    );
    const missing = [];
    for (const href of anchors) {
      const id = href.slice(1);
      const exists = await page.evaluate((i) => !!document.getElementById(i), id);
      if (!exists) missing.push(href);
    }
    expect(missing).toEqual([]);
  });

  test('canonical link is set to https://manzela.github.io/pipeline-observatory/', async ({ page }) => {
    await page.goto('/index.html');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBe('https://manzela.github.io/pipeline-observatory/');
  });

  test('og:url matches canonical', async ({ page }) => {
    await page.goto('/index.html');
    const og = await page.locator('meta[property="og:url"]').getAttribute('content');
    expect(og).toBe('https://manzela.github.io/pipeline-observatory/');
  });

  test('every named anchor from spec Appendix A exists', async ({ page }) => {
    await page.goto('/index.html');
    const required = [
      'main',
      'problem',
      'framing',
      'multi-tenant', 'moe', 'orav', 'demas', 'flywheel',
      'dag',
      'telemetry',
      'node-1', 'node-2', 'node-3', 'node-4', 'node-5', 'node-6', 'node-7',
      'economics',
    ];
    const missing = [];
    for (const id of required) {
      const exists = await page.evaluate((i) => !!document.getElementById(i), id);
      if (!exists) missing.push(`#${id}`);
    }
    expect(missing).toEqual([]);
  });

  test('no external links to architecture.html remain on the merged page', async ({ page }) => {
    await page.goto('/index.html');
    const archLinks = await page.$$eval('a[href*="architecture.html"]', (els) =>
      els.map((e) => e.getAttribute('href'))
    );
    expect(archLinks).toEqual([]);
  });
});
