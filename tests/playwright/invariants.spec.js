const { test, expect } = require('@playwright/test');

// architecture.html is now a redirect proxy (no <main>, no <h1>, no skip-link),
// so it's intentionally excluded from this content-page invariants iteration.
// Redirect-proxy behavior is tested in lifecycle.redirects.spec.js.
const PAGES = ['/index.html', '/case-studies.html'];

for (const path of PAGES) {
  test.describe(path, () => {
    test('skip-link is the first focusable element and routes to #main', async ({ page }) => {
      await page.goto(path);
      await page.keyboard.press('Tab');
      const cls = await page.evaluate(() => document.activeElement.className);
      expect(cls).toContain('skip-link');
      const href = await page.evaluate(() => document.activeElement.getAttribute('href'));
      expect(href).toBe('#main');
    });

    test('exactly one <main id="main"> exists', async ({ page }) => {
      await page.goto(path);
      const count = await page.locator('main#main').count();
      expect(count).toBe(1);
    });

    test('exactly one <h1> exists', async ({ page }) => {
      await page.goto(path);
      const count = await page.locator('h1').count();
      expect(count).toBe(1);
    });

    test(':focus-visible rule is defined', async ({ page }) => {
      await page.goto(path);
      const has = await page.evaluate(() => {
        for (const sheet of document.styleSheets) {
          try {
            for (const rule of sheet.cssRules || []) {
              if (rule.selectorText && rule.selectorText.includes(':focus-visible')) return true;
            }
          } catch (e) { /* CORS skip */ }
        }
        return false;
      });
      expect(has).toBe(true);
    });

    test('no horizontal scroll at 1280×800', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(path);
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });

    test('no horizontal scroll at 375×812', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(path);
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });

    test('all target=_blank links carry rel=noopener', async ({ page }) => {
      await page.goto(path);
      const bad = await page.evaluate(() =>
        Array.from(document.querySelectorAll('a[target="_blank"]'))
          .filter((a) => !(a.rel || '').includes('noopener'))
          .map((a) => a.href)
      );
      expect(bad).toEqual([]);
    });

    test('every <img> has an alt attribute', async ({ page }) => {
      await page.goto(path);
      const bad = await page.evaluate(() =>
        Array.from(document.querySelectorAll('img'))
          .filter((i) => !i.hasAttribute('alt'))
          .map((i) => i.src)
      );
      expect(bad).toEqual([]);
    });

    test('reveals are visible immediately under prefers-reduced-motion', async ({ browser }) => {
      const ctx = await browser.newContext({ reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(150);
      const ok = await page.evaluate(() => {
        const r = document.querySelector('.reveal');
        if (!r) return true;
        return r.classList.contains('visible') || getComputedStyle(r).opacity === '1';
      });
      expect(ok).toBe(true);
      await ctx.close();
    });

    test('no inline setInterval calls in page document HTML', async ({ page }) => {
      const docResponses = [];
      page.on('response', async (r) => {
        if (r.request().resourceType() === 'document') {
          try { docResponses.push(await r.text()); } catch (e) { /* ignore */ }
        }
      });
      await page.goto(path);
      const html = docResponses.join('\n');
      // The motion budget forbids unbounded setInterval in inline page JS.
      // Bounded one-shot pulses live in assets/stage.js (auditable) and are exempt.
      // Page-document setInterval count must be zero.
      expect((html.match(/setInterval/g) || []).length).toBe(0);
    });
  });
}

test('chrome verify script: nav and footer fragments are identical across pages', async () => {
  const { execFileSync } = require('child_process');
  const path = require('path');
  const script = path.resolve(__dirname, '../../scripts/verify-chrome.sh');
  const out = execFileSync('bash', [script]).toString();
  expect(out).toContain('OK: NAV');
  expect(out).toContain('OK: FOOTER');
});
