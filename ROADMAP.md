# Roadmap: Pipeline Observatory

This document outlines the strategic technical vision and upcoming milestones for the Pipeline Observatory and the Multi-Agent DAG ecosystem.

## Phase 1: Foundational Observability (Current)
- [x] **Sequential Reveal Engine**: Replaced fragile scroll-jacking with robust, native `IntersectionObserver` flow.
- [x] **Mechanistic Interpretability UI**: "Glass Box" visuals for Gemma 4 26B-A4B MoE and LoRA routing.
- [x] **O-R-A-V Validation Transparency**: Fail-closed loop visualizer with DEMAS JIT audit layers.
- [x] **Cross-Device Parity**: Apple-tier responsive fluid typography and grid reflowing.
- [x] **SLM Upgrades**: Migrated to `gemini-3.1-flash-lite` for cost-efficient sub-agent routing.

## Phase 2: Live Telemetry Integration (Q3 2026)
- [ ] **WebSocket Telemetry Stream**: Connect the static `traces` visualization to a live WebSocket server streaming from Google Cloud Pub/Sub (BigQuery logs).
- [ ] **Dynamic Node State**: Reflect the exact real-time execution load per node instead of static counters.
- [ ] **Langfuse Deep Links**: Clickable traces that open the exact Langfuse observation for prompt/completion forensic debugging.
- [ ] **Cost Guard Visualization**: Real-time dollar-cost tracking tied to the `antigravity-os` budget lease management system.

## Phase 3: Interactive DAG Control (Q4 2026)
- [ ] **Node-Level Hot Swapping UI**: Allow administrators to select different foundational models (e.g., swapping Node 2 to a vision-heavy model like Claude 3.5 Sonnet) directly from the dashboard.
- [ ] **Prompt Playground**: Embed a sandbox to test specific nodes (e.g., Node 5 Content Writer) with custom input payloads and see the O-R-A-V validation scores instantly.
- [ ] **Fail-Closed Dashboard**: A dedicated view analyzing the 31.1% of runs that DEMAS rejects, categorized by failure reason (hallucination, format error, taxonomy mismatch).

## Phase 4: Open-Source Enterprise Federation (2027)
- [ ] **Dockerized Control Plane**: One-click deployment of the entire observatory stack + mocked DAG execution environment for local development.
- [ ] **Multi-Tenant Hub**: Unified control plane for managing the 11 enterprise clients, 109 stores, and caching policies across different geographies.
- [ ] **Plugin Ecosystem**: Allow community contributions for new Node types (e.g., SEO Optimizer Node, Legal Compliance Node).
