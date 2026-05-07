import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { describeReactionPathway } from "@/lib/llm-narration"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const reaction = await prisma.reaction.findUnique({
    where: { id },
    include: {
      candidates: {
        orderBy: { predictedActivity: "desc" },
        take: 3,
        select: { name: true, formula: true, predictedActivity: true },
      },
    },
  })
  if (!reaction) {
    return NextResponse.json({ error: "Reaction not found" }, { status: 404 })
  }

  const description = await describeReactionPathway({
    reactionType: reaction.reactionType,
    reactionName: reaction.name,
    trackType: reaction.track,
    topCandidates: reaction.candidates.map((c) => ({
      name: c.name,
      formula: c.formula ?? "",
      predictedActivity: c.predictedActivity,
    })),
  })

  // Synthesise an idealised energy / step diagram appropriate to track type
  const steps =
    reaction.track === "SYNTHETIC_BIOLOGY"
      ? [
          { label: "Substrate binding", deltaG: 0, kind: "reactant" },
          { label: "Enzyme–substrate complex", deltaG: -8, kind: "intermediate" },
          { label: "Transition state", deltaG: 64, kind: "ts" },
          { label: "Enzyme–product complex", deltaG: -22, kind: "intermediate" },
          { label: "Product release", deltaG: -38, kind: "product" },
        ]
      : [
          { label: "Reactants", deltaG: 0, kind: "reactant" },
          { label: "Surface adsorption", deltaG: -18, kind: "intermediate" },
          { label: "Transition state", deltaG: 92, kind: "ts" },
          { label: "Surface intermediate", deltaG: -12, kind: "intermediate" },
          { label: "Desorption / products", deltaG: -54, kind: "product" },
        ]

  return NextResponse.json({
    reactionId: reaction.id,
    reactionName: reaction.name,
    track: reaction.track,
    ai_description: description,
    pathway_steps: steps,
    top_candidates: reaction.candidates,
  })
}
