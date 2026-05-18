/* assets/lifecycle.js
 * Lifecycle scroll-sync orchestrator.
 *
 * Single shared IntersectionObserver targets .lifecycle-node[data-node-id]
 * sections. When the most-visible node changes, mutates [data-lifecycle-container]
 * [data-active-node] and dispatches po:active-node-change for subscribers
 * (schematic, detail legend, trace caption — added in later tasks).
 *
 * Honors prefers-reduced-motion: when reduced, no observer attaches and the
 * container gets data-active-node="static" so subscribers can render their
 * static composition (all decoder cards stacked, all node sections visible).
 *
 * Idempotent: follows the window.PO = window.PO || {} pattern used by stage.js.
 *
 * See docs/superpowers/specs/2026-05-18-merge-architecture-observability-design.md
 * §8 (data flow) and §7.3 (components).
 */

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
      // Pick the entry with the largest intersectionRatio; ties broken by
      // higher data-node-id (later in document order, which feels more "current"
      // as the reader scrolls down).
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => {
          if (b.intersectionRatio !== a.intersectionRatio) return b.intersectionRatio - a.intersectionRatio;
          return Number(b.target.dataset.nodeId) - Number(a.target.dataset.nodeId);
        });
      if (!visible.length) return;
      const id = visible[0].target.dataset.nodeId;
      if (pending) cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => setActive(id));
    }, {
      // Band: upper-middle of viewport — matches existing stage.js pattern.
      rootMargin: '-15% 0px -55% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1],
    });

    nodes.forEach((n) => obs.observe(n));
  }

  window.PO.initLifecycle = initLifecycle;

  document.addEventListener('DOMContentLoaded', initLifecycle);
})();
