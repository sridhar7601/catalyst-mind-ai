import type { ReactionType, TrackType } from "@/lib/enums"

export type KnownSource = "OCP" | "BRENDA" | "Materials_Project" | "Literature"

export interface KnownCandidate {
  name: string
  source: KnownSource
  formula: string
  smiles?: string
  baselineActivity: number
  baselineSelectivity: number
  baselineStability: number
}

export interface GeneratedCandidate {
  name: string
  formula: string
  smiles: string
  basisCandidate?: string
  variationDescription: string
}

function hashSeed(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

function unitFloat(seed: number, salt: number): number {
  const x = Math.sin(seed * 9301 + salt * 49297) * 43758.5453
  return x - Math.floor(x)
}

const CO2_METHANOL_KNOWN: KnownCandidate[] = [
  { name: "Cu/ZnO/Al2O3 ICI", source: "Literature", formula: "Cu/ZnO/Al2O3", smiles: "CCO", baselineActivity: 0.82, baselineSelectivity: 0.71, baselineStability: 0.68 },
  { name: "Pd/Ga2O3 tandem", source: "OCP", formula: "Pd/Ga2O3", smiles: "c1ccccc1", baselineActivity: 0.76, baselineSelectivity: 0.88, baselineStability: 0.55 },
  { name: "In2O3-ZrO2 pair", source: "Materials_Project", formula: "In2O3-ZrO2", smiles: "CC(C)O", baselineActivity: 0.7, baselineSelectivity: 0.79, baselineStability: 0.62 },
  { name: "ZnO/Cr2O3 low-T", source: "Literature", formula: "ZnO/Cr2O3", baselineActivity: 0.64, baselineSelectivity: 0.66, baselineStability: 0.58 },
  { name: "Ni-Fe/Al2O3 RWGS", source: "OCP", formula: "Ni-Fe/Al2O3", baselineActivity: 0.58, baselineSelectivity: 0.52, baselineStability: 0.72 },
  { name: "Cu-CeO2 interface", source: "Materials_Project", formula: "Cu-CeO2", baselineActivity: 0.74, baselineSelectivity: 0.62, baselineStability: 0.61 },
  { name: "Ag-Al2O3 plasma-assisted", source: "Literature", formula: "Ag-Al2O3", baselineActivity: 0.55, baselineSelectivity: 0.7, baselineStability: 0.5 },
  { name: "Pt/TiO2 photothermal", source: "OCP", formula: "Pt/TiO2", baselineActivity: 0.6, baselineSelectivity: 0.64, baselineStability: 0.66 },
  { name: "Rh/SiO2 classic", source: "Literature", formula: "Rh/SiO2", baselineActivity: 0.68, baselineSelectivity: 0.58, baselineStability: 0.54 },
  { name: "Co-Mo/S hydro", source: "Literature", formula: "Co-Mo/S", baselineActivity: 0.52, baselineSelectivity: 0.6, baselineStability: 0.7 },
  { name: "Fe3O4@C core-shell", source: "Materials_Project", formula: "Fe3O4@C", baselineActivity: 0.48, baselineSelectivity: 0.55, baselineStability: 0.63 },
  { name: "HZSM-5 acid pair", source: "Literature", formula: "HZSM-5", smiles: "c1ccc(C)cc1", baselineActivity: 0.45, baselineSelectivity: 0.82, baselineStability: 0.75 },
  { name: "SAPO-34 shape select", source: "Literature", formula: "SAPO-34", baselineActivity: 0.5, baselineSelectivity: 0.9, baselineStability: 0.68 },
  { name: "ZSM-5+Cu bifunction", source: "Literature", formula: "ZSM-5+Cu", baselineActivity: 0.62, baselineSelectivity: 0.77, baselineStability: 0.6 },
  { name: "Mo2C/WC carbide", source: "OCP", formula: "Mo2C/WC", baselineActivity: 0.71, baselineSelectivity: 0.73, baselineStability: 0.57 },
]

const ETHANOL_HYDROCARBON_KNOWN: KnownCandidate[] = [
  { name: "Ni/HZSM-5 dehyd", source: "Literature", formula: "Ni/HZSM-5", baselineActivity: 0.78, baselineSelectivity: 0.72, baselineStability: 0.64 },
  { name: "PtSn/Al2O3 C-C scission", source: "Literature", formula: "PtSn/Al2O3", baselineActivity: 0.72, baselineSelectivity: 0.8, baselineStability: 0.58 },
  { name: "Pd-In2O3 oxide", source: "OCP", formula: "Pd-In2O3", baselineActivity: 0.66, baselineSelectivity: 0.76, baselineStability: 0.55 },
  { name: "Cu-SSZ-13 DME route", source: "Materials_Project", formula: "Cu-SSZ-13", baselineActivity: 0.7, baselineSelectivity: 0.84, baselineStability: 0.62 },
  { name: "Cr2O3/SiO2 classic", source: "Literature", formula: "Cr2O3/SiO2", baselineActivity: 0.6, baselineSelectivity: 0.65, baselineStability: 0.52 },
  { name: "Ru/Al2O3 hydrogenolysis", source: "Literature", formula: "Ru/Al2O3", baselineActivity: 0.74, baselineSelectivity: 0.7, baselineStability: 0.6 },
  { name: "Ir/Ta2O5 interface", source: "OCP", formula: "Ir/Ta2O5", baselineActivity: 0.58, baselineSelectivity: 0.78, baselineStability: 0.54 },
  { name: "Re/SiO2 high dispersion", source: "Literature", formula: "Re/SiO2", baselineActivity: 0.55, baselineSelectivity: 0.62, baselineStability: 0.66 },
  { name: "WOx/ZrO2 acid-redox", source: "Materials_Project", formula: "WOx/ZrO2", baselineActivity: 0.63, baselineSelectivity: 0.74, baselineStability: 0.59 },
  { name: "Nb2O5/SiO2 oligomerization", source: "Literature", formula: "Nb2O5/SiO2", baselineActivity: 0.52, baselineSelectivity: 0.68, baselineStability: 0.57 },
  { name: "V2O5/TiO2 oxidative", source: "Literature", formula: "V2O5/TiO2", baselineActivity: 0.5, baselineSelectivity: 0.6, baselineStability: 0.5 },
  { name: "Fe-ZSM-5 MTO spillover", source: "Literature", formula: "Fe-ZSM-5", baselineActivity: 0.68, baselineSelectivity: 0.81, baselineStability: 0.63 },
  { name: "Co-ZSM-5 tandem", source: "Literature", formula: "Co-ZSM-5", baselineActivity: 0.64, baselineSelectivity: 0.77, baselineStability: 0.6 },
  { name: "H-ZSM-22 1-D channels", source: "Literature", formula: "H-ZSM-22", baselineActivity: 0.61, baselineSelectivity: 0.86, baselineStability: 0.65 },
  { name: "Pt/HZSM-5 aromatics", source: "Literature", formula: "Pt/HZSM-5", baselineActivity: 0.7, baselineSelectivity: 0.75, baselineStability: 0.58 },
]

const CELLULOSE_HYDROCARBON_KNOWN: KnownCandidate[] = [
  { name: "cellulase-Cel7B cocktail", source: "BRENDA", formula: "cellulase-Cel7B", smiles: "NCC(=O)O", baselineActivity: 0.62, baselineSelectivity: 0.7, baselineStability: 0.55 },
  { name: "endoglucanase-EG1", source: "BRENDA", formula: "endoglucanase-EG1", smiles: "NC(CO)C(=O)O", baselineActivity: 0.58, baselineSelectivity: 0.66, baselineStability: 0.52 },
  { name: "CBHII surface mutant", source: "BRENDA", formula: "CBHII-mutant", baselineActivity: 0.65, baselineSelectivity: 0.72, baselineStability: 0.48 },
  { name: "GH5-family blend", source: "BRENDA", formula: "GH5-family", baselineActivity: 0.55, baselineSelectivity: 0.64, baselineStability: 0.5 },
  { name: "laccase-LacA oxidative", source: "BRENDA", formula: "laccase-LacA", smiles: "c1cc(O)c(O)cc1", baselineActivity: 0.5, baselineSelectivity: 0.6, baselineStability: 0.45 },
  { name: "peroxygenase-AaeUPO", source: "BRENDA", formula: "peroxygenase-AaeUPO", baselineActivity: 0.6, baselineSelectivity: 0.68, baselineStability: 0.42 },
  { name: "fatty-acid-decarboxylase", source: "Literature", formula: "fatty-acid-decarboxylase", baselineActivity: 0.54, baselineSelectivity: 0.74, baselineStability: 0.58 },
  { name: "MoOx/C hydrodeoxy", source: "Literature", formula: "MoOx/C", baselineActivity: 0.7, baselineSelectivity: 0.62, baselineStability: 0.6 },
  { name: "Ni-W/AC sulfide", source: "Literature", formula: "Ni-W/AC", baselineActivity: 0.66, baselineSelectivity: 0.58, baselineStability: 0.55 },
  { name: "RuSn/C jet precursor", source: "Literature", formula: "RuSn/C", baselineActivity: 0.72, baselineSelectivity: 0.76, baselineStability: 0.57 },
  { name: "PtCo/N-C alloy", source: "Materials_Project", formula: "PtCo/N-C", baselineActivity: 0.68, baselineSelectivity: 0.8, baselineStability: 0.54 },
  { name: "HZSM-5 pyrolysis tandem", source: "Literature", formula: "HZSM-5", baselineActivity: 0.6, baselineSelectivity: 0.82, baselineStability: 0.7 },
  { name: "ZSM-5-acid glucose route", source: "Literature", formula: "ZSM-5-acid", baselineActivity: 0.57, baselineSelectivity: 0.78, baselineStability: 0.66 },
  { name: "NiMoS/Al2O3 HDO", source: "Literature", formula: "NiMoS/Al2O3", baselineActivity: 0.74, baselineSelectivity: 0.65, baselineStability: 0.62 },
  { name: "CoMo/Al2O3 legacy", source: "Literature", formula: "CoMo/Al2O3", baselineActivity: 0.69, baselineSelectivity: 0.63, baselineStability: 0.64 },
]

function pickTable(reactionType: ReactionType): KnownCandidate[] {
  switch (reactionType) {
    case "CO2_TO_METHANOL":
      return CO2_METHANOL_KNOWN
    case "ETHANOL_TO_HYDROCARBON":
      return ETHANOL_HYDROCARBON_KNOWN
    case "CELLULOSE_TO_HYDROCARBON":
    case "BIOMASS_TO_FUEL":
      return CELLULOSE_HYDROCARBON_KNOWN
    default:
      return CO2_METHANOL_KNOWN.slice(0, 10)
  }
}

function mockLookupKnownCandidates(reactionType: ReactionType, track: TrackType): KnownCandidate[] {
  const base = pickTable(reactionType)
  if (track === "SYNTHETIC_BIOLOGY") {
    return base.map((k) =>
      k.source === "Literature" || k.source === "OCP" || k.source === "Materials_Project"
        ? { ...k, source: "BRENDA" as const }
        : k
    )
  }
  return base.map((k) => ({ ...k }))
}

export async function lookupKnownCandidates(
  reactionType: ReactionType,
  track: TrackType
): Promise<KnownCandidate[]> {
  if (process.env.USE_MOCK_AI === "false") {
    throw new Error("Real AI not implemented yet — set USE_MOCK_AI=true")
  }
  return mockLookupKnownCandidates(reactionType, track)
}

const DOPANTS = ["V", "Nb", "Ta", "Mo", "W", "Re", "La", "Ce", "Zr", "Sn", "Ga", "In"]

function mockGenerateNovelCandidates(
  reactionType: ReactionType,
  knownPool: KnownCandidate[],
  count: number
): GeneratedCandidate[] {
  const out: GeneratedCandidate[] = []
  const pool = knownPool.length ? knownPool : pickTable(reactionType)
  for (let i = 0; i < count; i++) {
    const basis = pool[i % pool.length]
    const dop = DOPANTS[(i + hashSeed(basis.formula)) % DOPANTS.length]
    const name = `Modified ${basis.formula.split("/")[0] ?? basis.formula} (${dop}-doped V${i + 1})`
    const formula = `${basis.formula}+${dop}`
    const smiles = `C${"C".repeat((i % 4) + 1)}O`
    out.push({
      name,
      formula,
      smiles,
      basisCandidate: basis.name,
      variationDescription: `${dop} tunes intermediate binding vs ${basis.formula}; deterministic variant ${i + 1} for ${reactionType}.`,
    })
  }
  return out
}

export async function generateNovelCandidates(
  reactionType: ReactionType,
  knownPool: KnownCandidate[],
  count: number
): Promise<GeneratedCandidate[]> {
  if (process.env.USE_MOCK_AI === "false") {
    throw new Error("Real AI not implemented yet — set USE_MOCK_AI=true")
  }
  return mockGenerateNovelCandidates(reactionType, knownPool, count)
}

function mockPredictProperties(
  candidate: { formula: string; smiles?: string },
  reactionType: ReactionType
): {
  activity: number
  selectivity: number
  stability: number
  yield: number
  confidence: number
  rationale: Record<string, string>
} {
  const seed = hashSeed(`${candidate.formula}|${reactionType}|${candidate.smiles ?? ""}`)
  const a = 0.3 + 0.65 * unitFloat(seed, 1)
  const s = 0.4 + 0.58 * unitFloat(seed, 2)
  const st = 0.2 + 0.7 * unitFloat(seed, 3)
  const y = 35 + 55 * unitFloat(seed, 4)
  const c = 0.55 + 0.44 * unitFloat(seed, 5)
  const hasMetal = /Cu|Pd|Pt|Ni|Ru|Rh|Ir|Mo|W|Re|Zn|Ga|In|Fe|Co|Cr|Ag/.test(candidate.formula)
  const rationale: Record<string, string> = {
    activity: hasMetal
      ? "Mock model: d-band center proxy suggests moderate CO/alkoxide activation."
      : "Mock model: acid-site density dominates turnover without strong metal function.",
    selectivity:
      unitFloat(seed, 6) > 0.5
        ? "Micropore confinement (zeolite-like) improves product shape selectivity in mock scoring."
        : "Bimetallic interface reduces side hydrogenolysis in mock pathway graph.",
    stability: "Sintering resistance inferred from support oxide and Tammann proxy (mock).",
    yield: "Single-pass yield estimated from activity × selectivity with recycle factor 0.82 (mock).",
  }
  return { activity: a, selectivity: s, stability: st, yield: y, confidence: c, rationale }
}

export async function predictProperties(
  candidate: { formula: string; smiles?: string },
  reactionType: ReactionType
): Promise<{
  activity: number
  selectivity: number
  stability: number
  yield: number
  confidence: number
  rationale: Record<string, string>
}> {
  if (process.env.USE_MOCK_AI === "false") {
    throw new Error("Real AI not implemented yet — set USE_MOCK_AI=true")
  }
  return mockPredictProperties(candidate, reactionType)
}
