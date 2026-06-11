export class SelfModel {
  readonly nodeId: string;
  readonly version: string;
  readonly environment: string;
  readonly components: Record<string, string>;
  readonly capabilities: Set<string>;
  readonly constraints: Set<string>;

  constructor(options: Partial<{
    nodeId: string;
    version: string;
    environment: string;
    components: Record<string, string>;
    capabilities: string[];
    constraints: string[];
  }> = {}) {
    this.nodeId = options.nodeId ?? 'gangstergod-next-spine';
    this.version = options.version ?? '0.1.0';
    this.environment = options.environment ?? process.env.NODE_ENV ?? 'local';

    this.components = {
      EVENT_BUS: 'local-event-emitter',
      AGENT_REGISTRY: 'in-process-registry',
      MISSION_ROUTER: 'mission-router-module',
      SHARED_MEMORY: 'next-runtime-memory',
      MONITORING: 'self-monitor-module',
      SELF_MODEL: 'self-model-module',
      SELF_MONITOR: 'self-monitor-module',
      SELF_SOVEREIGNTY: 'self-sovereignty-policy-engine',
      SELF_AUDIT: 'authority-decision-log',
      SELF_REPAIR: 'pending-repair-service',
      SELF_OPTIMIZER: 'proposal-only-optimizer',
      ...options.components,
    };

    this.capabilities = new Set(options.capabilities ?? [
      'local_test_execution',
      'scientific_skill_routing',
      'authority_decision_logging',
      'health_score_reporting',
      'proposal_only_optimization',
    ]);

    this.constraints = new Set(options.constraints ?? [
      'no_unauthorized_production_deployments',
      'approval_required_for_public_customer_messaging',
      'record_all_authority_decisions',
      'optimizer_never_executes_directly',
    ]);
  }

  describe() {
    return {
      nodeId: this.nodeId,
      version: this.version,
      environment: this.environment,
      components: this.components,
      capabilities: Array.from(this.capabilities),
      constraints: Array.from(this.constraints),
      timestamp: new Date().toISOString(),
    };
  }

  hasCapability(capability: string) {
    return this.capabilities.has(capability);
  }

  hasConstraint(constraint: string) {
    return this.constraints.has(constraint);
  }
}
