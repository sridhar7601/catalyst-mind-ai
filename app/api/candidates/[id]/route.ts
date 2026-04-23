import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      reaction: true,
      experiments: { orderBy: { loggedAt: "desc" } },
    },
  })
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 })

  let propertyRationale: Record<string, string> = {}
  try {
    propertyRationale = JSON.parse(candidate.propertyRationale) as Record<string, string>
  } catch {
    propertyRationale = {}
  }

  return NextResponse.json({
    ...candidate,
    propertyRationale,
  })
}
