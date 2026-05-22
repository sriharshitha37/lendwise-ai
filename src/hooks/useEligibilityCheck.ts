import { useMutation } from "@tanstack/react-query";
import { checkEligibility } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { EligibilityRequest, EligibilityResponse } from "@/types/eligibility";

export function useEligibilityCheck() {
  return useMutation<EligibilityResponse, Error, EligibilityRequest>({
    mutationKey: queryKeys.eligibility.all,
    mutationFn: checkEligibility,
  });
}
