export type BlackboardEvent = {
  agentId: string;
  action: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type OutcomeLogEntry = BlackboardEvent & {
  consensusScore: number;
  accepted: boolean;
};

export type WeightHistoryEntry = {
  id: string;
  strategy: string;
  previousWeight: number;
  newWeight: number;
  delta: number;
  reason: string;
  createdAt: string;
};

export class Blackboard {
  private readonly events: BlackboardEvent[] = [];

  publish(event: Omit<BlackboardEvent, "createdAt">): BlackboardEvent {
    const materialized: BlackboardEvent = {
      ...event,
      createdAt: new Date().toISOString(),
    };
    this.events.push(materialized);
    return materialized;
  }

  getEvents(): BlackboardEvent[] {
    return [...this.events];
  }
}

export class ConsensusEngine {
  evaluate(event: BlackboardEvent): { score: number; accepted: boolean } {
    const score = Math.min(
      1,
      Math.max(0, (event.action.length + Object.keys(event.payload).length) / 20),
    );
    return {
      score,
      accepted: score >= 0.3,
    };
  }
}

export const blackboard = new Blackboard();
export const consensusEngine = new ConsensusEngine();

export const outcomeLog: OutcomeLogEntry[] = [];
export const weightHistory: WeightHistoryEntry[] = [];

export function triggerStrategyMutation(input: {
  agentId: string;
  strategy: string;
  previousWeight: number;
  signalStrength: number;
  reason: string;
}): WeightHistoryEntry {
  const event = blackboard.publish({
    agentId: input.agentId,
    action: "strategy_mutation",
    payload: {
      strategy: input.strategy,
      signalStrength: input.signalStrength,
      reason: input.reason,
    },
  });

  const consensus = consensusEngine.evaluate(event);
  outcomeLog.push({
    ...event,
    consensusScore: consensus.score,
    accepted: consensus.accepted,
  });

  const delta = consensus.accepted ? input.signalStrength * 0.1 : -input.signalStrength * 0.05;
  const entry: WeightHistoryEntry = {
    id: `wh_${Date.now()}`,
    strategy: input.strategy,
    previousWeight: input.previousWeight,
    newWeight: Number((input.previousWeight + delta).toFixed(4)),
    delta: Number(delta.toFixed(4)),
    reason: input.reason,
    createdAt: new Date().toISOString(),
  };

  weightHistory.push(entry);
  return entry;
}
