import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AppStatus } from "@/lib/lendai-data";
import { CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";

export function StatusBadge({ status }: { status: AppStatus }) {
  const map = {
    approved: {
      label: "Approved",
      icon: CheckCircle2,
      cls: "bg-success/15 text-success border-success/30",
    },
    rejected: {
      label: "Rejected",
      icon: XCircle,
      cls: "bg-destructive/15 text-destructive border-destructive/30",
    },
    pending: {
      label: "Pending",
      icon: Clock,
      cls: "bg-muted text-muted-foreground border-border",
    },
    flagged: {
      label: "Flagged",
      icon: AlertTriangle,
      cls: "bg-warning/20 text-warning-foreground border-warning/40",
    },
  } as const;
  const v = map[status];
  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", v.cls)}>
      <v.icon className="size-3" />
      {v.label}
    </Badge>
  );
}

export function RiskPill({ score }: { score: number }) {
  const tone =
    score < 35
      ? "bg-success/15 text-success border-success/30"
      : score < 65
        ? "bg-warning/20 text-warning-foreground border-warning/40"
        : "bg-destructive/15 text-destructive border-destructive/30";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium tabular-nums",
        tone,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {score}/100
    </span>
  );
}
