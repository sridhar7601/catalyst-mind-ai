"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MoleculeViewer } from "@/components/molecule-viewer"

type Props = {
  open: boolean
  onOpenChange: (o: boolean) => void
  title: string
  smiles: string
}

export function MoleculeViewerDialog({ open, onOpenChange, title, smiles }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <MoleculeViewer smiles={smiles} className="min-h-[400px] w-full rounded-lg border bg-white" />
      </DialogContent>
    </Dialog>
  )
}
