import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ExtractedDocumentFields,
  isFallbackExtraction,
} from "@/types/api";
import { cn } from "@/lib/utils";
import { AlertTriangle, Loader2, ScanLine } from "lucide-react";

export interface ExtractedDocumentCardProps {
  data: ExtractedDocumentFields | null;
  loading?: boolean;
  loadingMessage?: string;
  error?: string | null;
  className?: string;
}

const FIELD_LABELS: { key: keyof Omit<ExtractedDocumentFields, "source">; label: string }[] =
  [
    { key: "fullName", label: "Full Name" },
    { key: "dob", label: "DOB" },
    { key: "aadhaarNumber", label: "Aadhaar Number" },
    { key: "panNumber", label: "PAN Number" },
    { key: "address", label: "Address" },
  ];

function formatValue(value: string | null): string {
  return value?.trim() ? value : "—";
}

export function ExtractedDocumentCard({
  data,
  loading = false,
  loadingMessage = "Extracting document fields…",
  error = null,
  className,
}: ExtractedDocumentCardProps) {
  const showFallbackBadge = data && isFallbackExtraction(data.source);

  return (
    <Card className={cn("border-border/70", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <CardTitle className="text-base flex items-center gap-2">
          <ScanLine className="size-4 text-primary" />
          Extracted Information
        </CardTitle>
        {showFallbackBadge && (
          <Badge
            variant="outline"
            className="shrink-0 border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400 gap-1"
          >
            <AlertTriangle className="size-3" />
            Demo data
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-primary" />
            {loadingMessage}
          </div>
        )}

        {!loading && error && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>Extraction unavailable</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && data && (
          <dl className="space-y-3">
            {FIELD_LABELS.map(({ key, label }) => (
              <div
                key={key}
                className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2.5"
              >
                <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {label}
                </dt>
                <dd className="text-sm font-medium mt-0.5 break-words">
                  {formatValue(data[key])}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {!loading && !error && !data && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Upload a PDF to extract identity fields automatically.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
