import { cn } from "@/lib/utils";
import type { AppStatus } from "@/lib/lendai-data";
import { CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";

export function StatusBadge({ status }: { status: AppStatus }) {
  const map = {
    approved: {
      label: "Approved",
      icon: CheckCircle2,
      cls: "bg-success/10 text-success border-success/20",
    },
    rejected: {
      label: "Rejected",
      icon: XCircle,
      cls: "bg-destructive/10 text-destructive border-destructive/20",
    },
    pending: {
      label: "Pending",
      icon: Clock,
      cls: "bg-muted text-muted-foreground border-border",
    },
    flagged: {
      label: "Flagged",
      icon: AlertTriangle,
      cls: "bg-warning/15 text-warning-foreground border-warning/30",
    },
  } as const;
  const v = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        v.cls,
      )}
    >
      <v.icon className="size-3" />
      {v.label}
    </span>
  );
}

export function RiskPill({ score }: { score: number }) {
  const tone =
    score < 35
      ? { text: "text-success", bar: "bg-success", label: "Low" }
      : score < 65
        ? { text: "text-warning-foreground", bar: "bg-warning", label: "Med" }
        : { text: "text-destructive", bar: "bg-destructive", label: "High" };
  const pct = Math.max(4, Math.min(100, score));
  return (
    <div className="flex items-center gap-2.5 min-w-[120px]">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", tone.bar)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn("text-xs font-bold tabular-nums", tone.text)}>
        {score}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {tone.label}
      </span>
    </div>
  );
}
