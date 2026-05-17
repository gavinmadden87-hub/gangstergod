export type ColumnType = "text" | "real" | "timestamp" | "boolean" | "json";

export type DrizzleColumn<TName extends string> = {
  name: TName;
  type: ColumnType;
  notNull: boolean;
};

function column<TName extends string>(name: TName, type: ColumnType): DrizzleColumn<TName> {
  return {
    name,
    type,
    notNull: true,
  };
}

export const outcomeLogTable = {
  name: "outcome_log",
  columns: {
    id: column("id", "text"),
    agentId: column("agent_id", "text"),
    action: column("action", "text"),
    payload: column("payload", "json"),
    consensusScore: column("consensus_score", "real"),
    accepted: column("accepted", "boolean"),
    createdAt: column("created_at", "timestamp"),
  },
} as const;

export const weightHistoryTable = {
  name: "weight_history",
  columns: {
    id: column("id", "text"),
    strategy: column("strategy", "text"),
    previousWeight: column("previous_weight", "real"),
    newWeight: column("new_weight", "real"),
    delta: column("delta", "real"),
    reason: column("reason", "text"),
    outcomeLogId: column("outcome_log_id", "text"),
    createdAt: column("created_at", "timestamp"),
  },
} as const;

export type InsertOutcomeLog = {
  id: string;
  agentId: string;
  action: string;
  payload: Record<string, unknown>;
  consensusScore: number;
  accepted: boolean;
  createdAt: string;
};

export type SelectOutcomeLog = InsertOutcomeLog;

export type InsertWeightHistory = {
  id: string;
  strategy: string;
  previousWeight: number;
  newWeight: number;
  delta: number;
  reason: string;
  outcomeLogId: string;
  createdAt: string;
};

export type SelectWeightHistory = InsertWeightHistory & {
  persistedRowCount: number;
};
