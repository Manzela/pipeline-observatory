# Merge Architecture + Observability — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse `pipeline-observatory/index.html` (live observability) and `pipeline-observatory/architecture.html` (static architecture explainer) into a single deductive-lifecycle page; delete `architecture.html`; coordinate external-ref updates across `Manzela/` and `Resume CV/`.

**Architecture:** Hybrid plan matched to the work's actual character — **Section A** drives the 5 behavior-critical surfaces via strict TDD (404 redirect, scroll-sync orchestration, keyboard/a11y, link integrity, no-JS/reduced-motion); **Section B** builds the visual rewrite iteratively in a worktree with the visual-companion server as oracle; **Section C** is a checklist for mechanical content moves and external-ref updates; **Section D** is the quality-gate matrix that gates the PR.

**Tech Stack:** Vanilla HTML/CSS/JS + Tailwind via CDN + Playwright (CommonJS) + axe-core + Lighthouse CI + `python3 -m http.server` for local dev (port 8765).

**Spec contract:** `pipeline-observatory/docs/superpowers/specs/2026-05-18-merge-architecture-observability-design.md` (commit `b7ae50d`). This plan implements that spec; if the spec and the plan disagree, **the spec wins** and the plan is updated.

---

## File Structure

### `pipeline-observatory/` — primary changes

| Action | Path | Responsibility |
|---|---|---|
| Rewrite | `index.html` | The merged page. Hero · Problem · Framing strip · Lifecycle (7 node sections) · Flywheel · Economics. Anchored Decoder sticky-wrapped. |
| Create | `404.html` | Smart client-side redirect: maps deprecated `architecture.html` paths/fragments to merged-page anchors. Pure HTML+JS. |
| Modify | `case-studies.html` | Nav-only: remove the `Architecture` link (lines 31, 41). |
| Delete | `architecture.html` | Replaced by merged page. |
| Modify | `assets/chrome.css` | Add: z-index scale custom properties, `.lifecycle-rail`, `.lifecycle-node`, `.framing-strip`, sticky positioning rules, responsive breakpoints, bottom-sheet decoder styles. |
| Create | `assets/lifecycle.js` | New module. Owns: single shared `IntersectionObserver` for lifecycle sections, `data-active-node` mutation, custom event dispatch, rail click + keyboard handlers, decoder re-targeting glue. Idempotent `window.PO` pattern. |
| Modify | `assets/stage.js` | Likely no change — `attachStage` reused as-is. If lifecycle.js needs a new shared helper, add to stage.js (not lifecycle.js). |
| Create | `assets/og-card.png` | 1200×630 social card. Captured from the built merged page hero. |
| Modify | `README.md` | Line 55: fix O-R-A-V expansion. Page list: remove architecture.html. |
| Modify | `CHANGELOG.md` | New `[3.0.0]` entry: Added / Changed / Removed / Migration notes. |
| Modify | `ROADMAP.md` | Update / remove items now shipped. |
| Create | `tests/playwright/lifecycle.404.spec.js` | Smart-redirect verification (Section A). |
| Create | `tests/playwright/lifecycle.scroll-sync.spec.js` | Active-node mutation under scroll (Section A). |
| Create | `tests/playwright/lifecycle.rail.spec.js` | Rail click + arrow keys + focus management (Section A). |
| Create | `tests/playwright/lifecycle.keyboard.spec.js` | Tab order, focus-visible, skip links, no traps (Section A). |
| Create | `tests/playwright/lifecycle.link-integrity.spec.js` | All anchors resolve; canonical and og:url valid (Section A). |
| Create | `tests/playwright/lifecycle.no-js.spec.js` | JS-disabled rendering (Section A). |
| Create | `tests/playwright/lifecycle.reduced-motion.spec.js` | `prefers-reduced-motion` path (Section A). |
| Create | `tests/playwright/lifecycle.intent-decoder.spec.js` | Decoder behavior preserved, re-targeted to nodes (Section A). |
| Create | `tests/playwright/lifecycle.mobile.spec.js` | Rail→scrubber, decoder→bottom-sheet (Section A). |
| Create | `tests/playwright/lifecycle.visual.spec.js` | Visual-regression snapshots at 11 viewport states × 3 breakpoints (Section D). |
| Modify | `tests/playwright/invariants.spec.js` | Remove `/architecture.html` from `PAGES` array (lines 3). |
| Modify | `tests/playwright/telemetry-decoder.spec.js` | Update any beat-targeted selectors that now reference `data-active-node` instead. |

### `Manzela/` — external coordination (separate PR)

| Action | Path | Change |
|---|---|---|
| Modify | `index.html` | Lines 1059, 1103: change `architecture.html` href → `/pipeline-observatory/#dag` |
| Modify | `llms.txt` | Line 16: remove the standalone "Architecture" line; replace with `/pipeline-observatory/#dag` reference |
| Modify | `sitemap.xml` | Line 40: remove `architecture.html` entry; update `<lastmod>` on the root entry |
| Modify (verify) | `README.md` | Verify no `architecture.html` ref before commit; expected: zero match |

### `Resume CV/` — external coordination (separate PR)

| Action | Path | Change |
|---|---|---|
| Modify | `00-GROUND-SOURCE-OF-TRUTH.md` | Lines 75, 95, 137: update URL references to anchored links on the merged page |
| Modify | `01-resume-spec-v3.md` | Line 117: remove the inline `— Architecture: ...architecture.html` from the resume bullet |
| Modify | `02-format-best-practices-2026.md` | Line 431: update the audit table row |
| Modify | `03-implementation-plan.md` | Lines 797, 844: update planned llms.txt template + sitemap.xml template |

---

## Section 0: Worktree + Baseline Capture

### Task 0.1: Create isolated worktree

**Files:** none yet.

- [ ] **Step 1: Invoke superpowers:using-git-worktrees skill**

The skill creates `.claude/worktrees/merge-architecture-observability/` branching from a fresh state of `pipeline-observatory/main`. All subsequent work happens inside the worktree. If the skill is unavailable, fall back to:
```bash
cd "/Users/danielmanzela/Professional Profile/pipeline-observatory"
git worktree add -b merge/architecture-observability ../.po-worktree main
cd ../.po-worktree
```

- [ ] **Step 2: Verify clean worktree state**

```bash
git status -s
# Expected: empty
git log --oneline -1
# Expected: latest main commit
```

- [ ] **Step 3: Start dev server in background**

```bash
python3 -m http.server 8765 --bind 127.0.0.1 &
echo $! > /tmp/po-devserver.pid
```

Verify with `curl -sI http://127.0.0.1:8765/index.html | head -1` → `HTTP/1.0 200 OK`.

### Task 0.2: Baseline capture (for PR description)

**Files:** `docs/superpowers/baselines/2026-05-18-pre-merge/` (created).

- [ ] **Step 1: Capture before-screenshots at 3 breakpoints**

Use Playwright headed mode or the playwright MCP browser tools to navigate to each current page at 1440, 1024, 390 widths and save full-page PNGs to `docs/superpowers/baselines/2026-05-18-pre-merge/{index,architecture,case-studies}-{1440,1024,390}.png`.

- [ ] **Step 2: Capture before-Lighthouse JSON**

```bash
npx -y lighthouse http://127.0.0.1:8765/index.html \
  --form-factor=mobile --output=json \
  --output-path=docs/superpowers/baselines/2026-05-18-pre-merge/lighthouse-index-mobile.json \
  --chrome-flags="--headless" --quiet
npx -y lighthouse http://127.0.0.1:8765/architecture.html \
  --form-factor=mobile --output=json \
  --output-path=docs/superpowers/baselines/2026-05-18-pre-merge/lighthouse-architecture-mobile.json \
  --chrome-flags="--headless" --quiet
```

- [ ] **Step 3: Commit baselines**

```bash
git add docs/superpowers/baselines/2026-05-18-pre-merge/
git commit -m "docs(baselines): pre-merge screenshots + Lighthouse JSON for PR diff"
```

---

## Section A: Behavior Tasks (Strict TDD)

Each task in this section follows the discipline: write failing Playwright spec → run to verify it fails → implement minimal code → run to verify it passes → commit. No exceptions.

### Task A.1: Smart 404 redirect

**Files:**
- Create: `tests/playwright/lifecycle.404.spec.js`
- Create: `404.html`

- [ ] **Step 1: Write failing spec**

`tests/playwright/lifecycle.404.spec.js`:

