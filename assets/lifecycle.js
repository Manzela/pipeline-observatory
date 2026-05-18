/* assets/lifecycle.js
 * Lifecycle scroll-sync orchestrator + Detail Legend subscriber.
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
 * Idempotent: initLifecycle() early-returns if container is already initialized
 * (container.dataset.lifecycleInitialized === '1'). Follows the
 * window.PO = window.PO || {} pattern used by stage.js.
 *
 * Events bubble (CustomEvent { bubbles: true }) so subscribers can listen on
 * the container OR on document — both work. An initial event is fired at the
 * end of initLifecycle() so subscribers attached after DOMContentLoaded still
 * receive the starting-state notification.
 *
 * Detail Legend subscriber (initDetailLegend): reads PO.DAG_NODES[nodeId] and
 * re-renders the typographic legend on every po:active-node-change. See spec
 * §5.2 for the legend's role as the typographic re-render of the former
 * Intent Decoder card cluster.
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

    // Idempotence guard: bail if already initialized so a second call does
    // not attach a second IntersectionObserver. A.2 code-review back-port.
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
      container.dispatchEvent(new CustomEvent('po:active-node-change', {
        bubbles: true,
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

    // Fire initial event so subscribers attached after DOMContentLoaded know
    // the starting active node without having to read the attribute themselves.
    // Dispatched on the container so it bubbles up to document — listeners on
    // either receive it. A.2 code-review back-port.
    container.dispatchEvent(new CustomEvent('po:active-node-change', {
      bubbles: true,
      detail: { nodeId: Number(nodes[0].dataset.nodeId) }
    }));
  }

  /* ────────────────────────────────────────────────────────────────────
   * Detail Legend renderer (task A.6).
   * Subscribes to po:active-node-change. On each change, reads
   * PO.DAG_NODES[nodeId] and populates six [data-legend-*] spans + sets
   * data-role on the legend root for the role-badge semantic color.
   * ──────────────────────────────────────────────────────────────────── */
  function initDetailLegend() {
    const legend = document.querySelector('[data-detail-legend]');
    if (!legend) return;

    // Cache the six writable spans so we don't re-query on every event.
    const targets = {
      number: legend.querySelector('[data-legend-node-number]'),
      name:   legend.querySelector('[data-legend-node-name]'),
      role:   legend.querySelector('[data-legend-role]'),
      gate:   legend.querySelector('[data-legend-gate-name]'),
      agent:  legend.querySelector('[data-legend-agent-name]'),
      intent: legend.querySelector('[data-legend-intent]'),
      trace:  legend.querySelector('[data-legend-trace]'),
    };

    function renderLegend(nodeId) {
      // Numeric coercion: events carry Number, container attr is a string.
      // Both must resolve to the same DAG_NODES key.
      const id = Number(nodeId);
      const node = window.PO && window.PO.DAG_NODES && window.PO.DAG_NODES[id];
      if (!node) return;

      const isDet = !!node.det;
      const roleLabel = isDet ? 'Deterministic' : 'Probabilistic';

      legend.setAttribute('data-role', isDet ? 'deterministic' : 'probabilistic');
      if (targets.number) targets.number.textContent = 'Node ' + id;
      if (targets.name)   targets.name.textContent   = node.nm || '';
      if (targets.role)   targets.role.textContent   = roleLabel;
      if (targets.gate)   targets.gate.textContent   = (node.gate  && node.gate.nm)  || '';
      if (targets.agent)  targets.agent.textContent  = (node.agent && node.agent.nm) || '';
      if (targets.intent) targets.intent.textContent = node.intent || '';
      if (targets.trace)  targets.trace.textContent  = node.trace  || '';
    }

    // Subscribe to lifecycle's node-change events (event bubbles, so document
    // works regardless of where dispatchEvent was invoked).
    document.addEventListener('po:active-node-change', (e) => {
      renderLegend(e.detail && e.detail.nodeId);
    });

    // Initial render: if initLifecycle already fired its initial event before
    // this subscriber attached, read the current container attribute as a
    // fallback. (With initLifecycle on DOMContentLoaded and initDetailLegend
    // on DOMContentLoaded after it, the initial-fire normally still reaches
    // us — but this defensive read keeps the legend correct even if reordered
    // or in reduced-motion mode where the initial-fire is skipped.)
    const container = document.querySelector('[data-lifecycle-container]');
    const active = container && container.getAttribute('data-active-node');
    if (active && active !== 'static') {
      renderLegend(active);
    } else if (window.PO && window.PO.DAG_NODES && window.PO.DAG_NODES[1]) {
      // Static / reduced-motion: default to Node 1 so the legend isn't empty.
      renderLegend(1);
    }
  }

  window.PO.initLifecycle = initLifecycle;
  window.PO.initDetailLegend = initDetailLegend;

  document.addEventListener('DOMContentLoaded', initLifecycle);
  document.addEventListener('DOMContentLoaded', initDetailLegend);
})();
