# Agent DAG Pipeline — Multi-Agent Orchestration Architecture

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Status: Production](https://img.shields.io/badge/Status-Live_in_Production-brightgreen.svg)]()
[![Models: 3 Generations](https://img.shields.io/badge/Models-3_Generations-purple.svg)]()

A production-grade 7-node Directed Acyclic Graph (DAG) for autonomous content generation, featuring fail-closed policy enforcement, model hot-swapping, multimodal vision extraction, and LLM-as-Judge quality validation.

## Table of Contents

- [Architecture](#architecture)
- [Model Portfolio](#model-portfolio-hot-swappable)
- [Key Design Decisions](#key-design-decisions)
- [Observability Stack](#observability-stack)
- [Data Sources](#data-sources)
- [Related Projects](#related-projects)
- [License](#license)

> **Status**: Live in production across 5 countries, 131 deployment targets, 3 model generations.

## Architecture

```mermaid
graph LR
    subgraph Orchestrator["fa:fa-sitemap Orchestrator (orchestrator.py)"]
        direction LR
        N1[Node 1<br/>City DNA<br/>Researcher]
        N2[Node 2<br/>Product<br/>Normalizer]
        N3[Node 3<br/>Synonym<br/>Generator]
        N4[Node 4<br/>SV Gatekeeper<br/>⚡ GATE]
        N5[Node 5<br/>Content<br/>Writer]
        N6[Node 6<br/>Quality<br/>Validator]
        N7[Node 7<br/>Store Feature<br/>Generator]
    end

    N1 -->|city context| N2
    N2 -->|normalized product| N3
    N3 -->|expanded keywords| N4
    N4 -->|gated pass| N5
    N5 -->|generated content| N6
    N6 -->|validated output| N7

    subgraph N2Detail["Node 2 — Parallel Sub-Tasks"]
        V[Vision Extraction<br/>Multimodal]
        T[Taxonomy<br/>Classification]
        L[LPN<br/>Extraction]
    end
    N2 -.-> V & T & L

    subgraph QA["Node 6 — O-R-A-V Validator"]
        O[Overlap Check]
        R[Relevance Score]
        A[Accuracy Verify]
        VV[Voice Consistency]
    end
    N6 -.-> O & R & A & VV

    DEMAS[DEMAS<br/>JIT Audit Layer<br/>⚠️ Fail-Closed]
    DEMAS -.->|parallel audit| N2 & N5

    subgraph Observability
        OT[OpenTelemetry<br/>Traces]
        LF[Langfuse<br/>Observations]
        FS[Firestore<br/>State]
        BQ[BigQuery<br/>Logs]
    end
    N5 --> OT & LF
    N7 --> FS & BQ

    style N4 fill:#78350f,stroke:#f59e0b,color:#fef3c7
    style DEMAS fill:#7f1d1d,stroke:#ef4444,color:#fca5a5
    style N6 fill:#1e3a5f,stroke:#3b82f6,color:#93c5fd
```

## Model Portfolio (Hot-Swappable)

| Model | Type | Usage | Invocations |
|---|---|---|---|
| `gemma-3-4b-it` | Vertex AI SLM | Text + Multimodal | 27,423 |
| `gemma-4-26b-a4b` | Vertex AI MoE | Text + Multimodal | 1,438 |
| `gemini-2.5-flash-lite` | Vertex AI | Text + Multimodal | 5,759 |
| `cached` (Redis LTM) | Redis Cache | Cache hits | 8,454 |

## Key Design Decisions

### Fail-Closed Policy
Any node failure → record to Firestore → product **NOT** sent downstream. No silent failures.

### DEMAS JIT Audit
Parallel audit layer runs alongside content generation. Acts as an independent quality gate with a 68.9% pass rate — intentionally aggressive to catch edge cases.

### O-R-A-V Dual-Layer Validation
Node 6 runs both deterministic checks (overlap, accuracy) and LLM-as-Judge scoring (relevance, voice) to create a mixed-metric evaluation system.

### Model Hot-Swap Architecture
Models are swappable at the node level without pipeline changes. Timeline:
- **Mar 24–31**: `gemma-3-4b-it` (initial deployment)
- **Apr 5–6**: `gemma-4-26b-a4b` (MoE evaluation — see [forensic runbook](https://github.com/Manzela/gemma4-vllm-deployment))
- **Apr 13+**: `gemini-2.5-flash-lite` (current production)

## Observability Stack

- **OpenTelemetry**: Distributed tracing across all 7 nodes
- **Langfuse**: LLM observation, scoring, and prompt versioning
- **Firestore**: State management and execution records
- **BigQuery**: Long-term execution log archival (48K+ node-level entries)
- **Redis**: LTM cache layer + budget lease management

## Data Sources

All metrics in this document are derived from verifiable production data:

| Metric | Source | Dataset |
|---|---|---|
| Node executions (48K+) | BigQuery | `pipeline_logs.node_logs_changelog_raw_changelog` |
| Deployment targets (131) | BigQuery | `json_sync_dataset.json_data` |
| Model invocations | BigQuery | `model_name` field in node logs |
| Cache hits (8,454) | BigQuery | `model_source = 'redis_ltm_cache'` filter |
| Store count (109) | BigQuery | `DISTINCT store_name` in json_data |

## Related Projects

- [`antigravity-os`](https://github.com/Manzela/antigravity-os) — Governance kernel with OPA policies, cost guard, and self-healing CI/CD
- [`gemma4-vllm-deployment`](https://github.com/Manzela/gemma4-vllm-deployment) — Forensic deployment runbook for Gemma 4 26B MoE on Vertex AI

## Interactive Visualizations

- [`index.html`](index.html) — Pipeline Observatory: execution traces, model timeline, geographic fanout
- [`architecture.html`](architecture.html) — Deep Architecture View: node anatomy, closed-loop autonomy, multi-model evaluation, self-improving state machine

## Enterprise Scale

Production throughput across 11 enterprise clients: ~7.9M PDPs per generation cycle, ~55M node operations per cycle, ~305M monthly node operations including daily price/inventory deltas. Each PDP traverses the full 7-node DAG with ~3 sub-agents per node, yielding ~116M sub-agent executions per cycle. Pipeline is fully autonomous, auto-scaling (up to 1,000 concurrent Modal workers), and self-healing.

## License

Apache-2.0
