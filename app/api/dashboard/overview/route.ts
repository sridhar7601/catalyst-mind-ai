import { NextResponse } from "next/server"
import { getDashboardOverview } from "@/lib/dashboard-queries"

export async function GET() {
  const data = await getDashboardOverview()
  return NextResponse.json(data)
}
