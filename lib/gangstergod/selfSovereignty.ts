import type { AuthorityDecision, Mission, MissionContext } from './types';

export class SelfSovereignty {
  private readonly decisions: AuthorityDecision[] = [];
  private readonly clock: () => Date;

  constructor(options: Partial<{ clock: () => Date }> = {}) {
    this.clock = options.clock ?? (() => new Date());
  }

  evaluateMission(mission: Mission = {}, context: MissionContext = {}): AuthorityDecision {
    const action = mission.action ?? mission.type ?? mission.intent ?? 'unknown';
    const environment = mission.environment ?? mission.env ?? 'local';
    const visibility = mission.visibility ?? mission.audience ?? 'internal';
    const missionId = mission.id ?? mission.missionId ?? `mission_${Date.now()}`;
    const channel = mission.channel ?? null;
    const actor = context.actor ?? mission.actor ?? 'system';

    const base = { missionId, action, environment, channel, actor, timestamp: this.clock().toISOString() };

    if (environment === 'production' && ['deploy', 'deployment', 'release', 'publish'].includes(action)) {
      const hasApproval = Boolean(context.productionDeploymentAuthorized || mission.authorized || mission.approvedBy || mission.authorizationToken);
      if (!hasApproval) {
        return this.record({
          ...base,
          allowed: false,
          status: 'blocked',
          authorityLevel: 'god_head_required',
          reason: 'Production release requires explicit approval.',
        });
      }
    }

    if (visibility === 'public' && ['customer_message', 'send_message', 'email_customer', 'post_social', 'publish_copy'].includes(action)) {
      const hasApproval = Boolean(context.customerMessagingApproved || mission.approved || mission.approvedBy);
      if (!hasApproval) {
        return this.record({
          ...base,
          allowed: false,
          status: 'approval_required',
          authorityLevel: 'human_approval_required',
          reason: 'Public customer messaging requires approval.',
        });
      }
    }

    if (environment === 'local' && ['test', 'run_tests', 'local_test_execution'].includes(action)) {
      return this.record({
        ...base,
        allowed: true,
        status: 'allowed',
        authorityLevel: 'local_autonomy',
        reason: 'Local test execution is allowed.',
      });
    }

    return this.record({
      ...base,
      allowed: true,
      status: 'allowed',
      authorityLevel: 'standard_autonomy',
      reason: 'Mission passed policy checks.',
    });
  }

  getDecisionLog() {
    return [...this.decisions];
  }

  getLastDecision() {
    return this.decisions.at(-1) ?? null;
  }

  private record(decision: AuthorityDecision) {
    this.decisions.push(decision);
    return decision;
  }
}
