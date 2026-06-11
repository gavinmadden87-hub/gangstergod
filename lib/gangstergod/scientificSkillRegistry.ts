import type { GangsterGodAgentName, ScientificMissionType, ScientificSkillName } from './types';

export type ScientificSkillRole = {
  agent: GangsterGodAgentName;
  useCase: string;
};

export class ScientificSkillRegistry {
  readonly status = 'active';
  readonly source = 'K-Dense-AI/claude-scientific-skills';
  readonly priority = 'high';

  readonly routes: Record<ScientificMissionType, ScientificSkillName> = {
    brainstorm: 'scientific-brainstorming',
    audit: 'scientific-critical-thinking',
    diagram: 'scientific-schematics',
    deck: 'scientific-slides',
    visualize: 'scientific-visualization',
    write: 'scientific-writing',
  };

  readonly gangsterGodAgents: Record<GangsterGodAgentName, ScientificSkillName> = {
    HypothesisForgeAgent: 'scientific-brainstorming',
    RedTeamAuditAgent: 'scientific-critical-thinking',
    SystemDiagramAgent: 'scientific-schematics',
    PitchDeckAgent: 'scientific-slides',
    SignalVizAgent: 'scientific-visualization',
    AuthorityWritingAgent: 'scientific-writing',
  };

  private readonly skillRoles: Record<ScientificSkillName, ScientificSkillRole> = {
    'scientific-brainstorming': {
      agent: 'HypothesisForgeAgent',
      useCase: 'Generate strategic ideas, experiments, monetization angles',
    },
    'scientific-critical-thinking': {
      agent: 'RedTeamAuditAgent',
      useCase: 'Attack weak logic, bad assumptions, fake breakthroughs',
    },
    'scientific-schematics': {
      agent: 'SystemDiagramAgent',
      useCase: 'Map swarm architecture, flows, module dependencies',
    },
    'scientific-slides': {
      agent: 'PitchDeckAgent',
      useCase: 'Investor decks, offer decks, client-facing strategy slides',
    },
    'scientific-visualization': {
      agent: 'SignalVizAgent',
      useCase: 'Metrics, dashboards, diagrams, performance visuals',
    },
    'scientific-writing': {
      agent: 'AuthorityWritingAgent',
      useCase: 'Research briefs, technical docs, premium positioning copy',
    },
  };

  getConfig() {
    return {
      scientificSkillPack: {
        status: this.status,
        source: this.source,
        priority: this.priority,
        routes: this.routes,
        gangsterGodAgents: this.gangsterGodAgents,
      },
    };
  }

  getSkillForMissionType(type?: string | null): ScientificSkillName | null {
    if (!type) return null;
    return this.routes[type.trim() as ScientificMissionType] ?? null;
  }

  getAgentForSkill(skillName: ScientificSkillName | null): GangsterGodAgentName | null {
    if (!skillName) return null;
    return this.skillRoles[skillName]?.agent ?? null;
  }

  getSkillRole(skillName: ScientificSkillName | null): ScientificSkillRole | null {
    if (!skillName) return null;
    const role = this.skillRoles[skillName];
    return role ? { ...role } : null;
  }
}
