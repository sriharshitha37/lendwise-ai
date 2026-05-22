import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/lendai/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { StatusBadge, RiskPill } from "@/components/lendai/StatusBadge";
import { store, useStore } from "@/lib/lendai-store";
import { RotateCcw, SlidersHorizontal } from "lucide-react";

export const Route = createFileRoute("/sandbox")({
  head: () => ({
    meta: [
      { title: "Underwriting Sandbox — LendAI" },
      {
        name: "description",
        content:
          "Interactively tune credit, DTI, and loan caps and watch active applications re-decision in real time.",
      },
    ],
  }),
  component: Sandbox,
});

function Sandbox() {
  const rules = useStore((s) => s.rules);
  const apps = useStore((s) => s.applications);

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-8 space-y-8 max-w-[1400px] mx-auto">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Policy Lab
            </div>
            <h1 className="text-3xl font-semibold tracking-tight mt-1 flex items-center gap-2">
              <SlidersHorizontal className="size-7 text-primary" />
              Underwriting Sandbox
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Drag a slider — every active application is instantly re-scored against the new
              policy.
            </p>
          </div>
          <Button variant="outline" onClick={() => store.resetRules()}>
            <RotateCcw className="size-4" /> Reset defaults
          </Button>
        </header>

        <div className="grid lg:grid-cols-[420px_1fr] gap-6">
          <Card className="border-border/70 h-fit">
            <CardHeader>
              <CardTitle className="text-base">Policy controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-7">
              <RuleSlider
                label="Minimum Credit Score"
                value={rules.minCreditScore}
                min={500}
                max={850}
                step={5}
                fmt={(v) => v.toString()}
                onChange={(v) => store.setRules({ ...rules, minCreditScore: v })}
              />
              <RuleSlider
                label="Maximum Loan Amount"
                value={rules.maxLoanAmount}
                min={250_000}
                max={5_000_000}
                step={50_000}
                fmt={(v) => `₹${(v / 100000).toFixed(1)}L`}
                onChange={(v) => store.setRules({ ...rules, maxLoanAmount: v })}
              />
              <RuleSlider
                label="Max Debt-to-Income"
                value={rules.maxDTI}
                min={20}
                max={70}
                step={1}
                fmt={(v) => `${v}%`}
                onChange={(v) => store.setRules({ ...rules, maxDTI: v })}
              />
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base">Re-decisioned applications</CardTitle>
              <p className="text-xs text-muted-foreground">
                {apps.filter((a) => a.status === "approved").length} approved ·{" "}
                {apps.filter((a) => a.status === "flagged").length} flagged ·{" "}
                {apps.filter((a) => a.status === "rejected").length} rejected
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {apps.map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl border border-border/70 p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{a.applicant.name}</div>
                      <div className="text-xs text-muted-foreground">
                        CIBIL {a.applicant.creditScore} · ₹
                        {a.applicant.loanAmount.toLocaleString("en-IN")} · DTI{" "}
                        {(
                          ((a.applicant.monthlyDebt * 12) / (a.applicant.income * 12)) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <RiskPill score={a.riskScore} />
                      <StatusBadge status={a.status} />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-3 leading-relaxed">
                    {a.reason}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function RuleSlider({
  label,
  value,
  min,
  max,
  step,
  fmt,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  fmt: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-semibold tabular-nums text-primary">{fmt(value)}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
      />
      <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5 tabular-nums">
        <span>{fmt(min)}</span>
        <span>{fmt(max)}</span>
      </div>
    </div>
  );
}
