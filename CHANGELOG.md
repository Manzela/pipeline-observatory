# Changelog

All notable changes to the Pipeline Observatory will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
