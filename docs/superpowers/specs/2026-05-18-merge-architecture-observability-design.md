# Design Spec — Merge Pipeline Architecture + Observability

**Repository**: `pipeline-observatory` (public, GitHub Pages at `manzela.github.io/pipeline-observatory/`)
**Date**: 2026-05-18
**Status**: Approved — ready for implementation planning
**Audience for the resulting page**: AI labs (Anthropic, OpenAI, Perplexity), retail-tech investors, technical recruiters, senior engineering hiring managers
**Audience for this spec**: implementing engineer (Daniel) and the code-reviewing agent that runs the spec self-review loop

---

## 1. Context

`pipeline-observatory` currently ships two sibling pages that argue two halves of one thesis:

- `index.html` (nav label *Pipeline*) — the live observability surface: problem framing, solution overview, the *Reading the Trace* telemetry section with the Intent Decoder sub-panel, and the *$0.0006 per page* economics teardown.
- `architecture.html` (nav label *Architecture*) — the static architecture explainer: 7 numbered DAG nodes, Multi-LoRA serving engine, O-R-A-V validation engine, "every run becomes training data" flywheel, multi-tenant pipeline.

The two pages share `assets/dag-data.js` (`PO.DAG_NODES`) as their canonical per-node metadata source. The split was historical; the content is two halves of one argument. First-time visitors land on `index.html`, encounter the live trace before any structural grounding, and either bounce or click to `architecture.html` and lose the trace context. The merge collapses these into a single deductive lifecycle: *here is the system → here is the system running → here is what it costs.*

A separate, parallel concern surfaced during red-team review (§13): O-R-A-V terminology drift across the portfolio, and the previously-flagged 6-vs-7 node count discrepancy. The merge resolves these locally on the merged page and logs portfolio-wide reconciliation as a follow-up.

## 2. Goals & Non-Goals

**Goals**
1. Collapse the two pages into one coherent narrative — a lifecycle structured as the journey of a single product detail page (PDP) through the 7-node DAG.
2. Preserve every load-bearing piece of content from both pages (architecture explanations, live trace, Intent Decoder, economics, flywheel, multi-tenant framing).
3. Make the merged page legible to an AI-lab engineer doing a 90-second skim *and* an investor doing a 15-minute deep-read.
4. Match Apple's illustration-not-promotion register (engineering notes, no CTAs, no superlatives, precise numbers).
5. Ship without breaking SEO surface area or losing inbound backlinks where avoidable.

**Non-goals**
- Redesigning the global visual language. Tokens, fonts, palette unchanged.
- Building new telemetry infrastructure. The trace data remains the existing curated stream from `dag-data.js`; no real-time prod feed.
- Rewriting `case-studies.html`. Out of scope; nav-only update (remove *Architecture* link).
- Reconciling O-R-A-V terminology across `Manzela/index.html` and `Manzela/README.md`. Logged as follow-up (§13.2).
- Resolving the 6-vs-7 node DAG count discrepancy at portfolio level. Merged page handles it locally via the *"Node 7 — in R&D · Langfuse"* annotation.

## 3. Locked Decisions (from brainstorming)

| # | Decision | Rationale |
|---|---|---|
| 1 | **Motivation**: tell one coherent story | The split breaks the narrative for first-time visitors |
| 2 | **Narrative arc**: lifecycle — one PDP end-to-end through the 7 nodes | Most cinematic; binds architecture and trace into a single timeline |
| 3 | **Cross-cutting concepts**: hybrid — brief framing strip + inline at the relevant node + flywheel epilogue | Honors the reader's progressive understanding without front-loading |
| 4 | **Orientation device**: sticky left rail on desktop; horizontal scrubber on tablet; horizontal scrubber on mobile | Strongest "documentation site" feel; scales down gracefully |
| 5 | **URL strategy**: delete `architecture.html`; update all external refs | Cleanest URL story; one canonical source of truth |
| 6 | **Component spine**: Anchored Decoder — one central Intent Decoder, sticky in viewport, scroll-syncs to the active node section | Reuses the most existing JS; honors the deductive lifecycle arc |

## 4. Industrial Illustration Philosophy

> **Design re-direction note (2026-05-18, post-spec, during execution):** The original §4 framed this page around an "Apple Environmental Report / How an iPad is made" register. Review against the `bencium-innovative-ux-designer` skill's anti-pattern protocol surfaced direct conflicts (Apple mimicry banned, Inter banned, glass morphism banned). Re-directed to the **Industrial / utilitarian** Tone option committed via the skill's Design Thinking Protocol, with **"the pipeline as a technical schematic"** as the page's Differentiation signature. The underlying values (illustration not promotion, engineering notes, no CTAs, no superlatives, precise numbers) are unchanged and arguably stronger in this register because they match what the content *is*: a literal engineering system.

