import type { AuthorityDecision, Mission, SkillRoute } from './types';

export class SelfMonitor {
  private readonly clock: () => Date;
  private readonly events: Array<Record<string, unknown>> = [];
  private readonly metrics = {
    missionsSeen: 0,
    missionsAllowed: 0,
    missionsBlocked: 0,
    missionsApprovalRequired: 0,
    missionFailures: 0,
    authorityDecisionsRecorded: 0,
    skillRoutesResolved: 0,
    skillDispatchesCompleted: 0,
    latencyMs: [] as number[],
  };

  constructor(options: Partial<{ clock: () => Date }> = {}) {
    this.clock = options.clock ?? (() => new Date());
  }

  recordMissionSeen(mission: Mission) {
    this.metrics.missionsSeen += 1;
    this.events.push({
      type: 'mission.seen',
      missionId: mission.id ?? mission.missionId ?? null,
      missionType: mission.type ?? mission.action ?? mission.intent ?? null,
      timestamp: this.clock().toISOString(),
    });
  }

  recordAuthorityDecision(decision: AuthorityDecision) {
    this.metrics.authorityDecisionsRecorded += 1;
    if (decision.status === 'allowed') this.metrics.missionsAllowed += 1;
    if (decision.status === 'blocked') this.metrics.missionsBlocked += 1;
    if (decision.status === 'approval_required') this.metrics.missionsApprovalRequired += 1;
    this.events.push({ type: 'authority.decision', decision, timestamp: this.clock().toISOString() });
  }

  recordMissionOutcome(event: { missionId?: string; latencyMs?: number; route?: SkillRoute | null }) {
    if (typeof event.latencyMs === 'number') this.metrics.latencyMs.push(event.latencyMs);
    this.events.push({ type: 'mission.completed', event, timestamp: this.clock().toISOString() });
  }

  recordMissionFailure(event: { missionId?: string; latencyMs?: number; error?: string }) {
    this.metrics.missionFailures += 1;
    if (typeof event.latencyMs === 'number') this.metrics.latencyMs.push(event.latencyMs);
    this.events.push({ type: 'mission.failed', event, timestamp: this.clock().toISOString() });
  }

  recordSkillRoute(route: SkillRoute) {
    this.metrics.skillRoutesResolved += 1;
    this.events.push({ type: 'skill.route.resolved', route, timestamp: this.clock().toISOString() });
  }

  recordSkillDispatch(route: SkillRoute, result: unknown) {
    this.metrics.skillDispatchesCompleted += 1;
    this.events.push({ type: 'skill.dispatch.completed', route, result, timestamp: this.clock().toISOString() });
  }

  getHealthScores() {
    const totalDecisions = Math.max(1, this.metrics.missionsAllowed + this.metrics.missionsBlocked + this.metrics.missionsApprovalRequired);
    const averageLatencyMs = average(this.metrics.latencyMs);
    const failureRatio = safeRatio(this.metrics.missionFailures, Math.max(1, this.metrics.missionsSeen));
    const holdRatio = safeRatio(this.metrics.missionsBlocked, totalDecisions);
    const reviewRatio = safeRatio(this.metrics.missionsApprovalRequired, totalDecisions);

    return {
      routingHealth: clampScore(100 - failureRatio * 100),
      authorityHealth: clampScore(100 - holdRatio * 35 - reviewRatio * 10),
      observabilityHealth: this.metrics.authorityDecisionsRecorded >= totalDecisions ? 100 : 70,
      latencyHealth: latencyScore(averageLatencyMs),
      raw: { ...this.metrics, latencyMs: [...this.metrics.latencyMs], averageLatencyMs },
      timestamp: this.clock().toISOString(),
    };
  }

  snapshot() {
    return {
      metrics: { ...this.metrics, latencyMs: [...this.metrics.latencyMs] },
      health: this.getHealthScores(),
      recentEvents: this.events.slice(-25),
    };
  }
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function safeRatio(numerator: number, denominator: number) {
  return denominator === 0 ? 0 : numerator / denominator;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function latencyScore(avgLatencyMs: number) {
  if (!avgLatencyMs || avgLatencyMs <= 250) return 100;
  if (avgLatencyMs <= 1000) return 85;
  if (avgLatencyMs <= 3000) return 60;
  return 30;
}
