import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { AppShell } from "@/components/lendai/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/lendai/StatusBadge";
import { store } from "@/lib/lendai-store";
import {
  type Applicant,
  type AgentKey,
  evaluateApplication,
  maskId,
  testProfiles,
} from "@/lib/lendai-data";
import {
  ScanLine,
  Gauge,
  Scale,
  Sparkles,
  UploadCloud,
  PlayCircle,
  CheckCircle2,
  Loader2,
  FileText,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/process")({
  head: () => ({
    meta: [
      { title: "Process Application — LendAI" },
      {
        name: "description",
        content: "Run a loan through the LendAI multi-agent pipeline with live agent telemetry.",
      },
    ],
  }),
  component: ProcessPage,
});

type StepState = "idle" | "running" | "done";
type AgentLog = { agent: AgentKey; output: Record<string, unknown> };

const steps: { key: AgentKey; label: string; icon: typeof ScanLine; desc: string }[] = [
  {
    key: "ingestion",
    label: "Document Ingestion Agent",
    icon: ScanLine,
    desc: "Extracts text from Aadhaar / PAN, masks PII, verifies authenticity.",
  },
  {
    key: "credit",
    label: "Credit Profiler Agent",
    icon: Gauge,
    desc: "Simulates a CIBIL bureau call and assembles credit profile.",
  },
  {
    key: "underwriter",
    label: "Rule-Based Underwriter Agent",
    icon: Scale,
    desc: "Applies hard business rules (score, DTI, cap) deterministically.",
  },
  {
    key: "decision",
    label: "Final Decision Agent",
    icon: Sparkles,
    desc: "Generates a human-readable rationale and recommended interest rate.",
  },
];

