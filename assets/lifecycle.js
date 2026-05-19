/* assets/lifecycle.js
 * Lifecycle scroll-sync orchestrator + DAG Schematic subscriber.
 *
 * Single shared IntersectionObserver targets two selectors merged:
 *   · .lifecycle-node[data-node-id]                  (Nodes 1..7)
 *   · [data-lifecycle-section][data-node-id]         (#flywheel, #economics)
 * When the most-visible section changes, mutates [data-lifecycle-container]
 * [data-active-node] and dispatches po:active-node-change for subscribers
 * (schematic, trace caption).
 *
 * For numeric nodeIds (1..7) the event's detail.nodeId is a Number; for the
 * post-lifecycle string ids ("flywheel"/"economics") it stays a String so
 * subscribers (initSchematic in particular) can guard and clear active state
 * when the reader has exited the numbered-node region.
 *
 * Honors prefers-reduced-motion: when reduced, no observer attaches and the
 * container gets data-active-node="static".
 *
 * Idempotent: initLifecycle() early-returns if container is already initialized
 * (container.dataset.lifecycleInitialized === '1'). Follows the
 * window.PO = window.PO || {} pattern used by stage.js.
 *
 * Events bubble (CustomEvent { bubbles: true }) so subscribers can listen on
 * the container OR on document — both work. An initial event is fired at the
 * end of initLifecycle() so subscribers attached after DOMContentLoaded still
 * receive the starting-state notification.
 *
 */