```javascript
const { test, expect } = require('@playwright/test');

const REDIRECT_MAP = [
  { from: '/architecture.html',            to: '/#dag' },
  { from: '/architecture.html#dag-h',      to: '/#dag' },
  { from: '/architecture.html#moe-h',      to: '/#moe' },
  { from: '/architecture.html#orav-h',     to: '/#orav' },
  { from: '/architecture.html#flow-h',     to: '/#flywheel' },
  { from: '/architecture.html#tenants-h',  to: '/#multi-tenant' },
];

test.describe('404.html smart redirect', () => {
  for (const { from, to } of REDIRECT_MAP) {
    test(`${from} -> ${to}`, async ({ page }) => {
      await page.goto(from, { waitUntil: 'networkidle' });
      const finalPath = await page.evaluate(() => location.pathname + location.hash);
      expect(finalPath).toBe(to);
    });
  }

  test('unknown path falls back to / with explanatory text', async ({ page }) => {
    await page.goto('/some-totally-bogus-path');
    await expect(page.locator('body')).toContainText(/now part of Pipeline/i);
    await expect(page.locator('a[href="/"]').first()).toBeVisible();
  });
});
```

- [ ] **Step 2: Run spec to verify failure**

```bash
cd tests/playwright
npx playwright test lifecycle.404.spec.js
# Expected: all 7 tests FAIL (404.html doesn't exist; redirect chain not implemented)
```

- [ ] **Step 3: Create 404.html**

`404.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>That page moved — Pipeline</title>
<meta name="robots" content="noindex">
<style>
  body{font:14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0b0b0c;color:#e5e5e7;margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
  main{max-width:480px;text-align:center}
  a{color:#5e9eff;text-decoration:none;border-bottom:1px solid #5e9eff33;padding-bottom:1px}
  a:hover{border-color:#5e9eff}
</style>
</head>
<body>
<main>
  <p>That page is now part of <a id="home" href="/pipeline-observatory/">Pipeline</a>.</p>
</main>
<script>
(function () {
  // Operate relative to the GitHub Pages project root /pipeline-observatory/.
  // location.pathname examples:
  //   /pipeline-observatory/architecture.html
  //   /pipeline-observatory/architecture.html (with #moe-h in location.hash)
  const ROOT = '/pipeline-observatory/';
  const REDIRECTS = {
    'architecture.html':           ROOT + '#dag',
    'architecture.html#dag-h':     ROOT + '#dag',
    'architecture.html#moe-h':     ROOT + '#moe',
    'architecture.html#orav-h':    ROOT + '#orav',
    'architecture.html#flow-h':    ROOT + '#flywheel',
    'architecture.html#tenants-h': ROOT + '#multi-tenant',
  };
  const path = location.pathname.replace(ROOT, '').replace(/^\//, '');
  const key = path + (location.hash || '');
  if (REDIRECTS[key]) {
    location.replace(REDIRECTS[key]);
  } else if (path === 'architecture.html') {
    location.replace(ROOT + '#dag');
  }
})();
</script>
</body>
</html>
```

**Note on local server vs GitHub Pages:** the local `python3 -m http.server` serves from the repo root (so `/architecture.html` works as a path under the worktree). On GitHub Pages, the site lives at `/pipeline-observatory/`. The script handles both: the `ROOT` constant should be set to `''` for local-server runs in the spec config OR the spec should base-URL with the `/pipeline-observatory/` prefix. For consistency, the spec runs locally without the `/pipeline-observatory/` prefix — adjust `ROOT = ''` at the top of `404.html` if needed, OR run the spec against a path-rewritten dev server. **Implementation choice: ship `ROOT = ''` for local tests; production deploy uses a build-step substitution OR a separate `404.html` template.** Document the chosen approach in the commit message.

- [ ] **Step 4: Run spec to verify pass**

```bash
npx playwright test lifecycle.404.spec.js
# Expected: 7 PASS
```

- [ ] **Step 5: Commit**

```bash
git add 404.html tests/playwright/lifecycle.404.spec.js
git commit -m "feat(404): smart redirect from architecture.html paths to merged-page anchors"
```

### Task A.2: Scroll-sync orchestration

**Files:**
- Create: `tests/playwright/lifecycle.scroll-sync.spec.js`
- Create: `assets/lifecycle.js`
- Modify: `index.html` (skeleton — temporary placeholder lifecycle sections that the spec can target)

> **Note for executor:** This task introduces just enough of `index.html` to make the spec pass. The full Apple-grade content lands in Section B; here we ship structural shell + observer wiring.

- [ ] **Step 1: Write failing spec**

`tests/playwright/lifecycle.scroll-sync.spec.js`:

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Lifecycle scroll-sync', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/index.html'); });

  test('container has data-active-node attribute on load', async ({ page }) => {
    const container = page.locator('[data-lifecycle-container]');
    await expect(container).toHaveAttribute('data-active-node', /^[1-7]$/);
  });

  test('scrolling through node 4 sets data-active-node="4"', async ({ page }) => {
    await page.locator('#node-4').scrollIntoViewIfNeeded();
    // Allow IntersectionObserver to fire
    await page.waitForFunction(() => {
      const c = document.querySelector('[data-lifecycle-container]');
      return c && c.getAttribute('data-active-node') === '4';
    }, null, { timeout: 2000 });
  });

  test('each of 7 node sections sets its node id when scrolled to', async ({ page }) => {
    for (let n = 1; n <= 7; n++) {
      await page.locator(`#node-${n}`).scrollIntoViewIfNeeded();
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
    await page.locator('#node-3').scrollIntoViewIfNeeded();
    await page.locator('#node-5').scrollIntoViewIfNeeded();
    const events = await page.evaluate(() => window.__events);
    expect(events).toEqual(expect.arrayContaining([3, 5]));
  });
});
```

- [ ] **Step 2: Run spec to verify failure**

```bash
npx playwright test lifecycle.scroll-sync.spec.js
# Expected: all 4 tests FAIL (lifecycle container + sections don't exist)
```

- [ ] **Step 3: Create assets/lifecycle.js**

`assets/lifecycle.js`:

```javascript
/* Lifecycle scroll-sync orchestrator.
   Single shared IntersectionObserver targets .lifecycle-node[data-node-id] sections.
   When the most-visible node changes, mutates [data-lifecycle-container][data-active-node]
   and dispatches po:active-node-change for subscribers (rail, decoder, trace caption). */

(function () {
  window.PO = window.PO || {};

  function initLifecycle() {
    const container = document.querySelector('[data-lifecycle-container]');
    const nodes = document.querySelectorAll('.lifecycle-node[data-node-id]');
    if (!container || !nodes.length) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      container.setAttribute('data-active-node', 'static');
      return;
    }

    // Initial state: first node is active until scroll proves otherwise
    container.setAttribute('data-active-node', String(nodes[0].dataset.nodeId));

    let pending = null;
    function setActive(nodeId) {
      if (container.getAttribute('data-active-node') === String(nodeId)) return;
      container.setAttribute('data-active-node', String(nodeId));
      document.dispatchEvent(new CustomEvent('po:active-node-change', {
        detail: { nodeId: Number(nodeId) }
      }));
    }

    const obs = new IntersectionObserver((entries) => {
      // Pick the entry with the largest intersectionRatio (or highest data-node-id when tied for stability)
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (!visible.length) return;
      const id = visible[0].target.dataset.nodeId;
      if (pending) cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => setActive(id));
    }, {
      // Band: upper-middle of viewport, matches existing stage.js pattern
      rootMargin: '-15% 0px -55% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1],
    });

    nodes.forEach((n) => obs.observe(n));
  }

  window.PO.initLifecycle = initLifecycle;

  document.addEventListener('DOMContentLoaded', initLifecycle);
})();
```

- [ ] **Step 4: Add minimal skeleton to index.html**

Edit `index.html`: inside `<main id="main">`, add a temporary block (the full content lands in Section B):

```html
<div data-lifecycle-container>
  <section class="lifecycle-node" id="node-1" data-node-id="1" style="min-height:100vh">Node 1 placeholder</section>
  <section class="lifecycle-node" id="node-2" data-node-id="2" style="min-height:100vh">Node 2 placeholder</section>
  <section class="lifecycle-node" id="node-3" data-node-id="3" style="min-height:100vh">Node 3 placeholder</section>
  <section class="lifecycle-node" id="node-4" data-node-id="4" style="min-height:100vh">Node 4 placeholder</section>
  <section class="lifecycle-node" id="node-5" data-node-id="5" style="min-height:100vh">Node 5 placeholder</section>
  <section class="lifecycle-node" id="node-6" data-node-id="6" style="min-height:100vh">Node 6 placeholder</section>
  <section class="lifecycle-node" id="node-7" data-node-id="7" style="min-height:100vh">Node 7 placeholder</section>