function ProcessPage() {
  const [selected, setSelected] = useState<Applicant>(testProfiles[1]);
  const [uploaded, setUploaded] = useState<string | null>(null);
  const [stepStates, setStepStates] = useState<Record<AgentKey, StepState>>({
    ingestion: "idle",
    credit: "idle",
    underwriter: "idle",
    decision: "idle",
  });
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [decision, setDecision] = useState<ReturnType<typeof evaluateApplication> | null>(null);
  const [running, setRunning] = useState(false);
  const dropRef = useRef<HTMLLabelElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const reset = useCallback(() => {
    setStepStates({ ingestion: "idle", credit: "idle", underwriter: "idle", decision: "idle" });
    setLogs([]);
    setDecision(null);
  }, []);

  const run = useCallback(async () => {
    reset();
    setRunning(true);
    const a = selected;
    const rules = store.get().rules;
    const ev = evaluateApplication(a, rules);
    const dti = ((a.monthlyDebt * 12) / (a.income * 12)) * 100;

    const sequence: { key: AgentKey; output: Record<string, unknown>; ms: number }[] = [
      {
        key: "ingestion",
        ms: 900,
        output: {
          extracted: {
            full_name: a.name,
            dob: a.dob,
            pan_number: maskId(a.pan),
            aadhaar_number: maskId(a.aadhaar),
          },
          pan_verification: "VERIFIED",
          aadhaar_verification: "VERIFIED",
          ocr_confidence: 0.97,
        },
      },
      {
        key: "credit",
        ms: 1100,
        output: {
          bureau: "CIBIL (simulated)",
          credit_score: a.creditScore,
          open_accounts: 3,
          delinquencies_24mo: a.creditScore < 650 ? 2 : 0,
          monthly_obligations_inr: a.monthlyDebt,
        },
      },
      {
        key: "underwriter",
        ms: 800,
        output: {
          rule_min_score: { threshold: rules.minCreditScore, value: a.creditScore, pass: a.creditScore >= rules.minCreditScore },
          rule_max_loan: { threshold: rules.maxLoanAmount, value: a.loanAmount, pass: a.loanAmount <= rules.maxLoanAmount },
          rule_max_dti: { threshold: rules.maxDTI, value: Number(dti.toFixed(2)), pass: dti <= rules.maxDTI },
          verdict: ev.status.toUpperCase(),
        },
      },
      {
        key: "decision",
        ms: 1000,
        output: {
          decision: ev.status.toUpperCase(),
          risk_score: ev.riskScore,
          recommended_apr_pct: ev.rate,
          rationale: ev.reason,
        },
      },
    ];

    for (const step of sequence) {
      setStepStates((s) => ({ ...s, [step.key]: "running" }));
      await new Promise((r) => setTimeout(r, step.ms));
      setLogs((l) => [...l, { agent: step.key, output: step.output }]);
      setStepStates((s) => ({ ...s, [step.key]: "done" }));
    }
    setDecision(ev);
    store.addApplication(a);
    setRunning(false);
  }, [selected, reset]);

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setUploaded(f.name);
  };

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-8 space-y-8 max-w-[1400px] mx-auto">
        <header>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Agentic Pipeline
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mt-1">Process Application</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Upload a mock document or pick a test profile, then watch four autonomous agents
            collaborate end-to-end.
          </p>
        </header>

        <div className="grid lg:grid-cols-[420px_1fr] gap-6">
          <div className="space-y-6">
            <Card className="border-border/70">
              <CardHeader>
                <CardTitle className="text-base">1. Provide a document</CardTitle>
              </CardHeader>
              <CardContent>
                <label
                  ref={dropRef}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  className={cn(
                    "block cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors",
                    dragOver
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/40",
                  )}
                >
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setUploaded(f.name);
                    }}
                  />
                  <UploadCloud className="size-7 mx-auto text-primary" />
                  <div className="mt-3 text-sm font-medium">
                    {uploaded ?? "Drop Aadhaar / PAN PDF or image"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    PDF, JPG, PNG · processed in-browser (mock)
                  </div>
                </label>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader>
                <CardTitle className="text-base">2. Or pick a test profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {testProfiles.map((p) => {
                  const active = selected.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelected(p)}
                      className={cn(
                        "w-full text-left rounded-lg border p-3 transition-colors",
                        active
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/40",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{p.name}</div>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          CIBIL {p.creditScore}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{p.riskNote}</div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button
                size="lg"
                className="flex-1 shadow-[var(--shadow-elegant)]"
                onClick={run}
                disabled={running}
              >
                {running ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Running agents…
                  </>
                ) : (
                  <>
                    <PlayCircle className="size-4" /> Process Application
                  </>
                )}
              </Button>
              <Button size="lg" variant="outline" onClick={reset} disabled={running}>
                <RotateCcw className="size-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-6 min-w-0">
            <Card className="border-border/70">
              <CardHeader>
                <CardTitle className="text-base">Multi-Agent Pipeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {steps.map((s, idx) => {
                  const state = stepStates[s.key];
                  return (
                    <div
                      key={s.key}
                      className={cn(
                        "rounded-xl border p-4 flex gap-4 items-start transition-colors",
                        state === "running" && "border-primary/60 bg-primary/5",
                        state === "done" && "border-success/40 bg-success/5",
                        state === "idle" && "border-border",
                      )}
                    >
                      <div
                        className={cn(
                          "size-10 shrink-0 rounded-lg grid place-items-center",
                          state === "running" && "bg-primary text-primary-foreground",
                          state === "done" && "bg-success text-success-foreground",
                          state === "idle" && "bg-muted text-muted-foreground",
                        )}
                      >
                        {state === "running" ? (
                          <Loader2 className="size-5 animate-spin" />
                        ) : state === "done" ? (
                          <CheckCircle2 className="size-5" />
                        ) : (
                          <s.icon className="size-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="text-xs font-mono text-muted-foreground">
                            agent_0{idx + 1}
                          </div>
                          <div className="font-medium text-sm">{s.label}</div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">{state}</div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-[oklch(0.18_0.04_260)] text-[oklch(0.96_0.012_250)] border-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <FileText className="size-4" /> agent.console.log
                </CardTitle>
                <span className="text-xs opacity-60">{logs.length} events</span>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-[12px] leading-relaxed max-h-80 overflow-auto space-y-3">
                  {logs.length === 0 && (
                    <div className="opacity-50">
                      // Waiting for agent execution. Click "Process Application" to begin…
                    </div>
                  )}
                  {logs.map((l, i) => (
                    <div key={i}>
                      <div className="text-[oklch(0.78_0.16_75)]">
                        ▸ {l.agent}_agent → output
                      </div>
                      <pre className="whitespace-pre-wrap text-[oklch(0.88_0.05_200)]">
{JSON.stringify(l.output, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {decision && (
              <Card
                className="border-border/70"
                style={{ backgroundImage: "var(--gradient-surface)" }}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Final Decision</CardTitle>
                  <StatusBadge status={decision.status} />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Stat label="Risk Score" value={`${decision.riskScore}/100`} />
                    <Stat label="Recommended APR" value={`${decision.rate}%`} />
                    <Stat
                      label="Loan Amount"
                      value={`₹${selected.loanAmount.toLocaleString("en-IN")}`}
                    />
                  </div>
                  <div className="rounded-lg bg-card border border-border/70 p-4 text-sm leading-relaxed">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                      AI rationale
                    </div>
                    {decision.reason}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-card p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tabular-nums mt-1">{value}</div>
    </div>
  );
}
