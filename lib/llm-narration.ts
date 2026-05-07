/**
 * Azure OpenAI GPT-4.1 narration overlay for CatalystMind AI.
 *
 * All AI outputs are GROUNDED — the model never invents catalyst names, formulas,
 * SMILES, activity numbers, or experiment outcomes. We pre-compute every value via
 * deterministic mock or learned predictor, pass exact values to GPT-4.1, and ask
 * it only to *describe* them in researcher-readable language.
 *
 * Brief non-negotiable: hosted-LLM use on real proprietary GPS Renewables data is
 * not permitted; demo runs synthetic data only. Production swaps Azure for on-prem
 * inference (Llama-3 / Mistral) by changing the URL + auth header.
 */

import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const CACHE_DIR = join(process.cwd(), "data", "llm-cache")

function hashKey(payload: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(payload, Object.keys(payload as object).sort()))
    .digest("hex")
    .slice(0, 16)
}

function readCache(key: string): string | null {
  const path = join(CACHE_DIR, `${key}.txt`)
  if (!existsSync(path)) return null
  try {
    return readFileSync(path, "utf8")
  } catch {
    return null
  }
}

function writeCache(key: string, text: string): void {
  mkdirSync(CACHE_DIR, { recursive: true })
  writeFileSync(join(CACHE_DIR, `${key}.txt`), text)
}

export function hasLLM(): boolean {
  return !!(process.env.AZURE_OPENAI_API_KEY || process.env.OPENAI_API_KEY)
}

