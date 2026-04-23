"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ScatterChart } from "@tremor/react"
import { toast } from "sonner"
import { ChevronDown, ChevronRight, Download, Loader2, Microscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { MoleculeViewerDialog } from "@/components/molecule-viewer-dialog"
import { resolveDemoSmiles } from "@/lib/molecular"
import Link from "next/link"

type CandidateRow = {
  id: string
  origin: string
  name: string
  formula: string | null
  smiles: string | null
  predictedActivity: number
  predictedSelectivity: number
  predictedStability: number
  predictedYield: number
  confidence: number
  reasoning: string
  propertyRationale: string
}

type ExperimentRow = {
  id: string
  candidateId: string
  measuredActivity: number | null
  measuredSelectivity: number | null
  measuredStability: number | null
  measuredYield: number | null
  outcome: string | null
  notes: string | null
  loggedBy: string
  loggedAt: string
  candidate: { name: string; id: string }
}

type ReactionPayload = {
  id: string
  name: string
  reactionType: string
  track: string
  discoveryCompleted: boolean
  candidates: CandidateRow[]
  experiments: ExperimentRow[]
}

export function ReactionWorkbench({ reaction: initial }: { reaction: ReactionPayload }) {
  const router = useRouter()
  const [reaction, setReaction] = useState(initial)
  const [tab, setTab] = useState("candidates")
  const [busy, setBusy] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [molOpen, setMolOpen] = useState(false)
  const [molSmiles, setMolSmiles] = useState("")
  const [molTitle, setMolTitle] = useState("")
  const [logOpen, setLogOpen] = useState(false)
  const [logCandidateId, setLogCandidateId] = useState<string>("")
  const [logFields, setLogFields] = useState({
    measuredActivity: "",
    measuredSelectivity: "",
    measuredStability: "",
    measuredYield: "",
    notes: "",
    loggedBy: "Dr. Demo Researcher",
  })

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#experiments") {
      setTab("experiments")
    }
  }, [])

  const scatterData = useMemo(
    () =>
      reaction.candidates.map((c) => ({
        name: c.name,
        selectivity: c.predictedSelectivity,
        activity: c.predictedActivity,
        stability: c.predictedStability,
        yield: c.predictedYield,
        dotSize: 120 + c.predictedStability * 880,
        originLabel: c.origin === "GENERATIVE_AI" ? "Novel (AI)" : "Known (DB)",
      })),
    [reaction.candidates]
  )

  async function refresh() {
    const res = await fetch(`/api/reactions/${reaction.id}`)
    if (!res.ok) return
    const data = (await res.json()) as ReactionPayload
    setReaction({
      id: data.id,
      name: data.name,
      reactionType: data.reactionType,
      track: data.track,
      discoveryCompleted: data.discoveryCompleted,
      candidates: data.candidates,
      experiments: data.experiments.map((e) => ({
        ...e,
        loggedAt: typeof e.loggedAt === "string" ? e.loggedAt : String(e.loggedAt),
      })),
    })
  }

  async function discover() {
    setBusy(true)
    try {
      const res = await fetch(`/api/reactions/${reaction.id}/discover`, { method: "POST" })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(body.error ?? "Discovery failed")
        return
      }
      toast.success(`Discovered ${body.databaseMatches} known + ${body.generatedCount} novel candidates`)
      await refresh()
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  async function retrain() {
    setBusy(true)
    try {
      const res = await fetch("/api/models/retrain", { method: "POST" })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error("Retrain failed")
        return
      }
      toast.message(body.message ?? "Model retrained")
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  async function submitExperiment() {
    if (!logCandidateId) {
      toast.error("Pick a candidate")
      return
    }
    const res = await fetch("/api/experiments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidateId: logCandidateId,
        measuredActivity: logFields.measuredActivity || undefined,
        measuredSelectivity: logFields.measuredSelectivity || undefined,
        measuredStability: logFields.measuredStability || undefined,
        measuredYield: logFields.measuredYield || undefined,
        notes: logFields.notes || undefined,
        loggedBy: logFields.loggedBy,
      }),
    })
    if (!res.ok) {
      toast.error("Could not log experiment")
      return
    }
    toast.success("Experiment logged")
    setLogOpen(false)
    await refresh()
    router.refresh()
  }

  async function exportCandidate(id: string) {
    const res = await fetch(`/api/candidates/${id}/export`, { method: "POST" })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) return
    toast.message("Export payload ready (mock CSV + SDF in response JSON)")
    console.info("export", body)
  }

  function open3d(c: CandidateRow) {
    const smi = resolveDemoSmiles(c.formula ?? "", c.smiles)
    setMolSmiles(smi)
    setMolTitle(c.name)
    setMolOpen(true)
  }

  return (
    <div className="space-y-6">
      <MoleculeViewerDialog open={molOpen} onOpenChange={setMolOpen} title={molTitle} smiles={molSmiles} />

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{reaction.name}</h1>
        <p className="text-muted-foreground text-sm">
          {reaction.reactionType.replace(/_/g, " ")} · {reaction.track.replace(/_/g, " ")}
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="plot">Performance Plot</TabsTrigger>
          <TabsTrigger value="experiments">Experiments</TabsTrigger>
          <TabsTrigger value="pathway">Pathway</TabsTrigger>
        </TabsList>

        <TabsContent value="candidates" className="space-y-4 pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={discover} disabled={reaction.discoveryCompleted || busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              Discover Candidates
            </Button>
            {reaction.discoveryCompleted ? (
              <Badge variant="secondary">Discovery complete</Badge>
            ) : (
              <span className="text-muted-foreground text-sm">Run discovery to populate ranked candidates.</span>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ranked candidates</CardTitle>
              <CardDescription>Sorted by predicted activity (mock model).</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead>Rank</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Formula</TableHead>
                    <TableHead>Act.</TableHead>
                    <TableHead>Sel.</TableHead>
                    <TableHead>Stab.</TableHead>
                    <TableHead>Yield %</TableHead>
                    <TableHead>Conf.</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reaction.candidates.flatMap((c, i) => {
                    const isOpen = expanded === c.id
                    let rationale: Record<string, string> = {}
                    try {
                      rationale = JSON.parse(c.propertyRationale) as Record<string, string>
                    } catch {
                      rationale = {}
                    }
                    const main = (
                      <TableRow key={c.id}>
                        <TableCell>
                          <Button variant="ghost" size="icon-sm" onClick={() => setExpanded(isOpen ? null : c.id)}>
                            {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                          </Button>
                        </TableCell>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell className="font-medium">
                          <Link className="text-primary hover:underline" href={`/candidates/${c.id}`}>
                            {c.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <OriginBadge origin={c.origin} />
                        </TableCell>
                        <TableCell className="max-w-[140px] truncate">{c.formula}</TableCell>
                        <TableCell>{c.predictedActivity.toFixed(2)}</TableCell>
                        <TableCell>{c.predictedSelectivity.toFixed(2)}</TableCell>
                        <TableCell>{c.predictedStability.toFixed(2)}</TableCell>
                        <TableCell>{c.predictedYield.toFixed(1)}</TableCell>
                        <TableCell className="min-w-[100px]">
                          <Progress value={c.confidence * 100} className="h-2" />
                        </TableCell>
                        <TableCell className="flex flex-wrap gap-1">
                          <Button variant="outline" size="sm" onClick={() => open3d(c)}>
                            <Microscope className="size-3.5" />
                            3D
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => exportCandidate(c.id)}>
                            <Download className="size-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                    if (!isOpen) return [main]
                    const detail = (
                      <TableRow key={`${c.id}-detail`}>
                        <TableCell colSpan={11} className="bg-muted/40">
                          <p className="text-sm font-medium">Reasoning</p>
                          <p className="text-muted-foreground mb-3 text-sm">{c.reasoning}</p>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {Object.entries(rationale).map(([k, v]) => (
                              <div key={k} className="rounded-md border bg-card p-2 text-sm">
                                <span className="font-medium capitalize">{k}</span>
                                <p className="text-muted-foreground">{v}</p>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                    return [main, detail]
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plot" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity vs selectivity</CardTitle>
              <CardDescription>Dot size encodes stability; color separates known vs novel designs.</CardDescription>
            </CardHeader>
            <CardContent>
              {scatterData.length ? (
                <ScatterChart
                  className="h-96"
                  data={scatterData}
                  category="originLabel"
                  x="selectivity"
                  y="activity"
                  size="dotSize"
                  showOpacity
                  minXValue={0}
                  maxXValue={1}
                  minYValue={0}
                  maxYValue={1}
                />
              ) : (
                <p className="text-muted-foreground text-sm">No candidates yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experiments" id="experiments" className="space-y-4 pt-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                setLogCandidateId(reaction.candidates[0]?.id ?? "")
                setLogOpen(true)
              }}
            >
              Log experiment
            </Button>
            <Button variant="secondary" onClick={retrain} disabled={busy}>
              Retrain model
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Experiment log</CardTitle>
              <CardDescription>Predicted vs measured deltas (demo).</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Δ Activity</TableHead>
                    <TableHead>Δ Yield %</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reaction.experiments.map((ex) => {
                    const cand = reaction.candidates.find((x) => x.id === ex.candidateId)
                    const dAct =
                      ex.measuredActivity != null && cand
                        ? ex.measuredActivity - cand.predictedActivity
                        : null
                    const dY =
                      ex.measuredYield != null && cand ? ex.measuredYield - cand.predictedYield : null
                    return (
                      <TableRow key={ex.id}>
                        <TableCell>{ex.candidate.name}</TableCell>
                        <TableCell>
                          {dAct != null ? (
                            <Badge variant={Math.abs(dAct) > 0.2 ? "destructive" : "secondary"}>
                              {dAct > 0 ? "+" : ""}
                              {dAct.toFixed(2)}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          {dY != null ? (
                            <Badge variant={Math.abs(dY) > 8 ? "outline" : "secondary"}>
                              {dY > 0 ? "+" : ""}
                              {dY.toFixed(1)}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          {ex.outcome ? <OutcomeBadge o={ex.outcome} /> : "—"}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{ex.notes}</TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {new Date(ex.loggedAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pathway" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Reaction energy sketch (static demo)</CardTitle>
              <CardDescription>
                Placeholder for future DFT / microkinetic coupling — shows staged free-energy narrative.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <svg viewBox="0 0 640 220" className="w-full max-w-3xl text-foreground">
                <defs>
                  <linearGradient id="g" x1="0" x2="1">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#c4b5fd" />
                  </linearGradient>
                </defs>
                <text x="20" y="24" className="fill-current text-sm font-medium">
                  CO₂ / biomass oxygenates → intermediates → hydrocarbon product (mock ΔG in eV)
                </text>
                {[0, 1, 2, 3].map((i) => {
                  const x = 80 + i * 160
                  const heights = [40, 100, 55, 30]
                  const labels = ["Reactants", "*CO / alkoxide", "C–C coupling", "Products"]
                  const dg = ["0.0", "+0.45", "+0.62", "−0.18"]
                  return (
                    <g key={i}>
                      <rect x={x} y={160 - heights[i]!} width="100" height={heights[i]!} rx="8" fill="url(#g)" opacity={0.85} />
                      <text x={x + 8} y={175} className="fill-white text-xs font-medium">
                        {labels[i]}
                      </text>
                      <text x={x + 8} y={200} className="fill-muted-foreground text-[11px]">
                        ΔG* {dg[i]} eV (mock)
                      </text>
                    </g>
                  )
                })}
                <path
                  d="M 130 120 Q 200 40 270 100 T 420 90 T 520 130"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  className="text-violet-500"
                />
              </svg>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log experiment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-2">
              <Label>Candidate</Label>
              <Select value={logCandidateId} onValueChange={(v) => setLogCandidateId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select candidate" />
                </SelectTrigger>
                <SelectContent>
                  {reaction.candidates.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Measured activity (0–1)</Label>
                <Input
                  value={logFields.measuredActivity}
                  onChange={(e) => setLogFields((f) => ({ ...f, measuredActivity: e.target.value }))}
                />
              </div>
              <div>
                <Label>Measured selectivity (0–1)</Label>
                <Input
                  value={logFields.measuredSelectivity}
                  onChange={(e) => setLogFields((f) => ({ ...f, measuredSelectivity: e.target.value }))}
                />
              </div>
              <div>
                <Label>Measured stability (0–1)</Label>
                <Input
                  value={logFields.measuredStability}
                  onChange={(e) => setLogFields((f) => ({ ...f, measuredStability: e.target.value }))}
                />
              </div>
              <div>
                <Label>Measured yield (%)</Label>
                <Input
                  value={logFields.measuredYield}
                  onChange={(e) => setLogFields((f) => ({ ...f, measuredYield: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Researcher</Label>
              <Input
                value={logFields.loggedBy}
                onChange={(e) => setLogFields((f) => ({ ...f, loggedBy: e.target.value }))}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={logFields.notes}
                onChange={(e) => setLogFields((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void submitExperiment()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function OriginBadge({ origin }: { origin: string }) {
  if (origin === "GENERATIVE_AI") return <Badge className="bg-violet-600">Generated</Badge>
  if (origin === "HYBRID") return <Badge variant="secondary">Hybrid</Badge>
  return <Badge variant="outline">Database</Badge>
}

function OutcomeBadge({ o }: { o: string }) {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    BEAT_PREDICTION: "default",
    MATCHED: "secondary",
    UNDERPERFORMED: "destructive",
    INCONCLUSIVE: "outline",
  }
  return <Badge variant={map[o] ?? "outline"}>{o.replace(/_/g, " ")}</Badge>
}
