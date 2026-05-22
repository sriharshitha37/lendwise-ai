import { useSyncExternalStore } from "react";
import {
  type Applicant,
  type Application,
  type UnderwritingRules,
  defaultRules,
  evaluateApplication,
  testProfiles,
} from "./lendai-data";

interface State {
  rules: UnderwritingRules;
  applications: Application[];
}

const listeners = new Set<() => void>();

function seedApps(rules: UnderwritingRules): Application[] {
  return testProfiles.map((p, i) => {
    const ev = evaluateApplication(p, rules);
    return {
      id: `LA-${1000 + i}`,
      applicant: p,
      status: ev.status,
      currentAgent: "done" as const,
      riskScore: ev.riskScore,
      recommendedRate: ev.rate,
      reason: ev.reason,
      submittedAt: Date.now() - (i + 1) * 1000 * 60 * 37,
    };
  });
}

let state: State = {
  rules: defaultRules,
  applications: seedApps(defaultRules),
};

function emit() {
  listeners.forEach((l) => l());
}

export const store = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  setRules(rules: UnderwritingRules) {
    state = {
      ...state,
      rules,
      applications: state.applications.map((app) => {
        const ev = evaluateApplication(app.applicant, rules);
        return {
          ...app,
          status: app.currentAgent === "done" ? ev.status : app.status,
          riskScore: ev.riskScore,
          recommendedRate: ev.rate,
          reason: ev.reason,
        };
      }),
    };
    emit();
  },
  resetRules() {
    store.setRules(defaultRules);
  },
  addApplication(applicant: Applicant) {
    const ev = evaluateApplication(applicant, state.rules);
    const id = `LA-${1000 + state.applications.length + Math.floor(Math.random() * 99)}`;
    const app: Application = {
      id,
      applicant,
      status: ev.status,
      currentAgent: "done",
      riskScore: ev.riskScore,
      recommendedRate: ev.rate,
      reason: ev.reason,
      submittedAt: Date.now(),
    };
    state = { ...state, applications: [app, ...state.applications] };
    emit();
    return app;
  },
};

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(state),
    () => selector(state),
  );
}
