import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { getDashboardOverview } from "@/lib/dashboard-queries"
import { DashboardScatter } from "@/components/dashboard-scatter"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const d = await getDashboardOverview()
  const scatterRows = d.scatter.map((r) => ({
    name: r.name,
    selectivity: r.selectivity,
    activity: r.activity,
    stability: r.stability,
    yield: r.yield,
    dotSize: r.dotSize,
    originLabel: r.originLabel,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-violet-950 dark:text-violet-100">
            Research dashboard
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
            CatalystMind AI — discover, predict, and learn from catalysts and enzymes for sustainable fuels.
          </p>
        </div>
        <Link
          href="/reactions/new"
          className={cn(buttonVariants(), "bg-violet-600 text-white hover:bg-violet-700")}
        >
          New reaction
        </Link>
      </div>

      {d.briefing ? (
        <div className="rounded-xl border-l-4 border-l-indigo-500 border bg-gradient-to-br from-indigo-50/60 to-white p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-semibold text-indigo-700">AI Research Briefing</span>
            <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              Azure GPT-4.1
            </span>
            <span className="ml-auto text-xs text-muted-foreground">
              {d.novelCandidates} novel · {d.beatPredictions} beat · {d.underperformers} under
            </span>
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-stone-700">{d.briefing}</p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Reactions tracked", value: (d.reactionsTracked ?? 0).toLocaleString(), sub: null },
          { label: "Candidates generated", value: (d.candidatesGenerated ?? 0).toLocaleString(), sub: null },
          { label: "Experiments logged", value: (d.experimentsLogged ?? 0).toLocaleString(), sub: null },
          {
            label: "Model accuracy (mock)",
            value: d.modelAccuracy != null ? d.modelAccuracy.toFixed(2) : "—",
            sub: d.modelVersion ?? null,
          },
        ].map((m) => (
          <Card key={m.label}>
            <CardHeader className="pb-2">
              <CardDescription>{m.label}</CardDescription>
              <CardTitle className="text-3xl font-semibold tabular-nums">{m.value}</CardTitle>
              {m.sub ? <p className="text-muted-foreground text-xs">{m.sub}</p> : null}
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity × selectivity (top 50 candidates)</CardTitle>
          <CardDescription>Across all reactions — size reflects stability; color separates database vs generative.</CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardScatter data={scatterRows} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent experiments</CardTitle>
          <CardDescription>Last 12 runs logged this week (demo clock).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {d.recentExperiments.length === 0 ? (
            <p className="text-muted-foreground text-sm">No experiments yet. Seed the demo database.</p>
          ) : (
            d.recentExperiments.map((e) => (
              <div
                key={e.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card/50 px-3 py-2"
              >
                <span className="text-sm font-medium">{e.candidateName}</span>
                <div className="flex items-center gap-2">
                  {e.outcome ? (
                    <Badge variant={e.outcome === "BEAT_PREDICTION" ? "default" : "secondary"}>{e.outcome.replace(/_/g, " ")}</Badge>
                  ) : null}
                  <span className="text-muted-foreground text-xs">{new Date(e.loggedAt).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
