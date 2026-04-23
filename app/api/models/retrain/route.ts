import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST() {
  const count = await prisma.experiment.count()
  await prisma.modelVersion.updateMany({ data: { active: false } })

  const last = await prisma.modelVersion.findFirst({ orderBy: { trainedAt: "desc" } })
  const nextTag = bumpVersion(last?.versionTag ?? "v0.9")
  const baseAcc = last?.accuracyMetric ?? 0.78
  const bump = Math.min(0.05, 0.01 + count * 0.001)
  const accuracy = Math.min(0.95, baseAcc + bump)

  const mv = await prisma.modelVersion.create({
    data: {
      versionTag: nextTag,
      experimentsUsed: count,
      accuracyMetric: accuracy,
      notes: `Mock retrain on ${count} experiments (deterministic demo).`,
      active: true,
    },
  })

  return NextResponse.json({
    version: mv,
    message: `Retrained on ${count} experiments · new accuracy ${accuracy.toFixed(2)} · ${nextTag}`,
  })
}

function bumpVersion(tag: string): string {
  const m = /^v(\d+)\.(\d+)$/.exec(tag)
  if (!m) return "v1.0"
  const major = Number(m[1])
  const minor = Number(m[2]) + 1
  return `v${major}.${minor}`
}
