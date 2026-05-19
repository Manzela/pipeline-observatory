// Visual regression baselines — per plan Task D.2 and spec §12 test matrix.
// 12 sections × 3 breakpoints = 36 snapshots. Baselines lock in the current
// visual state; future commits that visually break a section will fail here.

const { test, expect } = require('@playwright/test');

const BREAKPOINTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1024', width: 1024, height: 768 },
  { name: '390',  width: 390,  height: 844 },
];

// 12 sections to snapshot. waitFor is a CSS selector that must be visible
// before the screenshot is taken; we snapshot the same element (locator).
const SECTIONS = [
  { id: 'hero',       waitFor: 'header#hero' },
  { id: 'framing',    waitFor: '#framing' },
  { id: 'dag',        waitFor: '.dag-schematic' },
  { id: 'node-1',     waitFor: '#node-1' },
  { id: 'node-2',     waitFor: '#node-2' },
  { id: 'node-3',     waitFor: '#node-3' },
  { id: 'node-4',     waitFor: '#node-4' },
  { id: 'node-5',     waitFor: '#node-5' },
  { id: 'node-6',     waitFor: '#node-6' },
  { id: 'node-7',     waitFor: '#node-7' },
  { id: 'flywheel',   waitFor: '#flywheel' },
  { id: 'economics',  waitFor: '#economics' },
];

for (const bp of BREAKPOINTS) {
  test.describe(`Visual regression @ ${bp.width}x${bp.height}`, () => {
    test.use({ viewport: { width: bp.width, height: bp.height } });
    for (const section of SECTIONS) {
      test(`section #${section.id}`, async ({ page }) => {
        await page.goto('/index.html#' + section.id);
        await page.waitForSelector(section.waitFor, { state: 'visible' });
        await page.waitForTimeout(600); // settle scroll-sync + animations
        // Snapshot the section element (not full page — keeps diffs focused).
        const locator = page.locator(section.waitFor).first();
        await expect(locator).toHaveScreenshot(`${section.id}-${bp.width}.png`, {
          maxDiffPixelRatio: 0.02, // 2% tolerance for AA / sub-pixel jitter
          animations: 'disabled',
        });
      });
    }
  });
}
