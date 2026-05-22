import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { EligibilityResultCard } from "@/components/lendai/EligibilityResultCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEligibilityCheck } from "@/hooks/useEligibilityCheck";
import { getApiErrorMessage, parseApiValidationErrors } from "@/lib/api";
import {
  loanApplicationSchema,
  type LoanApplicationSchemaValues,
} from "@/lib/eligibility-schema";
import {
  EMPLOYMENT_TYPE_OPTIONS,
  toEligibilityDecision,
  type EligibilityDecision,
  type EmploymentType,
} from "@/types/eligibility";
import { Loader2, Send } from "lucide-react";

export interface LoanApplicationFormProps {
  defaultIncome?: number;
  defaultCreditScore?: number;
  defaultEmploymentType?: EmploymentType;
  className?: string;
}

const defaultValues: LoanApplicationSchemaValues = {
  income: "",
  credit_score: "",
  employment_type: "salaried",
};

export function LoanApplicationForm({
  defaultIncome,
  defaultCreditScore,
  defaultEmploymentType = "salaried",
  className,
}: LoanApplicationFormProps) {
  const eligibilityMutation = useEligibilityCheck();

  const form = useForm<LoanApplicationSchemaValues>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: {
      ...defaultValues,
      income: defaultIncome ? String(defaultIncome) : "",
      credit_score: defaultCreditScore ? String(defaultCreditScore) : "",
      employment_type: defaultEmploymentType,
    },
    mode: "onBlur",
  });

  useEffect(() => {
    form.reset({
      income: defaultIncome ? String(defaultIncome) : "",
      credit_score: defaultCreditScore ? String(defaultCreditScore) : "",
      employment_type: defaultEmploymentType,
    });
  }, [defaultIncome, defaultCreditScore, defaultEmploymentType, form]);

  const applyServerValidationErrors = (error: unknown) => {
    const fieldErrors = parseApiValidationErrors(error);
    for (const { field, message } of fieldErrors) {
      if (field === "income" || field === "credit_score" || field === "employment_type") {
        form.setError(field, { type: "server", message });
      }
    }
  };

  const onSubmit = (values: LoanApplicationSchemaValues) => {
    eligibilityMutation.mutate(
      {
        income: values.income,
        credit_score: values.credit_score,
        employment_type: values.employment_type,
      },
      {
        onSuccess: () => {
          toast.success("Eligibility check complete");
        },
        onError: (error) => {
          applyServerValidationErrors(error);
          const hasFieldErrors = parseApiValidationErrors(error).length > 0;
          if (!hasFieldErrors) {
            toast.error(getApiErrorMessage(error));
          }
        },
      },
    );
  };

  const decision: EligibilityDecision | null = eligibilityMutation.data
    ? toEligibilityDecision(eligibilityMutation.data)
    : null;

  return (
    <div className={className}>
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="text-base">Loan application</CardTitle>
          <p className="text-xs text-muted-foreground">
            Monthly income, credit score, and employment type are sent to the eligibility
            engine.
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="income"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly income (INR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        step={1000}
                        placeholder="e.g. 75000"
                        disabled={eligibilityMutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="credit_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credit score</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={300}
                        max={900}
                        step={1}
                        placeholder="300 – 900"
                        disabled={eligibilityMutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={eligibilityMutation.isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full shadow-[var(--shadow-elegant)]"
                disabled={eligibilityMutation.isPending}
              >
                {eligibilityMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Checking eligibility…
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Check eligibility
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <EligibilityResultCard
        className="mt-6"
        decision={decision}
        loading={eligibilityMutation.isPending}
        error={
          eligibilityMutation.isError && parseApiValidationErrors(eligibilityMutation.error).length === 0
            ? getApiErrorMessage(eligibilityMutation.error)
            : null
        }
      />
    </div>
  );
}