This is the register every subsequent decision must respect. Reference works: **Otl Aicher's 1972 Munich Olympics signage system**, **Aicher's Lufthansa identity manuals (1962-present)**, **Braun product specification sheets (Dieter Rams era)**, **ERCO lighting catalogs**, **IBM 1960s-70s technical documentation**.

- **Illustration, not promotion.** No CTAs ("Learn more", "Get in touch", "Contact"). No superlatives. Section titles state what *is*, not what *could be*. Captions read as engineering notes — the voice of a system manual, not a marketing page.
- **The schematic is the signature.** The 7-node DAG is rendered as a full-width technical drawing in the spirit of Aicher's pictogram systems and Lufthansa's process diagrams. It sits sticky beneath the top nav while the reader is inside the lifecycle, with the active node lit (scroll-syncs to the active node sections below). This is the one visual every visitor is meant to remember.
- **Type as the primary medium.** Schematic aside, the page communicates almost entirely through typographic hierarchy, grid discipline, and white space. The grid is strict (8-column on desktop, 4 on tablet, 2 on mobile). Headings, body, captions, code, labels — five visible type levels max.
- **Type stack.** **IBM Plex Sans** (headings + body) + **IBM Plex Mono** (code, labels, system data). IBM Plex is purpose-built for engineering documentation; geometrically Aicher-adjacent; free via Google Fonts. Replaces Inter (banned by `bencium-innovative-ux-designer` as a primary font).
- **Surgical color.** Paper + ink + two semantic accents:
  - **Paper** `#F8F6F1` (warm off-white, the feel of printed manual paper) for light mode; **drafting-blueprint dark** `#0F1418` for dark mode.
  - **Ink** `#1A1A1A` (very dark gray, not pure black) on paper; `#E8E6E0` on dark.
  - **Deterministic green** `#2D5A2F` (drafting-pen forest green, semantic for `det: true` nodes per `dag-data.js`).
  - **Probabilistic blue** `#1B3A5C` (drafting-pen navy, semantic for `det: false` nodes).
  No third accent. No gradients. No glass. Bencium NEVER list strictly honored.
