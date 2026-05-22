import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Workflow, SlidersHorizontal, Sparkles } from "lucide-react";
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
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="px-6 py-6 flex items-center gap-2.5 border-b border-sidebar-border">
          <div
            className="size-9 rounded-xl grid place-items-center text-sidebar-primary-foreground"
            style={{ backgroundImage: "var(--gradient-primary)" }}
          >
            <Sparkles className="size-4" />
          </div>
          <div>
            <div className="font-semibold tracking-tight">LendAI</div>
            <div className="text-[11px] uppercase tracking-widest text-sidebar-foreground/60">
              Agentic Lending
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {nav.map((n) => {
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <n.icon className="size-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto p-4 text-xs text-sidebar-foreground/55">
          <div className="rounded-lg border border-sidebar-border p-3">
            <div className="font-medium text-sidebar-foreground/85">v0.9 Prototype</div>
            <p className="mt-1 leading-relaxed">
              All agent outputs are simulated for demo purposes — no real credit data is fetched.
            </p>
          </div>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-sidebar text-sidebar-foreground">
          <div className="flex items-center gap-2">
            <div
              className="size-7 rounded-lg grid place-items-center"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              <Sparkles className="size-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold">LendAI</span>
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
