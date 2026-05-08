# Pipeline Observatory

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Status: Production](https://img.shields.io/badge/Status-Live_in_Production-brightgreen.svg)]()
[![Models: 3 Generations](https://img.shields.io/badge/Models-3_Generations-purple.svg)]()

A publication-grade interactive dashboard and architectural documentation for an autonomous 7-node Directed Acyclic Graph (DAG) pipeline. It features mechanistic interpretability visuals, fail-closed policy enforcement (DEMAS), and enterprise-scale execution telemetry.

🌍 **Live Demo:** [manzela.github.io/pipeline-observatory](https://manzela.github.io/pipeline-observatory)

## Table of Contents
- [Interactive Visualizations](#interactive-visualizations)
- [Architecture Overview](#architecture-overview)
- [Enterprise Scale](#enterprise-scale)
- [Project Documentation](#project-documentation)
- [License](#license)

## Interactive Visualizations

This repository hosts two core dashboards built with vanilla HTML/CSS/JS (zero dependencies) for maximum performance and sub-millisecond load times.

- 📊 **[Observatory Dashboard (`index.html`)](https://manzela.github.io/pipeline-observatory/index.html)**
  Live execution telemetry, model evolution timelines, geographic fanout, and an anonymized trace stream of multi-agent interactions.

- 🧠 **[Deep Architecture View (`architecture.html`)](https://manzela.github.io/pipeline-observatory/architecture.html)**
  A deep-dive explorer featuring a 7-node sequential reveal, "Glass Box" MoE/LoRA interpretability visualizations, and the O-R-A-V validation stack.

## Architecture Overview

```mermaid
graph LR
    subgraph Orchestrator["fa:fa-sitemap Orchestrator (orchestrator.py)"]
        direction LR
        N1[Node 1<br/>City DNA]
        N2[Node 2<br/>Normalizer]
        N3[Node 3<br/>Synonyms]
        N4[Node 4<br/>SV Gate]
        N5[Node 5<br/>Writer]
        N6[Node 6<br/>Validator]
        N7[Node 7<br/>Features]
    end

    N1 --> N2 --> N3 --> N4 --> N5 --> N6 --> N7

    DEMAS[DEMAS<br/>JIT Audit Layer<br/>⚠️ Fail-Closed]
    DEMAS -.->|parallel audit| N2 & N5
    
    style N4 fill:#78350f,stroke:#f59e0b,color:#fef3c7
    style DEMAS fill:#7f1d1d,stroke:#ef4444,color:#fca5a5
    style N6 fill:#1e3a5f,stroke:#3b82f6,color:#93c5fd
```

### Key Design Decisions
- **Fail-Closed Policy (DEMAS):** A Just-In-Time parallel audit layer running alongside generation. Any failure halts downstream propagation.
- **O-R-A-V Validation:** Node 6 runs Overlap, Relevance, Accuracy, and Voice checks via LLM-as-Judge.
- **Model Hot-Swapping:** Zero-downtime swaps between Gemma 3/4 and Gemini 2.5/3.1 Flash-Lite.

## Enterprise Scale
Production throughput across 11 enterprise clients:
- **~7.9M PDPs** (Product Detail Pages) per generation cycle.
- **~55M Node operations** per cycle.
- Auto-scaling up to 1,000 concurrent Modal workers.

## Project Documentation
We adhere to high open-source standards. Please review the following guidelines:
- [CHANGELOG.md](CHANGELOG.md) - History of architectural and UX improvements.
- [ROADMAP.md](ROADMAP.md) - Strategic vision and upcoming features.
- [SECURITY.md](SECURITY.md) - Security policy and vulnerability reporting.
- [CONTRIBUTING.md](CONTRIBUTING.md) - How to run, test, and contribute.
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) - Community standards.

## Related Projects
- [`antigravity-os`](https://github.com/Manzela/antigravity-os) — Governance kernel with OPA policies and cost guard.
- [`gemma4-vllm-deployment`](https://github.com/Manzela/gemma4-vllm-deployment) — Forensic deployment runbook for Gemma 4 MoE.

## License
[Apache-2.0](LICENSE)
