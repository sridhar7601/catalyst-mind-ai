import Link from "next/link"
import { FlaskConical, LayoutDashboard, Layers } from "lucide-react"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-8 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
            <FlaskConical className="size-6" />
            CatalystMind AI
          </Link>
          <nav className="flex flex-1 items-center gap-6 text-sm font-medium">
            <Link className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground" href="/">
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
            <Link className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground" href="/reactions">
              <Layers className="size-4" />
              Reactions
            </Link>
            <Link className="text-muted-foreground hover:text-foreground" href="/models">
              Models
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>
    </div>
  )
}