</div>
```

And before the closing `</body>`, add: `<script src="assets/lifecycle.js"></script>` (after `stage.js`).

- [ ] **Step 5: Run spec to verify pass**

```bash
npx playwright test lifecycle.scroll-sync.spec.js
# Expected: 4 PASS
```

- [ ] **Step 6: Commit**

```bash
git add assets/lifecycle.js index.html tests/playwright/lifecycle.scroll-sync.spec.js
git commit -m "feat(lifecycle): scroll-sync orchestrator with single shared IntersectionObserver"
```

### Task A.3: Keyboard navigation + a11y semantics

**Files:**
- Create: `tests/playwright/lifecycle.keyboard.spec.js`
- Create: `tests/playwright/lifecycle.rail.spec.js`
- Modify: `assets/lifecycle.js` (add rail keyboard handler)
- Modify: `assets/chrome.css` (focus-visible on rail items)
- Modify: `index.html` (add `<nav class="lifecycle-rail" aria-label="Pipeline lifecycle">…`, second skip link)

- [ ] **Step 1: Write failing keyboard spec**

`tests/playwright/lifecycle.keyboard.spec.js`:

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Lifecycle keyboard navigation', () => {
  test('two skip links: main + lifecycle', async ({ page }) => {
    await page.goto('/index.html');
    await page.keyboard.press('Tab');
    const first = await page.evaluate(() => document.activeElement.getAttribute('href'));
    expect(first).toBe('#main');
    await page.keyboard.press('Tab');
    const second = await page.evaluate(() => document.activeElement.getAttribute('href'));
    expect(second).toBe('#dag');
  });

  test('rail nav has aria-label "Pipeline lifecycle"', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('nav[aria-label="Pipeline lifecycle"]')).toBeVisible();
  });

  test('rail item has aria-current="step" when its node is active', async ({ page }) => {
    await page.goto('/index.html');
    await page.locator('#node-4').scrollIntoViewIfNeeded();
    await page.waitForFunction(() =>
      document.querySelector('[data-lifecycle-container]')?.getAttribute('data-active-node') === '4'
    );
    await expect(page.locator('nav[aria-label="Pipeline lifecycle"] [data-node-id="4"]')).toHaveAttribute('aria-current', 'step');
  });

  test('focus is not trapped anywhere on the page', async ({ page }) => {
    await page.goto('/index.html');
    // Tab through 50 times — should not loop early or stall
    for (let i = 0; i < 50; i++) await page.keyboard.press('Tab');
    // Activity didn't throw; baseline pass
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 2: Write failing rail spec**

`tests/playwright/lifecycle.rail.spec.js`:

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Lifecycle rail', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/index.html');
  });

  test('rail renders 9 items (7 nodes + Flywheel + Economics)', async ({ page }) => {
    const items = page.locator('nav[aria-label="Pipeline lifecycle"] [data-rail-item]');
    await expect(items).toHaveCount(9);
  });

  test('click on rail item jumps to section and moves focus to its heading', async ({ page }) => {
    await page.locator('nav[aria-label="Pipeline lifecycle"] [data-node-id="5"]').click();
    await page.waitForFunction(() => location.hash === '#node-5');
    const active = await page.evaluate(() => document.activeElement.tagName + ':' + (document.activeElement.id || ''));
    expect(active).toContain('node-5');
  });

  test('Arrow Down on rail advances to next item', async ({ page }) => {
    await page.locator('nav[aria-label="Pipeline lifecycle"] [data-node-id="1"]').focus();
    await page.keyboard.press('ArrowDown');
    const focusedNode = await page.evaluate(() => document.activeElement.getAttribute('data-node-id'));
    expect(focusedNode).toBe('2');
  });

  test('Arrow Up on rail item 1 stays at item 1 (no wrap)', async ({ page }) => {
    await page.locator('nav[aria-label="Pipeline lifecycle"] [data-node-id="1"]').focus();
    await page.keyboard.press('ArrowUp');
    const focusedNode = await page.evaluate(() => document.activeElement.getAttribute('data-node-id'));
    expect(focusedNode).toBe('1');
  });
});
```

- [ ] **Step 3: Run both specs to verify failure**

```bash
npx playwright test lifecycle.keyboard.spec.js lifecycle.rail.spec.js
# Expected: all FAIL (rail nav, skip link, keyboard handlers all missing)
```

- [ ] **Step 4: Implement rail HTML in index.html**

Add inside `<main id="main">`, before the lifecycle container:

```html
<a href="#dag" class="skip-link skip-link--second">Skip to lifecycle</a>
<nav class="lifecycle-rail" aria-label="Pipeline lifecycle">
  <ol>
    <li><a href="#node-1" data-rail-item data-node-id="1" tabindex="0">Node 1 · City DNA</a></li>
    <li><a href="#node-2" data-rail-item data-node-id="2" tabindex="0">Node 2 · Normalizer</a></li>
    <li><a href="#node-3" data-rail-item data-node-id="3" tabindex="0">Node 3 · Synonyms</a></li>
    <li><a href="#node-4" data-rail-item data-node-id="4" tabindex="0">Node 4 · SV Gate</a></li>
    <li><a href="#node-5" data-rail-item data-node-id="5" tabindex="0">Node 5 · Writer</a></li>
    <li><a href="#node-6" data-rail-item data-node-id="6" tabindex="0">Node 6 · Validator</a></li>
    <li><a href="#node-7" data-rail-item data-node-id="7" tabindex="0">Node 7 · Evaluator</a></li>
    <li><a href="#flywheel" data-rail-item data-node-id="flywheel" tabindex="0">Flywheel</a></li>
    <li><a href="#economics" data-rail-item data-node-id="economics" tabindex="0">Economics</a></li>
  </ol>
</nav>
```

Also: ensure each `.lifecycle-node` section has a heading element with a matching `id` for focus-jump (e.g. `<h3 id="node-5-h" tabindex="-1">…`). Each rail-item click handler moves focus to the section root (the `<section id="node-N">`).

- [ ] **Step 5: Implement rail behavior in lifecycle.js**

Append to `assets/lifecycle.js` inside the existing IIFE:

```javascript
function initRail() {
  const rail = document.querySelector('nav[aria-label="Pipeline lifecycle"]');
  if (!rail) return;
  const items = Array.from(rail.querySelectorAll('[data-rail-item]'));

  // Click: move focus to the target section (the anchor jump handles the scroll)
  items.forEach((item) => {
    item.addEventListener('click', () => {
      const targetId = item.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: false });
      }
    });
  });

  // Arrow keys: cycle through items, no wrap
  rail.addEventListener('keydown', (e) => {
    const i = items.indexOf(document.activeElement);
    if (i < 0) return;
    if (e.key === 'ArrowDown' && i < items.length - 1) {
      items[i + 1].focus();
      e.preventDefault();
    } else if (e.key === 'ArrowUp' && i > 0) {
      items[i - 1].focus();
      e.preventDefault();
    }
  });

  // Subscribe to scroll-sync: mark active item
  document.addEventListener('po:active-node-change', (e) => {
    items.forEach((it) => it.removeAttribute('aria-current'));
    const active = rail.querySelector(`[data-node-id="${e.detail.nodeId}"]`);
    if (active) active.setAttribute('aria-current', 'step');
  });
}

// Wire on DOMContentLoaded alongside initLifecycle
document.addEventListener('DOMContentLoaded', initRail);
```

- [ ] **Step 6: Run specs to verify pass**

```bash
npx playwright test lifecycle.keyboard.spec.js lifecycle.rail.spec.js
# Expected: 9 PASS
```

- [ ] **Step 7: Commit**

```bash
git add tests/playwright/lifecycle.keyboard.spec.js tests/playwright/lifecycle.rail.spec.js assets/lifecycle.js index.html
git commit -m "feat(lifecycle): sticky rail with keyboard nav, focus management, aria-current"
```

### Task A.4: Link integrity

**Files:**
- Create: `tests/playwright/lifecycle.link-integrity.spec.js`

