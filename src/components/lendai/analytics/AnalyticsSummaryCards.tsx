import { MetricCard } from "@/components/lendai/MetricCard";
import type { LendingAnalyticsSummary } from "@/lib/analytics-data";
import {
  CheckCircle2,
  Clock,
  Files,
  Gauge,
  XCircle,
} from "lucide-react";

export function AnalyticsSummaryCards({ summary }: { summary: LendingAnalyticsSummary }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
      <MetricCard
        label="Total Applications"
        value={summary.totalApplications.toLocaleString("en-IN")}
        delta={`+${summary.portfolioGrowthPct}% MoM`}
        trend="up"
        icon={Files}
        accent
      />
      <MetricCard
        label="Approved Applications"
        value={summary.approvedApplications.toLocaleString("en-IN")}
        delta={`${summary.approvalRatePct}% of portfolio`}
        trend="up"
        icon={CheckCircle2}
        tone="success"
      />
      <MetricCard
        label="Pending Applications"
        value={summary.pendingApplications.toLocaleString("en-IN")}
        delta="In review queue"
        trend="flat"
        icon={Clock}
        tone="warning"
      />
      <MetricCard
        label="Rejected Applications"
        value={summary.rejectedApplications.toLocaleString("en-IN")}
        delta="Policy & risk blocks"
        trend="down"
        icon={XCircle}
        tone="destructive"
      />
      <MetricCard
        label="Average Risk Score"
        value={summary.averageRiskScore.toFixed(1)}
        delta="Scale 0–100"
        trend="flat"
        icon={Gauge}
      />
    </section>
  );
}
