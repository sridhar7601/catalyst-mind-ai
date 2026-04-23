import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const reaction = await prisma.reaction.findUnique({
    where: { id },
    include: {
      candidates: {
        orderBy: { predictedActivity: "desc" },
      },
      experiments: {
        orderBy: { loggedAt: "desc" },
        include: { candidate: { select: { id: true, name: true } } },
      },
    },
  })
  if (!reaction) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const ranked = reaction.candidates.map((c, i) => ({
    ...c,
    rank: i + 1,
  }))

  return NextResponse.json({
    ...reaction,
    candidates: ranked,
  })
}
