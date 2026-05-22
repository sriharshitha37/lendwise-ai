import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/lendai/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, RiskPill } from "@/components/lendai/StatusBadge";
import { useStore } from "@/lib/lendai-store";
import {
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-8 space-y-8 max-w-[1400px] mx-auto">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Loan Operations
            </div>
            <h1 className="text-3xl font-semibold tracking-tight mt-1">Underwriting Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Live view of all applications flowing through the LendAI agent mesh.
            </p>
          </div>
          <Button asChild size="lg" className="shadow-[var(--shadow-elegant)]">
            <Link to="/process">
              New Application <ArrowRight className="size-4" />
            </Link>
          </Button>
        </header>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Applications"
            value={total}
            icon={Files}
            tint="bg-primary/10 text-primary"
          />
          <MetricCard
            label="Pending Verification"
            value={pending}
            icon={Clock}
            tint="bg-warning/20 text-warning-foreground"
          />
          <MetricCard
            label="Approved"
            value={approved}
            icon={CheckCircle2}
            tint="bg-success/15 text-success"
          />
          <MetricCard
            label="Rejected"
            value={rejected}
            icon={XCircle}
            tint="bg-destructive/15 text-destructive"
          />
        </section>

        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Active Workflows</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Real-time view of applicants, current agent ownership, and risk score.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="size-2 rounded-full bg-success animate-pulse" /> Live
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-muted/40">
                  <tr>
                    <th className="text-left font-medium px-6 py-3">ID</th>
                    <th className="text-left font-medium px-6 py-3">Applicant</th>
                    <th className="text-left font-medium px-6 py-3">Amount</th>
                    <th className="text-left font-medium px-6 py-3">Current Agent</th>
                    <th className="text-left font-medium px-6 py-3">Risk</th>
                    <th className="text-left font-medium px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map((a) => {
                    const Meta =
                      agentMeta[a.currentAgent as keyof typeof agentMeta] ?? agentMeta.done;
                    return (
                      <tr
                        key={a.id}
                        className="border-t border-border/70 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                          {a.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{a.applicant.name}</div>
                          <div className="text-xs text-muted-foreground">{a.applicant.email}</div>
                        </td>
                        <td className="px-6 py-4 tabular-nums">
                          ₹{a.applicant.loanAmount.toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-2 text-xs">
                            <span className="size-6 rounded-md bg-primary/10 text-primary grid place-items-center">
                              <Meta.icon className="size-3.5" />
                            </span>
                            {Meta.label}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <RiskPill score={a.riskScore} />
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={a.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <section className="grid md:grid-cols-2 gap-4">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bot className="size-4 text-primary" /> Agent Mesh
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {(["ingestion", "credit", "underwriter", "decision"] as const).map((k) => {
                const Meta = agentMeta[k];
                return (
                  <div
                    key={k}
                    className="rounded-lg border border-border/70 p-3 flex items-center gap-3"
                  >
                    <span className="size-9 rounded-md bg-primary/10 text-primary grid place-items-center">
                      <Meta.icon className="size-4" />
                    </span>
                    <div>
                      <div className="text-sm font-medium">{Meta.label} Agent</div>
                      <div className="text-xs text-muted-foreground">Idle · Healthy</div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-border/70" style={{ backgroundImage: "var(--gradient-surface)" }}>
            <CardHeader>
              <CardTitle className="text-base">Tune underwriting policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Adjust score, DTI and loan caps in the sandbox to see how active applications
                re-decision in real time.
              </p>
              <Button asChild variant="secondary" className="mt-4">
                <Link to="/sandbox">
                  Open Sandbox <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tint,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
}) {
  return (
    <Card className="border-border/70">
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="text-3xl font-semibold tabular-nums mt-1.5">{value}</div>
        </div>
        <span className={`size-11 rounded-xl grid place-items-center ${tint}`}>
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}
