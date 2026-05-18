const { test, expect } = require('@playwright/test');

// architecture.html is now a redirect proxy (returns HTTP 200 with meta-refresh
// + inline JS that maps the 5 historical fragment IDs to the merged-page anchors).
// 404.html is the generic fallback for any unknown path.
//
// See spec §3 (URL strategy) and §7.3 (redirect proxy component). The proxy
// approach is preferred over the original 404-based redirect because it
// returns HTTP 200, which search engines treat as a 301-equivalent, and
// because the visitor never sees a "not found" page even briefly.

const PROXY_MAP = [
  { from: '/architecture.html',            to: '/#dag' },
  { from: '/architecture.html#dag-h',      to: '/#dag' },
  { from: '/architecture.html#moe-h',      to: '/#moe' },
  { from: '/architecture.html#orav-h',     to: '/#orav' },
  { from: '/architecture.html#flow-h',     to: '/#flywheel' },
  { from: '/architecture.html#tenants-h',  to: '/#multi-tenant' },
  { from: '/architecture.html#unknown-x',  to: '/#dag' }, // unknown fragment falls through
];

test.describe('architecture.html redirect proxy', () => {
  for (const { from, to } of PROXY_MAP) {
    test(`${from} -> ${to}`, async ({ page }) => {
      await page.goto(from, { waitUntil: 'load' });
      // location.replace runs synchronously in the inline script; wait until
      // location actually reaches the target. waitForFunction polls in the page
      // until the predicate is true or times out.
      await page.waitForFunction(
        (expected) => location.pathname + location.hash === expected,
        to,
        { timeout: 5000 }
      );
      const finalPath = await page.evaluate(() => location.pathname + location.hash);
      expect(finalPath).toBe(to);
    });
  }

  test('proxy returns HTTP 200 (not 404) so search engines treat it as 301-equivalent', async ({ request }) => {
    const response = await request.get('/architecture.html');
    expect(response.status()).toBe(200);
  });

  // The three meta-tag checks below use request.get() (raw HTTP) rather than
  // page.goto(), because the inline JS in the proxy fires location.replace()
  // immediately on load — by the time page.goto resolves the document may
  // already be redirected and the response body unreadable.
  test('proxy is robots: noindex,follow so the deprecated URL drops out of the index', async ({ request }) => {
    const response = await request.get('/architecture.html');
    const html = await response.text();
    expect(html).toMatch(/<meta\s+name=["']robots["']\s+content=["']noindex,\s*follow["']/i);
  });

  test('proxy has a canonical link to the merged page', async ({ request }) => {
    const response = await request.get('/architecture.html');
    const html = await response.text();
    expect(html).toMatch(/<link\s+rel=["']canonical["']\s+href=["']https:\/\/manzela\.github\.io\/pipeline-observatory\/["']/i);
  });

  test('proxy has a meta-refresh fallback for JS-disabled visitors', async ({ request }) => {
    const response = await request.get('/architecture.html');
    const html = await response.text();
    expect(html).toMatch(/<meta\s+http-equiv=["']refresh["']\s+content=["']0;\s*url=\/#dag["']/i);
  });
});

test.describe('404.html generic fallback', () => {
  test('unknown path renders the 404 page with a link home', async ({ page }) => {
    await page.goto('/some-totally-bogus-path');
    await expect(page.locator('body')).toContainText(/doesn['’]t exist/i);
    await expect(page.locator('a[href="/"]').first()).toBeVisible();
  });

  test('404.html does not contain architecture-specific redirect logic', async ({ request }) => {
    // After the pivot, 404.html is a generic fallback only. No JS redirect map.
    const response = await request.get('/404.html');
    const html = await response.text();
    expect(html).not.toMatch(/architecture\.html/i);
    expect(html).not.toMatch(/location\.replace/i);
  });
});