- **Deliberate motion.** Single timing function `cubic-bezier(0.4, 0, 0.2, 1)` at `0.25s` — preserved from existing `chrome.css`. Reduced motion is a first-class state, not an afterthought.
- **Honesty over polish.** Node 7 annotated *"in R&D · Langfuse"* in both schematic and inline section. Multi-LoRA inline at Node 5 states "~4B active params of 26B per token" (the production reality of sparse MoE). O-R-A-V locked to production expansion *(Observe / Reason / Act / Validate)* across the merged page, `dag-data.js`, and `pipeline-observatory/README.md`.
- **No marketing voice.** Section title example: *"Pure deterministic Python. The final structural defense before output ships."* — not *"Industry-leading validation."*
- **Bencium NEVER list honored.** No Inter / Roboto / Arial / Space Grotesk as primary type. No SaaS blue (#3B82F6) or purple gradients on white. No Apple design language mimicry. No glass morphism. No cookie-cutter SaaS layouts.
- **Light-mode default, dark-mode secondary.** Engineering manuals are printed; the page reads as a printed document by default. Dark mode is offered as a system-preference response (already supported by existing tokens; updated palette).
- **Site-cohesion follow-up logged.** `case-studies.html` will visually diverge from the merged page after this PR lands. A separate follow-up aligns `case-studies.html` to the same industrial register; not in scope for this PR.

## 5. Information Architecture

Top-down, single URL at `/pipeline-observatory/` (i.e. `index.html` rewritten in place):

1. **Hero** — page title, one-line positioning, problem hook (preserved from current `index.html`).
2. **Problem** — *"Content-gen automations are unreliable at scale."* (preserved verbatim).
3. **Framing strip** — one horizontal row, five one-line callouts (each is an anchor target):
   - *Multi-tenant* (`#multi-tenant`) — 11 enterprise retailers across 5 countries, 234 managed surfaces.
   - *Mixture-of-Experts + Multi-LoRA* (`#moe`) — Gemma 4 26B-A4B-it, ~4B active of 26B per token, per-tenant LoRA adapters.
   - *O-R-A-V validation* (`#orav`) — Observe / Reason / Act / Validate, fail-closed, 68.9% pass rate by design.
   - *DEMAS boundary* (`#demas`) — deterministic schema + integrity check at every node boundary.
   - *Data flywheel* (`#flywheel`) — every run becomes training data via DPO.
4. **Lifecycle** (`#dag`) — *The journey of one PDP*, the spine of the page. Opens with the **DAG schematic** (the page's signature, see §5.1 below); the seven node sections follow in order beneath it, each with stable id `#node-1` through `#node-7`:
   - Node 1 · City DNA (Context Injection)
   - Node 2 · Normalizer (Data Cleansing)
   - Node 3 · Synonyms (Expansion)
   - Node 4 · SV Gate (Volume Filter)
   - Node 5 · Writer (Generation) — inline expansion: MoE / Multi-LoRA serving deep-dive
   - Node 6 · Validator (Deterministic QA) — inline expansion: O-R-A-V engine + DEMAS boundary callout
   - Node 7 · Evaluator (DEMAS JIT) — annotated *"in R&D · Langfuse"*
5. **Flywheel epilogue** (`#flywheel`) — every run becomes training data (DPO / Reinforcement Learning from AI Feedback / "Dreaming Module" framing).
6. **Economics** (`#economics`) — *"$0.0006 per page. Here's the math."* (preserved).
7. **Footer** — links to case-studies, repo, contact (current pattern; no CTAs).

### 5.1 The DAG Schematic (signature element)

A full-width SVG technical drawing rendered in the spirit of Aicher's process diagrams and ERCO catalog figures:

- 7 numbered nodes laid out horizontally on desktop (≥1024px), wrapped to two rows on tablet, vertical stack on mobile.
- Each node is a thin-stroked rectangle (1px ink stroke on paper, 0.5px on dark) with the node number and short name inside; gate name above, agent name below the rectangle as caption.
- Connection lines between nodes are thin technical-drawing strokes (continuous black on paper) with directional arrowheads in Aicher's drawing style.
- DEMAS boundary rendered as a dashed perimeter line enclosing nodes 1-6, with Node 7 outside it ("in R&D" annotation).
- Color: nodes are paper-on-paper (just stroke + type) by default; the active node fills with deterministic green (`det: true`) or probabilistic blue (`det: false`) per `PO.DAG_NODES`.
- Position: sticky directly under the top nav while the reader is inside the lifecycle region (`#dag` through `#economics`). Sits in normal document flow above `#dag` and below `#economics`.
- Height: ~22vh sticky / ~40vh expanded when first reached (paginated reveal — full schematic on first viewport, then collapses to compact-strip on scroll into nodes).
- Doubles as wayfinding: replaces the `lifecycle-rail` from the original spec. Clicking any node in the schematic jumps to that node's section below and lights it.

### 5.2 The Detail Legend (replaces Anchored Decoder)

Re-render of the existing Intent Decoder as a typographic legend that sits alongside the schematic (right column on ≥1024px desktop; below the schematic on mobile/tablet):

- Shows the active node's `gate · agent · intent · trace · failureRoute` as labeled type, in IBM Plex Mono. No card chrome; just labels + values on the grid.
- Updates via the same `po:active-node-change` event the schematic listens for.
- Mobile: legend collapses into the section content (no floating sheet) — type doesn't need to float.

The existing trace log continues to stream as part of the lifecycle content; on each node section it is filtered/captioned to flag which rows correspond to that node.

## 6. Sticky Region Hierarchy (revised for schematic-as-backbone)

Two sticky regions coexist (down from three after removing the lifecycle-rail in favor of the schematic):

| Breakpoint | Top nav | DAG schematic | Detail legend |
|---|---|---|---|
| **≥1280px** | Sticky top, thin paper-and-ink bar, 2 items (*Pipeline · Case Studies*) | Sticky beneath top nav while inside lifecycle (`#dag`–`#economics`); ~22vh compact strip after first reveal | Sits in right column alongside the lifecycle node sections (not sticky on its own — flows with the section it belongs to); ~280px wide |
| **768–1279px** | Sticky top | Sticky beneath top nav inside lifecycle; horizontal scroll if needed | Inline below schematic on each node section |
| **<768px** | Sticky top (mobile nav pattern preserved, minus glass-morphism) | Compact vertical stack; sticky thin strip beneath top nav showing just node numbers when scrolled past initial reveal | Inline within each node section (no floating sheet — type doesn't need to float) |

- All touch targets ≥ 44pt.
- Shared z-index scale via CSS custom properties: `--z-nav: 60`, `--z-schematic: 50`.
- Page content has top padding sufficient to prevent any sticky region from overlapping text content at any breakpoint.
- The Anchored Decoder / Lifecycle Rail from the original spec are replaced by the schematic + inline detail legend (see §5.1, §5.2). The skill-mandated `bencium-innovative-ux-designer` anti-glass-morphism rule retires `.glass-nav`; replacement is a thin paper-and-ink top bar with a 1px ink rule beneath.

## 7. Components

### 7.1 Reused (unchanged)

- `assets/dag-data.js` — `PO.DAG_NODES` consumed verbatim. Source of node names, roles, gate/agent metadata, intent lines, traces, failure routes.
- `assets/stage.js` — `attachStage`, `attachReveals`, `attachNavToggle`, `pulseOnce`, reduced-motion guard. The exact `attachStage` pattern (band: 15–45% viewport, `data-attr` mutation on container) is repurposed for lifecycle node sections.
- `assets/chrome.css` — **substantial update**: replace SaaS-blue palette tokens with paper-and-ink palette per §4; replace Inter font-family with IBM Plex Sans / Plex Mono; remove `.glass-nav` rule; add `.dag-schematic`, `.detail-legend`, `.framing-strip` rules; add light-mode default + dark-mode secondary tokens.
- `assets/tokens.js` — **substantial update**: align JS-side color and font tokens with the new palette and type stack.
- Mobile nav toggle (`navToggle`, `mobileNav`) — collapses from 3 items to 2 (*Pipeline · Case Studies*).

### 7.2 Reused (re-targeted)

- **Intent Decoder** — existing scroll-sync logic currently listens for `data-beat` mutations on the telemetry container. Re-target it to listen for `data-active-node` mutations on the lifecycle container. Card render logic is unchanged.
- **Telemetry trace log** — continues to stream the existing curated event sequence. New: a caption below the trace updates per active node, flagging which rows correspond to the current node (e.g. *"Rows 4–8: Node 4 SV Gate execution"*).

### 7.3 New

- **`.dag-schematic` component** — full-width SVG technical drawing per §5.1. Single file `assets/dag-schematic.svg.js` (or inline `<svg>` in `index.html` if smaller). Reads node metadata from `PO.DAG_NODES`. Subscribes to `po:active-node-change` to toggle the active fill. Includes click handlers on each node group → scroll to that section. Honors `prefers-reduced-motion` (no fill transitions; instant state changes).
- **`.detail-legend` component** — typographic re-render of the existing Intent Decoder per §5.2. Same data source (`PO.DAG_NODES`), same event subscription (`po:active-node-change`), but no card chrome — just labeled type on the grid. Implementation: re-using the decoder's existing render function with a different DOM template.
- **`.lifecycle-node` section component** — one per node (×7). Structure:
  ```html
  <section class="lifecycle-node" id="node-1" data-node-id="1">
    <header>
      <span class="node-number">Node 1</span>
      <h3>City DNA · Context Injection</h3>
      <span class="role-badge role-badge--probabilistic">Probabilistic</span>
    </header>
    <div class="node-architecture">… explainer prose, gate → agent diagram …</div>
    <!-- inline expansion only for Node 5 (MoE) and Node 6 (O-R-A-V + DEMAS) -->
    <details class="node-deep-dive" open>
      <summary>Multi-LoRA serving engine</summary>
      … (MoE-specific deep-dive content) …
    </details>
  </section>
  ```
  `<details>` defaults open on desktop (≥768px), closed on mobile (progressive disclosure for density).

- **`.framing-strip`** — top-of-page horizontal row of one-line concept callouts. Each callout is an anchor target. Visual: 1px ink rules above and below the strip, IBM Plex Mono small caps for labels, body-weight Plex Sans for values.

- *(Removed)* `.lifecycle-rail` and Anchored Decoder container — replaced by `.dag-schematic` + `.detail-legend` per §5.1, §5.2.

- **`404.html`** — new file. Smart client-side redirect:
  - Detects `architecture.html` in `location.pathname` and maps the five real fragment patterns currently on that page to the merged-page anchors:

    | Deprecated URL | Redirects to |
    |---|---|
    | `/pipeline-observatory/architecture.html` | `/pipeline-observatory/#dag` |
    | `/pipeline-observatory/architecture.html#dag-h` | `/pipeline-observatory/#dag` |
    | `/pipeline-observatory/architecture.html#moe-h` | `/pipeline-observatory/#moe` |
    | `/pipeline-observatory/architecture.html#orav-h` | `/pipeline-observatory/#orav` |
    | `/pipeline-observatory/architecture.html#flow-h` | `/pipeline-observatory/#flywheel` |
    | `/pipeline-observatory/architecture.html#tenants-h` | `/pipeline-observatory/#multi-tenant` |

  - Performs the jump via `location.replace` (no entry in browser history; back button works as if the user came directly).
  - Falls back to `/pipeline-observatory/` with a one-sentence message *"That page is now part of Pipeline."* and a single link for any unmatched path.
  - Pure HTML/JS, no framework. GitHub Pages' default `404.html` behavior catches all unmatched paths.

### 7.4 Removed

- `architecture.html` (deleted; replaced by lifecycle node sections and inline cross-cutting expansions).
- `architecture.html`'s page-specific sequential-reveal JS (currently inlined in the file) — superseded by `attachStage` scroll-sync to lifecycle sections.
- `index.html`'s *"Self-Improving Generative AI Pipeline"* overview section — absorbed by the framing strip + lifecycle structure itself.

## 8. Data Flow

Single source of truth: a `data-active-node` attribute on the lifecycle container, mutated by one shared `IntersectionObserver`.

```
scroll position
  ↓
IntersectionObserver (single instance)
  rootMargin: '-15% 0px -55% 0px'  // band in upper-middle of viewport
  threshold: 0
  targets: .lifecycle-node[data-node-id]
  ↓ (on intersection)
  container.setAttribute('data-active-node', N)
  ↓ (custom event dispatch: po:active-node-change)
  ├→ .dag-schematic node group N receives .active class (fills with det/probabilistic color)
  ├→ .detail-legend re-renders gate/agent/intent/trace/failureRoute for PO.DAG_NODES[N]
  ├→ Trace log caption updates to current node
  └→ aria-live="polite" region announces ("Node N: <name>") after 400ms settle
```

No global JS state. No race conditions. Pattern is identical to the existing `attachStage` mechanism in `stage.js`; we add one subscriber (the rail) and re-target two existing subscribers (decoder, trace caption).

## 9. Performance, Accessibility, SEO — Concrete Budgets

### 9.1 Performance (Lighthouse mobile, throttled 4G)

- **LCP** ≤ 2.5s
- **CLS** ≤ 0.1 (no layout-affecting properties on scroll-sync; sticky regions reserve their space upfront)
- **INP** ≤ 200ms
- **TBT** ≤ 200ms
- **Lighthouse Performance** ≥ 95

Implementation rules:
- Single shared `IntersectionObserver` across rail/decoder/trace-caption.
- GPU-only transition properties (`opacity`, `transform`); never `width`/`height`/`top`.
- Inline critical CSS for above-the-fold (existing pattern preserved).
- No new fonts; Inter + JetBrains Mono are already loaded.
- 16ms RAF throttle on the active-node change handler.

### 9.2 Accessibility (Lighthouse + axe-core)

- `<nav aria-label="Pipeline lifecycle">` wraps the rail.
- Active rail item carries `aria-current="step"`.
- `<div role="status" aria-live="polite">` region announces active node changes for screen readers; debounced 400ms to avoid spam during continuous scroll.
- Keyboard:
  - Arrow ↑/↓ on rail cycles through items.
  - Enter activates (jumps + moves focus to section heading).
  - Tab traversal follows visual order; no keyboard traps.
- Heading hierarchy: H1 (page title) → H2 (each top-level section: Problem, Framing, Lifecycle, Flywheel, Economics) → H3 (per node, per cross-cutting concept).
- Color contrast ≥ WCAG AA: 4.5:1 body text, 3:1 large text and UI components. Verified with axe-core.
- Two skip links: *Skip to main content* (existing) + *Skip to lifecycle*.
- **Lighthouse A11y** ≥ 95 · **axe-core** 0 violations.

### 9.3 SEO

- **`<title>`**: *"Pipeline — Multi-agent DAG, Mixture-of-Experts serving, live trace — Daniel Manzela"* (currently *"Pipeline — Daniel Manzela"*).
- **`<meta name="description">`**: rewrite to ~155 chars covering merged scope. Draft: *"A 7-node multi-agent pipeline serving 11 enterprise retailers across 5 countries at $0.0006/PDP. Mixture-of-Experts serving, deterministic O-R-A-V validation, live trace."*
- **`<link rel="canonical" href="https://manzela.github.io/pipeline-observatory/">`**.
- **JSON-LD**: `TechArticle` + `SoftwareApplication` blocks; reuse pattern from `Manzela/index.html` lines 65-100. Include `author`, `abstract`, `programmingLanguage`, `applicationCategory`.
- **`og:image`**: 1200×630 social card. New asset — capture from the merged page hero composition.
- **Updated `sitemap.xml`** in `Manzela/`: remove `architecture.html` entry; update `lastmod` on the root entry.
- **Lighthouse SEO** ≥ 95.

## 10. Content Mapping (source → destination)

| From | To |
|---|---|
| `index.html` Hero | Merged Hero (preserved) |
| `index.html` Problem section | Merged Problem (preserved) |
| `index.html` "Self-Improving Generative AI Pipeline" overview | **Absorbed** by framing strip + lifecycle structure |
| `index.html` "Reading the trace" + Intent Decoder | Reshaped into Anchored Decoder (sticky, scroll-syncs to node sections) |
| `index.html` "$0.0006 per page" economics | Merged Economics (preserved) |
| `architecture.html` Hero | Removed (page deleted) |
| `architecture.html` "7 nodes, in order" | Distributed across 7 lifecycle node sections |
| `architecture.html` "Multi-LoRA serving engine" | Inline at Node 5 (Writer) — `<details>` deep-dive |
| `architecture.html` "O-R-A-V validation engine" | Inline at Node 6 (Validator) — `<details>` deep-dive + DEMAS boundary callout |
| `architecture.html` "Every run becomes training data" | Flywheel epilogue (preserved tone) |
| `architecture.html` "Multi-tenant pipeline architecture" | Compressed to one line in framing strip |
| `architecture.html` cross-link footer block | Removed |

### 10.1 Numbers — single source of truth

Every quantitative claim on the merged page must trace to `Resume CV/00-GROUND-SOURCE-OF-TRUTH.md`. Authoring rule: when adding or revising a number, leave an HTML comment of the form `<!-- source: Resume CV/00-GROUND-SOURCE-OF-TRUTH.md L<line> --> ` adjacent to the number. The locked numbers are:

- 11 enterprise retailers across 5 countries (live: ES, PT, IL; historical: US, MX)
- ~10.5M product detail pages per cycle
- ~73.5M agent operations per run (the older "116M ceiling" wording is unsourced — do not reintroduce)
- $0.0006 per PDP
- 234 managed websites
- 7-node DAG, with the explicit caveat *"Node 7 in R&D · Langfuse"* surfaced in the Node 7 section header and decoder card
- 68.9% O-R-A-V pass rate by design

## 11. External Coordination

The merged page lives in `pipeline-observatory`. The external coordination spans `pipeline-observatory`, `Manzela`, and `Resume CV` — each is a separate repo and gets a separate PR. PRs reference each other in commit messages to make the atomic intent legible.

| File | Change |
|---|---|
| `pipeline-observatory/architecture.html` | **Delete** |
| `pipeline-observatory/index.html` | Rewrite as merged page |
| `pipeline-observatory/case-studies.html` | Nav: remove *Architecture* link (lines 31, 41) |
| `pipeline-observatory/README.md` | Line 55: fix O-R-A-V expansion from "Originality, Relevance, Accuracy, Value" → "Observe, Reason, Act, Validate"; update page list to remove architecture.html reference |
| `pipeline-observatory/CHANGELOG.md` | New `[3.0.0]` entry documenting the merge, with `Added` / `Changed` / `Removed` / `Migration notes` |
| `pipeline-observatory/ROADMAP.md` | Update / remove items now shipped |
| `pipeline-observatory/404.html` | **New** — smart-redirect implementation per §7.3 |
| `pipeline-observatory/tests/playwright/*.spec.js` | Update existing specs that scroll through `index.html` sections; add new specs per §12 |
| `Manzela/index.html` | Lines 1059, 1103: change `architecture.html` href → `/pipeline-observatory/#dag` |
| `Manzela/llms.txt` | Line 16: remove standalone "Architecture" entry; replace with anchor reference `/pipeline-observatory/#dag` |
| `Manzela/sitemap.xml` | Line 40: remove architecture.html entry; update `lastmod` on root entry |
| `Manzela/README.md` | Verify with `grep -E 'architecture\.html'` (currently no direct match found; verify before commit) |
| `Resume CV/00-GROUND-SOURCE-OF-TRUTH.md` | Lines 75, 95, 137: update URL references to anchored links on the merged page |
| `Resume CV/01-resume-spec-v3.md` | Line 117: remove the inline `— Architecture: ...architecture.html` from the resume bullet |
| `Resume CV/02-format-best-practices-2026.md` | Line 431: update the audit table row |
| `Resume CV/03-implementation-plan.md` | Lines 797, 844: update planned llms.txt template + sitemap.xml template |

**Search Console**: after merge, request removal of `https://manzela.github.io/pipeline-observatory/architecture.html` and submit updated sitemap. Manual step; documented in the merge PR description.

## 12. Test Matrix (Playwright)

Existing harness is in `pipeline-observatory/tests/playwright/`. Config already points at `index.html`; no infrastructure change needed. All specs run against a freshly-built local copy via the existing dev server pattern.

| Spec file (new) | Validates |
|---|---|
| `lifecycle.scroll-sync.spec.js` | Scrolling through each `.lifecycle-node` updates `data-active-node` and dispatches `po:active-node-change` |
| `lifecycle.schematic.spec.js` | Click schematic node → page scrolls to that section + focus moves; active node fills with semantic color; arrow keys on focused schematic cycle through nodes; sticky behavior under top nav within lifecycle region |
| `lifecycle.mobile.spec.js` | At `<768px`: schematic stacks vertically; detail legend renders inline within each section (no floating sheet); 44pt touch targets on schematic node groups |
| `lifecycle.reduced-motion.spec.js` | `prefers-reduced-motion: reduce` → no scroll-sync animations; schematic shows static composition; detail legends visible per section |
| `lifecycle.keyboard.spec.js` | Full keyboard traversal (Tab order, focus-visible outlines, both skip links, no keyboard traps) |
| `lifecycle.no-js.spec.js` | With JS disabled: page renders, all sections in document order, schematic visible as static SVG, all detail legends visible per section, no broken layout |
| `lifecycle.visual.spec.js` | Visual regression: snapshot at each of 11 viewport states (hero, framing, schematic + nodes 1–7, flywheel, economics) at 3 breakpoints |
| `lifecycle.404.spec.js` | `404.html` correctly maps `/pipeline-observatory/architecture.html` and all 5 historical fragment patterns (`#dag-h`, `#moe-h`, `#orav-h`, `#flow-h`, `#tenants-h`) to the corresponding merged-page anchors per §7.3 |
| `lifecycle.detail-legend.spec.js` | Detail legend re-renders gate/agent/intent/trace/failureRoute for active node via `po:active-node-change`; preserves the semantic data of the existing Intent Decoder |
| `lifecycle.link-integrity.spec.js` | All in-page anchor `href`s resolve; no internal 404s; canonical and `og:url` valid |

Specs to update (not new): any existing spec that targeted `architecture.html` directly. Catalog at implementation time.

Lighthouse CI integration: run in Playwright `globalTeardown`. Fail the build if Performance / A11y / Best Practices / SEO drops below 95.

## 13. Risk Register, Rollout, Definition of Done

### 13.1 Risks + mitigations

| Risk | Mitigation |
|---|---|
| Scroll-sync feels janky on long page | Single shared IntersectionObserver, 16ms RAF throttle, no layout-affecting properties on transition |
| Decoder competes for attention with body content | Default opacity 0.55 → 1.0 only on active-node change → settles back to 0.85; no flash, no movement |
| Lost backlinks from deleted `architecture.html` | Smart `404.html` (§7.3) catches known patterns; Search Console removal request + sitemap update |
| Information density too high | Progressive disclosure: cross-cutting blocks at Nodes 5 & 6 collapsed via `<details>`; default-open desktop, default-closed mobile |
| Number drift between portfolio repos | Spec mandates citing `Resume CV/00-GROUND-SOURCE-OF-TRUTH.md` line numbers in HTML comments adjacent to each number |
| Sibling-repo PR window leaves stale links | Sibling-repo PRs merged within 24h of `pipeline-observatory` PR; PR description in each sibling repo links to the upstream merge |
| Mobile bottom-sheet decoder competes with system browser UI | Test on Safari iOS + Chrome Android; bottom-sheet height `min(50vh, calc(100vh - env(safe-area-inset-bottom) - 96px))` |

### 13.2 Out-of-scope follow-ups (logged, not blocking)

1. **O-R-A-V terminology drift across `Manzela/`**: `Manzela/index.html` (lines 1054, 1094, 1320, 1363) and `Manzela/README.md` (lines 27, 78, 130, 136) use the marketing expansion *"Originality, Relevance, Accuracy, Value"* while linking to a site whose data model says *"Observe, Reason, Act, Validate"*. Separate reconciliation task. Recommendation: align Manzela surfaces to the production expansion to match `dag-data.js` and `llms.txt`.
2. **Portfolio-wide 6-vs-7 node DAG count** — surfaced in `Resume CV/audit-pass-1-and-2/phase1-findings.md` lines 48 + 199. The merged page resolves this locally via the Node 7 *"in R&D · Langfuse"* annotation; portfolio-wide alignment is a separate task.

### 13.3 Rollout

1. Worktree off `main` (`hardening/merge-architecture-pipeline` or similar); build merged page; run full Playwright + Lighthouse locally.
2. Open PR with: before/after screenshots per breakpoint, before/after Lighthouse JSON, link to this spec.
3. After merge to `pipeline-observatory`: push external-ref commits in `Manzela/` and `Resume CV/` as separate PRs, each commit message referencing the upstream `pipeline-observatory` SHA.
4. Request Google Search Console removal of `https://manzela.github.io/pipeline-observatory/architecture.html`; submit updated sitemap.
5. Monitor 404s via Search Console for 14 days; record findings in `pipeline-observatory/audit/post-merge-404-monitoring.md`.

### 13.4 Definition of Done

No items skipped. No "good enough."

- [ ] All `architecture.html` content distributed correctly to merged page; nothing lost without explicit "absorbed" justification recorded in this spec.
- [ ] `architecture.html` deleted; `404.html` redirect verified for all 5 historical fragment patterns (`#dag-h`, `#moe-h`, `#orav-h`, `#flow-h`, `#tenants-h`) and the no-fragment case.
- [ ] All external refs updated. Verification command must return zero matches:
  ```bash
  grep -rE 'pipeline-observatory/architecture\.html' \
    "/Users/danielmanzela/Professional Profile/" \
    --exclude-dir=.git --exclude-dir=.superpowers --exclude-dir=.firecrawl
  ```
- [ ] Lighthouse mobile: ≥ 95 in Performance, A11y, Best Practices, SEO.
- [ ] axe-core: 0 violations.
- [ ] All 10 Playwright specs (§12) pass; visual regression baselines reviewed and approved.
- [ ] Reduced-motion path verified manually (System Preferences → Accessibility → Reduce motion).
- [ ] JS-disabled path verified manually (DevTools → Disable JavaScript).
- [ ] Every number on the page traces to `Resume CV/00-GROUND-SOURCE-OF-TRUTH.md` via inline HTML comment.
- [ ] O-R-A-V expansion consistent: *"Observe, Reason, Act, Validate"* across merged page + `pipeline-observatory/README.md` + `dag-data.js`.
- [ ] Node 7 visually annotated *"in R&D · Langfuse"* in both schematic (outside DEMAS perimeter) and inline section header + detail legend.
- [ ] DAG schematic renders correctly at all 3 breakpoints; sticky behavior works inside lifecycle region only.
- [ ] Type stack updated: IBM Plex Sans + Plex Mono load and render; Inter no longer referenced.
- [ ] `.glass-nav` removed; replaced with thin paper-and-ink top bar.
- [ ] Light-mode + dark-mode palettes match §4 hex specs; no SaaS-blue (`#3B82F6`) anywhere.
- [ ] CHANGELOG `[3.0.0]` entry written.
- [ ] PR description includes before/after Lighthouse JSON, before/after screenshots at 3 breakpoints (1440, 1024, 390), link to this spec.
- [ ] Sibling-repo PRs (`Manzela`, `Resume CV`) merged within 24h of `pipeline-observatory` PR.
- [ ] Search Console removal request submitted for `architecture.html`.

---

## Appendix A — Anchor Inventory

Stable anchors on the merged page. Used by `404.html` redirect mapping, by external links, and as in-page nav targets.

| Anchor | Lands on |
|---|---|
| `#main` | Top of main content (above hero) |
| `#problem` | Problem section |
| `#framing` | Framing strip |
| `#multi-tenant` | Multi-tenant callout in framing strip |
| `#moe` | MoE callout in framing strip (also linked from Node 5 deep-dive) |
| `#orav` | O-R-A-V callout in framing strip (also linked from Node 6 deep-dive) |
| `#demas` | DEMAS callout in framing strip |
| `#flywheel` | Flywheel callout in framing strip (also linked from epilogue) |
| `#dag` | Lifecycle section start (Node 1) |
| `#node-1` … `#node-7` | Each numbered lifecycle node section |
| `#economics` | Economics section |
| `#telemetry` | Alias for `#dag` (preserves legacy in-page references in CHANGELOG and audit docs) |

## Appendix B — File Inventory at Implementation Time

To be enumerated during the implementation-planning phase. Includes: every existing Playwright spec to update, every HTML/CSS/JS module to touch, every external file. Lives in the implementation plan, not this spec.
