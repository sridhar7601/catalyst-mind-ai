import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const versions = await prisma.modelVersion.findMany({
    orderBy: { trainedAt: "desc" },
  })
  return NextResponse.json({ total: versions.length, items: versions })
}
