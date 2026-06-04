import { ScientificSkillRegistry } from './scientificSkillRegistry';
import type { AgentRegistry, Mission, MissionContext, SkillRoute } from './types';

export class SkillRouter {
  private readonly registry: ScientificSkillRegistry;
  private readonly agentRegistry?: AgentRegistry;
  private readonly strict: boolean;

  constructor(options: Partial<{ registry: ScientificSkillRegistry; agentRegistry: AgentRegistry; strict: boolean }> = {}) {
    this.registry = options.registry ?? new ScientificSkillRegistry();
    this.agentRegistry = options.agentRegistry;
    this.strict = options.strict ?? true;
  }

  resolve(mission: Mission = {}): SkillRoute {
    const missionType = normalizeMissionType(mission);
    const skillName = this.registry.getSkillForMissionType(missionType);

    if (!skillName) {
      if (this.strict) {
        throw new Error(`No scientific skill route registered for mission type: ${missionType ?? 'unknown'}`);
      }

      return {
        routed: false,
        missionId: mission.id ?? mission.missionId ?? null,
        missionType,
        skillName: null,
        agentName: null,
        priority: this.registry.priority,
        source: this.registry.source,
        skillRole: null,
      };
    }

    const agentName = this.registry.getAgentForSkill(skillName);

    return {
      routed: true,
      missionId: mission.id ?? mission.missionId ?? null,
      missionType,
      skillName,
      agentName,
      priority: this.registry.priority,
      source: this.registry.source,
      skillRole: this.registry.getSkillRole(skillName),
    };
  }

  async dispatch(mission: Mission = {}, context: MissionContext = {}) {
    const route = this.resolve(mission);
    const handler = this.resolveHandler(mission, route);

    if (!handler) {
      throw new Error(`No agent handler available for route: ${route.agentName ?? 'unknown'}`);
    }

    const result = await handler.execute(
      { ...mission, payload: { ...mission.payload, selectedSkill: route.skillName, selectedAgent: route.agentName } },
      { ...context, route }
    );

    return { ok: true, route, result };
  }

  private resolveHandler(mission: Mission, route: SkillRoute) {
    if (!this.agentRegistry) return undefined;

    if (route.agentName && this.agentRegistry.get) {
      return this.agentRegistry.get(route.agentName);
    }

    if (this.agentRegistry.resolve) {
      return this.agentRegistry.resolve({ ...mission, skillName: route.skillName, agentName: route.agentName });
    }

    return undefined;
  }
}

export function normalizeMissionType(mission: Mission = {}) {
  return mission.type ?? mission.action ?? mission.intent ?? null;
}
