export type AppStatus = "pending" | "approved" | "rejected" | "flagged";
export type AgentKey = "ingestion" | "credit" | "underwriter" | "decision";

export interface Applicant {
  id: string;
  name: string;
  email: string;
  pan: string;
  aadhaar: string;
  dob: string;
  loanAmount: number;
  income: number;
  monthlyDebt: number;
  creditScore: number;
  employment: string;
  city: string;
  riskNote?: string;
}

export interface UnderwritingRules {
  minCreditScore: number;
  maxLoanAmount: number;
  maxDTI: number; // percentage
}

export const defaultRules: UnderwritingRules = {
  minCreditScore: 680,
  maxLoanAmount: 2_500_000,
  maxDTI: 45,
};

export interface Application {
  id: string;
  applicant: Applicant;
  status: AppStatus;
  currentAgent: AgentKey | "done";
  riskScore: number; // 0-100, higher = riskier
  recommendedRate: number;
  reason: string;
  submittedAt: number;
}

export const testProfiles: Applicant[] = [
  {
    id: "p-jane",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    pan: "ABCPS1234J",
    aadhaar: "1234 5678 9012",
    dob: "1991-04-12",
    loanAmount: 800000,
    income: 145000,
    monthlyDebt: 18000,
    creditScore: 792,
    employment: "Senior PM, Infosys",
    city: "Bengaluru",
    riskNote: "Ideal applicant — strong score, low DTI.",
  },
  {
    id: "p-john",
    name: "John Doe",
    email: "john.doe@example.com",
    pan: "XYZPD9876K",
    aadhaar: "9876 5432 1098",
    dob: "1988-09-30",
    loanAmount: 1500000,
    income: 90000,
    monthlyDebt: 52000,
    creditScore: 612,
    employment: "Freelance Designer",
    city: "Mumbai",
    riskNote: "High risk — sub-650 score, high DTI.",
  },
  {
    id: "p-arav",
    name: "Arav Mehta",
    email: "arav.mehta@example.com",
    pan: "LMNPA4521R",
    aadhaar: "4455 6677 8899",
    dob: "1985-01-22",
    loanAmount: 3200000,
    income: 210000,
    monthlyDebt: 40000,
    creditScore: 735,
    employment: "Director, HDFC",
    city: "Pune",
    riskNote: "Loan request exceeds default cap.",
  },
  {
    id: "p-neha",
    name: "Neha Verma",
    email: "neha.v@example.com",
    pan: "QRSTV6789L",
    aadhaar: "2233 4455 6677",
    dob: "1995-07-08",
    loanAmount: 450000,
    income: 72000,
    monthlyDebt: 14000,
    creditScore: 701,
    employment: "Data Analyst, TCS",
    city: "Hyderabad",
    riskNote: "Borderline — moderate score.",
  },
];

export function maskId(id: string) {
  const digits = id.replace(/\s/g, "");
  if (digits.length <= 4) return id;
  return "XXXX XXXX " + digits.slice(-4);
}

export function evaluateApplication(
  a: Applicant,
  rules: UnderwritingRules,
): { status: AppStatus; riskScore: number; rate: number; reason: string } {
  const dti = (a.monthlyDebt * 12 * 100) / (a.income * 12);
  const scoreGap = Math.max(0, rules.minCreditScore - a.creditScore);
  const dtiGap = Math.max(0, dti - rules.maxDTI);
  const loanGap = Math.max(0, a.loanAmount - rules.maxLoanAmount);

  // Risk score 0..100
  const riskScore = Math.min(
    100,
    Math.round(
      (900 - a.creditScore) * 0.12 +
        dti * 0.6 +
        (a.loanAmount / Math.max(a.income, 1)) * 2.5,
    ),
  );

  let status: AppStatus = "approved";
  const reasons: string[] = [];

  if (a.creditScore < rules.minCreditScore) {
    status = "rejected";
    reasons.push(
      `Credit score ${a.creditScore} is below the required minimum of ${rules.minCreditScore}.`,
    );
  }
  if (a.loanAmount > rules.maxLoanAmount) {
    status = "rejected";
    reasons.push(
      `Requested loan ₹${a.loanAmount.toLocaleString("en-IN")} exceeds the policy cap of ₹${rules.maxLoanAmount.toLocaleString("en-IN")}.`,
    );
  }
  if (dti > rules.maxDTI) {
    if (status !== "rejected") status = "flagged";
    reasons.push(
      `Debt-to-Income ratio of ${dti.toFixed(1)}% exceeds the ${rules.maxDTI}% threshold.`,
    );
  }

  // Rate model
  const baseRate = 9.25;
  const rate =
    baseRate +
    Math.max(0, (rules.minCreditScore - a.creditScore) / 50) +
    Math.max(0, (dti - 30) / 25) +
    (status === "flagged" ? 1.5 : 0);

  let reason: string;
  if (status === "approved") {
    reason = `Approved. Credit score ${a.creditScore} clears the ${rules.minCreditScore} threshold, DTI ${dti.toFixed(1)}% is within ${rules.maxDTI}%, and the requested amount fits the policy envelope. Risk score ${riskScore}/100. Recommended APR ${rate.toFixed(2)}%.`;
  } else if (status === "flagged") {
    reason = `Flagged for manual review. ${reasons.join(" ")} Suggested APR if proceeding: ${rate.toFixed(2)}%.`;
  } else {
    reason = `Rejected by underwriter. ${reasons.join(" ")} Risk score ${riskScore}/100.`;
  }

  return { status, riskScore, rate: Number(rate.toFixed(2)), reason };
}