(function () {
  window.PO = window.PO || {};

  function initLifecycle() {
    const container = document.querySelector('[data-lifecycle-container]');
    // Broader selector: also picks up post-lifecycle sections (#flywheel,
    // #economics) marked with [data-lifecycle-section][data-node-id] so the
    // observer can reset the schematic's active state once the reader exits
    // the numbered-node region. See FIX 3 in the 4-part audit.
    const nodes = document.querySelectorAll('[data-lifecycle-section][data-node-id], .lifecycle-node[data-node-id]');
    if (!container || !nodes.length) return;

    // Idempotence guard: bail if already initialized so a second call does
    // not attach a second IntersectionObserver.
    if (container.dataset.lifecycleInitialized === '1') return;
    container.dataset.lifecycleInitialized = '1';

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
      // Dispatch on the container so the event bubbles up to document.
      // Listeners on either the container or document both receive it.
      // Numeric nodes 1..7 dispatch as Number; string ids like "flywheel" /
      // "economics" dispatch as the raw string so the schematic guard can
      // distinguish them from numeric schematic nodes.
      const detailId = /^[1-7]$/.test(String(nodeId)) ? Number(nodeId) : nodeId;
      container.dispatchEvent(new CustomEvent('po:active-node-change', {
        bubbles: true,
        detail: { nodeId: detailId }
      }));
    }

    const obs = new IntersectionObserver((entries) => {
      // Pick the entry with the largest intersectionRatio; ties broken by
      // document order (later sections feel "more current" as the reader
      // scrolls down). String ids like "flywheel"/"economics" coerce to NaN
      // under Number() so we use compareDocumentPosition instead.
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => {
          if (b.intersectionRatio !== a.intersectionRatio) return b.intersectionRatio - a.intersectionRatio;
          // 0x04 = DOCUMENT_POSITION_FOLLOWING — b comes after a, so b is "later".
          return (a.target.compareDocumentPosition(b.target) & 0x04) ? 1 : -1;
        });
      if (!visible.length) return;
      const id = visible[0].target.dataset.nodeId;
      if (pending) cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => setActive(id));
    }, {
      // Active band sits JUST BELOW the sticky DAG schematic (top:56 + content
      // ~284px + caption ~26px = ~366px bottom), not behind it. The schematic
      // occupies viewport y=56 to ~y=366 when sticky; the band starts at
      // y=360 so the active-state changes the moment a section's header
      // appears below the schematic — matching what the reader actually sees.
      // Before this: band was at y=135-180 (behind the schematic) which caused
      // the active to lag — visible header below the schematic but active
      // still showed previous node (the one still occupying y=135-180 behind
      // the schematic).
      // Bottom margin -45% pulls the band's bottom up to y≈495 on a 900vp,
      // giving a ~135px-tall band — wide enough that the section with the
      // most body in that band wins decisively at any natural scroll speed.
      rootMargin: '-360px 0px -45% 0px',
      threshold: 0,
    });

    nodes.forEach((n) => obs.observe(n));

    // Fire initial event so subscribers attached after DOMContentLoaded know
    // the starting active node without having to read the attribute themselves.
    // Dispatched on the container so it bubbles up to document — listeners on
    // either receive it. Apply the same numeric
    // guard so string ids (e.g. "flywheel") pass through untouched.
    {
      const initialId = nodes[0].dataset.nodeId;
      const initialDetail = /^[1-7]$/.test(String(initialId)) ? Number(initialId) : initialId;
      container.dispatchEvent(new CustomEvent('po:active-node-change', {
        bubbles: true,
        detail: { nodeId: initialDetail }
      }));
    }
  }

  /* ────────────────────────────────────────────────────────────────────
   * DAG Schematic init.
   * Hydrates the inline SVG schematic from PO.DAG_NODES (no hardcoded
   * names), wires click + keyboard activation (scroll to #node-N), and
   * subscribes to po:active-node-change to flip active-state on the
   * matching node in BOTH the horizontal and vertical SVG variants so
   * the two stay in sync across viewport resizes.
   * ──────────────────────────────────────────────────────────────────── */
  function initSchematic() {
    const schematic = document.querySelector('[data-dag-schematic]');
    if (!schematic) return;
    const dagNodes = (window.PO && window.PO.DAG_NODES) || null;
    if (!dagNodes) return;

    const nodes = schematic.querySelectorAll('.dag-schematic__node[data-node-id]');
    if (!nodes.length) return;

    // ── Hydrate label text + data-role from PO.DAG_NODES.
    // (.dag-schematic__role lookup removed 2026-05-19 — that selector did
    // not exist in the SVG markup, so the branch was dead code. The role
    // contrast is carried by data-role on the group + CSS, not a literal
    // DET/PROB/R&D label.)
    nodes.forEach((n) => {
      const id = n.dataset.nodeId;
      const data = dagNodes[id];
      if (!data) return;

      n.setAttribute('data-role', data.det ? 'deterministic' : 'probabilistic');

      const nameEl = n.querySelector('.dag-schematic__name');
      if (nameEl) nameEl.textContent = (data.nm || '').toUpperCase();
    });

    // ── Click + keyboard activation: scroll to corresponding lifecycle section.
    function activateNode(id) {
      const target = document.getElementById('node-' + id);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    nodes.forEach((n) => {
      n.addEventListener('click', () => activateNode(n.dataset.nodeId));
      n.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activateNode(n.dataset.nodeId);
        }
      });
    });

    // ── Subscribe to lifecycle's active-node-change. Update BOTH SVG variants
    // (horizontal + vertical) so resizing the viewport never shows a stale
    // active-state on the freshly-shown variant. Guard: only apply data-active
    // when nodeId is numeric (1..7). String ids like "flywheel" / "economics"
    // clear all schematic highlights — those sections aren't schematic nodes.
    document.addEventListener('po:active-node-change', (e) => {
      const nodeId = e.detail && e.detail.nodeId;
      if (nodeId === undefined || nodeId === null) return;
      // Always clear first; only set if nodeId resolves to a numeric 1..7.
      nodes.forEach((n) => n.removeAttribute('data-active'));
      if (typeof nodeId === 'number' || /^[1-7]$/.test(String(nodeId))) {
        schematic
          .querySelectorAll('.dag-schematic__node[data-node-id="' + Number(nodeId) + '"]')
          .forEach((n) => n.setAttribute('data-active', 'true'));
      }
    });

    // ── Initial render: if lifecycle's initial-fire already ran before we
    // subscribed, read the container's current data-active-node as fallback.
    // Same numeric guard as the event handler above.
    const container = document.querySelector('[data-lifecycle-container]');
    const active = container && container.getAttribute('data-active-node');
    if (active && active !== 'static' && /^[1-7]$/.test(String(active))) {
      schematic
        .querySelectorAll('.dag-schematic__node[data-node-id="' + Number(active) + '"]')
        .forEach((n) => n.setAttribute('data-active', 'true'));
    }
  }

  /* ────────────────────────────────────────────────────────────────────
   * Inline deep-dive default-open behavior.
   *  · <details data-default-open="desktop"> → open on viewports ≥768px,
   *    closed on mobile so the node trace stays above the fold.
   *  · 'always' / no attribute → leave as authored.
   *
   * Note (2026-05-19): the prior 128-cell MoE mini-grid hydrator was
   * removed when the Multi-LoRA serving topology diagram replaced it.
   * The new diagram is inline SVG in index.html (#moe deep-dive); no JS
   * paint is required.
   * ──────────────────────────────────────────────────────────────────── */
  function initDeepDives() {
    const dds = document.querySelectorAll('details[data-default-open]');
    dds.forEach((d) => {
      const mode = d.getAttribute('data-default-open');
      if (mode === 'desktop' && window.matchMedia('(min-width: 768px)').matches) {
        d.setAttribute('open', '');
      }
      // 'always' / no attribute → leave as authored
    });
  }

  window.PO.initLifecycle = initLifecycle;
  window.PO.initSchematic = initSchematic;
  window.PO.initDeepDives = initDeepDives;

  document.addEventListener('DOMContentLoaded', initLifecycle);
  document.addEventListener('DOMContentLoaded', initSchematic);
  document.addEventListener('DOMContentLoaded', initDeepDives);
})();
