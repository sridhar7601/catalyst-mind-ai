import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { explainCandidate } from "@/lib/llm-narration"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const cand = await prisma.candidate.findUnique({
    where: { id },
    include: { reaction: { select: { reactionType: true, name: true } } },
  })
  if (!cand) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 })
  }

  const text = await explainCandidate({
    reactionType: cand.reaction.reactionType,
    reactionName: cand.reaction.name,
    candidateName: cand.name,
    formula: cand.formula ?? "",
    origin: cand.origin,
    source: cand.source ?? undefined,
    predictedActivity: cand.predictedActivity,
    predictedSelectivity: cand.predictedSelectivity,
    predictedStability: cand.predictedStability,
    predictedYield: cand.predictedYield,
    confidence: cand.confidence,
  })

  return NextResponse.json({
    candidateId: cand.id,
    name: cand.name,
    formula: cand.formula,
    ai_rationale: text,
    confidence: cand.confidence,
  })
}
