import { SelfOptimizer } from './selfOptimizer';
import { SelfSovereignty } from './selfSovereignty';
import { SelfMonitor } from './selfMonitor';
import { SkillRouter } from './skillRouter';
import type { AgentRegistry, AuthorityDecision, EventBus, Mission, MissionContext, SkillRoute } from './types';

export class MissionRouter {
  constructor(private readonly options: {
    sovereignty?: SelfSovereignty;
    skillRouter?: SkillRouter;
    monitor?: SelfMonitor;
    optimizer?: SelfOptimizer;
    agentRegistry?: AgentRegistry;
    eventBus?: EventBus;
  } = {}) {}

  async route(mission: Mission, context: MissionContext = {}) {
    const startedAt = Date.now();
    const monitor = this.options.monitor;

    monitor?.recordMissionSeen(mission);

    const decision = this.evaluateOnce(mission, context);
    monitor?.recordAuthorityDecision(decision);
    this.options.eventBus?.emit('authority.decision', decision);

    if (decision.status === 'blocked' || decision.status === 'approval_required') {
      return { ok: false, status: decision.status, decision, route: null, result: null, optimizerProposals: this.options.optimizer?.propose() ?? [] };
    }

    let route: SkillRoute | null = null;
    let result: unknown = null;

    try {
      if (this.options.skillRouter) {
        route = this.options.skillRouter.resolve(mission);
      }

      const handler = this.resolveHandler(mission, route);
      if (handler) {
        result = await handler.execute(mission, { ...context, decision, route: route ?? undefined });
      } else {
        result = { routed: Boolean(route), selectedSkill: route?.skillName ?? null, selectedAgent: route?.agentName ?? null };
      }

      monitor?.recordMissionOutcome({ missionId: mission.id ?? mission.missionId, latencyMs: Date.now() - startedAt, route });
      return { ok: true, status: 'completed', decision, route, result, optimizerProposals: this.options.optimizer?.propose() ?? [] };
    } catch (error) {
      monitor?.recordMissionFailure({ missionId: mission.id ?? mission.missionId, latencyMs: Date.now() - startedAt, error: error instanceof Error ? error.message : 'unknown' });
      throw error;
    }
  }

  private evaluateOnce(mission: Mission, context: MissionContext): AuthorityDecision {
    return (this.options.sovereignty ?? new SelfSovereignty()).evaluateMission(mission, context);
  }

  private resolveHandler(mission: Mission, route: SkillRoute | null) {
    if (!this.options.agentRegistry) return undefined;
    if (route?.agentName && this.options.agentRegistry.get) return this.options.agentRegistry.get(route.agentName);
    if (this.options.agentRegistry.resolve) return this.options.agentRegistry.resolve({ ...mission, skillName: route?.skillName ?? null, agentName: route?.agentName ?? null });
    return undefined;
  }
}
