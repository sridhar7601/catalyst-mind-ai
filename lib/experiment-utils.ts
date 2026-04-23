import type { ExperimentOutcome } from "@/lib/enums"

export function computeExperimentOutcome(
  predicted: { activity: number; selectivity: number; stability: number; yield: number },
  measured: {
    measuredActivity?: number | null
    measuredSelectivity?: number | null
    measuredStability?: number | null
    measuredYield?: number | null
  }
): { outcome: ExperimentOutcome | null; discrepancy: boolean } {
  const pairs: [number, number][] = []
  if (measured.measuredActivity != null) pairs.push([predicted.activity, measured.measuredActivity])
  if (measured.measuredSelectivity != null) pairs.push([predicted.selectivity, measured.measuredSelectivity])
  if (measured.measuredStability != null) pairs.push([predicted.stability, measured.measuredStability])
  if (measured.measuredYield != null) pairs.push([predicted.yield / 100, measured.measuredYield / 100])

  if (pairs.length === 0) return { outcome: null, discrepancy: false }

  let maxDelta = 0
  let sumPred = 0
  let sumMeas = 0
  for (const [p, m] of pairs) {
    sumPred += p
    sumMeas += m
    maxDelta = Math.max(maxDelta, Math.abs(m - p))
  }
  const discrepancy = maxDelta > 0.2
  const avgDelta = sumMeas / pairs.length - sumPred / pairs.length

  let outcome: ExperimentOutcome
  if (avgDelta > 0.08) outcome = "BEAT_PREDICTION"
  else if (avgDelta < -0.08) outcome = "UNDERPERFORMED"
  else if (Math.abs(avgDelta) <= 0.08) outcome = "MATCHED"
  else outcome = "INCONCLUSIVE"

  return { outcome, discrepancy }
}
