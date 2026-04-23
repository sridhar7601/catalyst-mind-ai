import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/** Mock SDF/CSV export payload for demo. */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const c = await prisma.candidate.findUnique({ where: { id } })
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const csv = `name,formula,smiles,predictedActivity,predictedSelectivity,predictedYield\n${csvEscape(c.name)},${csvEscape(c.formula ?? "")},${csvEscape(c.smiles ?? "")},${c.predictedActivity},${c.predictedSelectivity},${c.predictedYield}\n`
  const sdf = `CatalystMind AI mock export\n> <${c.name}>\n${c.smiles ?? ""}\n$$$$\n`

  return NextResponse.json({
    format: "bundle",
    csv,
    sdf,
    note: "Stub export — production would stream binary SDF / attach provenance.",
  })
}

function csvEscape(s: string) {
  if (s.includes(",") || s.includes('"')) return `"${s.replace(/"/g, '""')}"`
  return s
}
