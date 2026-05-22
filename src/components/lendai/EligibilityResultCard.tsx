import { StatusBadge, RiskPill } from "@/components/lendai/StatusBadge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EligibilityDecision } from "@/types/eligibility";
import type { AppStatus } from "@/lib/lendai-data";
import { cn } from "@/lib/utils";
import { AlertTriangle, Loader2, Scale } from "lucide-react";

export interface EligibilityResultCardProps {
  decision: EligibilityDecision | null;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

function toAppStatus(status: EligibilityDecision["approvalStatus"]): AppStatus {
  if (status === "approved" || status === "rejected" || status === "pending") {
    return status;
  }
  return "pending";
}

export function EligibilityResultCard({
  decision,
  loading = false,
  error = null,
  className,
}: EligibilityResultCardProps) {
  return (
    <Card className={cn("border-border/70", className)}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Scale className="size-4 text-primary" />
          Eligibility Decision
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-primary" />
            Evaluating eligibility…
          </div>
        )}

        {!loading && error && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>Eligibility check failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && decision && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Approval Status
                </div>
                <div className="mt-1.5">
                  <StatusBadge status={toAppStatus(decision.approvalStatus)} />
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                  Risk Score
                </div>
                <RiskPill score={decision.riskScore} />
              </div>
            </div>

            <div className="rounded-lg border border-border/70 bg-muted/30 p-4">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Decision Explanation
              </div>
              <p className="text-sm leading-relaxed mt-2">
                {decision.decisionExplanation}
              </p>
            </div>
          </div>
        )}

        {!loading && !error && !decision && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Submit the loan application to see approval status and risk score.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
