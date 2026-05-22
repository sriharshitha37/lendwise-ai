import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/lendai/AppShell";
import { AnalyticsSummaryCards } from "@/components/lendai/analytics/AnalyticsSummaryCards";
import { ApplicationsBarChart } from "@/components/lendai/analytics/ApplicationsBarChart";
import { StatusPieChart } from "@/components/lendai/analytics/StatusPieChart";
import {
  applicationStatusBreakdown,
  lendingAnalyticsSummary,
  monthlyApplicationVolume,
} from "@/lib/analytics-data";
import { BarChart3, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — LendAI" },
      {
        name: "description",
        content:
          "Lending portfolio analytics — application volume, approval mix, and risk score insights.",
      },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <AppShell>
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-mesh opacity-90 pointer-events-none" />
        <div className="absolute inset-0 bg-dot-grid pointer-events-none [mask-image:linear-gradient(180deg,black,transparent_80%)]" />
        <div className="relative px-6 md:px-12 pt-10 md:pt-14 pb-8 max-w-[1400px] mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/70 backdrop-blur border border-border text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <BarChart3 className="size-3.5 text-primary" />
                Portfolio Intelligence
              </div>
              <h1 className="font-display text-4xl md:text-[48px] font-semibold tracking-tight mt-5 leading-[1.05]">
                Lending analytics
              </h1>
              <p className="text-muted-foreground text-base mt-4 max-w-lg leading-relaxed">
                Executive view of application throughput, decision outcomes, and average risk
                exposure across your lending book.
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-border bg-card/80 backdrop-blur text-sm">
              <TrendingUp className="size-4 text-success" />
              <span className="text-muted-foreground">Last updated</span>
              <span className="font-semibold tabular-nums">Apr 2026</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 py-8 space-y-8 max-w-[1400px] mx-auto">
        <AnalyticsSummaryCards summary={lendingAnalyticsSummary} />

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 min-w-0">
            <ApplicationsBarChart data={monthlyApplicationVolume} />
          </div>
          <div className="min-w-0">
            <StatusPieChart
              data={applicationStatusBreakdown}
              summary={lendingAnalyticsSummary}
            />
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InsightTile
            label="Approval rate"
            value={`${lendingAnalyticsSummary.approvalRatePct}%`}
            detail="518 approvals from 1,247 applications in the current cohort."
          />
          <InsightTile
            label="Pending backlog"
            value={`${Math.round((lendingAnalyticsSummary.pendingApplications / lendingAnalyticsSummary.totalApplications) * 100)}%`}
            detail="312 applications awaiting agent review or manual decision."
          />
          <InsightTile
            label="Risk posture"
            value={`${lendingAnalyticsSummary.averageRiskScore} avg`}
            detail="Portfolio risk index remains in the moderate band (target below 50)."
          />
        </section>
      </div>
    </AppShell>
  );
}

function InsightTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">
        {label}
      </div>
      <div className="font-display text-2xl font-semibold mt-2 tabular-nums">{value}</div>
      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{detail}</p>
    </div>
  );
}
