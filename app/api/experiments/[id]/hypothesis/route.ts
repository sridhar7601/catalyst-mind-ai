import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { explainExperimentOutcome } from "@/lib/llm-narration"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const exp = await prisma.experiment.findUnique({
    where: { id },
    include: {
      candidate: true,
      reaction: { select: { name: true } },
    },
  })
  if (!exp) {
    return NextResponse.json({ error: "Experiment not found" }, { status: 404 })
  }

  const text = await explainExperimentOutcome({
    candidateName: exp.candidate.name,
    formula: exp.candidate.formula ?? "",
    reactionName: exp.reaction.name,
    predictedActivity: exp.candidate.predictedActivity,
    predictedSelectivity: exp.candidate.predictedSelectivity,
    predictedStability: exp.candidate.predictedStability,
    predictedYield: exp.candidate.predictedYield,
    measuredActivity: exp.measuredActivity,
    measuredSelectivity: exp.measuredSelectivity,
    measuredStability: exp.measuredStability,
    measuredYield: exp.measuredYield,
    outcome: exp.outcome,
    notes: exp.notes ?? undefined,
  })

  return NextResponse.json({
    experimentId: exp.id,
    outcome: exp.outcome,
    ai_hypothesis: text,
  })
}
