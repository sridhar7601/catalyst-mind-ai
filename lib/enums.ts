export const ReactionType = {
  CO2_TO_METHANOL: "CO2_TO_METHANOL",
  SYNGAS_TO_ETHANOL: "SYNGAS_TO_ETHANOL",
  ETHANOL_TO_HYDROCARBON: "ETHANOL_TO_HYDROCARBON",
  BIOMASS_TO_FUEL: "BIOMASS_TO_FUEL",
  CELLULOSE_TO_HYDROCARBON: "CELLULOSE_TO_HYDROCARBON",
  H2_PRODUCTION: "H2_PRODUCTION",
  OTHER: "OTHER",
} as const
export type ReactionType = (typeof ReactionType)[keyof typeof ReactionType]

export const TrackType = {
  CATALYSIS: "CATALYSIS",
  SYNTHETIC_BIOLOGY: "SYNTHETIC_BIOLOGY",
} as const
export type TrackType = (typeof TrackType)[keyof typeof TrackType]

export const CandidateOrigin = {
  DATABASE_LOOKUP: "DATABASE_LOOKUP",
  GENERATIVE_AI: "GENERATIVE_AI",
  HYBRID: "HYBRID",
} as const
export type CandidateOrigin = (typeof CandidateOrigin)[keyof typeof CandidateOrigin]

export const ExperimentOutcome = {
  BEAT_PREDICTION: "BEAT_PREDICTION",
  MATCHED: "MATCHED",
  UNDERPERFORMED: "UNDERPERFORMED",
  INCONCLUSIVE: "INCONCLUSIVE",
} as const
export type ExperimentOutcome = (typeof ExperimentOutcome)[keyof typeof ExperimentOutcome]

export const REACTION_TYPE_VALUES = Object.values(ReactionType)
export const TRACK_TYPE_VALUES = Object.values(TrackType)
