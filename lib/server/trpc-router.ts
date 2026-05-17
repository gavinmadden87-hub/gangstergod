import { getBillingStats } from "./billing";
import { triggerStrategyMutation } from "../swarm";
import { type BillingStatsResponse, type StrategyMutationResponse, type TrpcProcedure } from "../trpc";

export type AppRouter = {
  "billing.getStats": () => Promise<BillingStatsResponse>;
  "swarm.triggerStrategyMutation": () => Promise<StrategyMutationResponse>;
};

export const appRouter: AppRouter = {
  "billing.getStats": getBillingStats,
  "swarm.triggerStrategyMutation": () =>
    triggerStrategyMutation({
      agentId: "swarm-commander",
      strategy: "risk-weighted-routing",
      previousWeight: 0.7,
      signalStrength: 0.9,
      reason: "manual-phase-13-validation",
    }),
};

export async function callProcedure(procedure: TrpcProcedure): Promise<BillingStatsResponse | StrategyMutationResponse> {
  return appRouter[procedure]();
}
