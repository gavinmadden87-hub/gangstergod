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

// ── signals.md ─────────────────────────────────────────────────────────────

describe('codex/mission_control/signals.md', () => {
  let content: string;
  beforeAll(() => {
    content = readDoc('codex/mission_control/signals.md');
  });

  it('file exists and is non-empty', () => {
    expect(content.length).toBeGreaterThan(0);
  });

  it('has a top-level heading', () => {
    expect(content).toMatch(/^# /m);
  });

  it('contains a Signal types section', () => {
    expect(hasSection(content, 'Signal types')).toBe(true);
  });

  it('contains a Ranking rule section', () => {
    expect(hasSection(content, 'Ranking rule')).toBe(true);
  });

  it('contains a Current baseline signals section', () => {
    expect(hasSection(content, 'Current baseline signals')).toBe(true);
  });

  const expectedSignals = ['deploy', 'repo', 'lead', 'revenue', 'agent', 'proof', 'risk'];
  it.each(expectedSignals)('signal type "%s" is present in the table', (signal) => {
    expect(content).toContain(`| ${signal} |`);
  });

  it('deploy signal has critical priority', () => {
    expect(content).toMatch(/\|\s*deploy\s*\|[^|]+\|\s*critical\s*\|/);
  });

  it('proof signal has critical priority', () => {
    expect(content).toMatch(/\|\s*proof\s*\|[^|]+\|\s*critical\s*\|/);
  });

  it('risk signal has critical priority', () => {
    expect(content).toMatch(/\|\s*risk\s*\|[^|]+\|\s*critical\s*\|/);
  });

  it('repo signal has high priority', () => {
    expect(content).toMatch(/\|\s*repo\s*\|[^|]+\|\s*high\s*\|/);
  });

  it('agent signal has medium priority', () => {
    expect(content).toMatch(/\|\s*agent\s*\|[^|]+\|\s*medium\s*\|/);
  });

  it('states that a mission without proof is not complete', () => {
    expect(content).toContain('A mission without proof is not complete');
  });

  it('references Vercel deployment verification requirement', () => {
    expect(content).toContain('Vercel deployment must be verified');
  });

  it('states Codex may draft and test but may not silently merge or deploy', () => {
    expect(content).toContain('may not silently merge or deploy');
  });

  it('has a signal table with 3 columns (Signal, Meaning, Default priority)', () => {
    expect(content).toContain('| Signal |');
    expect(content).toContain('| Meaning |');
    expect(content).toContain('| Default priority |');
  });

  it('lists all 7 signal types (no extra or missing rows)', () => {
    const tableRowMatches = content.match(/^\|\s*\w+\s*\|/gm) ?? [];
    // Subtract the header row and divider row
    const dataRows = tableRowMatches.filter(
      (r) => !r.includes('Signal') && !r.includes('---')
    );
    expect(dataRows).toHaveLength(7);
  });
});

// ── active_missions.md ─────────────────────────────────────────────────────

describe('codex/mission_control/active_missions.md', () => {
  let content: string;
  beforeAll(() => {
    content = readDoc('codex/mission_control/active_missions.md');
  });

  it('file exists and is non-empty', () => {
    expect(content.length).toBeGreaterThan(0);
  });

  it('has a top-level heading', () => {
    expect(content).toMatch(/^# /m);
  });

  it('contains a Mission ranking section', () => {
    expect(hasSection(content, 'Mission ranking')).toBe(true);
  });

  it('contains an Active missions section', () => {
    expect(hasSection(content, 'Active missions')).toBe(true);
  });

  it('contains a Completion rule section', () => {
    expect(hasSection(content, 'Completion rule')).toBe(true);
  });

  it('mission ranking has Critical stability risk as first priority', () => {
    expect(content).toMatch(/1\.\s+Critical stability risk/);
  });

  it('mission ranking has 7 priority levels', () => {
    const lines = content
      .split('\n')
      .filter((l) => /^\d+\.\s/.test(l.trim()));
    expect(lines).toHaveLength(7);
  });

  it('contains mission M-001', () => {
    expect(content).toContain('M-001');
  });

  it('contains mission M-002', () => {
    expect(content).toContain('M-002');
  });

  it('contains mission M-003', () => {
    expect(content).toContain('M-003');
  });

  it('contains mission M-004', () => {
    expect(content).toContain('M-004');
  });

  it('M-001 has critical priority', () => {
    const m001Block = content.slice(
      content.indexOf('### M-001'),
      content.indexOf('### M-002')
    );
    expect(m001Block).toContain('Priority: critical');
  });

  it('M-004 has queued status', () => {
    const m004Start = content.indexOf('### M-004');
    const m004Block = content.slice(m004Start);
    expect(m004Block).toContain('Status: queued');
  });

  it('every active mission has a Type field', () => {
    const missionBlocks = ['M-001', 'M-002', 'M-003', 'M-004'].map((id) => {
      const start = content.indexOf(`### ${id}`);
      const nextMission = content.indexOf('### M-', start + 1);
      return nextMission === -1
        ? content.slice(start)
        : content.slice(start, nextMission);
    });
    missionBlocks.forEach((block) => {
      expect(block).toContain('- Type:');
    });
  });

  it('every active mission has an Owner field', () => {
    ['M-001', 'M-002', 'M-003', 'M-004'].forEach((id) => {
      const start = content.indexOf(`### ${id}`);
      const nextMission = content.indexOf('### M-', start + 1);
      const block =
        nextMission === -1 ? content.slice(start) : content.slice(start, nextMission);
      expect(block).toContain('- Owner:');
    });
  });

  it('every active mission has a Proof required field', () => {
    ['M-001', 'M-002', 'M-003', 'M-004'].forEach((id) => {
      const start = content.indexOf(`### ${id}`);
      const nextMission = content.indexOf('### M-', start + 1);
      const block =
        nextMission === -1 ? content.slice(start) : content.slice(start, nextMission);
      expect(block).toContain('- Proof required:');
    });
  });

  it('completion rule states verbal confidence is not proof', () => {
    expect(content).toContain('Verbal confidence is not proof');
  });
});

// ── agent_reports.md ───────────────────────────────────────────────────────

describe('codex/mission_control/agent_reports.md', () => {
  let content: string;
  beforeAll(() => {
    content = readDoc('codex/mission_control/agent_reports.md');
  });

  it('file exists and is non-empty', () => {
    expect(content.length).toBeGreaterThan(0);
  });

  it('contains a Required report format section', () => {
    expect(hasSection(content, 'Required report format')).toBe(true);
  });

  it('contains a Report template section', () => {
    expect(hasSection(content, 'Report template')).toBe(true);
  });

  it('contains a Proof artifacts section', () => {
    expect(hasSection(content, 'Proof artifacts')).toBe(true);
  });

  it('contains a Rejection rule section', () => {
    expect(hasSection(content, 'Rejection rule')).toBe(true);
  });

  const requiredReportFields = [
    'Agent name',
    'Mission ID',
    'Observation',
    'Action taken or proposed',
    'Proof artifact',
    'Risk level',
    'Next recommended move',
  ];
  it.each(requiredReportFields)(
    'required report format includes "%s"',
    (field) => {
      expect(content).toContain(field);
    }
  );

  const templateFields = [
    'Agent:',
    'Mission ID:',
    'Signal type:',
    'Observation:',
    'Action:',
    'Proof:',
    'Risk:',
    'Next move:',
    'Status:',
  ];
  it.each(templateFields)('report template includes field "%s"', (field) => {
    expect(content).toContain(field);
  });

  const proofArtifacts = [
    'Commit SHA',
    'Pull request link or number',
    'Test result',
    'Build log summary',
    'Deployment link',
    'Lead record',
    'Client message',
    'Revenue record',
    'Decision log entry',
    'Rollback note',
  ];
  it.each(proofArtifacts)('proof artifacts list includes "%s"', (artifact) => {
    expect(content).toContain(artifact);
  });

  it('rejection rule requires proof, risk, and next move', () => {
    expect(content).toContain('proof');
    expect(content).toContain('risk');
    expect(content).toContain('next move');
  });

  it('current report includes a proof commit SHA', () => {
    // The report in the file cites specific commit SHAs
    expect(content).toMatch(/[0-9a-f]{40}/);
  });

  it('current report includes a risk level', () => {
    expect(content).toMatch(/Risk:\s*\w+/);
  });

  it('current report includes a next move', () => {
    expect(content).toMatch(/Next move:/);
  });

  it('current report has a status field', () => {
    expect(content).toMatch(/Status:\s*\w+/);
  });
});

// ── decision_log.md ────────────────────────────────────────────────────────

describe('codex/mission_control/decision_log.md', () => {
  let content: string;
  beforeAll(() => {
    content = readDoc('codex/mission_control/decision_log.md');
  });

  it('file exists and is non-empty', () => {
    expect(content.length).toBeGreaterThan(0);
  });

  it('contains a Decision format section', () => {
    expect(hasSection(content, 'Decision format')).toBe(true);
  });

  it('contains a Decisions section', () => {
    expect(hasSection(content, 'Decisions')).toBe(true);
  });

  const templateFields = [
    'Decision ID:',
    'Date:',
    'Mission ID:',
    'Signal type:',
    'Decision:',
    'Reason:',
    'Proof:',
    'Risk:',
    'Rollback condition:',
    'Owner:',
    'Status:',
  ];
  it.each(templateFields)('decision template includes field "%s"', (field) => {
    expect(content).toContain(field);
  });

  it('decision template has 11 fields', () => {
    // Count occurrences of 'fieldname:' style entries in the code block
    const templateStart = content.indexOf('```text');
    const templateEnd = content.indexOf('```', templateStart + 5);
    const templateBlock = content.slice(templateStart, templateEnd);
    const fieldCount = (templateBlock.match(/^\w[^:]+:/gm) ?? []).length;
    expect(fieldCount).toBe(11);
  });

  it('contains decision D-001', () => {
    expect(content).toContain('D-001');
  });

  it('contains decision D-002', () => {
    expect(content).toContain('D-002');
  });

  it('contains decision D-003', () => {
    expect(content).toContain('D-003');
  });

  it('D-001 is dated 2026-05-27', () => {
    const d001Block = content.slice(
      content.indexOf('### D-001'),
      content.indexOf('### D-002')
    );
    expect(d001Block).toContain('2026-05-27');
  });

  it('D-001 links to M-001', () => {
    const d001Block = content.slice(
      content.indexOf('### D-001'),
      content.indexOf('### D-002')
    );
    expect(d001Block).toContain('M-001');
  });

  it('D-002 identifies stale PRs #1, #3, #4', () => {
    const d002Block = content.slice(
      content.indexOf('### D-002'),
      content.indexOf('### D-003')
    );
    expect(d002Block).toContain('PR #1');
    expect(d002Block).toContain('PR #3');
    expect(d002Block).toContain('PR #4');
  });

  it('D-003 restricts autonomous merge and deploy', () => {
    const d003Block = content.slice(content.indexOf('### D-003'));
    expect(d003Block).toContain('may not silently merge or deploy');
  });

  it('D-003 has critical risk if ignored', () => {
    const d003Block = content.slice(content.indexOf('### D-003'));
    expect(d003Block).toMatch(/risk:\s*critical/i);
  });

  it('each decision block has an Owner field', () => {
    ['D-001', 'D-002', 'D-003'].forEach((id) => {
      const start = content.indexOf(`### ${id}`);
      const nextDecision = content.indexOf('### D-', start + 1);
      const block =
        nextDecision === -1 ? content.slice(start) : content.slice(start, nextDecision);
      expect(block).toContain('Owner:');
    });
  });

  it('each decision block has a Rollback condition field', () => {
    ['D-001', 'D-002', 'D-003'].forEach((id) => {
      const start = content.indexOf(`### ${id}`);
      const nextDecision = content.indexOf('### D-', start + 1);
      const block =
        nextDecision === -1 ? content.slice(start) : content.slice(start, nextDecision);
      expect(block).toContain('Rollback condition:');
    });
  });
});