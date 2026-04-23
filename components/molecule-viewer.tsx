"use client"

import { useEffect, useRef } from "react"

type Props = { smiles: string; className?: string }

export function MoleculeViewer({ smiles, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el || !smiles) return
    let cancelled = false

    void (async () => {
      const mod = await import("3dmol")
      if (cancelled || !containerRef.current) return
      const createViewer = mod.createViewer
      containerRef.current.innerHTML = ""
      const viewer = createViewer(containerRef.current, { backgroundColor: "#faf5ff" })
      try {
        viewer.addModel(smiles, "smi")
        viewer.setStyle({}, { stick: { radius: 0.12 }, sphere: { scale: 0.22 } })
        viewer.zoomTo()
        viewer.render()
      } catch {
        viewer.addLabel("SMILES parse demo — showing placeholder", { position: { x: 0, y: 0, z: 0 }, fontSize: 12 })
        viewer.render()
      }
    })()

    return () => {
      cancelled = true
      el.innerHTML = ""
    }
  }, [smiles])

  return <div ref={containerRef} className={className ?? "min-h-[320px] w-full rounded-lg border bg-white"} />
}
