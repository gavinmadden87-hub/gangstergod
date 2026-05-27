import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

const WORKFLOW_PATH = path.resolve(
  __dirname,
  '../../.github/workflows/vercelbot-deploy.yml'
);

type WorkflowJob = {
  name: string;
  'runs-on': string;
  needs?: string | string[];
  if?: string;
  permissions?: Record<string, string>;
  steps: Array<{
    name?: string;
    uses?: string;
    run?: string;
    with?: Record<string, unknown>;
    env?: Record<string, string>;
    id?: string;
  }>;
};

type WorkflowDocument = {
  name: string;
  on: Record<string, unknown>;
  concurrency: {
    group: string;
    'cancel-in-progress': boolean;
  };
  jobs: Record<string, WorkflowJob>;
};

let workflow: WorkflowDocument;

beforeAll(() => {
  const raw = fs.readFileSync(WORKFLOW_PATH, 'utf8');
  workflow = yaml.load(raw) as WorkflowDocument;
});

describe('vercelbot-deploy.yml – file integrity', () => {
  it('parses as valid YAML without throwing', () => {
    expect(() => {
      const raw = fs.readFileSync(WORKFLOW_PATH, 'utf8');
      yaml.load(raw);
    }).not.toThrow();
  });

  it('has workflow name "Vercelbot Deploy"', () => {
    expect(workflow.name).toBe('Vercelbot Deploy');
  });
});

describe('vercelbot-deploy.yml – triggers', () => {
  it('includes workflow_dispatch trigger', () => {
    expect(workflow.on).toHaveProperty('workflow_dispatch');
  });

  it('includes pull_request trigger targeting main branch', () => {
    const pr = workflow.on['pull_request'] as { branches: string[] };
    expect(pr).toBeDefined();
    expect(pr.branches).toContain('main');
  });

  it('includes push trigger targeting main branch', () => {
    const push = workflow.on['push'] as { branches: string[] };
    expect(push).toBeDefined();
    expect(push.branches).toContain('main');
  });

  it('push trigger also targets work branch', () => {
    const push = workflow.on['push'] as { branches: string[] };
    expect(push.branches).toContain('work');
  });

  it('pull_request trigger does not include the work branch', () => {
    const pr = workflow.on['pull_request'] as { branches: string[] };
    expect(pr.branches).not.toContain('work');
  });
});

describe('vercelbot-deploy.yml – concurrency', () => {
  it('defines a concurrency group', () => {
    expect(workflow.concurrency).toBeDefined();
    expect(workflow.concurrency.group).toMatch(/vercelbot/);
  });

  it('cancels in-progress runs', () => {
    expect(workflow.concurrency['cancel-in-progress']).toBe(true);
  });
});

describe('vercelbot-deploy.yml – jobs present', () => {
  it('defines a validate job', () => {
    expect(workflow.jobs).toHaveProperty('validate');
  });

  it('defines a deploy-production job', () => {
    expect(workflow.jobs).toHaveProperty('deploy-production');
  });

  it('has exactly two jobs', () => {
    expect(Object.keys(workflow.jobs)).toHaveLength(2);
  });
});

describe('vercelbot-deploy.yml – validate job', () => {
  let job: WorkflowJob;
  beforeAll(() => {
    job = workflow.jobs['validate'];
  });

  it('has display name "Validate build"', () => {
    expect(job.name).toBe('Validate build');
  });

  it('runs on ubuntu-latest', () => {
    expect(job['runs-on']).toBe('ubuntu-latest');
  });

  it('has contents:read permission', () => {
    expect(job.permissions?.contents).toBe('read');
  });

  it('has pull-requests:read permission (not write)', () => {
    expect(job.permissions?.['pull-requests']).toBe('read');
  });

  it('does not have deployments permission', () => {
    expect(job.permissions?.deployments).toBeUndefined();
  });

  it('does not have needs dependency', () => {
    expect(job.needs).toBeUndefined();
  });

  it('has no conditional (runs on all triggers)', () => {
    expect(job.if).toBeUndefined();
  });

  it('checks out code as first step', () => {
    const step = job.steps[0];
    expect(step.uses).toMatch(/actions\/checkout/);
  });

  it('sets up Node.js 20', () => {
    const nodeStep = job.steps.find((s) => s.uses?.includes('actions/setup-node'));
    expect(nodeStep).toBeDefined();
    expect(nodeStep?.with?.['node-version']).toBe(20);
  });

  it('installs dependencies with --legacy-peer-deps', () => {
    const installStep = job.steps.find(
      (s) => s.run?.includes('npm install') && s.run?.includes('--legacy-peer-deps')
    );
    expect(installStep).toBeDefined();
  });

  it('includes a lint step', () => {
    const lintStep = job.steps.find((s) => s.name === 'Lint');
    expect(lintStep).toBeDefined();
    expect(lintStep?.run).toContain('npm run lint');
  });

  it('lint step uses --if-present flag', () => {
    const lintStep = job.steps.find((s) => s.name === 'Lint');
    expect(lintStep?.run).toContain('--if-present');
  });

  it('includes a build step', () => {
    const buildStep = job.steps.find((s) => s.name === 'Build');
    expect(buildStep).toBeDefined();
    expect(buildStep?.run).toContain('npm run build');
  });

  it('lint step comes before build step', () => {
    const lintIdx = job.steps.findIndex((s) => s.name === 'Lint');
    const buildIdx = job.steps.findIndex((s) => s.name === 'Build');
    expect(lintIdx).toBeGreaterThanOrEqual(0);
    expect(buildIdx).toBeGreaterThan(lintIdx);
  });

  it('does not contain any Vercel deploy steps', () => {
    const vercelStep = job.steps.find((s) => s.run?.includes('vercel@latest deploy'));
    expect(vercelStep).toBeUndefined();
  });
});

