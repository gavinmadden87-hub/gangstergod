export type BillingStat = {
  label: string;
  revenue: number;
  churn: number;
  expansion: number;
};

export type BillingStatsResponse = {
  totalRevenue: number;
  mrr: number;
  arr: number;
  points: BillingStat[];
};

export type OutcomeLogEntry = {
  id: string;
  agentId: string;
  action: string;
  payload: Record<string, unknown>;
  consensusScore: number;
  accepted: boolean;
  createdAt: string;
};

export type WeightHistoryEntry = {
  id: string;
  strategy: string;
  previousWeight: number;
  newWeight: number;
  delta: number;
  reason: string;
  outcomeLogId: string;
  persistedRowCount: number;
  createdAt: string;
};

export type StrategyMutationResponse = {
  historyEntry: WeightHistoryEntry;
  outcomeEntry: OutcomeLogEntry;
  weightHistorySize: number;
  outcomeLogSize: number;
};

export type TrpcProcedure = "billing.getStats" | "swarm.triggerStrategyMutation";

type TrpcProcedureMap = {
  "billing.getStats": BillingStatsResponse;
  "swarm.triggerStrategyMutation": StrategyMutationResponse;
};

type TrpcEnvelope<TData> = {
  data?: TData;
  error?: string;
};

const trpcProcedures: readonly TrpcProcedure[] = ["billing.getStats", "swarm.triggerStrategyMutation"];

export function isTrpcProcedure(value: string): value is TrpcProcedure {
  return trpcProcedures.includes(value as TrpcProcedure);
}

async function callTrpcProcedure<TProcedure extends TrpcProcedure>(
  procedure: TProcedure,
): Promise<TrpcProcedureMap[TProcedure]> {
  const response = await fetch(`/api/trpc/${procedure}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ json: null }),
  });
  const envelope = (await response.json()) as TrpcEnvelope<TrpcProcedureMap[TProcedure]>;

  if (!response.ok || envelope.error || !envelope.data) {
    throw new Error(envelope.error ?? `tRPC procedure failed: ${procedure}`);
  }

  return envelope.data;
}

export const trpcClient = {
  billing: {
    getStats: () => callTrpcProcedure("billing.getStats"),
  },
  swarm: {
    triggerStrategyMutation: () => callTrpcProcedure("swarm.triggerStrategyMutation"),
  },
};
