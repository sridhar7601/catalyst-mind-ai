# CatalystMind AI — Molecular discovery for catalysis & synthetic biology

AI-powered molecular discovery for chemical catalysis and synthetic biology — from target reaction to ranked novel candidates with experimental feedback loops. The demo runs entirely on **mock AI** (`USE_MOCK_AI=true`): deterministic lookups, generative mutations, and property scores so judges can explore the product without API keys.

> **PanIIT AI for Bharat Hackathon** — Theme 4: AI Platform for Molecular Discovery in Chemical Catalysis & Synthetic Biology (sponsor: GPS Renewables)

## Quick start

```bash
git clone https://github.com/sridhar7601/catalyst-mind-ai.git
cd catalyst-mind-ai
cp .env.example .env
npm install
npx prisma migrate deploy
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo data

`npm run seed` clears SQLite and inserts **3 reactions**, **69 candidates** (15 curated + 8 generated per reaction), **12 experiments**, and **2 model versions** (v1.0 → v1.1). All generators honour **seed=42** semantics via deterministic hashes in `lib/ai.ts`.

## Architecture

See [docs/diagrams/architecture.png](docs/diagrams/architecture.png) (source: [docs/diagrams/architecture.mmd](docs/diagrams/architecture.mmd)).

## Tech stack

- Next.js 16 (App Router) + TypeScript  
- Prisma 5 + SQLite (`DATABASE_URL=file:./dev.db` → `prisma/dev.db` next to the schema file)  
- Tailwind CSS v3 + shadcn/ui (Base UI) + Tremor charts  
- **3Dmol.js** for SMILES-based viewers (dynamic import, client-only)  
- Mock services in `lib/ai.ts` (`lookupKnownCandidates`, `generateNovelCandidates`, `predictProperties`)

## Documentation

Full write-up: [docs/solution-document.md](docs/solution-document.md) · PDF: [docs/solution-document.pdf](docs/solution-document.pdf)

## Verification

```bash
npm install
npx tsc --noEmit
npm run build
npm run seed
npm run dev   # curl http://localhost:3000
```

## Licence

Hackathon demo — synthetic data only; no real PII or proprietary catalyst datasets.
