import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { computeExperimentOutcome } from "@/lib/experiment-utils"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const candidateId = searchParams.get("candidateId")
  const where = candidateId ? { candidateId } : {}
  const items = await prisma.experiment.findMany({
    where,
    orderBy: { loggedAt: "desc" },
    include: { candidate: { select: { name: true } } },
  })
  return NextResponse.json({ total: items.length, items })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body?.candidateId || !body?.loggedBy) {
    return NextResponse.json({ error: "candidateId and loggedBy required" }, { status: 400 })
  }

  const candidate = await prisma.candidate.findUnique({
    where: { id: String(body.candidateId) },
  })
  if (!candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 })

  const predicted = {
    activity: candidate.predictedActivity,
    selectivity: candidate.predictedSelectivity,
    stability: candidate.predictedStability,
    yield: candidate.predictedYield,
  }

  const measured = {
    measuredActivity: body.measuredActivity != null ? Number(body.measuredActivity) : null,
    measuredSelectivity: body.measuredSelectivity != null ? Number(body.measuredSelectivity) : null,
    measuredStability: body.measuredStability != null ? Number(body.measuredStability) : null,
    measuredYield: body.measuredYield != null ? Number(body.measuredYield) : null,
  }

  const { outcome, discrepancy } = computeExperimentOutcome(predicted, measured)

  const exp = await prisma.experiment.create({
    data: {
      candidateId: candidate.id,
      reactionId: candidate.reactionId,
      measuredActivity: measured.measuredActivity,
      measuredSelectivity: measured.measuredSelectivity,
      measuredStability: measured.measuredStability,
      measuredYield: measured.measuredYield,
      outcome,
      notes: body.notes != null ? String(body.notes) : null,
      loggedBy: String(body.loggedBy),
    },
  })

  return NextResponse.json({ ...exp, discrepancy })
}
