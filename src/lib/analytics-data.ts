/**
 * Realistic mock data for the lending analytics dashboard (portfolio-wide).
 */

export interface LendingAnalyticsSummary {
  totalApplications: number;
  approvedApplications: number;
  pendingApplications: number;
  rejectedApplications: number;
  averageRiskScore: number;
  approvalRatePct: number;
  portfolioGrowthPct: number;
}

export interface MonthlyApplicationVolume {
  month: string;
  approved: number;
  pending: number;
  rejected: number;
}

export interface ApplicationStatusSlice {
  status: "approved" | "pending" | "rejected";
  label: string;
  count: number;
}

export const lendingAnalyticsSummary: LendingAnalyticsSummary = {
  totalApplications: 1247,
  approvedApplications: 518,
  pendingApplications: 312,
  rejectedApplications: 417,
  averageRiskScore: 41.8,
  approvalRatePct: 41.5,
  portfolioGrowthPct: 8.4,
};

export const monthlyApplicationVolume: MonthlyApplicationVolume[] = [
  { month: "Oct", approved: 58, pending: 34, rejected: 41 },
  { month: "Nov", approved: 64, pending: 39, rejected: 48 },
  { month: "Dec", approved: 71, pending: 44, rejected: 52 },
  { month: "Jan", approved: 78, pending: 48, rejected: 55 },
  { month: "Feb", approved: 84, pending: 52, rejected: 58 },
  { month: "Mar", approved: 91, pending: 55, rejected: 62 },
  { month: "Apr", approved: 72, pending: 40, rejected: 61 },
];

export const applicationStatusBreakdown: ApplicationStatusSlice[] = [
  { status: "approved", label: "Approved", count: 518 },
  { status: "pending", label: "Pending", count: 312 },
  { status: "rejected", label: "Rejected", count: 417 },
];