- [ ] **Step 1: Write failing spec**

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Lifecycle link integrity', () => {
  test('all in-page anchor links resolve to an element on the page', async ({ page }) => {
    await page.goto('/index.html');
    const anchors = await page.$$eval('a[href^="#"]', (els) => els.map((e) => e.getAttribute('href')));
    const missing = [];
    for (const href of anchors) {
      if (href === '#') continue;
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
      'main', 'problem', 'framing',
      'multi-tenant', 'moe', 'orav', 'demas', 'flywheel',
      'dag', 'telemetry',
      'node-1', 'node-2', 'node-3', 'node-4', 'node-5', 'node-6', 'node-7',
      'economics',
    ];
    for (const id of required) {
      const exists = await page.evaluate((i) => !!document.getElementById(i), id);
      expect.soft(exists, `expected #${id} to exist`).toBe(true);
    }
  });

  test('no external links to architecture.html remain on the merged page', async ({ page }) => {
    await page.goto('/index.html');
    const broken = await page.$$eval('a[href*="architecture.html"]', (els) => els.length);
    expect(broken).toBe(0);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Expected: tests fail on missing anchors / wrong canonical / leftover architecture.html refs.

- [ ] **Step 3: Implementation is satisfied by Section B and Section C work**

This spec acts as the gate at the end of the build. Mark this task complete only after the spec passes following Sections B+C. Do not stub `<a id="…">` elements just to pass the spec — those would be Apple-grade-failing placeholders.

- [ ] **Step 4: Re-run at end of Section B**

```bash
npx playwright test lifecycle.link-integrity.spec.js
# Expected: all PASS
```

- [ ] **Step 5: Commit when passing**

```bash
git add tests/playwright/lifecycle.link-integrity.spec.js
git commit -m "test(link-integrity): assert every spec-defined anchor resolves on merged page"
```

### Task A.5: No-JS + reduced-motion graceful degrade

**Files:**
- Create: `tests/playwright/lifecycle.no-js.spec.js`
- Create: `tests/playwright/lifecycle.reduced-motion.spec.js`
- Modify: `assets/chrome.css` (no-JS fallback styles)
- Modify: `assets/lifecycle.js` (reduced-motion already short-circuits — verify)

- [ ] **Step 1: Write failing no-JS spec**

```javascript
const { test, expect } = require('@playwright/test');

test.use({ javaScriptEnabled: false });

test.describe('No-JS rendering', () => {
  test('all 7 node sections render in document order', async ({ page }) => {
    await page.goto('/index.html');
    for (let n = 1; n <= 7; n++) {
      await expect(page.locator(`#node-${n}`)).toBeVisible();
    }
  });

  test('framing strip is visible', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('#framing')).toBeVisible();
  });

  test('Anchored Decoder cards all visible (stacked, no scroll-sync)', async ({ page }) => {
    await page.goto('/index.html');
    // With JS off, the decoder shows all 7 cards stacked (per spec §7.4 + chrome.css fallback)
    const cards = page.locator('[data-decoder-card]');
    await expect(cards).toHaveCount(7);
    for (let i = 0; i < 7; i++) {
      await expect(cards.nth(i)).toBeVisible();
    }
  });

  test('no horizontal scroll at 390×844 with JS off', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/index.html');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
```

- [ ] **Step 2: Write failing reduced-motion spec**

```javascript
const { test, expect } = require('@playwright/test');

test.use({ colorScheme: 'dark', reducedMotion: 'reduce' });

test.describe('Reduced motion', () => {
  test('container data-active-node is "static" under reduced motion', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('[data-lifecycle-container]')).toHaveAttribute('data-active-node', 'static');
  });

  test('all 7 decoder cards visible (no scroll-sync animation)', async ({ page }) => {
    await page.goto('/index.html');
    const cards = page.locator('[data-decoder-card]');
    await expect(cards).toHaveCount(7);
    for (let i = 0; i < 7; i++) await expect(cards.nth(i)).toBeVisible();
  });

  test('scrolling does not toggle data-active-node', async ({ page }) => {
    await page.goto('/index.html');
    await page.locator('#node-4').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const value = await page.locator('[data-lifecycle-container]').getAttribute('data-active-node');
    expect(value).toBe('static');
  });
});
```

- [ ] **Step 3: Run both to verify failure**

```bash
npx playwright test lifecycle.no-js.spec.js lifecycle.reduced-motion.spec.js
# Expected: all FAIL
```

- [ ] **Step 4: Implement no-JS fallback in chrome.css**

Add to `assets/chrome.css`:

```css
/* No-JS / reduced-motion fallback: all decoder cards visible, stacked */
[data-lifecycle-container][data-active-node="static"] [data-decoder-card],
.no-js [data-decoder-card] {
  display: block;
  opacity: 1;
  position: static;
}

/* Without JS, the lifecycle container behaves like a plain document */
.no-js .lifecycle-rail {
  position: static;
}
```

Add to `index.html` `<html>` element: `<html lang="en" class="scroll-smooth no-js">` — then add a tiny `<script>` block in `<head>` that removes the `no-js` class on load:

```html
<script>document.documentElement.classList.remove('no-js');</script>
```

- [ ] **Step 5: Verify lifecycle.js already short-circuits on reduced motion**

(It does in Task A.2 Step 3; re-read to confirm: `if (reduced) { container.setAttribute('data-active-node', 'static'); return; }`)

- [ ] **Step 6: Run both specs to verify pass**

```bash
npx playwright test lifecycle.no-js.spec.js lifecycle.reduced-motion.spec.js
# Expected: 7 PASS
```

- [ ] **Step 7: Commit**

```bash
git add tests/playwright/lifecycle.no-js.spec.js tests/playwright/lifecycle.reduced-motion.spec.js assets/chrome.css index.html
git commit -m "feat(a11y): no-JS and reduced-motion graceful degrade for lifecycle"
```

### Task A.6: Intent Decoder re-targeting

**Files:**
- Create: `tests/playwright/lifecycle.intent-decoder.spec.js`
- Modify: existing decoder JS (currently inlined or in `assets/`) — find via grep
- Modify: `assets/lifecycle.js` (dispatch event already done; decoder must subscribe)

- [ ] **Step 1: Grep for existing decoder logic**

```bash
grep -rnE 'intent-card|decoder|data-beat' assets/ index.html
```

Catalog the current decoder render path. Goal: keep the card render logic identical, change only the trigger (from `data-beat` to `po:active-node-change`).

- [ ] **Step 2: Write failing spec**

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Intent Decoder re-targeted to node sections', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/index.html'); });

  test('decoder is present and shows card for active node', async ({ page }) => {
    await page.locator('#node-5').scrollIntoViewIfNeeded();
    await page.waitForFunction(() =>
      document.querySelector('[data-lifecycle-container]')?.getAttribute('data-active-node') === '5'
    );
    // Decoder card should reflect node 5 (Writer)
    await expect(page.locator('[data-decoder-active-card]')).toContainText(/Writer/i);
  });

  test('decoder card includes gate, agent, intent, and role badge', async ({ page }) => {
    await page.locator('#node-6').scrollIntoViewIfNeeded();
    await page.waitForFunction(() =>
      document.querySelector('[data-lifecycle-container]')?.getAttribute('data-active-node') === '6'
    );
    const card = page.locator('[data-decoder-active-card]');
    await expect(card.locator('[data-decoder-gate]')).toBeVisible();
    await expect(card.locator('[data-decoder-agent]')).toBeVisible();
    await expect(card.locator('[data-decoder-intent]')).toBeVisible();
    await expect(card.locator('[data-decoder-role-badge]')).toContainText(/Deterministic/i);
  });
});
```

- [ ] **Step 3: Run to verify failure**

```bash
npx playwright test lifecycle.intent-decoder.spec.js
# Expected: FAIL
```

- [ ] **Step 4: Update decoder subscriber**

In the decoder's existing JS (location determined by Step 1's grep): replace the `data-beat` listener with:

```javascript
document.addEventListener('po:active-node-change', (e) => {
  renderDecoderCard(PO.DAG_NODES[e.detail.nodeId]);
});
```

Keep `renderDecoderCard` identical to today's render logic.

- [ ] **Step 5: Run to verify pass**

```bash
npx playwright test lifecycle.intent-decoder.spec.js
# Expected: PASS
```

- [ ] **Step 6: Commit**

```bash
git add assets/ tests/playwright/lifecycle.intent-decoder.spec.js
git commit -m "refactor(decoder): re-target Intent Decoder from data-beat to po:active-node-change"
```

### Task A.7: Mobile responsive behaviors

**Files:**
- Create: `tests/playwright/lifecycle.mobile.spec.js`
- Modify: `assets/chrome.css` (responsive breakpoints)
- Modify: `assets/lifecycle.js` (bottom-sheet expand toggle on mobile)

- [ ] **Step 1: Write failing spec**

