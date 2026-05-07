import { subDays } from "date-fns"
import { prisma } from "@/lib/db"
import { generateDashboardBriefing } from "@/lib/llm-narration"

export async function getDashboardOverview() {
  const [
    reactionCount,
    candidateCount,
    novelCount,
    experimentCount,
    beatCount,
    underCount,
    activeModel,
    recentExperiments,
    topCandidates,
  ] = await Promise.all([
    prisma.reaction.count(),
    prisma.candidate.count(),
    prisma.candidate.count({ where: { origin: "GENERATIVE_AI" } }),
    prisma.experiment.count(),
    prisma.experiment.count({ where: { outcome: "BEAT_PREDICTION" } }),
    prisma.experiment.count({ where: { outcome: "UNDERPERFORMED" } }),
    prisma.modelVersion.findFirst({ where: { active: true }, orderBy: { trainedAt: "desc" } }),
    prisma.experiment.findMany({
      where: { loggedAt: { gte: subDays(new Date(), 7) } },
      orderBy: { loggedAt: "desc" },
      take: 12,
      include: { candidate: { select: { name: true } } },
    }),
    prisma.candidate.findMany({
      orderBy: { predictedActivity: "desc" },
      take: 50,
      include: { reaction: { select: { name: true, id: true, reactionType: true } } },
    }),
  ])

  const scatter = topCandidates.map((c) => ({
    id: c.id,
    name: c.name,
    reactionName: c.reaction.name,
    reactionId: c.reaction.id,
    activity: c.predictedActivity,
    selectivity: c.predictedSelectivity,
    stability: c.predictedStability,
    yield: c.predictedYield,
    dotSize: 120 + c.predictedStability * 880,
    origin: c.origin,
    originLabel: c.origin === "GENERATIVE_AI" ? "Novel (AI)" : "Known (DB)",
  }))

  const top = topCandidates[0]

  const briefing = await generateDashboardBriefing({
    reactionsTracked: reactionCount,
    candidatesGenerated: candidateCount,
    novelCandidates: novelCount,
    experimentsLogged: experimentCount,
    beatPredictions: beatCount,
    underperformers: underCount,
    modelAccuracy: activeModel?.accuracyMetric ?? 0,
    modelVersion: activeModel?.versionTag ?? "—",
    topReactionType: top?.reaction.reactionType,
    topCandidateName: top?.name,
    topCandidateActivity: top?.predictedActivity,
  })

  return {
    reactionsTracked: reactionCount,
    candidatesGenerated: candidateCount,
    novelCandidates: novelCount,
    experimentsLogged: experimentCount,
    beatPredictions: beatCount,
    underperformers: underCount,
    modelAccuracy: activeModel?.accuracyMetric ?? null,
    modelVersion: activeModel?.versionTag ?? null,
    briefing,
    scatter,
    recentExperiments: recentExperiments.map((e) => ({
      id: e.id,
      candidateName: e.candidate.name,
      outcome: e.outcome,
      loggedAt: e.loggedAt.toISOString(),
    })),
  }
}
