// assets/dag-data.js
// Source of truth for DAG node metadata. Consumed by index.html (#telemetry)
// and architecture.html (#dag). Cross-checked against the production pipeline
// at ~/Developer/PRODUCT/repos/Pipeline/pipeline_import/adk_pipeline/ on
// 2026-05-17 — node count and event vocabulary are stylized for clarity in
// the public showcase; production uses node{N}_{component} naming.
//
// Schema per entry:
//   nm      display name (short)
//   role    one-line role label
//   det     true = deterministic Python only / false = involves a model
//   gate    { nm, desc, tools[] }  — the deterministic check that fires first
//   agent   { nm, desc, tools[] }  — what runs if the gate passes
//   intent  one sentence — *why* this node exists in the pipeline
//   trace   short text routing pattern (e.g. "Locale → Gate → Web Search → Context")
//   failureRoute (DEMAS only) — the failure cascade

(function () {
  window.PO = window.PO || {};
  window.PO.DAG_NODES = {
    __version: '2.1.0',

    1: {
      id: 1, nm: 'City DNA',  role: 'Context Injection', det: false,
      gate:  { nm: 'Locale Resolver', desc: 'Validates ISO locale codes and timezone offsets. Rejects malformed location data.', tools: ['ISO-3166', 'Timezone DB'] },
      agent: { nm: 'Grounded Search', desc: 'Fetches factual, up-to-date data from verified .gov sources per locale.', tools: ['Gemini', 'Gov Sources'] },
      intent: 'Locks down locale facts before any downstream node can reason about geography.',
      trace: 'Locale → Gate → Web Search → Context'
    },
    2: {
      id: 2, nm: 'Normalizer', role: 'Data Cleansing', det: false,
      gate:  { nm: 'Schema Validator', desc: 'Enforces strict JSON schema. Fails on mismatch.', tools: ['Pydantic', 'AST'] },
      agent: { nm: 'Vision + Classifier', desc: 'Text classification for taxonomy mapping. Vision model extracts context from product images.', tools: ['Classification', 'Vision'] },
      intent: 'Maps raw tenant data to a canonical schema so every downstream node sees the same shape.',
      trace: 'Input → Schema → Classification → Record'
    },
    3: {
      id: 3, nm: 'Synonyms', role: 'Expansion', det: false,
      gate:  { nm: 'Dedup Filter', desc: 'Exact-match and fuzzy deduplication across the synonym set.', tools: ['SimHash', 'Levenshtein'] },
      agent: { nm: 'LPN Generator', desc: 'Text classification model generating locale-aware synonyms and landing page name variants.', tools: ['Classification', 'Tenant Dict'] },
      intent: 'Generates locale-aware keyword variants — the surface area Node 4 will filter.',
      trace: 'Terms → Dedup → Classification → Set'
    },
    4: {
      id: 4, nm: 'SV Gate', role: 'Volume Filter', det: true,
      gate:  { nm: 'Volume Fetcher', desc: 'Queries Google Ads API for keyword search volume per synonym per location.', tools: ['Google Ads API', 'BigQuery'] },
      agent: { nm: 'Keyword Ranker', desc: 'Algorithmic scoring ranks keywords by commercial value per city. No LLM invoked.', tools: ['NumPy', 'Custom Math'] },
      intent: 'Hard gate: drops sub-threshold keywords before they reach the expensive Node 5.',
      trace: 'Set → API Query → Math Ranking → Qualified'
    },
    5: {
      id: 5, nm: 'Writer', role: 'Generation', det: false,
      gate:  { nm: 'Template Selector', desc: 'Enforces structural constraints: length, heading count, content block schema.', tools: ['Jinja2', 'Constraints'] },
      agent: { nm: 'Content Generator', desc: 'Generates 10 SEO-optimized content blocks per product-location pair.', tools: ['Gemma 4 MoE', 'LoRA'] },
      intent: 'The only sustained inference path. ~80% of run cost lives in this ~11-second window.',
      trace: 'Qualified → Template → LoRA → 10 Blocks'
    },
    6: {
      id: 6, nm: 'Validator', role: 'Deterministic QA', det: true,
      gate:  { nm: 'Format Check', desc: 'Validates format, word count, blocks forbidden patterns. O(1) deterministic checks.', tools: ['Regex', 'Blocklist'] },
      agent: { nm: 'O-R-A-V Engine', desc: 'Observe diagnostics, reason about severity, act with corrections, validate final output. Zero LLM calls — pure rule-based validation.', tools: ['Python', 'Pydantic'] },
      intent: 'Pure deterministic Python — the final structural defense before output ships.',
      trace: 'Draft → Format → O-R-A-V → PASS / RETRY / FAIL'
    },
    7: {
      id: 7, nm: 'Evaluator', role: 'DEMAS JIT', det: false,
      gate:  { nm: 'Quality Threshold', desc: 'Validates minimum O-R-A-V scores before SLM evaluation.', tools: ['Threshold', 'Guard'] },
      agent: { nm: 'SLM-as-Judge', desc: 'DEMAS JIT evaluator runs per-block qualitative auditing inline within Node 5. Language-agnostic content quality assessment.', tools: ['Gemma 4 SLM', 'Langfuse'] },
      intent: 'JIT consensus audit — validates per-block content quality before commit.',
      trace: 'Content → Threshold → SLM Audit → Accept/Reject'
    },

    demas: {
      nm: 'DEMAS', role: 'JIT Audit Boundary', det: true,
      gate:  { nm: 'Schema + Integrity Check', desc: 'Validates data integrity and schema compliance at every node boundary, in real time.', tools: ['Pydantic', 'Schema'] },
      agent: { nm: 'JIT Audit Layer', desc: 'Deterministic Evaluation & Monitoring Audit System. Intercepts at every node boundary. 68.9% pass rate. Fail-closed — rejected outputs never propagate downstream.', tools: ['Langfuse', 'Firestore'] },
      intent: 'Boundary contract: rejects below-threshold outputs before they propagate downstream.',
      failureRoute: 'Block-level: ≤2x JIT retry with corrected prompt · Product-level: Firestore-requeue for next CRON cycle',
      trace: 'Boundary → Schema → Integrity → PASS / FAIL'
    }
  };
})();
