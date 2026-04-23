import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { ReactionWorkbench } from "@/components/reaction-workbench"

export const dynamic = "force-dynamic"

export default async function ReactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const reaction = await prisma.reaction.findUnique({
    where: { id },
    include: {
      candidates: { orderBy: { predictedActivity: "desc" } },
      experiments: {
        orderBy: { loggedAt: "desc" },
        include: { candidate: { select: { id: true, name: true } } },
      },
    },
  })
  if (!reaction) notFound()

  const payload = JSON.parse(JSON.stringify(reaction)) as Parameters<typeof ReactionWorkbench>[0]["reaction"]
  return <ReactionWorkbench reaction={payload} />
}
