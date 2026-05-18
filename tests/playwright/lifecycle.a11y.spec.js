const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

// axe-core accessibility sweep.
// Per spec §9.2 and §13.4 DoD: zero violations on the merged page.
//
// Dependency convention (Option B): the repo gitignores package.json — node
// tooling is not first-class. Before running this spec in a fresh environment,
// install the two test dependencies on demand:
//
//   cd tests/playwright
//   npm install --no-save @playwright/test @axe-core/playwright
//
// The install is local to node_modules (also gitignored) and takes ~30s. The
// rest of the lifecycle.* specs only need @playwright/test, which is already
// installed when you run any other spec via `npx playwright test`.

test.describe('axe-core a11y sweep', () => {
  test('index.html has zero violations at desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page }).analyze();
    if (results.violations.length) {
      console.log('Violations:', JSON.stringify(results.violations, null, 2));
    }
    expect(results.violations).toEqual([]);
  });

  test('index.html has zero violations at mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page }).analyze();
    if (results.violations.length) {
      console.log('Violations:', JSON.stringify(results.violations, null, 2));
    }
    expect(results.violations).toEqual([]);
  });
});
