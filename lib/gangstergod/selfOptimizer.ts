import type { SelfMonitor } from './selfMonitor';

export type OptimizerProposal = {
  type: string;
  priority: 'low' | 'medium' | 'high';
  recommendation: string;
  autoExecutable: false;
};

export class SelfOptimizer {
  constructor(private readonly monitor?: SelfMonitor) {}

  propose(): OptimizerProposal[] {
    const snapshot = this.monitor?.snapshot();

    if (!snapshot) {
      return [{
        type: 'instrumentation',
        priority: 'high',
        recommendation: 'Attach SelfMonitor before optimizer activation.',
        autoExecutable: false,
      }];
    }

    const proposals: OptimizerProposal[] = [];

    if (snapshot.health.routingHealth < 90) {
      proposals.push({
        type: 'routing_reliability',
        priority: 'high',
        recommendation: 'Inspect failing mission handlers and isolate route errors.',
        autoExecutable: false,
      });
    }

    if (snapshot.health.observabilityHealth < 100) {
      proposals.push({
        type: 'observability',
        priority: 'high',
        recommendation: 'Record one authority decision for every mission path.',
        autoExecutable: false,
      });
    }

    if (snapshot.health.latencyHealth < 85) {
      proposals.push({
        type: 'latency',
        priority: 'medium',
        recommendation: 'Track slow mission types and isolate bottleneck agents.',
        autoExecutable: false,
      });
    }

    return proposals.length ? proposals : [{
      type: 'stability',
      priority: 'low',
      recommendation: 'System is stable enough for the next production adapter spike.',
      autoExecutable: false,
    }];
  }
}
