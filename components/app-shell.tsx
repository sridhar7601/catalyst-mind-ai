"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FlaskConical, LayoutDashboard, Layers, Cpu } from "lucide-react"

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/reactions", label: "Reactions", icon: Layers },
  { href: "/models", label: "Models", icon: Cpu },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-sm shadow-violet-500/30">
              <FlaskConical className="size-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold leading-tight text-foreground">CatalystMind AI</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                GPS Renewables · Molecular Discovery
              </div>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            {nav.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={
                    active
                      ? "flex items-center gap-1.5 rounded-lg bg-violet-500 px-3 py-2 text-sm font-semibold text-white shadow-sm"
                      : "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  }
                >
                  <Icon className="size-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              )
            })}
          </nav>
          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 lg:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-emerald-700">Live</span>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>
    </div>
  )
}
