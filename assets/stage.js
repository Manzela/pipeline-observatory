/* Shared sticky-stage helper — IntersectionObserver-driven state machine for
   beat-based scroll experiences (telemetry, DAG, editorial spine).
   Idempotent: scrolling backward does not re-trigger reveals.
   Honors prefers-reduced-motion: when reduced, no observers attach and the
   designed static composition (defined per-page in chrome.css) is the only state. */

(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // One-shot reveal: applies .visible to elements with .reveal once they intersect.
  function attachReveals(root) {
    const els = (root || document).querySelectorAll('.reveal:not(.visible)');
    if (!els.length) return;
    if (reduced) {
      els.forEach((el) => el.classList.add('visible'));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach((el) => obs.observe(el));
  }

  // Stage progression: as each beat enters view, sets the supplied attr on the
  // stage container to the beat's data-beat value. Idempotent. Last value wins.
  function attachStage({ stageSelector, beatSelector, attr }) {
    const stage = document.querySelector(stageSelector);
    if (!stage) return;
    const attrName = attr || 'data-active-beat';
    if (reduced) {
      stage.setAttribute(attrName, 'static');
      return;
    }
    const beats = document.querySelectorAll(beatSelector);
    if (!beats.length) return;
    // Trigger band: a horizontal slice in the upper-middle of the viewport.
    // rootMargin '-15% 0px -55% 0px' creates a ~30% band ranging from 15% to 45%
    // from the viewport top. threshold: 0 fires as soon as ANY part of a beat
    // overlaps this band — works for beats taller than the band itself.
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && e.target.dataset.beat) {
          stage.setAttribute(attrName, e.target.dataset.beat);
        }
      });
    }, { threshold: 0, rootMargin: '-15% 0px -55% 0px' });
    beats.forEach((b) => obs.observe(b));
  }

  // One-shot animated count-up. Final value rendered immediately if reduced.
  function animateCount(el, target, suffix) {
    if (!el) return;
    suffix = suffix || '';
    const isFloat = !Number.isInteger(target);
    const fmt = (n) => (isFloat ? n.toFixed(1) : Math.floor(n).toLocaleString());
    if (reduced) {
      const final = typeof target === 'number' ? fmt(target) : String(target);
      el.textContent = final + suffix;
      return;
    }
    let current = 0;
    const step = Math.max(target / 50, isFloat ? 0.1 : 1);
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      el.textContent = fmt(current) + suffix;
    }, 28);
  }

  // One-shot bounded pulse for visualizations that benefit from a brief animated
  // reveal then settle (e.g. MoE sparse activation). Fires `count` pulses with
  // random indices, then settles to `finalIndices`.
  function pulseOnce({ container, items, count, settleIndices, intervalMs }) {
    if (!container || !items || !items.length) return;
    if (reduced) {
      settleIndices.forEach((i) => items[i] && items[i].classList.add('active'));
      return;
    }
    let pulses = 0;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        obs.unobserve(e.target);
        const id = setInterval(() => {
          items.forEach((x) => x.classList.remove('active'));
          if (pulses >= count) {
            clearInterval(id);
            settleIndices.forEach((i) => items[i] && items[i].classList.add('active'));
            return;
          }
          const set = new Set();
          while (set.size < settleIndices.length) {
            set.add(Math.floor(Math.random() * items.length));
          }
          set.forEach((i) => items[i] && items[i].classList.add('active'));
          pulses++;
        }, intervalMs || 600);
      });
    }, { threshold: 0.3 });
    obs.observe(container);
  }

  // Mobile nav toggle (shared across all three pages).
  function attachNavToggle() {
    const t = document.getElementById('navToggle');
    const m = document.getElementById('mobileNav');
    if (!t || !m) return;
    t.addEventListener('click', () => {
      const wasHidden = m.classList.contains('hidden');
      m.classList.toggle('hidden');
      t.setAttribute('aria-expanded', String(wasHidden));
    });
  }

  // Active-nav indicator. Per-page caller selects the link via [data-nav=...].
  function setActiveNav(key) {
    document.querySelectorAll(`[data-nav="${key}"]`).forEach((el) => {
      el.classList.remove('text-appleGray');
      el.classList.add('text-appleLight', 'border-b-2', 'border-appleLight', 'pb-1');
      el.setAttribute('aria-current', 'page');
    });
  }

  window.PO = { attachReveals, attachStage, animateCount, pulseOnce, attachNavToggle, setActiveNav, reduced };

  document.addEventListener('DOMContentLoaded', () => {
    attachReveals();
    attachNavToggle();
  });
})();
