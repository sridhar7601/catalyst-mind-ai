import { prisma } from "@/lib/db"
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

export const dynamic = "force-dynamic"

export default async function ModelsPage() {
  const versions = await prisma.modelVersion.findMany({ orderBy: { trainedAt: "desc" } })
  const active = versions.find((v) => v.active)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Model history</h1>
        <p className="text-muted-foreground text-sm">Mock retrain bumps accuracy as experiments accumulate.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current accuracy (active checkpoint)</CardTitle>
          <CardDescription>
            {active
              ? `${active.versionTag} — ${active.accuracyMetric.toFixed(2)} on ${active.experimentsUsed} experiments`
              : "No active version — run retrain from a reaction workbench."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {active ? (
            <p className="text-4xl font-semibold tabular-nums text-violet-700 dark:text-violet-300">
              {(active.accuracyMetric * 100).toFixed(1)}%
            </p>
          ) : (
            <p className="text-muted-foreground">—</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Versions</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag</TableHead>
                <TableHead>Trained</TableHead>
                <TableHead>Experiments used</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.versionTag}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm">{v.trainedAt.toLocaleString()}</TableCell>
                  <TableCell>{v.experimentsUsed}</TableCell>
                  <TableCell>{v.accuracyMetric.toFixed(3)}</TableCell>
                  <TableCell>{v.active ? <Badge>active</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{v.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