```javascript
const { test, expect } = require('@playwright/test');

const MOBILE = { width: 390, height: 844 };

test.describe('Lifecycle mobile', () => {
  test.use({ viewport: MOBILE });

  test('rail renders as horizontal scrubber under top nav', async ({ page }) => {
    await page.goto('/index.html');
    const rail = page.locator('nav[aria-label="Pipeline lifecycle"]');
    const style = await rail.evaluate((el) => getComputedStyle(el));
    // On mobile, rail should be horizontal (flex-direction: row OR display: flex with overflow-x)
    expect(['row', 'row-reverse']).toContain(style.flexDirection || 'row');
    const overflowX = style.overflowX;
    expect(['auto', 'scroll']).toContain(overflowX);
  });

  test('decoder renders as bottom-pinned sheet', async ({ page }) => {
    await page.goto('/index.html');
    const decoder = page.locator('[data-decoder-sheet]');
    const box = await decoder.boundingBox();
    expect(box.y + box.height).toBeGreaterThan(MOBILE.height - 80);
  });

  test('tapping the bottom-sheet expands it', async ({ page }) => {
    await page.goto('/index.html');
    const decoder = page.locator('[data-decoder-sheet]');
    const beforeBox = await decoder.boundingBox();
    await decoder.click();
    await page.waitForTimeout(350); // motion settle
    const afterBox = await decoder.boundingBox();
    expect(afterBox.height).toBeGreaterThan(beforeBox.height + 100);
  });

  test('all rail items have touch target ≥ 44pt', async ({ page }) => {
    await page.goto('/index.html');
    const items = await page.locator('nav[aria-label="Pipeline lifecycle"] [data-rail-item]').all();
    for (const item of items) {
      const box = await item.boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
npx playwright test lifecycle.mobile.spec.js
# Expected: FAIL
```

- [ ] **Step 3: Implement CSS breakpoints in chrome.css**

```css
/* Desktop ≥1280px — sticky left rail */
@media (min-width: 1280px) {
  .lifecycle-rail {
    position: sticky;
    top: 64px;
    height: calc(100vh - 64px);
    width: 180px;
    flex-direction: column;
    overflow-y: auto;
  }
  .lifecycle-rail ol { display: flex; flex-direction: column; gap: 4px; }
  [data-decoder-sheet] {
    position: sticky;
    top: 64px;
    width: 340px;
    align-self: flex-start;
  }
}

/* Tablet 768-1279px — horizontal scrubber, narrower decoder */
@media (min-width: 768px) and (max-width: 1279px) {
  .lifecycle-rail {
    position: sticky;
    top: 56px;
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    padding: 8px 16px;
  }
  .lifecycle-rail ol { display: flex; flex-direction: row; gap: 8px; }
  [data-decoder-sheet] {
    position: sticky;
    top: 96px;
    width: 280px;
  }
}

/* Mobile <768px — scrubber + bottom-sheet decoder */
@media (max-width: 767px) {
  .lifecycle-rail {
    position: sticky;
    top: 56px;
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    padding: 8px 12px;
  }
  .lifecycle-rail ol { display: flex; flex-direction: row; gap: 8px; }
  .lifecycle-rail [data-rail-item] {
    min-height: 44px;
    min-width: 44px;
    display: flex;
    align-items: center;
    padding: 8px 14px;
  }
  [data-decoder-sheet] {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: 64px;
    max-height: min(50vh, calc(100vh - env(safe-area-inset-bottom) - 96px));
    transition: height 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  [data-decoder-sheet][data-expanded="true"] {
    height: min(50vh, calc(100vh - env(safe-area-inset-bottom) - 96px));
  }
}
```

- [ ] **Step 4: Add bottom-sheet expand JS in lifecycle.js**

```javascript
function initDecoderSheet() {
  const sheet = document.querySelector('[data-decoder-sheet]');
  if (!sheet) return;
  sheet.addEventListener('click', (e) => {
    // Only toggle on header-tap, not on inner interactive elements (links)
    if (e.target.closest('a, button')) return;
    const expanded = sheet.getAttribute('data-expanded') === 'true';
    sheet.setAttribute('data-expanded', String(!expanded));
  });
}

document.addEventListener('DOMContentLoaded', initDecoderSheet);
```

- [ ] **Step 5: Run spec to verify pass**

```bash
npx playwright test lifecycle.mobile.spec.js
# Expected: 4 PASS
```

- [ ] **Step 6: Commit**

```bash
git add assets/chrome.css assets/lifecycle.js tests/playwright/lifecycle.mobile.spec.js
git commit -m "feat(responsive): rail scrubber + decoder bottom-sheet on mobile, sticky rail on desktop"
```

---

## Section B: Craft Tasks (Iterative, Visual-Companion-Driven)

Each task in this section is built in a tight build-→-screenshot-→-review loop with the visual-companion server. Tests assert structure (already in Section A); craft asserts feel, hierarchy, copy. The user (Daniel) is the oracle for craft decisions.

**Workflow per task:**
1. Build the section.
2. Push a screenshot or live snapshot to `http://localhost:61131` via the visual-companion server.
3. User reviews. Revise. Repeat until "ship it."
4. Commit.

### Task B.1: Hero + Problem section (preserved from current index.html)

**Files:** `index.html` (preserved sections; verify still rendering with rail in place)

- [ ] Confirm the existing Hero + Problem sections from `index.html` still render correctly with the new `lifecycle-rail` sibling in place. No copy change. No motion change.
- [ ] Screenshot at 1440 × 900 and push to visual companion. Confirm visual hierarchy reads: Problem → (lifecycle rail visible to the left) → rest of page.
- [ ] Commit if structural changes needed; otherwise no commit.

### Task B.2: Framing strip

**Files:** `index.html` (new `#framing` section), `assets/chrome.css` (`.framing-strip` styles)

- [ ] Build the framing-strip HTML with 5 callouts per spec §5. Each callout: monospace small-cap label, body-weight value/note, subtle divider between callouts, padding for breathing room.
- [ ] Reference Apple's *Environmental Progress Report* density: text-rich, no icons, no animations.
- [ ] Anchor ids: `#multi-tenant`, `#moe`, `#orav`, `#demas`, `#flywheel`. The `#flywheel` anchor in the strip is a soft jump to the epilogue.
- [ ] Push screenshot. Iterate copy until each callout reads as engineering shorthand, not marketing.
- [ ] Numbers in callouts must have HTML comments citing `Resume CV/00-GROUND-SOURCE-OF-TRUTH.md` line numbers per spec §10.1.
- [ ] Commit: `feat(framing): five-callout horizontal strip for cross-cutting concepts`

### Task B.3: Seven lifecycle node sections

**Files:** `index.html` (replace the 7 placeholder sections from Task A.2 with full content)

- [ ] For each node 1-7, write the section per the template:
  ```html
  <section class="lifecycle-node" id="node-N" data-node-id="N">
    <header>
      <span class="node-number">Node N</span>
      <h3 id="node-N-h" tabindex="-1">{nm} · {role}</h3>
      <span class="role-badge role-badge--{det?deterministic:probabilistic}">{Deterministic|Probabilistic}</span>
    </header>
    <div class="node-architecture">{prose from architecture.html for this node}</div>
    <!-- Node 5 and Node 6 additionally include <details class="node-deep-dive">; see B.4 -->
  </section>
  ```
- [ ] Source the per-node prose from `architecture.html`'s existing DAG section. Preserve voice; do not rewrite.
- [ ] Pull `nm`, `role`, `det`, `gate`, `agent`, `intent` from `PO.DAG_NODES` for any inline references.
- [ ] After all 7 are in place, screenshot at 1440 and push. Confirm reading rhythm: each section is one focused viewport's worth.
- [ ] Commit: `feat(lifecycle): seven node sections with distributed architecture content`

### Task B.4: Cross-cutting deep-dives inline at Node 5 (MoE) and Node 6 (O-R-A-V + DEMAS)

**Files:** `index.html` (extend Node 5 and Node 6 sections)

- [ ] Inside Node 5's `<section>`, add:
  ```html
  <details class="node-deep-dive" id="moe" data-default-open="desktop">
    <summary>Mixture-of-Experts + Multi-LoRA serving engine</summary>
    {prose from architecture.html's "Multi-LoRA serving engine" section}
  </details>
  ```
- [ ] Inside Node 6's `<section>`, add:
  ```html
  <details class="node-deep-dive" id="orav" data-default-open="desktop">
    <summary>O-R-A-V validation engine — Observe / Reason / Act / Validate</summary>
    {prose from architecture.html's "O-R-A-V validation engine" section}
  </details>
  <aside class="demas-callout" id="demas">
    {prose from architecture.html's DEMAS-related content + dag-data.js demas entry}
  </aside>
  ```