describe('vercelbot-deploy.yml – deploy-production job', () => {
  let job: WorkflowJob;
  beforeAll(() => {
    job = workflow.jobs['deploy-production'];
  });

  it('has display name "Deploy production manually"', () => {
    expect(job.name).toBe('Deploy production manually');
  });

  it('runs on ubuntu-latest', () => {
    expect(job['runs-on']).toBe('ubuntu-latest');
  });

  it('depends on validate job via needs', () => {
    expect(job.needs).toBe('validate');
  });

  it('only runs on workflow_dispatch event', () => {
    expect(job.if).toContain('workflow_dispatch');
    expect(job.if).toContain("github.event_name == 'workflow_dispatch'");
  });

  it('has contents:read permission', () => {
    expect(job.permissions?.contents).toBe('read');
  });

  it('has deployments:write permission', () => {
    expect(job.permissions?.deployments).toBe('write');
  });

  it('has pull-requests:write permission', () => {
    expect(job.permissions?.['pull-requests']).toBe('write');
  });

  it('checks out code', () => {
    const step = job.steps.find((s) => s.uses?.includes('actions/checkout'));
    expect(step).toBeDefined();
  });

  it('sets up Node.js 20', () => {
    const nodeStep = job.steps.find((s) => s.uses?.includes('actions/setup-node'));
    expect(nodeStep).toBeDefined();
    expect(nodeStep?.with?.['node-version']).toBe(20);
  });

  it('installs dependencies with --legacy-peer-deps', () => {
    const installStep = job.steps.find(
      (s) => s.run?.includes('npm install') && s.run?.includes('--legacy-peer-deps')
    );
    expect(installStep).toBeDefined();
  });

  it('pulls Vercel project settings with production environment', () => {
    const pullStep = job.steps.find((s) => s.name === 'Pull Vercel project settings');
    expect(pullStep).toBeDefined();
    expect(pullStep?.run).toContain('--environment=production');
  });

  it('pulls Vercel settings using VERCEL_TOKEN secret', () => {
    const pullStep = job.steps.find((s) => s.name === 'Pull Vercel project settings');
    expect(pullStep?.env?.['VERCEL_TOKEN']).toContain('secrets.VERCEL_TOKEN');
  });

  it('builds Vercel artifact with --prod flag', () => {
    const buildStep = job.steps.find((s) => s.name === 'Build Vercel artifact');
    expect(buildStep).toBeDefined();
    expect(buildStep?.run).toContain('--prod');
  });

  it('deploys prebuilt artifact with --prebuilt flag', () => {
    const deployStep = job.steps.find((s) => s.name === 'Deploy prebuilt artifact');
    expect(deployStep).toBeDefined();
    expect(deployStep?.run).toContain('--prebuilt');
    expect(deployStep?.run).toContain('--prod');
  });

  it('deploy step captures DEPLOYMENT_URL output', () => {
    const deployStep = job.steps.find((s) => s.name === 'Deploy prebuilt artifact');
    expect(deployStep?.id).toBe('deploy');
    expect(deployStep?.run).toContain('GITHUB_OUTPUT');
    expect(deployStep?.run).toContain('deployment_url');
  });

  it('publishes deployment summary mentioning production deployment', () => {
    const summaryStep = job.steps.find((s) => s.name === 'Publish deployment summary');
    expect(summaryStep).toBeDefined();
    expect(summaryStep?.run).toContain('Vercelbot production deployment');
  });

  it('publishes deployment summary writing to GITHUB_STEP_SUMMARY', () => {
    const summaryStep = job.steps.find((s) => s.name === 'Publish deployment summary');
    expect(summaryStep?.run).toContain('GITHUB_STEP_SUMMARY');
  });

  it('includes VERCEL_ORG_ID and VERCEL_PROJECT_ID secrets in deploy step', () => {
    const deployStep = job.steps.find((s) => s.name === 'Deploy prebuilt artifact');
    expect(deployStep?.env?.['VERCEL_ORG_ID']).toContain('secrets.VERCEL_ORG_ID');
    expect(deployStep?.env?.['VERCEL_PROJECT_ID']).toContain('secrets.VERCEL_PROJECT_ID');
  });
});

describe('vercelbot-deploy.yml – security guardrails', () => {
  it('validate job does not have deployments permission', () => {
    const validateJob = workflow.jobs['validate'];
    expect(validateJob.permissions?.deployments).toBeUndefined();
  });

  it('no raw secret values appear in the YAML (secrets only via ${{ secrets.* }})', () => {
    const raw = fs.readFileSync(WORKFLOW_PATH, 'utf8');
    // Ensure secrets are only referenced via GitHub's secret syntax, not hardcoded
    expect(raw).not.toMatch(/VERCEL_TOKEN\s*=\s*["'][^$]/);
  });

  it('deploy-production job requires validate to pass first', () => {
    const deployJob = workflow.jobs['deploy-production'];
    // needs must be set so validate must pass before deploy runs
    expect(deployJob.needs).toBeDefined();
    const needs = Array.isArray(deployJob.needs)
      ? deployJob.needs
      : [deployJob.needs];
    expect(needs).toContain('validate');
  });

  it('production deployment is gated to workflow_dispatch only (not push or pull_request)', () => {
    const deployJob = workflow.jobs['deploy-production'];
    expect(deployJob.if).toBe("github.event_name == 'workflow_dispatch'");
  });
});