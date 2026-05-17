import {
  outcomeLogRepository,
  weightHistoryRepository,
} from "./db/repositories";
import { type SelectOutcomeLog, type SelectWeightHistory } from "./db/schema";

export type BlackboardEvent = {
  id: string;
  agentId: string;
  action: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type OutcomeLogEntry = SelectOutcomeLog;

export type WeightHistoryEntry = SelectWeightHistory;

export class Blackboard {
  private readonly events: BlackboardEvent[] = [];

  publish(event: Omit<BlackboardEvent, "id" | "createdAt">): BlackboardEvent {
    const createdAt = new Date().toISOString();
    const materialized: BlackboardEvent = {
      ...event,
      id: `bb_${createdAt}_${this.events.length + 1}`,
      createdAt,
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

export type StrategyMutationInput = {
  agentId: string;
  strategy: string;
  previousWeight: number;
  signalStrength: number;
  reason: string;
};

export type StrategyMutationResult = {
  historyEntry: WeightHistoryEntry;
  outcomeEntry: OutcomeLogEntry;
  weightHistorySize: number;
  outcomeLogSize: number;
};

export const blackboard = new Blackboard();
export const consensusEngine = new ConsensusEngine();

export async function getMutationCounts(): Promise<{ weightHistorySize: number; outcomeLogSize: number }> {
  const [weightHistorySize, outcomeLogSize] = await Promise.all([
    weightHistoryRepository.count(),
    outcomeLogRepository.count(),
  ]);

  return { weightHistorySize, outcomeLogSize };
}

export async function triggerStrategyMutation(input: StrategyMutationInput): Promise<StrategyMutationResult> {
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
  const outcomeEntry = await outcomeLogRepository.insert({
    id: `ol_${Date.now()}`,
    agentId: event.agentId,
    action: event.action,
    payload: event.payload,
    consensusScore: consensus.score,
    accepted: consensus.accepted,
    createdAt: event.createdAt,
  });

  const delta = consensus.accepted ? input.signalStrength * 0.1 : -input.signalStrength * 0.05;
  const historyEntry = await weightHistoryRepository.insert({
    id: `wh_${Date.now()}`,
    strategy: input.strategy,
    previousWeight: input.previousWeight,
    newWeight: Number((input.previousWeight + delta).toFixed(4)),
    delta: Number(delta.toFixed(4)),
    reason: input.reason,
    outcomeLogId: outcomeEntry.id,
    createdAt: new Date().toISOString(),
  });

  const counts = await getMutationCounts();

  return {
    historyEntry,
    outcomeEntry,
    ...counts,
  };
}