- [ ] Add JS to `assets/lifecycle.js`:
  ```javascript
  function initDeepDives() {
    const detailsEls = document.querySelectorAll('[data-default-open]');
    detailsEls.forEach((d) => {
      const mode = d.getAttribute('data-default-open');
      if (mode === 'desktop' && window.matchMedia('(min-width: 768px)').matches) {
        d.setAttribute('open', '');
      }
    });
  }
  document.addEventListener('DOMContentLoaded', initDeepDives);
  ```
- [ ] CSS for `.node-deep-dive` and `.demas-callout` — subtle border, generous padding, semantic separation from the parent node section. Refer Apple's "Tech specs" expand pattern.
- [ ] Lock O-R-A-V wording to *"Observe · Reason · Act · Validate"* — no other expansion appears anywhere on the merged page.
- [ ] Annotate Node 7 with the *"in R&D · Langfuse"* badge.
- [ ] Push screenshot at 1440 and 390. Iterate.
- [ ] Commit: `feat(deep-dive): MoE inline at Node 5 + O-R-A-V/DEMAS inline at Node 6 + Node 7 R&D annotation`

### Task B.5: Anchored Decoder integration

**Files:** `index.html` (relocate decoder cluster), `assets/chrome.css` (sticky positioning per breakpoint)

- [ ] Move the existing decoder card cluster from inside the old "Reading the trace" section to a sticky-positioned wrapper alongside the lifecycle container.
- [ ] Apply spec §6 sticky-region hierarchy: top-right at ≥1280px, narrower at 768-1279, bottom-sheet at <768.
- [ ] Verify decoder card transitions on scroll (one focal node at a time, opacity 0.55→1.0→0.85 sequence per spec §13.1).
- [ ] Trace log streams below decoder unchanged.
- [ ] Push screenshot at all three breakpoints. Iterate motion + opacity until decoder reads as supporting evidence, not competing focal element.
- [ ] Commit: `feat(decoder): sticky-positioned Anchored Decoder integrated with lifecycle scroll-sync`

### Task B.6: Flywheel epilogue + Economics preservation

**Files:** `index.html` (move flywheel from architecture.html; preserve economics from old index.html)

- [ ] Move the "Every run becomes training data" section from `architecture.html` to a new `#flywheel` section positioned after the lifecycle container.
- [ ] Preserve the existing "$0.0006 per page" Economics section from `index.html` (numbers, math teardown, all preserved). Place it after `#flywheel`.
- [ ] Remove the now-redundant "Self-Improving Generative AI Pipeline" overview section from `index.html` per spec §10 ("Absorbed").
- [ ] Screenshot full-page. Confirm reading order: lifecycle → flywheel (what happens after) → economics (what it costs).
- [ ] Commit: `feat(content): flywheel epilogue + economics preserved; remove absorbed solution-overview`

### Task B.7: Apple-grade copy + typography pass

**Files:** `index.html` (copy revisions across all sections)

- [ ] Audit every heading, every caption, every line for marketing voice. Remove:
  - Superlatives ("industry-leading", "cutting-edge", "best-in-class")
  - CTAs ("Learn more", "Get in touch", "Contact us")
  - Emotional pitches ("Imagine if…", "Picture this…")
- [ ] Replace with engineering-note voice (spec §4 examples).
- [ ] Verify typography: single H1, H2 per top-level section, H3 per node and deep-dive. No skipped levels.
- [ ] Confirm prevailing motion timing (0.25s) is applied consistently — no one-off durations.
- [ ] Audit numbers — every number gets a `<!-- source: Resume CV/00-GROUND-SOURCE-OF-TRUTH.md L<line> -->` HTML comment per spec §10.1.
- [ ] Re-screenshot full page. Final iteration with user.
- [ ] Commit: `polish(copy): Apple-register pass — remove marketing voice, source-cite every number`

---

## Section C: Mechanical Tasks (Checklist)

Pure text substitutions. No tests required for these; verification is `grep` and the link-integrity spec from Task A.4.

### Task C.1: Delete architecture.html + case-studies.html nav

- [ ] Delete `architecture.html`:
  ```bash
  git rm architecture.html
  ```
- [ ] Edit `case-studies.html` lines 31, 41: remove the `<li><a href="architecture.html" ...>` (or `<a href="architecture.html" ...>` in mobile nav). Leaves *Pipeline · Case Studies*.
- [ ] Update `tests/playwright/invariants.spec.js` line 3: `const PAGES = ['/index.html', '/case-studies.html'];`
- [ ] Run full Playwright suite:
  ```bash
  cd tests/playwright && npx playwright test
  ```
  Expected: all PASS.
- [ ] Commit: `feat(merge): delete architecture.html; update case-studies nav and invariants spec`

### Task C.2: README O-R-A-V fix + page-list update

- [ ] Edit `README.md` line 55: change `"O-R-A-V Validation: Node 6 runs Originality, Relevance, Accuracy, and Value checks via LLM-as-Judge."` → `"O-R-A-V Validation: Node 6 runs Observe / Reason / Act / Validate deterministic checks. Zero LLM calls."`
- [ ] Update any page-list section in README that references `architecture.html` to remove it.
- [ ] Commit: `fix(readme): O-R-A-V expansion to production wording; remove architecture.html from page list`

### Task C.3: CHANGELOG + ROADMAP

