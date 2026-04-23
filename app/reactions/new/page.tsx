"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { REACTION_TYPE_VALUES, TRACK_TYPE_VALUES } from "@/lib/enums"

const LABELS: Record<string, string> = {
  CO2_TO_METHANOL: "CO₂ → methanol",
  SYNGAS_TO_ETHANOL: "Syngas → ethanol",
  ETHANOL_TO_HYDROCARBON: "Ethanol → hydrocarbon",
  BIOMASS_TO_FUEL: "Biomass → fuel",
  CELLULOSE_TO_HYDROCARBON: "Cellulose → hydrocarbon",
  H2_PRODUCTION: "H₂ production",
  OTHER: "Other",
}

export default function NewReactionPage() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [reactionType, setReactionType] = useState<string>(REACTION_TYPE_VALUES[0]!)
  const [track, setTrack] = useState<string>(TRACK_TYPE_VALUES[0]!)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [targetYield, setTargetYield] = useState("")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          reactionType,
          track,
          targetYield: targetYield ? Number(targetYield) : undefined,
          createdBy: "Dr. Demo Researcher",
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.error ?? "Failed")
        return
      }
      const r = (await res.json()) as { id: string }
      router.push(`/reactions/${r.id}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link href="/reactions" className={cn(buttonVariants({ variant: "ghost" }), "-ml-2 w-fit")}>
        ← Back to reactions
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>New reaction</CardTitle>
          <CardDescription>Define a target pathway, then run discovery from the workbench.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label>Reaction type</Label>
              <Select value={reactionType} onValueChange={(v) => setReactionType(v ?? REACTION_TYPE_VALUES[0]!)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REACTION_TYPE_VALUES.map((v) => (
                    <SelectItem key={v} value={v}>
                      {LABELS[v] ?? v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Track</Label>
              <div className="flex gap-4">
                {TRACK_TYPE_VALUES.map((t) => (
                  <label key={t} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input type="radio" name="track" checked={track === t} onChange={() => setTrack(t)} />
                    {t === "CATALYSIS" ? "Catalysis" : "Synthetic biology"}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Pilot name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ty">Target yield (%)</Label>
              <Input id="ty" type="number" value={targetYield} onChange={(e) => setTargetYield(e.target.value)} />
            </div>
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700" disabled={busy}>
              {busy ? "Saving…" : "Create reaction"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
