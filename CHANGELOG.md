# Changelog

All notable changes to the Pipeline Observatory will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-05-19

### Added
- **Industrial design re-direction** (Aicher / Braun / Lufthansa identity manual register): IBM Plex Sans + Plex Mono type stack, paper-and-ink palette (`--paper #F8F6F1`, `--ink #1A1A1A`, deterministic `--det-green #2D5A2F`, probabilistic `--prob-blue #1B3A5C`, surgical `--signal #B83216`), light + dark mode. Replaces the previous Apple-register tokens.
- **Single-page merged lifecycle**: one PDP traversing the 7-node DAG, with cross-cutting concepts inline at Node 5 (MoE) and Node 6 (O-R-A-V + DEMAS), framing strip at top, flywheel epilogue, $0.0006/PDP economics close.
- **DAG schematic SVG** — the page's signature visual (Aicher / Lufthansa technical-drawing register): horizontal at desktop ≥768px, vertical at mobile. Active node fills with 15% semantic tint + colored border. Click + keyboard navigation. Sync-locked to scroll position.
- **Anchored Detail Legend** (replaces old Intent Decoder card chrome): typographic re-render of `PO.DAG_NODES[active]` data.
- **Scroll-sync orchestrator** (`assets/lifecycle.js`): single shared IntersectionObserver, `data-active-node` attribute mutation, `po:active-node-change` event dispatch.
- **404.html generic fallback** + `architecture.html` redirect proxy (HTTP 200, meta-refresh + JS, 5-fragment mapping to merged-page anchors).
- **Reduced-motion and no-JS graceful-degrade paths**.
- **SEO surface**: canonical link, Open Graph + Twitter Card meta tags, `TechArticle` + `SoftwareApplication` JSON-LD, 1200×630 social card.
- **Visual regression baselines**: 36 PNGs (12 sections × 3 breakpoints) committed for future regression detection.

### Changed
- O-R-A-V wording locked to production expansion (**Observe / Reason / Act / Validate**) site-wide; README.md updated.
- `case-studies.html` chrome (nav, footer, fonts, tokens) migrated to industrial register; stale `architecture.html` hrefs replaced with `index.html#dag` and re-labelled "DAG schematic".
- Scale-figure cadence locked to **monthly** framing site-wide (Hero, KPI label, JSON-LD description, Node 5 MoE prose, Node 6 O-R-A-V prose, case-studies intro, README scale block). Replaces the prior ambiguous "per cycle" / "per run" wording. Numbers unchanged: 10.5M PDPs / month, 73.5M agent operations / month.

### Removed
- `architecture.html`'s original 465-line content (architecture explainer) — distributed across the merged lifecycle. The file itself is replaced with an 84-line redirect proxy.
- "Self-Improving Generative AI Pipeline" overview section on the merged page (absorbed by framing strip + lifecycle).
- Old Intent Decoder card cluster on the merged page (replaced by Detail Legend).
- `.glass-nav` rule; all `appleX` design tokens; Inter font as primary.

### Test surface
- 119 Playwright tests passing across 11 spec files (lifecycle.*, invariants, redirects).
- axe-core: 0 violations at desktop + mobile.
- Lighthouse desktop: Performance 99 / A11y 100 / BP 100 / SEO 100.
- Lighthouse mobile: Performance 81 / A11y 100 / BP 100 / SEO 100. Performance below 95 is structural (Tailwind CDN + Google Fonts render-blocking) per `CLAUDE.md` no-build-step rule.

### Migration notes
- External links to `architecture.html` (and `#dag-h`, `#moe-h`, `#orav-h`, `#flow-h`, `#tenants-h`) are caught by the proxy and redirected to the corresponding anchors on `/`.
- Sibling-repo updates (`Manzela/`, `Resume CV/`) ship in coordinated PRs.

## [2.2.0] - 2026-05-17

### Added
- **Telemetry Intent Decoder**: New sub-panel below the trace log on `index.html` that re-renders per active scroll beat. Shows one card per node touched by the current beat — role badge (deterministic green / probabilistic blue), `gate → agent` micro-pattern, intent line, tool chips. Adds a fail-route chip on the FAIL beat. Mobile (`<md`) renders all 7 nodes + DEMAS at once with no scroll-sync. Rotating engineering caption between the trace and the cards narrates the architectural decision each beat illustrates.
- **Trace Row Affordances**: Trace rows on `index.html` now carry `tabindex="0"` and a native `title` tooltip sourced from `PO.DAG_NODES` (format: `<role> · <gate name>`). Adds a `:focus-visible` outline for keyboard users.
- **Shared DAG Metadata Module**: Extracted per-node DAG metadata into `assets/dag-data.js` as `PO.DAG_NODES`. `architecture.html` now consumes the shared module instead of inlining its `nodeData` literal; the new telemetry decoder on `index.html` is the second consumer. Includes an entry for the DEMAS audit boundary alongside the 7 numbered nodes.

### Changed
- Mobile breakpoint (`767px`) extracted into `PO.MOBILE_BREAKPOINT_PX` on the shared `PO` namespace in `assets/stage.js`. CSS media queries continue to use the literal value with a pointer-comment to the JS source of truth.

## [2.1.0] - 2026-05-08

### Added
- **Publication-Grade Readability**: Rebuilt `index.html` to include descriptive, human-readable text for every section.
- **Visual Hierarchy**: Improved typography scale (hero → stats → scale) matching DeepMind/Anthropic aesthetics.
- **Interaction**: Added IntersectionObserver for scroll-triggered counter animations.
- **Cross-Linking**: Enhanced CTA buttons seamlessly connecting `index.html` to `architecture.html`.
- **Open-Source Compliance**: Added comprehensive GitHub scaffolding (`LICENSE`, `SECURITY.md`, `ROADMAP.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, issue templates).

### Changed
- Refactored UI/UX across all dashboards to ensure extreme minimal, clean styling.
- Unified CSS design tokens (hero padding, max-widths, color palette).
- Updated model timeline statistics to reflect `gemini-3.1-flash-lite` migration.

### Removed
- Purged dead CSS artifacts (e.g., `.evo`, `causal-trace`, `trace-beam`) left over from previous iterations.
- Removed anti-patterns (emojis, raw console logs, unstyled lists).

## [2.0.0] - 2026-05-07

### Added
- **Sequential Reveal Engine**: Replaced broken sticky-scroll behavior in `architecture.html` with a robust 7-node vertical sequential reveal using IntersectionObserver.
- **Glass Box Mechanistic UI**: Added MoE grid visualizations showing active parameter routing and fluid LoRA membranes.
- **Fail-Closed Metrics**: Added DEMAS audit metrics to the DAG topology visualization.

### Fixed
- Layout clipping and z-index overflow issues on mobile devices.
- Removed arbitrary 500vh scroll-jacks that caused black screen voids.
