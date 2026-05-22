import {
  Activity,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export interface MetricCardProps {
  label: string;
  value: number | string;
  delta: string;
  trend: "up" | "down" | "flat";
  icon: LucideIcon;
  tone?: "success" | "destructive" | "warning";
  accent?: boolean;
}

export function MetricCard({
  label,
  value,
  delta,
  trend,
  icon: Icon,
  tone,
  accent,
}: MetricCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Activity;
  const trendCls =
    trend === "up"
      ? "text-success"
      : trend === "down"
        ? "text-destructive"
        : "text-muted-foreground";
  const iconCls =
    tone === "success"
      ? "bg-success/10 text-success"
      : tone === "destructive"
        ? "bg-destructive/10 text-destructive"
        : tone === "warning"
          ? "bg-warning/15 text-warning-foreground"
          : accent
            ? "bg-accent text-accent-foreground"
            : "bg-foreground text-background";

  return (
    <div className="group relative bg-card border border-border rounded-2xl p-5 hover:shadow-[var(--shadow-elegant)] hover:-translate-y-0.5 transition-all">
      <div className="flex items-start justify-between">
        <span className={`size-10 rounded-xl grid place-items-center ${iconCls}`}>
          <Icon className="size-5" />
        </span>
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold text-right max-w-[110px] leading-tight">
          {label}
        </span>
      </div>
      <div className="mt-5 flex items-end justify-between gap-2">
        <div className="font-display text-4xl font-semibold tabular-nums leading-none">
          {value}
        </div>
        <div className={`inline-flex items-center gap-1 text-[11px] font-bold ${trendCls}`}>
          <TrendIcon className="size-3" />
          {delta}
        </div>
      </div>
    </div>
  );
}