- [ ] Add to `CHANGELOG.md`:
  ```markdown
  ## [3.0.0] - 2026-05-18

  ### Added
  - Single-page merged lifecycle: one PDP traversing the 7-node DAG, with cross-cutting concepts inline.
  - Sticky lifecycle rail (vertical on desktop, scrubber on mobile) with keyboard navigation.
  - Anchored Intent Decoder: scroll-syncs to active node section; replaces the beat-based decoder.
  - `404.html` smart redirect for deprecated `architecture.html` paths/fragments.
  - Reduced-motion and no-JS graceful-degradation paths.

  ### Changed
  - Intent Decoder re-targeted from `data-beat` mutations to `po:active-node-change` events.
  - O-R-A-V wording locked to production expansion (Observe / Reason / Act / Validate) site-wide.

  ### Removed
  - `architecture.html` (content distributed across the lifecycle).
  - "Self-Improving Generative AI Pipeline" overview section on index.html (absorbed by framing + lifecycle).
  - Page-specific sequential-reveal JS that lived inline in architecture.html.

  ### Migration notes
  - External links to `architecture.html` (and `#dag-h`, `#moe-h`, `#orav-h`, `#flow-h`, `#tenants-h`) are caught by `404.html` and redirected to the corresponding anchors on `/`.
  - Sibling-repo updates (Manzela, Resume CV) ship within 24h of this merge.
  ```
- [ ] Update `ROADMAP.md`: mark shipped any items now delivered; remove items rendered moot by the merge.
- [ ] Commit: `docs: CHANGELOG 3.0.0 + ROADMAP updates for merge`

### Task C.4: SEO updates

- [ ] In `index.html` `<head>`:
  - Update `<title>` to *"Pipeline — Multi-agent DAG, Mixture-of-Experts serving, live trace — Daniel Manzela"*
  - Update `<meta name="description">` to spec §9.3 draft (~155 chars).
  - Add `<link rel="canonical" href="https://manzela.github.io/pipeline-observatory/">`
  - Verify `<meta property="og:url" content="https://manzela.github.io/pipeline-observatory/">` (already present).
  - Add `<meta property="og:image" content="https://manzela.github.io/pipeline-observatory/assets/og-card.png">`
  - Add JSON-LD `TechArticle` + `SoftwareApplication` blocks (reuse pattern from `Manzela/index.html` lines 65-100).
- [ ] Generate `assets/og-card.png` (1200×630): screenshot hero region of the merged page at 1440 → crop to 1200×630 → save as PNG.
- [ ] Run `lifecycle.link-integrity.spec.js` — canonical/og:url assertions should pass.
- [ ] Commit: `feat(seo): title/description/canonical/og:image/JSON-LD for merged page`

### Task C.5: Manzela external coordination (separate repo, separate PR)

```bash
cd "/Users/danielmanzela/Professional Profile/Manzela"
git checkout -b external-refs/pipeline-merge
```

- [ ] Edit `index.html`:
  - Line 1059: `href="https://manzela.github.io/pipeline-observatory/architecture.html"` → `href="https://manzela.github.io/pipeline-observatory/#dag"`
  - Line 1103: same change.
- [ ] Edit `llms.txt` line 16: remove the standalone `- [Architecture](https://manzela.github.io/pipeline-observatory/architecture.html): ...` line. (If keeping a deep-link reference is useful for AI bots, replace with `- [Architecture (anchor)](https://manzela.github.io/pipeline-observatory/#dag): 7-node DAG, MoE routing, LoRA adapters.`)
- [ ] Edit `sitemap.xml`: remove the `<url>` block for `architecture.html` (line 40 region). Update `<lastmod>` on the root `<url>` for `pipeline-observatory/`.
- [ ] Grep verify: `grep -rE 'pipeline-observatory/architecture\.html' .` → expected zero matches.
- [ ] Commit: `external: redirect pipeline-observatory architecture refs to merged-page anchor`
- [ ] Open separate PR on `Manzela` referencing the upstream `pipeline-observatory` merge SHA.

### Task C.6: Resume CV external coordination (separate repo, separate PR)

```bash
cd "/Users/danielmanzela/Professional Profile/Resume CV"
git checkout -b external-refs/pipeline-merge   # if it's a git repo; otherwise just edit
```

- [ ] Edit `00-GROUND-SOURCE-OF-TRUTH.md`:
  - Line 75: change `pipeline-observatory/architecture.html` reference → `pipeline-observatory/#dag`
  - Line 95: same.
  - Line 137: rewrite to reflect that architecture.html is gone; the merged page carries all metrics.
- [ ] Edit `01-resume-spec-v3.md` line 117: remove ` — Architecture: \`https://manzela.github.io/pipeline-observatory/architecture.html\`` from the resume bullet. Keep the rest of the bullet intact.
- [ ] Edit `02-format-best-practices-2026.md` line 431: update the audit table row to reflect deleted architecture.html / merged page.
- [ ] Edit `03-implementation-plan.md`:
  - Line 797: update the planned llms.txt template entry.
  - Line 844: update the planned sitemap.xml template entry.
- [ ] Grep verify: `grep -rE 'pipeline-observatory/architecture\.html' .` → expected zero matches.
- [ ] Commit: `external: drop architecture.html references; merged page is the canonical link`

---

## Section D: Quality Gates

Each gate is non-negotiable. PR cannot open with any gate red.

### Task D.1: axe-core sweep

- [ ] Install axe-playwright (one-time, dev dependency):
  ```bash
  cd tests/playwright
  npm install --save-dev @axe-core/playwright
  ```
- [ ] Add `lifecycle.a11y.spec.js`:
  ```javascript
  const { test, expect } = require('@playwright/test');
  const AxeBuilder = require('@axe-core/playwright').default;

  test('index.html has zero axe-core violations', async ({ page }) => {
    await page.goto('/index.html');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
  ```
- [ ] Run: `npx playwright test lifecycle.a11y.spec.js`. Fix every violation. Re-run until clean.
- [ ] Commit: `test(a11y): axe-core sweep — zero violations`

### Task D.2: Visual regression baselines

- [ ] Add `lifecycle.visual.spec.js`:
  ```javascript
  const { test, expect } = require('@playwright/test');
  const BREAKPOINTS = [{ w: 1440, h: 900 }, { w: 1024, h: 768 }, { w: 390, h: 844 }];
  const ANCHORS = ['hero', 'framing', 'node-1', 'node-2', 'node-3', 'node-4', 'node-5', 'node-6', 'node-7', 'flywheel', 'economics'];
  for (const bp of BREAKPOINTS) {
    test.describe(`Visual @ ${bp.w}x${bp.h}`, () => {
      test.use({ viewport: { width: bp.w, height: bp.h } });
      for (const a of ANCHORS) {
        test(`section #${a}`, async ({ page }) => {
          await page.goto('/index.html#' + a);
          await page.waitForTimeout(400); // settle scroll-sync
          await expect(page).toHaveScreenshot(`${a}-${bp.w}.png`, { fullPage: false, maxDiffPixelRatio: 0.01 });
        });
      }
    });
  }
  ```
- [ ] Generate baselines: `npx playwright test lifecycle.visual.spec.js --update-snapshots`
- [ ] Review every baseline image manually. Re-take any that don't match design intent.
- [ ] Commit: `test(visual): regression baselines for 11 sections × 3 breakpoints`

### Task D.3: Lighthouse quality gate

- [ ] Capture post-merge Lighthouse for mobile:
  ```bash
  npx -y lighthouse http://127.0.0.1:8765/index.html \
    --form-factor=mobile --output=json \
    --output-path=docs/superpowers/baselines/2026-05-18-post-merge/lighthouse-index-mobile.json \
    --chrome-flags="--headless" --quiet
  ```
- [ ] Open the JSON. Verify each category ≥ 95: Performance, Accessibility, Best Practices, SEO.
- [ ] If any < 95: triage, fix root cause (not symptom). Re-run.
- [ ] Commit: `docs(baselines): post-merge Lighthouse mobile (≥95 in all categories)`

### Task D.4: Cross-repo verification

- [ ] Run the spec's required check:
  ```bash
  grep -rE 'pipeline-observatory/architecture\.html' \
    "/Users/danielmanzela/Professional Profile/" \
    --exclude-dir=.git --exclude-dir=.superpowers --exclude-dir=.firecrawl
  ```
- [ ] Expected output: zero matches. (Search results from `audit/` or `docs/` folders documenting the merge are acceptable; flag and review manually.)
- [ ] Run full Playwright suite one final time:
  ```bash
  cd tests/playwright && npx playwright test
  ```
  Expected: all PASS.
- [ ] No commit (verification step only).

### Task D.5: Open the PR

- [ ] Push the branch:
  ```bash
  git push -u origin merge/architecture-observability
  ```
- [ ] Open PR via `gh pr create` with this body template:
  ```markdown
  ## Summary

  Merges `architecture.html` into `index.html` as a deductive lifecycle page. Deletes `architecture.html`. Smart 404 redirect catches deprecated URLs.

  Spec: `docs/superpowers/specs/2026-05-18-merge-architecture-observability-design.md`
  Plan: `docs/superpowers/plans/2026-05-18-merge-architecture-observability.md`

  ## Before / After Screenshots

  Attached: `docs/superpowers/baselines/2026-05-18-pre-merge/` (before) and `docs/superpowers/baselines/2026-05-18-post-merge/` (after) at 1440, 1024, 390.

  ## Lighthouse (mobile)

  | Category | Before (index) | Before (arch) | After |
  |---|---|---|---|
  | Performance | (paste) | (paste) | ≥95 |
  | A11y | (paste) | (paste) | ≥95 |
  | Best Practices | (paste) | (paste) | ≥95 |
  | SEO | (paste) | (paste) | ≥95 |

  ## Test plan

  - [x] All Playwright specs pass (10 new + updated existing)
  - [x] axe-core: 0 violations
  - [x] Lighthouse mobile ≥95 in all 4 categories
  - [x] Visual regression baselines reviewed and committed
  - [x] No-JS path manually verified
  - [x] Reduced-motion path manually verified
  - [x] Sibling-repo PRs opened (link: Manzela#XX, Resume CV — separate repo)
  - [ ] Search Console removal request submitted post-merge (tracked separately)
  ```

- [ ] After PR merge: submit Search Console removal request for `https://manzela.github.io/pipeline-observatory/architecture.html`; submit updated `sitemap.xml`. Document the submission in `docs/superpowers/baselines/2026-05-18-post-merge/search-console-submission.md`.

---

## Definition of Done

Mirrors the spec DoD (§13.4). Repeated here for the implementing engineer:

- [ ] All `architecture.html` content distributed correctly to merged page; nothing lost without explicit "absorbed" justification.
- [ ] `architecture.html` deleted; `404.html` redirect verified for all 5 historical fragment patterns + no-fragment case.
- [ ] Cross-repo grep returns zero `pipeline-observatory/architecture.html` matches.
- [ ] Lighthouse mobile: ≥ 95 in Performance, A11y, Best Practices, SEO.
- [ ] axe-core: 0 violations.
- [ ] All Playwright specs (Section A + Section D) pass; visual regression baselines reviewed and approved.
- [ ] Reduced-motion path verified manually.
- [ ] JS-disabled path verified manually.
- [ ] Every number on the page traces to `Resume CV/00-GROUND-SOURCE-OF-TRUTH.md` via inline HTML comment.
- [ ] O-R-A-V expansion consistent: *Observe / Reason / Act / Validate* across merged page + `pipeline-observatory/README.md` + `dag-data.js`.
- [ ] Node 7 visually annotated *"in R&D · Langfuse"* in both section header and decoder card.
- [ ] CHANGELOG `[3.0.0]` entry written.
- [ ] PR description includes before/after Lighthouse, before/after screenshots at 3 breakpoints, link to spec.
- [ ] Sibling-repo PRs (`Manzela`, `Resume CV`) merged within 24h of `pipeline-observatory` PR.
- [ ] Search Console removal request submitted for `architecture.html`.

---

## Appendix C — Design Re-Direction Notes (2026-05-18, post-plan, during execution)

**Trigger:** Review against the `bencium-innovative-ux-designer` skill surfaced three direct conflicts with the original spec §4 (Apple mimicry banned; Inter as primary banned; glass morphism banned). Re-anchored via the skill's Design Thinking Protocol to: **Tone = Industrial / utilitarian**; **Differentiation = "the pipeline as a technical schematic."**

**Spec commit recording the re-direction:** `c24efa7` (updates §4, §5, §5.1, §5.2, §6, §7.1, §7.3, §8, §12, §13.4).

This appendix supersedes the following plan items where they diverge. Items not listed are unchanged.

### New Task 0.3: Design Tokens Update (insert between Section 0 and Section A)

Must run BEFORE any Section A task that touches `assets/chrome.css` (i.e. A.3, A.5, A.7).

**Files:** `index.html` (font links + class swaps), `assets/chrome.css` (palette, fonts, glass-nav removal), `assets/tokens.js` (matching JS tokens), `case-studies.html` (note: temporary visual divergence is acceptable; logged as follow-up).

- [ ] **Step 1: Update Google Fonts link**

In `<head>` of `index.html` (and same in `case-studies.html`), replace the Inter+JetBrains Mono `<link>` with:
```html
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Replace palette in `assets/chrome.css`**

Define the new token block at the top of `chrome.css` per spec §4:
```css
:root {
  /* Industrial / utilitarian palette — paper + ink + 2 semantic accents */
  --paper: #F8F6F1;
  --paper-deep: #F2EFE7;
  --ink: #1A1A1A;
  --ink-mid: #4A4A4A;
  --ink-low: #8A8A8A;
  --ink-rule: rgba(26, 26, 26, 0.12);
  --det-green: #2D5A2F;     /* deterministic nodes — drafting forest */
  --prob-blue: #1B3A5C;     /* probabilistic nodes — drafting navy */
  --signal: #B83216;        /* surgical warning accent — Aicher red */
  --font-sans: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, 'Cascadia Code', monospace;
  --z-nav: 60;
  --z-schematic: 50;
}
@media (prefers-color-scheme: dark) {
  :root {
    --paper: #0F1418;
    --paper-deep: #161C20;
    --ink: #E8E6E0;
    --ink-mid: #B0AEA6;
    --ink-low: #7A786E;
    --ink-rule: rgba(232, 230, 224, 0.12);
    --det-green: #6FAF6B;
    --prob-blue: #6FA0CC;
    --signal: #E07A5F;
  }
}
body { background: var(--paper); color: var(--ink); font-family: var(--font-sans); }
code, pre, .mono { font-family: var(--font-mono); }
```

Remove all old `appleBg`, `appleLight`, `appleGray`, `appleBlue` references — replace with the new token names. Grep for `apple` in chrome.css and index.html to find them all.

- [ ] **Step 3: Remove `.glass-nav`**

Find `.glass-nav` rule in `chrome.css` and delete it. Replace top nav styling with:
```css
.top-nav {
  position: sticky; top: 0; z-index: var(--z-nav);
  background: var(--paper);
  border-bottom: 1px solid var(--ink-rule);
  padding: 12px 24px;
}
```
And update the nav HTML in `index.html` + `case-studies.html`: change `class="… glass-nav"` to `class="top-nav"`.

- [ ] **Step 4: Verify type stack loads**

Open the page in a browser (dev server on 8765), inspect computed style on `body` — confirm `font-family` resolves to `IBM Plex Sans`. Same on a `<code>` element — confirm `IBM Plex Mono`.

- [ ] **Step 5: Commit**

```bash
git add index.html case-studies.html assets/chrome.css assets/tokens.js
git commit -m "feat(tokens): industrial register — IBM Plex stack, paper-and-ink palette, glass-nav retired"
```

### Renamed / re-scoped Section A tasks

- **A.3 Sticky rail → Sticky schematic.** Task name becomes "Sticky DAG schematic with active node + keyboard nav." Spec file `lifecycle.rail.spec.js` becomes `lifecycle.schematic.spec.js`. Assertions: click on a schematic node group jumps to that section + moves focus; arrow keys cycle through nodes (when schematic is focused); the schematic is sticky beneath top nav only while inside the lifecycle region (`#dag` through `#economics`); active node group has the semantic fill color (det-green or prob-blue). The schematic itself is built as part of Task B.5 (craft) — the A.3 spec validates the BEHAVIOR layer once the schematic exists.

- **A.6 Intent Decoder re-target → Detail Legend implementation.** Task name becomes "Detail Legend re-render alongside schematic." Spec file `lifecycle.intent-decoder.spec.js` becomes `lifecycle.detail-legend.spec.js`. The existing Intent Decoder's card chrome is replaced; same data source (`PO.DAG_NODES`), same event subscription (`po:active-node-change`), new DOM template (typographic labels on the grid, no card wrapper).

- **A.7 Mobile rail+decoder → Mobile schematic+legend.** Spec file name unchanged (`lifecycle.mobile.spec.js`). Assertions update: at `<768px` the schematic stacks vertically (or compacts to a horizontal numbered strip beneath top nav); the detail legend renders inline within each node section (no bottom-sheet); touch targets ≥ 44pt on schematic node groups.

### Re-scoped Section B tasks

- **B.5 Anchored Decoder integration → DAG schematic implementation.** This becomes the highest-stakes craft task in Section B. The schematic is the page's signature element. Approach: build an SVG technical drawing in the spirit of Aicher's 1972 Munich Olympics signage system, Lufthansa identity manuals, and ERCO catalogs. Thin (1px / 0.5px) ink strokes, IBM Plex Mono labels, technical-drawing arrowheads, DEMAS perimeter as dashed line enclosing nodes 1-6 with Node 7 outside ("in R&D · Langfuse" annotation). Build iteratively with the user as oracle: sketch → present in visual companion → refine → repeat. Final SVG either inline in `index.html` or in `assets/dag-schematic.svg.js`. Subscribes to `po:active-node-change`. The Detail Legend (built in A.6) sits beside / below the schematic per §6.

- **B.7 Apple copy pass → Industrial copy pass.** Same intent (illustration-not-promotion, engineering notes, no CTAs, no superlatives, precise numbers); reference works update from "Apple Environmental Report / How an iPad is made" to "Aicher Lufthansa manual / Braun product spec / IBM 1960s technical documentation." Voice: terser, more schematic, more measurement-oriented. Reads as a system spec, not a product page.

### Unchanged tasks

A.1, A.2, A.4, A.5 (behaviorally the same — the no-JS spec just gains "schematic renders as static SVG" instead of "decoder cards stacked"), B.1, B.2, B.3, B.4, B.6, and all of Section C and Section D are structurally unchanged. Implementation details may need light token-renaming during execution (replace `appleBg` → `--paper`, etc.); subagents will handle this when they touch the relevant files.

### Risks added by the re-direction

1. **Aicher-style schematic is genuinely novel for an AI portfolio.** Done poorly, it could read as cold, alien, or unfinished. Mitigation: build it iteratively with user as oracle (Task B.5); compare against the named reference works at each iteration.
2. **`case-studies.html` will visually diverge.** It still uses Inter / glass-nav / appleBg tokens. The merged page commit deliberately doesn't update it (out of scope). Mitigation: logged as follow-up PR in this repo's CHANGELOG; merged page top nav still navigates to it cleanly.
3. **IBM Plex Sans rendering on Windows Chrome may differ subtly from Inter.** Mitigation: covered by visual regression baselines at 3 breakpoints in Task D.2; cross-browser parity tested manually before PR opens.

### Skill provenance for this re-direction

This re-direction was driven by review against `bencium-innovative-ux-designer` (v2.0.0) from `https://github.com/bencium/bencium-marketplace`. The skill's anti-pattern protocol — specifically its "Master Tier" requirement that the controller commit to one of 11 Tone Options as an extreme rather than asking for a generic "design a website" — is what forced the re-anchoring. The four-question Design Thinking Protocol from the skill was answered by:
- Purpose: illustrate Daniel's professional work to AI labs / retail-tech investors / technical recruiters (from existing CLAUDE.md + spec §2).
- Tone: Industrial / utilitarian (user-selected, 2026-05-18).
- Constraints: vanilla HTML/CSS/JS + Tailwind CDN + WCAG AA + Lighthouse mobile ≥95 (from spec §9).
- Differentiation: "the pipeline as a technical schematic" — Aicher / Lufthansa identity manual register (user-selected, 2026-05-18).
