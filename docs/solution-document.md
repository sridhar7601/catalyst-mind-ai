# CatalystMind AI — AI Platform for Molecular Discovery in Chemical Catalysis & Synthetic Biology

**PanIIT AI for Bharat Hackathon — Theme 4 Submission**

---

## 1. Executive Summary

Industrial chemistry and synthetic biology teams still spend months iterating on catalyst formulations and enzyme panels using disconnected spreadsheets, ad-hoc literature reviews, and one-off DFT studies. **CatalystMind AI** is a Next.js research workbench where a scientist defines a **target reaction** (for example CO₂→methanol, ethanol→hydrocarbon for sustainable aviation fuel, or cellulose→hydrocarbon for biomass upgrading), pulls **known catalysts** from mocked integrations with Open Catalyst Project–style and BRENDA-style catalogs, generates **novel candidates** via deterministic mutation rules, assigns **predicted activity, selectivity, stability, and yield** with explicit rationale JSON, visualises structures in **3Dmol.js**, logs **bench experiments** with predicted-vs-measured deltas, and runs a **mock model retrain** that bumps accuracy and appends a new `ModelVersion` row.

The prototype is deliberately **mock-first**: `USE_MOCK_AI=true` (default) ensures every demo laptop gets identical rankings without cloud LLM keys. The codebase is structured so real retrieval-augmented generation, graph neural nets, or surrogate models can replace `lib/ai.ts` behind the same function signatures.

---

## 2. Problem Deep Dive

### Pain points

- **Fragmented evidence:** Published catalysts for CO₂ hydrogenation or ethanol upgrading live across journals, Materials Project entries, and proprietary pilot logs — researchers lack a single ranked workspace.  
- **Slow iteration:** Each design variant historically requires bespoke synthesis and testing before the next learning cycle.  
- **Explainability gap:** Black-box ML scores are unacceptable in regulated or sponsor-facing R&D (e.g. GPS Renewables e-fuels pilots) without property-level rationale strings.

### Stakeholders

**Primary:** heterogeneous catalysis leads, enzyme engineering teams, and programme managers at renewable fuel and biochemical firms. **Secondary:** national lab collaborators integrating DFT pipelines.

### Regulatory & deployment context

Data sovereignty matters for Indian industrial R&D. The app runs as a **single-tenant Node process** with SQLite; swapping `DATABASE_URL` to PostgreSQL is a one-line Prisma change. No third-party inference calls occur in the mock mode, which simplifies MEITY / on-prem reviews.

---

## 3. Solution Architecture

### System overview

CatalystMind AI is one Next.js application (App Router) combining UI, REST-style JSON routes under `app/api/**`, and Prisma persistence. The user journey:

1. **Dashboard** — Tremor scatter of top-50 candidates (activity vs selectivity, size = stability, colour = database vs generative origin) plus experiment feed and model accuracy card.  
2. **Reactions list / new reaction** — CRUD for `Reaction` with `reactionType`, `track` (catalysis vs synthetic biology), and optional `targetYield`.  
3. **Reaction workbench** (`/reactions/[id]`) — four tabs: ranked candidates (expandable rationale + 3D modal + stub export), performance scatter, experiment log + **Retrain model** (toast + `/api/models/retrain`), static **pathway SVG** placeholder for future DFT microkinetics.  
4. **Candidate detail** (`/candidates/[id]`) — half-page 3Dmol viewer + rationale cards + experiment table + link back to workbench `#experiments`.  
5. **Models** — `ModelVersion` history with active flag.

### Data model (Prisma + SQLite)

Because SQLite does not support Prisma enums natively in our toolchain, enumerations are stored as **strings** validated in TypeScript via `lib/enums.ts`:

- `Reaction` — includes `discoveryCompleted` to enforce one-shot discovery per reaction in the demo.  
- `Candidate` — `origin` (`DATABASE_LOOKUP` | `GENERATIVE_AI` | `HYBRID`), predicted metrics, `reasoning`, `propertyRationale` (JSON string).  
- `Experiment` — optional measured channels + `outcome` (`BEAT_PREDICTION` | `MATCHED` | `UNDERPERFORMED` | `INCONCLUSIVE`).  
- `ModelVersion` — `versionTag`, `experimentsUsed`, `accuracyMetric`, `active`.

### Mock AI (`lib/ai.ts`)

- **`lookupKnownCandidates`** — hardcoded pools for **CO₂→methanol**, **ethanol→hydrocarbon**, and **cellulose/biomass→hydrocarbon** (15 entries each) with realistic metal/zeolite/enzyme names.  
- **`generateNovelCandidates`** — dopant mutations (V, Nb, Mo, …) on the known pool, deterministic SMILES stubs.  
- **`predictProperties`** — hashed pseudo-random metrics 0–1 (and yield %) with template rationales keyed off formula tokens (e.g. Cu/Pd presence).

### Molecular helpers (`lib/molecular.ts`)

Lightweight SMILES sanity check, `resolveDemoSmiles` mapping from formula to public-domain-style SMILES for 3Dmol when explicit SMILES are absent.

### Explainability & feedback loop

Every candidate carries `reasoning` plus structured `propertyRationale`. Experiments compute deltas; `/api/models/retrain` bumps accuracy and creates a new active version — satisfying the hackathon emphasis on **closed-loop learning**.

---

## 4. Government Feasibility & Integration Path

| External system | Role | Integration path |
|---|---|---|
| **Materials Project** | Bulk formation energies / phase diagrams for supports | REST client in `lookupKnownCandidates` replacing mock tables; cache in `Candidate.source`. |
| **Open Catalyst Project** | Adsorption energies on slabs | Same boundary; store slab token + energy JSON on `Candidate.description`. |
| **BRENDA / UniProt** | Enzyme kinetics | Map `TrackType.SYNTHETIC_BIOLOGY` to EC numbers; hydrate `KnownCandidate` rows from API. |

### Pilot framing (GPS Renewables)

The seeded **“CO₂ to Methanol (GPS Renewables E2J pilot)”** reaction is named to align with sponsor storytelling. Production would attach pilot KPIs (single-pass yield, recycle ratio) as extra columns on `Experiment`.

---

## 5. Security & Ethics

- **Synthetic data only** — no real pilot PII, no proprietary structures.  
- **No secrets in repo** — `.env.example` documents `DATABASE_URL` and `USE_MOCK_AI`.  
- **Scientific humility** — mock scores are **not** claimed to be physically accurate; the UI labels them as mock predictors.

---

## 6. Testing & Reproducibility

```bash
npm install
npx tsc --noEmit
npm run build
npm run seed
npm run dev
```

Diagrams: regenerate from `docs/diagrams/architecture.mmd` using `@mermaid-js/mermaid-cli`. PDF: render `docs/solution-document.md` with Pandoc + a headless Chromium PDF engine where available.

---

## 7. Known Limitations (MVP)

- No real DFT / MD — pathway tab is illustrative SVG only.  
- No authentication — single-user lab bench.  
- SDF export is a JSON payload stub, not binary SDF streaming.  
- 3Dmol renders **demo SMILES**; exotic inorganic clusters are approximated for visual effect.

---

## 8. Conclusion

CatalystMind AI demonstrates a **credible product skeleton** for AI-assisted catalyst discovery: curated + generative pools, explainable mock predictions, interactive molecular viewing, experiment logging, and versioned model history — ready to swap in sovereign Indian LLM / GNN backends when keys and training data become available.
