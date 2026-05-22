import { z } from "zod";

export const loanApplicationSchema = z.object({
  income: z.coerce
    .number({ invalid_type_error: "Enter a valid monthly income" })
    .positive("Monthly income must be greater than 0"),
  credit_score: z.coerce
    .number({ invalid_type_error: "Enter a valid credit score" })
    .min(300, "Credit score must be at least 300")
    .max(900, "Credit score must be at most 900"),
  employment_type: z.enum(["salaried", "self_employed", "contract", "unemployed"], {
    required_error: "Select an employment type",
  }),
});

export type LoanApplicationSchemaValues = z.infer<typeof loanApplicationSchema>;
