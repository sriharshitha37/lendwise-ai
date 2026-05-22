import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/lendai/AppShell";
import { StatusBadge, RiskPill } from "@/components/lendai/StatusBadge";
import { useStore } from "@/lib/lendai-store";
import {
  Activity,
  Files,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Bot,
  ScanLine,
  Gauge,
  Scale,
  Sparkles,
  ArrowUpRight,
} from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/lendai/MetricCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — LendAI" },
      {
        name: "description",
        content: "Loan officer dashboard with live multi-agent workflow metrics.",
      },
    ],
  }),
  component: Dashboard,
});

const agentMeta = {
  ingestion: { label: "Document Ingestion", icon: ScanLine },
  credit: { label: "Credit Profiler", icon: Gauge },
  underwriter: { label: "Underwriter", icon: Scale },
  decision: { label: "Decision", icon: Sparkles },
  done: { label: "Completed", icon: CheckCircle2 },
} as const;

function Dashboard() {
  const apps = useStore((s) => s.applications);
  const total = apps.length;
  const pending = apps.filter((a) => a.status === "pending" || a.status === "flagged").length;
  const approved = apps.filter((a) => a.status === "approved").length;
  const rejected = apps.filter((a) => a.status === "rejected").length;
  const approvalRate = total ? Math.round((approved / total) * 100) : 0;

  return (
    <AppShell>
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-mesh opacity-90 pointer-events-none" />
        <div className="absolute inset-0 bg-dot-grid pointer-events-none [mask-image:linear-gradient(180deg,black,transparent_80%)]" />
        <div className="relative px-6 md:px-12 pt-10 md:pt-14 pb-8 max-w-[1400px] mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/70 backdrop-blur border border-border text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-accent shadow-[0_0_10px] shadow-accent/70" />
                Loan Operations · Live
              </div>
              <h1 className="font-display text-4xl md:text-[52px] font-semibold tracking-tight mt-5 leading-[1.02]">
                Underwriting,
                <br />
                <span className="relative inline-block">
                  on autopilot.
                  <span className="absolute left-0 right-0 -bottom-1 h-3 bg-accent/60 -z-0 rounded-sm" />
                </span>
              </h1>
              <p className="text-muted-foreground text-base mt-4 max-w-lg leading-relaxed">
                The agentic intelligence layer for your lending desk — ingestion,
                credit profiling and risk decisioning, end-to-end.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link to="/analytics">Analytics</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link to="/sandbox">Tune policy</Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-[var(--shadow-elegant)]"
              >
                <Link to="/process">
                  New Application <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 py-8 space-y-8 max-w-[1400px] mx-auto">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Applications"
            value={total}
            delta={`${approvalRate}% approval`}
            trend="up"
            icon={Files}
            accent
          />
          <MetricCard
            label="Pending Review"
            value={pending}
            delta="Awaiting agent"
            trend="flat"
            icon={Clock}
          />
          <MetricCard
            label="Approved"
            value={approved}
            delta="+2 today"
            trend="up"
            icon={CheckCircle2}
            tone="success"
          />
          <MetricCard
            label="Rejected"
            value={rejected}
            delta="Policy block"
            trend="down"
            icon={XCircle}
            tone="destructive"
          />
        </section>

        <section className="bg-card border border-border rounded-3xl overflow-hidden shadow-[var(--shadow-elegant)]">
          <div className="flex items-center justify-between gap-4 px-6 md:px-8 py-6 border-b border-border">
            <div>
              <h2 className="font-display text-xl font-semibold tracking-tight">
                Active workflows
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Real-time orchestration of agent-led underwriting.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 animate-ping" />
                <span className="relative inline-flex rounded-full size-2 bg-success" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-success">
                Mesh live
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground bg-muted/40">
                <tr>
                  <th className="text-left font-semibold px-6 md:px-8 py-3.5">Ref</th>
                  <th className="text-left font-semibold px-6 py-3.5">Applicant</th>
                  <th className="text-left font-semibold px-6 py-3.5">Amount</th>
                  <th className="text-left font-semibold px-6 py-3.5">Current Agent</th>
                  <th className="text-left font-semibold px-6 py-3.5 min-w-[180px]">Risk Index</th>
                  <th className="text-left font-semibold px-6 md:px-8 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((a) => {
                  const Meta =
                    agentMeta[a.currentAgent as keyof typeof agentMeta] ?? agentMeta.done;
                  const initials = a.applicant.name
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("");
                  return (
                    <tr
                      key={a.id}
                      className="border-t border-border hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-6 md:px-8 py-4">
                        <span className="font-mono text-[11px] text-foreground/70 bg-muted px-2 py-1 rounded-md">
                          {a.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-gradient-to-br from-foreground to-foreground/70 text-background grid place-items-center text-[11px] font-bold">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">
                              {a.applicant.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {a.applicant.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 tabular-nums font-semibold">
                        ₹{a.applicant.loanAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2 text-xs">
                          <span className="size-7 rounded-lg bg-foreground/[0.04] border border-border grid place-items-center">
                            <Meta.icon className="size-3.5 text-foreground/80" />
                          </span>
                          <span className="font-medium text-foreground/80">
                            {Meta.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <RiskPill score={a.riskScore} />
                      </td>
                      <td className="px-6 md:px-8 py-4">
                        <StatusBadge status={a.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-6 md:px-8 py-4 border-t border-border bg-muted/20 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Showing {apps.length} of {apps.length} active applications
            </span>
            <Link
              to="/process"
              className="text-xs font-semibold uppercase tracking-wider text-foreground hover:text-foreground/70 inline-flex items-center gap-1"
            >
              Process new <ArrowRight className="size-3" />
            </Link>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-card border border-border rounded-3xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
                  System health
                </div>
                <h3 className="font-display text-lg font-semibold tracking-tight mt-1 flex items-center gap-2">
                  <Bot className="size-4" /> Agent Mesh
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs text-success font-semibold">
                <Activity className="size-3.5" /> All agents online
              </span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {(["ingestion", "credit", "underwriter", "decision"] as const).map((k, i) => {
                const Meta = agentMeta[k];
                return (
                  <div
                    key={k}
                    className="relative rounded-2xl border border-border p-4 bg-gradient-to-br from-card to-muted/20 hover:border-foreground/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="size-9 rounded-xl bg-foreground text-background grid place-items-center">
                        <Meta.icon className="size-4" />
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        0{i + 1}
                      </span>
                    </div>
                    <div className="mt-3 text-sm font-semibold leading-tight">
                      {Meta.label}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="size-1.5 rounded-full bg-success" /> Idle · Healthy
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="relative overflow-hidden rounded-3xl border border-border p-6 md:p-8 bg-foreground text-background"
            style={{ backgroundImage: "var(--gradient-ink)" }}
          >
            <div className="absolute -top-16 -right-16 size-48 rounded-full bg-accent/30 blur-3xl" />
            <div className="relative">
              <div className="text-[10px] uppercase tracking-[0.18em] text-background/60 font-semibold">
                Underwriting policy
              </div>
              <h3 className="font-display text-2xl font-semibold mt-2 leading-tight">
                Tune the rules. Watch every decision re-flow.
              </h3>
              <p className="text-sm text-background/70 mt-3 leading-relaxed">
                Drag sliders for min credit score, max loan and DTI cap — applications
                re-decision in real time across the mesh.
              </p>
              <Button
                asChild
                className="mt-6 rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Link to="/sandbox">
                  Open Sandbox <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