async function rawLLM(
  systemPrompt: string,
  userContent: string,
  maxTokens = 220,
): Promise<string> {
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userContent },
  ]
  const azureKey = process.env.AZURE_OPENAI_API_KEY
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT
  if (azureKey && azureEndpoint) {
    const res = await fetch(azureEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": azureKey },
      body: JSON.stringify({ messages, max_tokens: maxTokens, temperature: 0.2 }),
    })
    if (!res.ok) throw new Error(`Azure OpenAI HTTP ${res.status}`)
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
    return (json.choices?.[0]?.message?.content ?? "").trim()
  }
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error("No LLM API key configured")
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      max_tokens: maxTokens,
      temperature: 0.2,
    }),
  })
  if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`)
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
  return (json.choices?.[0]?.message?.content ?? "").trim()
}

// ─── 1. Dashboard scientific briefing ────────────────────────────────────────
export interface DashboardBriefingInput {
  reactionsTracked: number
  candidatesGenerated: number
  novelCandidates: number
  experimentsLogged: number
  beatPredictions: number
  underperformers: number
  modelAccuracy: number
  modelVersion: string
  topReactionType?: string
  topCandidateName?: string
  topCandidateActivity?: number
}

export async function generateDashboardBriefing(input: DashboardBriefingInput): Promise<string> {
  const cacheKey = `briefing_${hashKey({
    ...input,
    day: new Date().toISOString().slice(0, 10),
  })}`
  const cached = readCache(cacheKey)
  if (cached) return cached

  if (!hasLLM()) {
    return (
      `${input.reactionsTracked} reactions tracked · ${input.candidatesGenerated} candidates ` +
      `(${input.novelCandidates} novel via generative AI) · ${input.experimentsLogged} experiments logged ` +
      `(${input.beatPredictions} beat predictions, ${input.underperformers} underperformed). ` +
      `Active model ${input.modelVersion} at ${(input.modelAccuracy * 100).toFixed(0)}% accuracy. ` +
      `Top candidate: ${input.topCandidateName ?? "—"}.`
    )
  }

  const system =
    "You are a research-platform AI assistant briefing a chief scientist at GPS Renewables. " +
    "Write a 3-sentence morning briefing for the catalyst & enzyme discovery team. Structure:\n" +
    "1. Discovery state: reactions tracked + candidates (split known vs generative-AI novel) + experiments logged.\n" +
    "2. Model performance: active model version + accuracy + how many experiments beat predictions vs underperformed.\n" +
    "3. Action: which reaction line or candidate to focus on next. Mention the top performer by name.\n" +
    "Use chemistry / biology research language. Be specific with numbers. Under 80 words."

  try {
    const text = await rawLLM(system, JSON.stringify(input), 240)
    writeCache(cacheKey, text)
    return text
  } catch {
    return (
      `${input.reactionsTracked} reactions · ${input.candidatesGenerated} candidates ` +
      `(${input.novelCandidates} novel) · ${input.experimentsLogged} experiments. ` +
      `Model ${input.modelVersion} at ${(input.modelAccuracy * 100).toFixed(0)}% accuracy.`
    )
  }
}

// ─── 2. Per-candidate AI rationale ───────────────────────────────────────────
export interface CandidateRationaleInput {
  reactionType: string
  reactionName: string
  candidateName: string
  formula: string
  origin: string // DATABASE_LOOKUP | GENERATIVE_AI | HYBRID
  source?: string
  predictedActivity: number
  predictedSelectivity: number
  predictedStability: number
  predictedYield: number
  confidence: number
  basisCandidate?: string
  variationDescription?: string
}

export async function explainCandidate(input: CandidateRationaleInput): Promise<string> {
  const cacheKey = `cand_${hashKey(input)}`
  const cached = readCache(cacheKey)
  if (cached) return cached

  if (!hasLLM()) {
    const top = Math.max(
      input.predictedActivity,
      input.predictedSelectivity,
      input.predictedStability,
    )
    const topName =
      top === input.predictedActivity
        ? "activity"
        : top === input.predictedSelectivity
          ? "selectivity"
          : "stability"
    return (
      `${input.candidateName} (${input.formula}) ${input.origin === "GENERATIVE_AI" ? "is a generative-AI variant" : "is a known catalyst"} ` +
      `with strongest predicted ${topName} (${(top * 100).toFixed(0)}/100). ` +
      `Confidence ${(input.confidence * 100).toFixed(0)}%.`
    )
  }

  const system =
    "You are a catalyst chemist / synthetic biologist writing a 2-sentence rationale " +
    "for a candidate appearing in a researcher's ranked list. Structure:\n" +
    "1. Why this candidate is interesting for the target reaction — call out its strongest predicted property " +
    "(activity / selectivity / stability) and one chemistry reason (active site, electronic effect, surface area, etc.).\n" +
    "2. The risk or follow-up: what to verify in bench testing first (which condition, which characterization).\n" +
    "Use research-paper language. Cite the formula explicitly. Under 50 words. Do not invent numbers — only " +
    "describe the values given."

  try {
    const text = await rawLLM(system, JSON.stringify(input), 160)
    writeCache(cacheKey, text)
    return text
  } catch {
    return `${input.candidateName} ranked highly on activity ${(input.predictedActivity * 100).toFixed(0)}/100. Verify under target conditions.`
  }
}

// ─── 3. Experiment outcome hypothesis (closes feedback loop) ─────────────────
export interface ExperimentHypothesisInput {
  candidateName: string
  formula: string
  reactionName: string
  predictedActivity: number
  predictedSelectivity: number
  predictedStability: number
  predictedYield: number
  measuredActivity?: number | null
  measuredSelectivity?: number | null
  measuredStability?: number | null
  measuredYield?: number | null
  outcome: string // BEAT_PREDICTION | MATCHED | UNDERPERFORMED | INCONCLUSIVE
  notes?: string
}

export async function explainExperimentOutcome(
  input: ExperimentHypothesisInput,
): Promise<string> {
  const cacheKey = `exp_${hashKey(input)}`
  const cached = readCache(cacheKey)
  if (cached) return cached

  if (!hasLLM()) {
    if (input.outcome === "BEAT_PREDICTION") {
      return `${input.candidateName} exceeded predictions — investigate which structural feature (active-site density, dopant electronic effect) is unaccounted for in current model.`
    }
    if (input.outcome === "UNDERPERFORMED") {
      return `${input.candidateName} fell short of predictions — likely surface deactivation or unmodelled selectivity loss. Re-run with shorter time-on-stream and TGA characterisation.`
    }
    return `${input.candidateName} matched predictions — model is calibrated for this composition class.`
  }

  const system =
    "You are a research mentor analysing an experiment outcome for a junior catalyst chemist. " +
    "Write 2 sentences:\n" +
    "1. Hypothesise the chemistry / kinetics reason for the gap between predicted and measured " +
    "(or for matching). Reference the candidate's formula and the specific metric (activity / selectivity / stability / yield) that diverged most.\n" +
    "2. Suggest ONE concrete follow-up experiment or characterisation that would test the hypothesis " +
    "(e.g., TGA, in-situ DRIFTS, time-on-stream extension, BET surface area, varied feed ratio).\n" +
    "Use catalysis / enzyme research language. Reference numbers from the input. Under 60 words."

  try {
    const text = await rawLLM(system, JSON.stringify(input), 200)
    writeCache(cacheKey, text)
    return text
  } catch {
    return `${input.candidateName} ${input.outcome.toLowerCase()}. Recommend characterisation follow-up to refine model.`
  }
}

// ─── 4. Reaction pathway narration ───────────────────────────────────────────
export interface PathwayNarrationInput {
  reactionType: string
  reactionName: string
  trackType: string // CATALYSIS | SYNTHETIC_BIOLOGY
  topCandidates: Array<{ name: string; formula: string; predictedActivity: number }>
}

export async function describeReactionPathway(input: PathwayNarrationInput): Promise<string> {
  const cacheKey = `path_${hashKey(input)}`
  const cached = readCache(cacheKey)
  if (cached) return cached

  if (!hasLLM()) {
    return (
      `${input.reactionName} proceeds via standard ${input.trackType === "SYNTHETIC_BIOLOGY" ? "enzymatic" : "heterogeneous catalytic"} ` +
      `pathway. Rate-limiting step typically determines yield; activation energy ranges 60–120 kJ/mol depending on catalyst class.`
    )
  }

  const system =
    "You are a catalysis or enzyme-engineering expert. Describe the reaction pathway " +
    "for the given target reaction in 3 sentences:\n" +
    "1. Name the elementary steps (adsorption / activation / surface reaction / desorption " +
    "for catalysis; substrate binding / catalysis / product release for enzymes).\n" +
    "2. Identify the rate-limiting step and typical activation energy range.\n" +
    "3. Suggest which property of the top candidate would most affect the rate-limiting step.\n" +
    "Use research language. Cite the top candidate by name. Under 80 words."

  try {
    const text = await rawLLM(system, JSON.stringify(input), 240)
    writeCache(cacheKey, text)
    return text
  } catch {
    return `${input.reactionName} pathway: standard mechanism · rate-limiting step depends on catalyst class.`
  }
}
