import Link from "next/link"
import { prisma } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function ReactionsPage() {
  const reactions = await prisma.reaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { candidates: true, experiments: true } },
      candidates: { select: { predictedActivity: true, predictedSelectivity: true } },
      experiments: { orderBy: { loggedAt: "desc" }, take: 1, select: { loggedAt: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reactions</h1>
          <p className="text-muted-foreground text-sm">Workbench entries with discovery and experiment counts.</p>
        </div>
        <Link
          href="/reactions/new"
          className={cn(buttonVariants(), "bg-violet-600 text-white hover:bg-violet-700")}
        >
          New reaction
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reactions.map((r) => {
          const bestAct = r.candidates.length ? Math.max(...r.candidates.map((c) => c.predictedActivity)) : null
          const bestSel = r.candidates.length ? Math.max(...r.candidates.map((c) => c.predictedSelectivity)) : null
          return (
            <Card key={r.id}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <CardTitle className="text-lg">{r.name}</CardTitle>
                  <Badge variant="outline">{r.track.replace(/_/g, " ")}</Badge>
                </div>
                <CardDescription>{r.reactionType.replace(/_/g, " ")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex flex-wrap gap-4 text-muted-foreground">
                  <span>{r._count.candidates} candidates</span>
                  <span>{r._count.experiments} experiments</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  <span>Best activity: {bestAct != null ? bestAct.toFixed(2) : "—"}</span>
                  <span>Best selectivity: {bestSel != null ? bestSel.toFixed(2) : "—"}</span>
                </div>
                <p className="text-muted-foreground text-xs">
                  Last experiment:{" "}
                  {r.experiments[0]?.loggedAt ? r.experiments[0].loggedAt.toLocaleString() : "—"}
                </p>
                <Link
                  href={`/reactions/${r.id}`}
                  className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
                >
                  Open workbench
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
