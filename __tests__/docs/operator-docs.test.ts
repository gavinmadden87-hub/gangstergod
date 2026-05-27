import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// ── helpers ────────────────────────────────────────────────────────────────

function readDoc(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../', relativePath), 'utf8');
}

function hasSection(content: string, heading: string): boolean {
  return content.includes(`## ${heading}`) || content.includes(`# ${heading}`);
}

// ── DEPLOYMENT_STABILIZATION.md ────────────────────────────────────────────

describe('docs/DEPLOYMENT_STABILIZATION.md', () => {
  let content: string;
  beforeAll(() => {
    content = readDoc('docs/DEPLOYMENT_STABILIZATION.md');
  });

  it('file exists and is non-empty', () => {
    expect(content.length).toBeGreaterThan(0);
  });

  it('has a top-level heading', () => {
    expect(content).toMatch(/^# /m);
  });

  it('contains a Current baseline section', () => {
    expect(hasSection(content, 'Current baseline')).toBe(true);
  });

  it('contains a Do not merge directly section', () => {
    expect(hasSection(content, 'Do not merge directly')).toBe(true);
  });

  it('contains a Recovery sequence section', () => {
    expect(hasSection(content, 'Recovery sequence')).toBe(true);
  });

  it('contains a Codex guardrails section', () => {
    expect(hasSection(content, 'Codex guardrails')).toBe(true);
  });

  it('contains an Expansion hold section', () => {
    expect(hasSection(content, 'Expansion hold')).toBe(true);
  });

  it('identifies main as the default branch', () => {
    expect(content).toContain('Default branch: `main`');
  });

  it('identifies the stabilization branch', () => {
    expect(content).toContain('stabilize/deploy-codex-foundation');
  });

  it('lists stale reference PRs #1, #3, #4', () => {
    expect(content).toContain('PR #1');
    expect(content).toContain('PR #3');
    expect(content).toContain('PR #4');
  });

  it('PR #1 is labeled Fix security', () => {
    expect(content).toContain('PR #1: `Fix security`');
  });

  it('PR #3 is labeled Vercel/install and configure vercel', () => {
    expect(content).toMatch(/PR #3:.*Vercel/);
  });

  it('PR #4 is labeled Fix and merge', () => {
    expect(content).toContain('PR #4: `Fix and merge`');
  });

  it('recovery sequence starts with keeping raw secrets out of the repo', () => {
    expect(content).toMatch(/1\.\s+Keep raw secrets out of the repository/);
  });

  it('recovery sequence mentions OPENAI_API_KEY as a required Vercel secret', () => {
    expect(content).toContain('OPENAI_API_KEY');
  });

  it('recovery sequence mandates deploying preview before production', () => {
    const recoveryStart = content.indexOf('## Recovery sequence');
    const recoveryBlock = content.slice(
      recoveryStart,
      content.indexOf('##', recoveryStart + 3)
    );
    expect(recoveryBlock).toContain('Deploy preview first');
    expect(recoveryBlock).toContain('Promote production only after preview passes');
  });

  it('recovery sequence lists npm install, lint, and build commands', () => {
    expect(content).toContain('npm install');
    expect(content).toContain('npm run lint');
    expect(content).toContain('npm run build');
  });

  it('Codex guardrails permit analyze, draft, patch, and test', () => {
    const guardrailsStart = content.indexOf('## Codex guardrails');
    const guardrailsBlock = content.slice(
      guardrailsStart,
      content.indexOf('##', guardrailsStart + 3)
    );
    expect(guardrailsBlock).toContain('analyze');
    expect(guardrailsBlock).toContain('draft');
    expect(guardrailsBlock).toContain('patch');
    expect(guardrailsBlock).toContain('test');
  });

  it('Codex guardrails forbid silently merging or deploying production', () => {
    expect(content).toContain('not silently merge or deploy production changes');
  });

  it('required controls mandate human approval before merge', () => {
    expect(content).toContain('Human approval before merge');
  });

  it('required controls mandate human approval before production deployment', () => {
    expect(content).toContain('Human approval before production deployment');
  });

  it('required controls mandate no raw API keys', () => {
    expect(content).toContain('No raw API keys');
  });

  it('required controls mandate CI validation before deployment', () => {
    expect(content).toContain('CI validation before deployment');
  });

  it('expansion hold covers Adalo and Base44 modules', () => {
    expect(content).toContain('Adalo');
    expect(content).toContain('Base44');
  });

  // boundary: ensure the file does not itself contain any raw API key patterns
  it('does not contain any raw API key values (no sk- or similar patterns)', () => {
    expect(content).not.toMatch(/sk-[A-Za-z0-9]{20,}/);
  });
});

// ── OPERATOR_PROTOCOL.md ───────────────────────────────────────────────────

describe('docs/OPERATOR_PROTOCOL.md', () => {
  let content: string;
  beforeAll(() => {
    content = readDoc('docs/OPERATOR_PROTOCOL.md');
  });

  it('file exists and is non-empty', () => {
    expect(content.length).toBeGreaterThan(0);
  });

  it('has a top-level heading', () => {
    expect(content).toMatch(/^# /m);
  });

  it('contains an Authority model section', () => {
    expect(hasSection(content, 'Authority model')).toBe(true);
  });

  it('contains a Non-negotiable rules section', () => {
    expect(hasSection(content, 'Non-negotiable rules')).toBe(true);
  });

  it('contains a Proof requirements section', () => {
    expect(hasSection(content, 'Proof requirements')).toBe(true);
  });

  it('contains a Mission loop section', () => {
    expect(hasSection(content, 'Mission loop')).toBe(true);
  });

  it('contains a Deployment rule section', () => {
    expect(hasSection(content, 'Deployment rule')).toBe(true);
  });

  it('contains a Codex rule section', () => {
    expect(hasSection(content, 'Codex rule')).toBe(true);
  });

  it('contains a Revenue integration rule section', () => {
    expect(hasSection(content, 'Revenue integration rule')).toBe(true);
  });

  it('contains a Current command state section', () => {
    expect(hasSection(content, 'Current command state')).toBe(true);
  });

  it('authority model assigns strategy to God-Head', () => {
    const authBlock = content.slice(
      content.indexOf('## Authority model'),
      content.indexOf('##', content.indexOf('## Authority model') + 3)
    );
    expect(authBlock).toContain('God-Head');
    expect(authBlock).toContain('strategy');
  });

  it('authority model assigns implementation acceleration to Codex', () => {
    const authBlock = content.slice(
      content.indexOf('## Authority model'),
      content.indexOf('##', content.indexOf('## Authority model') + 3)
    );
    expect(authBlock).toContain('Codex');
  });

  it('authority model assigns merge/production approval to human operator', () => {
    const authBlock = content.slice(
      content.indexOf('## Authority model'),
      content.indexOf('##', content.indexOf('## Authority model') + 3)
    );
    expect(authBlock).toContain('human operator');
    expect(authBlock).toContain('approves');
  });

  it('non-negotiable rules include no raw secrets in repository', () => {
    expect(content).toContain('No raw secrets');
  });

  it('non-negotiable rules include no autonomous production deployment', () => {
    expect(content).toContain('No autonomous production deployment without human approval');
  });

  it('non-negotiable rules include no merge without proof', () => {
    expect(content).toContain('No merge without proof');
  });

  it('non-negotiable rules include no feature expansion while deployment is failing', () => {
    expect(content).toContain('No feature expansion while deployment is failing');
  });

  it('non-negotiable rules include no stale PR merge without manual harvest', () => {
    expect(content).toContain('No stale PR merge without manual harvest');
  });

  it('has exactly 6 non-negotiable rules', () => {
    const rulesStart = content.indexOf('## Non-negotiable rules');
    const rulesEnd = content.indexOf('##', rulesStart + 3);
    const rulesBlock = content.slice(rulesStart, rulesEnd);
    const numberedItems = rulesBlock.match(/^\d+\.\s/gm) ?? [];
    expect(numberedItems).toHaveLength(6);
  });

  const proofArtifacts = [
    'Commit SHA',
    'Pull request number',
    'Passing CI result',
    'Build log summary',
    'Preview deployment link',
    'Production deployment result',
    'Lead record',
    'Client message',
    'Revenue record',
    'Decision log entry',
    'Rollback note',
  ];
  it.each(proofArtifacts)('proof requirements list includes "%s"', (artifact) => {
    expect(content).toContain(artifact);
  });

  it('mission loop code block starts with observe signals', () => {
    const loopStart = content.indexOf('```text\nobserve signals');
    expect(loopStart).toBeGreaterThan(-1);
  });

  it('mission loop includes deploy preview first step', () => {
    expect(content).toContain('deploy preview first');
  });

  it('mission loop includes promote production after proof step', () => {
    expect(content).toContain('promote production after proof');
  });

  it('mission loop includes monitor regression step', () => {
    expect(content).toContain('monitor regression');
  });

  it('deployment rule requires secrets set in Vercel dashboard, not repo', () => {
    const deployStart = content.indexOf('## Deployment rule');
    const deployBlock = content.slice(
      deployStart,
      content.indexOf('##', deployStart + 3)
    );
    expect(deployBlock).toContain('Secrets set in Vercel dashboard, not repo');
  });

  it('deployment rule requires human operator approval', () => {
    const deployStart = content.indexOf('## Deployment rule');
    const deployBlock = content.slice(
      deployStart,
      content.indexOf('##', deployStart + 3)
    );
    expect(deployBlock).toContain('Human operator approves');
  });

  const codexPermitted = [
    'analyze repository structure',
    'draft patches',
    'generate tests',
    'propose refactors',
    'summarize risk',
    'prepare pull requests',
  ];
  it.each(codexPermitted)('Codex rule permits "%s"', (action) => {
    const codexStart = content.indexOf('## Codex rule');
    const codexBlock = content.slice(
      codexStart,
      content.indexOf('##', codexStart + 3)
    );
    expect(codexBlock).toContain(action);
  });

  const codexForbidden = [
    'silently merge',
    'silently deploy production',
    'broaden secret access',
    'mutate architecture without a decision log entry',
    "treat its own confidence as proof",
  ];
  it.each(codexForbidden)('Codex rule forbids "%s"', (action) => {
    const codexStart = content.indexOf('## Codex rule');
    const codexBlock = content.slice(
      codexStart,
      content.indexOf('##', codexStart + 3)
    );
    expect(codexBlock).toContain(action);
  });

  it('revenue integration rule mentions deployment trust prerequisite', () => {
    const revenueStart = content.indexOf('## Revenue integration rule');
    const revenueBlock = content.slice(
      revenueStart,
      content.indexOf('##', revenueStart + 3)
    );
    expect(revenueBlock).toContain('deployment trust is restored');
  });

  it('current command state identifies PR #15 as stabilization lane', () => {
    const stateStart = content.indexOf('## Current command state');
    const stateBlock = content.slice(stateStart);
    expect(stateBlock).toContain('PR #15');
    expect(stateBlock).toContain('stabilization');
  });

  it('current command state identifies PR #1, #3, #4 as reference only', () => {
    const stateStart = content.indexOf('## Current command state');
    const stateBlock = content.slice(stateStart);
    expect(stateBlock).toContain('PR #1, PR #3, and PR #4 are reference only');
  });

  // boundary/negative: file must not itself contain raw API key patterns
  it('does not contain any raw API key values (no sk- or Bearer token patterns)', () => {
    expect(content).not.toMatch(/sk-[A-Za-z0-9]{20,}/);
    expect(content).not.toMatch(/Bearer\s+[A-Za-z0-9._\-]{20,}/);
  });
});