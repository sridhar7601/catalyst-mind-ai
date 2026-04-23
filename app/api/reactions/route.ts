import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { REACTION_TYPE_VALUES, TRACK_TYPE_VALUES } from "@/lib/enums"

export async function GET() {
  const reactions = await prisma.reaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { candidates: true, experiments: true } },
      candidates: { select: { predictedActivity: true, predictedSelectivity: true } },
      experiments: { orderBy: { loggedAt: "desc" }, take: 1, select: { loggedAt: true } },
    },
  })

  const items = reactions.map((r) => {
    const bestAct = Math.max(0, ...r.candidates.map((c) => c.predictedActivity))
    const bestSel = Math.max(0, ...r.candidates.map((c) => c.predictedSelectivity))
    return {
      id: r.id,
      reactionType: r.reactionType,
      track: r.track,
      name: r.name,
      description: r.description,
      targetYield: r.targetYield,
      createdBy: r.createdBy,
      createdAt: r.createdAt.toISOString(),
      discoveryCompleted: r.discoveryCompleted,
      candidateCount: r._count.candidates,
      experimentCount: r._count.experiments,
      bestActivity: r.candidates.length ? bestAct : null,
      bestSelectivity: r.candidates.length ? bestSel : null,
      lastExperimentAt: r.experiments[0]?.loggedAt?.toISOString() ?? null,
    }
  })

  return NextResponse.json({ total: items.length, reactions: items })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body?.name || !body?.reactionType || !body?.createdBy) {
    return NextResponse.json({ error: "name, reactionType, createdBy required" }, { status: 400 })
  }
  if (!REACTION_TYPE_VALUES.includes(body.reactionType)) {
    return NextResponse.json({ error: "invalid reactionType" }, { status: 400 })
  }
  const track = body.track ?? "CATALYSIS"
  if (!TRACK_TYPE_VALUES.includes(track)) {
    return NextResponse.json({ error: "invalid track" }, { status: 400 })
  }

  const reaction = await prisma.reaction.create({
    data: {
      name: String(body.name),
      description: body.description != null ? String(body.description) : null,
      reactionType: String(body.reactionType),
      track: String(track),
      targetYield: body.targetYield != null ? Number(body.targetYield) : null,
      createdBy: String(body.createdBy),
    },
  })

  return NextResponse.json(reaction)
}
