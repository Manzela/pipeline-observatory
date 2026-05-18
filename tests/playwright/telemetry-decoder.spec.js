const { test, expect } = require('@playwright/test');

const TARGET_PAGE = '/index.html';

test.describe('telemetry intent decoder', () => {
  // Default desktop viewport. Mobile test overrides this inline.
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('initial render seeded to Beat 1', async ({ page }) => {
    await page.goto(TARGET_PAGE);
    await page.locator('.telemetry-stage').waitFor();

    // Assert stage initialized to Beat 1
    const activeBeat = await page.evaluate(() =>
      document.querySelector('.telemetry-stage').getAttribute('data-active-beat')
    );
    expect(activeBeat).toBe('1');

    // Assert caption text starts with DEMAS intro
    const captionText = await page.locator('#telemetryCaption').textContent();
    expect(captionText).toMatch(/^DEMAS sits between nodes/);

    // Assert at least one DEMAS card rendered
    const demasCardCount = await page.locator('#intentDecoder .intent-card[data-node-id="demas"]').count();
    expect(demasCardCount).toBeGreaterThan(0);
  });

  test('Beat change triggers decoder update', async ({ page }) => {
    await page.goto(TARGET_PAGE);
    await page.locator('.telemetry-stage').waitFor();

    // Programmatically change to Beat 2 (mimics IntersectionObserver on scroll)
    await page.evaluate(() => {
      document.querySelector('.telemetry-stage').setAttribute('data-active-beat', '2');
    });

    // Wait for decoder to render the expected card
    await page.locator('#intentDecoder .intent-card[data-node-id="5"]').waitFor({ timeout: 2000 });

    // Assert Beat 2 caption
    const captionText = await page.locator('#telemetryCaption').textContent();
    expect(captionText).toMatch(/^Nodes 1/);

    // Assert exactly 3 cards (nodes 5, 6, 7)
    const cardCount = await page.locator('#intentDecoder .intent-card').count();
    expect(cardCount).toBe(3);

    // Assert the three specific node IDs are present
    const node5Count = await page.locator('#intentDecoder .intent-card[data-node-id="5"]').count();
    const node6Count = await page.locator('#intentDecoder .intent-card[data-node-id="6"]').count();
    const node7Count = await page.locator('#intentDecoder .intent-card[data-node-id="7"]').count();
    expect(node5Count).toBe(1);
    expect(node6Count).toBe(1);
    expect(node7Count).toBe(1);
  });

  test('Beat 3 surfaces the DEMAS failureRoute chip', async ({ page }) => {
    await page.goto(TARGET_PAGE);
    await page.locator('.telemetry-stage').waitFor();

    // Prime via Beat 2 first to ensure clean state (avoid previous-beat-DEMAS-card race)
    await page.evaluate(() => {
      document.querySelector('.telemetry-stage').setAttribute('data-active-beat', '2');
    });
    await page.locator('#intentDecoder .intent-card[data-node-id="5"]').waitFor({ timeout: 2000 });

    // Change to Beat 3 (FAIL beat)
    await page.evaluate(() => {
      document.querySelector('.telemetry-stage').setAttribute('data-active-beat', '3');
    });

    // Wait for DEMAS card to render
    await page.locator('#intentDecoder .intent-card[data-node-id="demas"]').waitFor({ timeout: 2000 });

    // Assert FAIL caption
    const captionText = await page.locator('#telemetryCaption').textContent();
    expect(captionText).toMatch(/^FAIL /);

    // Assert DEMAS card exists
    const demasCardCount = await page.locator('#intentDecoder .intent-card[data-node-id="demas"]').count();
    expect(demasCardCount).toBe(1);

    // Assert fail-route chip exists (red border or text)
    const failChipCount = await page.evaluate(() => {
      const demasCard = document.querySelector('#intentDecoder .intent-card[data-node-id="demas"]');
      if (!demasCard) return 0;
      const redElements = demasCard.querySelectorAll('[class*="border-appleRed"], [class*="text-appleRed"]');
      return redElements.length;
    });
    expect(failChipCount).toBeGreaterThan(0);
  });

  test('Beat 4 (scale beat) renders caption but zero cards', async ({ page }) => {
    await page.goto(TARGET_PAGE);
    await page.locator('.telemetry-stage').waitFor();

    // Change to Beat 4 (scale beat)
    await page.evaluate(() => {
      document.querySelector('.telemetry-stage').setAttribute('data-active-beat', '4');
    });

    // Wait for decoder to clear
    await page.waitForFunction(() => {
      return document.querySelectorAll('#intentDecoder .intent-card').length === 0;
    });

    // Assert scale caption contains tenant count
    const captionText = await page.locator('#telemetryCaption').textContent();
    expect(captionText).toContain('11 tenants');

    // Assert no cards rendered
    const cardCount = await page.locator('#intentDecoder .intent-card').count();
    expect(cardCount).toBe(0);
  });

  test('trace rows are keyboard-focusable and carry tooltips', async ({ page }) => {
    await page.goto(TARGET_PAGE);

    // Assert trace lines have tabindex="0"
    const focusableCount = await page.locator('[data-trace-line][tabindex="0"]').count();
    expect(focusableCount).toBeGreaterThan(0);

    // Assert trace lines have non-empty title attributes (sample first one)
    const firstTitle = await page.evaluate(() => {
      const line = document.querySelector('[data-trace-line]');
      return line ? line.getAttribute('title') : null;
    });
    expect(firstTitle).toBeTruthy();
    expect(firstTitle.length).toBeGreaterThan(0);

    // Assert at least one FAIL row exists
    const failRowCount = await page.locator('[data-trace-line][data-status="fail"]').count();
    expect(failRowCount).toBeGreaterThan(0);
  });

  test('mobile viewport shows all 8 node cards', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(TARGET_PAGE);

    // Mobile fallback should render all 8 cards
    const cardCount = await page.locator('#intentDecoder .intent-card').count();
    expect(cardCount).toBe(8);

    // Verify each node ID exists (7 nodes + DEMAS)
    const nodeIds = await page.evaluate(() =>
      Array.from(document.querySelectorAll('#intentDecoder .intent-card'))
        .map(card => card.getAttribute('data-node-id'))
    );
    expect(nodeIds.sort()).toEqual(['1', '2', '3', '4', '5', '6', '7', 'demas'].sort());
  });
});
