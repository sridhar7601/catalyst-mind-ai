import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
const ORIGINS = ["DATABASE_LOOKUP", "GENERATIVE_AI", "HYBRID"] as const

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const { searchParams } = new URL(req.url)
  const origin = searchParams.get("origin")
  const minActivity = searchParams.get("minActivity")

  const where: {
    reactionId: string
    origin?: string
    predictedActivity?: { gte: number }
  } = { reactionId: id }

  if (origin && (ORIGINS as readonly string[]).includes(origin)) {
    where.origin = origin
  }
  if (minActivity != null && minActivity !== "") {
    const v = Number(minActivity)
    if (!Number.isNaN(v)) where.predictedActivity = { gte: v }
  }

  const items = await prisma.candidate.findMany({
    where,
    orderBy: { predictedActivity: "desc" },
  })

  const ranked = items.map((c, i) => ({ ...c, rank: i + 1 }))
  return NextResponse.json({ total: ranked.length, items: ranked })
}
