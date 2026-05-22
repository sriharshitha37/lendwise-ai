/** Employment types accepted by POST /eligibility */
export type EmploymentType =
  | "salaried"
  | "self_employed"
  | "contract"
  | "unemployed";

/** Request body for POST /eligibility */
export interface EligibilityRequest {
  income: number;
  credit_score: number;
  employment_type: EmploymentType;
}

/** Approval values returned by the API */
export type ApprovalStatus = "approved" | "rejected" | "pending";

/** Response from POST /eligibility */
export interface EligibilityResponse {
  approval_status: ApprovalStatus;
  risk_score: number;
  reason: string;
}

/** Form values (same shape as request; used in the UI layer) */
export interface LoanApplicationFormValues {
  income: string;
  credit_score: string;
  employment_type: EmploymentType;
}

/** UI-facing eligibility decision */
export interface EligibilityDecision {
  approvalStatus: ApprovalStatus;
  riskScore: number;
  decisionExplanation: string;
}

export function toEligibilityDecision(
  response: EligibilityResponse,
): EligibilityDecision {
  return {
    approvalStatus: response.approval_status,
    riskScore: response.risk_score,
    decisionExplanation: response.reason,
  };
}

export const EMPLOYMENT_TYPE_OPTIONS: {
  value: EmploymentType;
  label: string;
}[] = [
  { value: "salaried", label: "Salaried" },
  { value: "self_employed", label: "Self employed" },
  { value: "contract", label: "Contract" },
  { value: "unemployed", label: "Unemployed" },
];
