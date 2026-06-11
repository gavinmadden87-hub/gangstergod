import { describe, expect, it } from 'vitest';
import { MissionRouter, ScientificSkillRegistry, SelfMonitor, SelfOptimizer, SelfSovereignty, SkillRouter } from '../../lib/gangstergod';
import type { AgentRegistry } from '../../lib/gangstergod/types';

describe('GangsterGod self spine policy', () => {
  it('blocks production deployment without approval', () => {
    const sovereignty = new SelfSovereignty();
    const decision = sovereignty.evaluateMission({ id: 'deploy-001', action: 'deploy', environment: 'production' });

    expect(decision.allowed).toBe(false);
    expect(decision.status).toBe('blocked');
    expect(decision.authorityLevel).toBe('god_head_required');
  });

  it('requires approval for public customer messaging', () => {
    const sovereignty = new SelfSovereignty();
    const decision = sovereignty.evaluateMission({ id: 'msg-001', action: 'customer_message', environment: 'production', visibility: 'public' });

    expect(decision.allowed).toBe(false);
    expect(decision.status).toBe('approval_required');
    expect(decision.authorityLevel).toBe('human_approval_required');
  });

  it('allows local test execution', () => {
    const sovereignty = new SelfSovereignty();
    const decision = sovereignty.evaluateMission({ id: 'test-001', action: 'run_tests', environment: 'local' });

    expect(decision.allowed).toBe(true);
    expect(decision.status).toBe('allowed');
    expect(decision.authorityLevel).toBe('local_autonomy');
  });

  it('records authority decisions', () => {
    const sovereignty = new SelfSovereignty();
    sovereignty.evaluateMission({ id: 'test-002', action: 'run_tests', environment: 'local' });

    expect(sovereignty.getDecisionLog()).toHaveLength(1);
    expect(sovereignty.getLastDecision()?.missionId).toBe('test-002');
  });
});

describe('GangsterGod scientific skill router', () => {
  it('exposes the formal scientific skill pack config', () => {
    const config = new ScientificSkillRegistry().getConfig();
    expect(config.scientificSkillPack.status).toBe('active');
    expect(config.scientificSkillPack.source).toBe('K-Dense-AI/claude-scientific-skills');
  });

  it.each([
    ['brainstorm', 'scientific-brainstorming', 'HypothesisForgeAgent'],
    ['audit', 'scientific-critical-thinking', 'RedTeamAuditAgent'],
    ['diagram', 'scientific-schematics', 'SystemDiagramAgent'],
    ['deck', 'scientific-slides', 'PitchDeckAgent'],
    ['visualize', 'scientific-visualization', 'SignalVizAgent'],
    ['write', 'scientific-writing', 'AuthorityWritingAgent'],
  ])('routes %s missions deterministically', (type, skill, agent) => {
    const route = new SkillRouter().resolve({ id: `mission-${type}`, type });
    expect(route.skillName).toBe(skill);
    expect(route.agentName).toBe(agent);
  });

  it('throws on unknown mission type in strict mode', () => {
    expect(() => new SkillRouter().resolve({ id: 'unknown-001', type: 'unknown' })).toThrow(/No scientific skill route registered/);
  });
});

describe('GangsterGod mission router integration', () => {
  it('records one authority decision for an allowed routed mission', async () => {
    const monitor = new SelfMonitor();
    const sovereignty = new SelfSovereignty();
    const router = new MissionRouter({ sovereignty, monitor, skillRouter: new SkillRouter() });

    const result = await router.route({ id: 'audit-001', type: 'audit', environment: 'local' });

    expect(result.ok).toBe(true);
    expect(result.route?.skillName).toBe('scientific-critical-thinking');
    expect(sovereignty.getDecisionLog()).toHaveLength(1);
    expect(monitor.snapshot().metrics.authorityDecisionsRecorded).toBe(1);
  });

  it('dispatches to the selected scientific agent handler', async () => {
    const agentRegistry: AgentRegistry = {
      get(agentName) {
        return {
          execute: async () => ({ handledBy: agentName }),
        };
      },
    };

    const skillRouter = new SkillRouter({ agentRegistry });
    const output = await skillRouter.dispatch({ id: 'write-001', type: 'write' });

    expect(output.ok).toBe(true);
    expect(output.route.agentName).toBe('AuthorityWritingAgent');
    expect(output.result).toEqual({ handledBy: 'AuthorityWritingAgent' });
  });

  it('optimizer receives monitoring metrics and only proposes', () => {
    const monitor = new SelfMonitor();
    monitor.recordMissionSeen({ id: 'test-003', action: 'run_tests' });
    monitor.recordAuthorityDecision({
      missionId: 'test-003',
      action: 'run_tests',
      environment: 'local',
      channel: null,
      actor: 'system',
      allowed: true,
      status: 'allowed',
      authorityLevel: 'local_autonomy',
      reason: 'Local test execution is allowed.',
      timestamp: new Date().toISOString(),
    });

    const proposals = new SelfOptimizer(monitor).propose();
    expect(proposals.length).toBeGreaterThan(0);
    expect(proposals.every((proposal) => proposal.autoExecutable === false)).toBe(true);
  });
});
