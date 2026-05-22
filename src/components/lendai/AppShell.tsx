import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Workflow,
  SlidersHorizontal,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/process", label: "Process Application", icon: Workflow },
  { to: "/sandbox", label: "Underwriting Sandbox", icon: SlidersHorizontal },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border relative">
        <div className="px-6 pt-7 pb-6 flex items-center gap-3">
          <div
            className="size-10 rounded-2xl grid place-items-center text-sidebar-primary-foreground shadow-[var(--shadow-accent)]"
            style={{ backgroundImage: "var(--gradient-primary)" }}
          >
            <Sparkles className="size-4" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <div className="font-display font-semibold text-[17px] tracking-tight">
              LendAI
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/55 mt-0.5">
              Agentic Lending
            </div>
          </div>
        </div>

        <div className="px-6 pt-2 pb-2 text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/40">
          Workspace
        </div>

        <nav className="px-3 space-y-0.5">
          {nav.map((n) => {
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/65 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-accent" />
                )}
                <n.icon className="size-4" />
                <span className="font-medium">{n.label}</span>
                {active && (
                  <span className="ml-auto size-1.5 rounded-full bg-accent shadow-[0_0_12px] shadow-accent/70" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-4">
          <div className="relative overflow-hidden rounded-2xl border border-sidebar-border p-4 bg-gradient-to-br from-sidebar-accent/60 to-transparent">
            <div className="absolute -top-12 -right-12 size-32 rounded-full bg-accent/15 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/70 font-semibold">
                  v0.9 Prototype
                </span>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-sidebar-foreground/65">
                All agent outputs are simulated. No real credit data is fetched.
              </p>
              <a
                href="https://lovable.dev"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:text-accent/80 transition-colors"
              >
                Read docs <ArrowUpRight className="size-3" />
              </a>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-sidebar-border bg-sidebar text-sidebar-foreground">
          <div className="flex items-center gap-2">
            <div
              className="size-8 rounded-xl grid place-items-center"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              <Sparkles className="size-3.5 text-sidebar-primary-foreground" />
            </div>
            <span className="font-display font-semibold">LendAI</span>
          </div>
          <div className="flex gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "px-2.5 py-1.5 rounded-md text-xs",
                  pathname === n.to
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70",
                )}
              >
                <n.icon className="size-4" />
              </Link>
            ))}
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
