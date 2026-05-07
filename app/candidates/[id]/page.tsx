import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoleculeViewer } from "@/components/molecule-viewer"
import { resolveDemoSmiles } from "@/lib/molecular"
import { explainCandidate } from "@/lib/llm-narration"

export const dynamic = "force-dynamic"

export default async function CandidatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const c = await prisma.candidate.findUnique({
    where: { id },
    include: {
      reaction: { select: { id: true, name: true, reactionType: true } },
      experiments: { orderBy: { loggedAt: "desc" } },
    },
  })
  if (!c) notFound()

  let rationale: Record<string, string> = {}
  try {
    rationale = JSON.parse(c.propertyRationale) as Record<string, string>
  } catch {
    rationale = {}
  }

  const smiles = resolveDemoSmiles(c.formula ?? "", c.smiles)

  const aiRationale = await explainCandidate({
    reactionType: c.reaction.reactionType,
    reactionName: c.reaction.name,
    candidateName: c.name,
    formula: c.formula ?? "",
    origin: c.origin,
    source: c.source ?? undefined,
    predictedActivity: c.predictedActivity,
    predictedSelectivity: c.predictedSelectivity,
    predictedStability: c.predictedStability,
    predictedYield: c.predictedYield,
    confidence: c.confidence,
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/reactions/${c.reaction.id}`} className={cn(buttonVariants({ variant: "ghost" }))}>
          ← Workbench
        </Link>
        <Link
          href={`/reactions/${c.reaction.id}#experiments`}
          className={cn(buttonVariants({ variant: "secondary" }))}
        >
          Flag for experiment
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold">{c.name}</h1>
        <p className="text-muted-foreground text-sm">
          {c.reaction.name} · <OriginBadge origin={c.origin} />
        </p>
      </div>

      <div className="rounded-xl border-l-4 border-l-indigo-500 border bg-gradient-to-br from-indigo-50/60 to-white p-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-sm font-semibold text-indigo-700">AI Rationale</span>
          <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            Azure GPT-4.1
          </span>
          <span className="ml-auto text-xs text-muted-foreground">
            confidence {(c.confidence * 100).toFixed(0)}%
          </span>
        </div>
        <p className="text-sm leading-relaxed text-stone-700">{aiRationale}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>3D structure (SMILES)</CardTitle>
            <CardDescription>3Dmol.js viewer — demo SMILES resolved from formula when needed.</CardDescription>
          </CardHeader>
          <CardContent>
            <MoleculeViewer smiles={smiles} />
            <p className="text-muted-foreground mt-2 font-mono text-xs">{smiles}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Predicted performance</CardTitle>
            <CardDescription>Mock model outputs with confidence.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <MetricRow label="Activity" value={c.predictedActivity} />
            <MetricRow label="Selectivity" value={c.predictedSelectivity} />
            <MetricRow label="Stability" value={c.predictedStability} />
            <div className="flex justify-between border-b py-1">
              <span className="text-muted-foreground">Yield %</span>
              <span className="font-medium">{c.predictedYield.toFixed(1)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Confidence</span>
              <span className="font-medium">{(c.confidence * 100).toFixed(0)}%</span>
            </div>
            <p className="text-muted-foreground pt-2">{c.reasoning}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">Property rationale</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(rationale).map(([k, v]) => (
            <Card key={k}>
              <CardHeader className="py-3">
                <CardTitle className="text-base capitalize">{k}</CardTitle>
                <CardDescription>{v}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Experiments on this candidate</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Outcome</TableHead>
                <TableHead>Yield meas.</TableHead>
                <TableHead>Activity meas.</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {c.experiments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No experiments yet.
                  </TableCell>
                </TableRow>
              ) : (
                c.experiments.map((ex) => (
                  <TableRow key={ex.id}>
                    <TableCell>
                      {ex.outcome ? <Badge variant="secondary">{ex.outcome.replace(/_/g, " ")}</Badge> : "—"}
                    </TableCell>
                    <TableCell>{ex.measuredYield != null ? ex.measuredYield.toFixed(1) : "—"}</TableCell>
                    <TableCell>{ex.measuredActivity != null ? ex.measuredActivity.toFixed(2) : "—"}</TableCell>
                    <TableCell className="max-w-[220px] truncate">{ex.notes}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {ex.loggedAt.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between border-b py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value.toFixed(2)}</span>
    </div>
  )
}

function OriginBadge({ origin }: { origin: string }) {
  if (origin === "GENERATIVE_AI") return <Badge className="bg-violet-600">Generated</Badge>
  if (origin === "HYBRID") return <Badge variant="secondary">Hybrid</Badge>
  return <Badge variant="outline">Database</Badge>
}
