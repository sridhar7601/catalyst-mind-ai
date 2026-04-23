"use client"

import { ScatterChart } from "@tremor/react"

export type ScatterRow = {
  name: string
  selectivity: number
  activity: number
  stability: number
  yield: number
  dotSize: number
  originLabel: string
}

export function DashboardScatter({ data }: { data: ScatterRow[] }) {
  if (!data.length) {
    return <p className="text-sm text-muted-foreground">Run seed to populate the scatter plot.</p>
  }
  return (
    <ScatterChart
      className="h-96"
      data={data}
      category="originLabel"
      x="selectivity"
      y="activity"
      size="dotSize"
      showOpacity
      minXValue={0}
      maxXValue={1}
      minYValue={0}
      maxYValue={1}
      valueFormatter={{
        x: (v) => `${(Number(v) * 100).toFixed(0)}% sel.`,
        y: (v) => `${(Number(v) * 100).toFixed(0)}% act.`,
      }}
      xAxisLabel="Selectivity (mock)"
      yAxisLabel="Activity (mock)"
    />
  )
}
