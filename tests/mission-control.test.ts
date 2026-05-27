import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const MISSION_CONTROL_DIR = join(__dirname, "..", "codex", "mission_control");

function readDoc(filename: string): string {
  return readFileSync(join(MISSION_CONTROL_DIR, filename), "utf-8");
}

// ---------------------------------------------------------------------------
// signals.md
// ---------------------------------------------------------------------------
describe("codex/mission_control/signals.md – file integrity", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("signals.md");
  });

  it("exists and is non-empty", () => {
    expect(content.trim().length).toBeGreaterThan(0);
  });

  it("has the correct top-level heading", () => {
    expect(content).toContain("# GangsterGod Mission Control Signals");
  });

  it("contains a Signal types section", () => {
    expect(content).toContain("## Signal types");
  });

  it("contains a Ranking rule section", () => {
    expect(content).toContain("## Ranking rule");
  });

  it("contains a Current baseline signals section", () => {
    expect(content).toContain("## Current baseline signals");
  });
});

describe("codex/mission_control/signals.md – signal table", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("signals.md");
  });

  const requiredSignals = ["deploy", "repo", "lead", "revenue", "agent", "proof", "risk"];

  for (const signal of requiredSignals) {
    it(`defines the '${signal}' signal`, () => {
      expect(content).toContain(`| ${signal} |`);
    });
  }

  it("marks deploy signal as critical priority", () => {
    expect(content).toMatch(/deploy.*critical/);
  });

  it("marks proof signal as critical priority", () => {
    expect(content).toMatch(/proof.*critical/);
  });

  it("marks risk signal as critical priority", () => {
    expect(content).toMatch(/risk.*critical/);
  });

  it("marks repo signal as high priority", () => {
    expect(content).toMatch(/repo.*high/);
  });

  it("marks revenue signal as high priority", () => {
    expect(content).toMatch(/revenue.*high/);
  });

  it("marks agent signal as medium priority", () => {
    expect(content).toMatch(/agent.*medium/);
  });

  it("table has Signal, Meaning, and Default priority columns", () => {
    expect(content).toContain("| Signal |");
    expect(content).toContain("Meaning");
    expect(content).toContain("Default priority");
  });
});

describe("codex/mission_control/signals.md – ranking rule", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("signals.md");
  });

  it("states that a mission without proof is not complete", () => {
    expect(content).toContain("A mission without proof is not complete");
  });

  it("states that risk without proof causes a signal to move down or get blocked", () => {
    expect(content).toContain("risk without proof");
  });
});

describe("codex/mission_control/signals.md – baseline signals", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("signals.md");
  });

  it("references PR #15 as the stabilization lane", () => {
    expect(content).toContain("PR #15");
  });

  it("marks PR #1, #3, and #4 as stale reference", () => {
    expect(content).toContain("PR #1");
    expect(content).toContain("PR #3");
    expect(content).toContain("PR #4");
  });

  it("prohibits Codex from silently merging or deploying", () => {
    expect(content).toContain("may not silently merge or deploy");
  });
});

// ---------------------------------------------------------------------------
// active_missions.md
// ---------------------------------------------------------------------------
describe("codex/mission_control/active_missions.md – file integrity", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("active_missions.md");
  });

  it("exists and is non-empty", () => {
    expect(content.trim().length).toBeGreaterThan(0);
  });

  it("has the correct top-level heading", () => {
    expect(content).toContain("# GangsterGod Active Missions");
  });

  it("contains a Mission ranking section", () => {
    expect(content).toContain("## Mission ranking");
  });

  it("contains an Active missions section", () => {
    expect(content).toContain("## Active missions");
  });

  it("contains a Completion rule section", () => {
    expect(content).toContain("## Completion rule");
  });
});

describe("codex/mission_control/active_missions.md – mission ranking", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("active_missions.md");
  });

  it("lists Critical stability risk as the top priority", () => {
    expect(content).toContain("1. Critical stability risk");
  });

  it("lists Revenue opportunity as second priority", () => {
    expect(content).toContain("2. Revenue opportunity");
  });

  it("lists Security or secret exposure risk", () => {
    expect(content).toContain("Security or secret exposure risk");
  });

  it("lists Documentation as the lowest priority", () => {
    expect(content).toContain("7. Documentation");
  });
});

describe("codex/mission_control/active_missions.md – missions", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("active_missions.md");
  });

  const missions = ["M-001", "M-002", "M-003", "M-004"];

  for (const missionId of missions) {
    it(`defines mission ${missionId}`, () => {
      expect(content).toContain(`### ${missionId}:`);
    });
  }

  it("M-001 has critical priority", () => {
    expect(content).toMatch(/M-001[\s\S]*?Priority: critical/);
  });

  it("M-001 is of type deploy", () => {
    expect(content).toMatch(/M-001[\s\S]*?Type: deploy/);
  });

  it("M-001 status is active", () => {
    expect(content).toMatch(/M-001[\s\S]*?Status: active/);
  });

  it("M-001 requires proof artifacts", () => {
    expect(content).toMatch(/M-001[\s\S]*?Proof required:/);
  });

  it("M-002 is of type repo", () => {
    expect(content).toMatch(/M-002[\s\S]*?Type: repo/);
  });

  it("M-003 is of type agent", () => {
    expect(content).toMatch(/M-003[\s\S]*?Type: agent/);
  });

  it("M-004 status is queued (not yet active)", () => {
    expect(content).toMatch(/M-004[\s\S]*?Status: queued/);
  });

  it("M-004 is of type revenue", () => {
    expect(content).toMatch(/M-004[\s\S]*?Type: revenue/);
  });

  it("every active mission specifies an Owner field", () => {
    const missionBlocks = content.split(/### M-\d+:/);
    // skip the first element (preamble before any mission)
    const blocks = missionBlocks.slice(1);
    for (const block of blocks) {
      expect(block).toContain("Owner:");
    }
  });
});

describe("codex/mission_control/active_missions.md – completion rule", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("active_missions.md");
  });

  it("states a mission is complete only when proof exists", () => {
    expect(content).toContain("A mission is complete only when proof exists");
  });

  it("rejects verbal confidence as proof", () => {
    expect(content).toContain("Verbal confidence is not proof");
  });
});

// ---------------------------------------------------------------------------
// agent_reports.md
// ---------------------------------------------------------------------------
describe("codex/mission_control/agent_reports.md – file integrity", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("agent_reports.md");
  });

  it("exists and is non-empty", () => {
    expect(content.trim().length).toBeGreaterThan(0);
  });

  it("has the correct top-level heading", () => {
    expect(content).toContain("# GangsterGod Agent Reports");
  });

  it("contains a Required report format section", () => {
    expect(content).toContain("## Required report format");
  });

  it("contains a Report template section", () => {
    expect(content).toContain("## Report template");
  });

  it("contains a Proof artifacts section", () => {
    expect(content).toContain("## Proof artifacts");
  });

  it("contains a Rejection rule section", () => {
    expect(content).toContain("## Rejection rule");
  });

  it("contains a Current reports section", () => {
    expect(content).toContain("## Current reports");
  });
});

describe("codex/mission_control/agent_reports.md – required fields", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("agent_reports.md");
  });

  const requiredFields = [
    "Agent name",
    "Mission ID",
    "Observation",
    "Action taken or proposed",
    "Proof artifact",
    "Risk level",
    "Next recommended move",
  ];

  for (const field of requiredFields) {
    it(`lists '${field}' as a required field`, () => {
      expect(content).toContain(field);
    });
  }
});

describe("codex/mission_control/agent_reports.md – report template fields", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("agent_reports.md");
  });

  const templateFields = [
    "Agent:",
    "Mission ID:",
    "Signal type:",
    "Observation:",
    "Action:",
    "Proof:",
    "Risk:",
    "Next move:",
    "Status:",
  ];

  for (const field of templateFields) {
    it(`template contains '${field}'`, () => {
      expect(content).toContain(field);
    });
  }
});

describe("codex/mission_control/agent_reports.md – proof artifacts", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("agent_reports.md");
  });

  const acceptableProofs = [
    "Commit SHA",
    "Pull request link or number",
    "Test result",
    "Build log summary",
    "Deployment link",
    "Lead record",
    "Client message",
    "Revenue record",
    "Decision log entry",
    "Rollback note",
  ];

  for (const proof of acceptableProofs) {
    it(`lists '${proof}' as an acceptable proof artifact`, () => {
      expect(content).toContain(proof);
    });
  }
});

describe("codex/mission_control/agent_reports.md – rejection rule", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("agent_reports.md");
  });

  it("rejects outputs without proof", () => {
    expect(content).toContain("Reject outputs that do not include proof");
  });

  it("rejects outputs without risk", () => {
    expect(content).toContain("risk");
  });

  it("rejects outputs without next move", () => {
    expect(content).toContain("next move");
  });
});

describe("codex/mission_control/agent_reports.md – current reports", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("agent_reports.md");
  });

  it("includes a report for God-Head / Mission Control", () => {
    expect(content).toContain("God-Head / Mission Control");
  });

  it("report covers M-001, M-002, and M-003", () => {
    expect(content).toContain("M-001");
    expect(content).toContain("M-002");
    expect(content).toContain("M-003");
  });

  it("report includes a risk level", () => {
    const reportSection = content.split("## Current reports")[1] ?? "";
    expect(reportSection).toContain("Risk:");
  });

  it("report includes a next move", () => {
    const reportSection = content.split("## Current reports")[1] ?? "";
    expect(reportSection).toContain("Next move:");
  });

  it("report includes a proof artifact (commit SHA)", () => {
    const reportSection = content.split("## Current reports")[1] ?? "";
    expect(reportSection).toMatch(/[0-9a-f]{40}/);
  });

  it("report includes a status", () => {
    const reportSection = content.split("## Current reports")[1] ?? "";
    expect(reportSection).toContain("Status:");
  });
});

// ---------------------------------------------------------------------------
// decision_log.md
// ---------------------------------------------------------------------------
describe("codex/mission_control/decision_log.md – file integrity", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("decision_log.md");
  });

  it("exists and is non-empty", () => {
    expect(content.trim().length).toBeGreaterThan(0);
  });

  it("has the correct top-level heading", () => {
    expect(content).toContain("# GangsterGod Decision Log");
  });

  it("contains a Decision format section", () => {
    expect(content).toContain("## Decision format");
  });

  it("contains a Decisions section", () => {
    expect(content).toContain("## Decisions");
  });
});

describe("codex/mission_control/decision_log.md – decision format template", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("decision_log.md");
  });

  const templateFields = [
    "Decision ID:",
    "Date:",
    "Mission ID:",
    "Signal type:",
    "Decision:",
    "Reason:",
    "Proof:",
    "Risk:",
    "Rollback condition:",
    "Owner:",
    "Status:",
  ];

  for (const field of templateFields) {
    it(`decision format template contains '${field}'`, () => {
      expect(content).toContain(field);
    });
  }
});

describe("codex/mission_control/decision_log.md – decisions", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("decision_log.md");
  });

  const decisions = ["D-001", "D-002", "D-003"];

  for (const decisionId of decisions) {
    it(`defines decision ${decisionId}`, () => {
      expect(content).toContain(`### ${decisionId}:`);
    });
  }

  it("D-001 links to Mission M-001", () => {
    expect(content).toMatch(/D-001[\s\S]*?Mission ID: M-001/);
  });

  it("D-001 has an active status", () => {
    expect(content).toMatch(/D-001[\s\S]*?Status: active/);
  });

  it("D-002 links to Mission M-002", () => {
    expect(content).toMatch(/D-002[\s\S]*?Mission ID: M-002/);
  });

  it("D-003 links to Mission M-003", () => {
    expect(content).toMatch(/D-003[\s\S]*?Mission ID: M-003/);
  });

  it("D-003 risk is critical if ignored", () => {
    expect(content).toMatch(/D-003[\s\S]*?Risk: critical/);
  });

  it("every decision has an Owner field", () => {
    const decisionBlocks = content.split(/### D-\d+:/);
    const blocks = decisionBlocks.slice(1);
    for (const block of blocks) {
      expect(block).toContain("Owner:");
    }
  });

  it("every decision has a Proof field", () => {
    const decisionBlocks = content.split(/### D-\d+:/);
    const blocks = decisionBlocks.slice(1);
    for (const block of blocks) {
      expect(block).toContain("Proof:");
    }
  });

  it("every decision has a Rollback condition", () => {
    const decisionBlocks = content.split(/### D-\d+:/);
    const blocks = decisionBlocks.slice(1);
    for (const block of blocks) {
      expect(block).toContain("Rollback condition:");
    }
  });

  it("D-003 prohibits silent merge or deploy by agents", () => {
    expect(content).toContain("may not silently merge or deploy");
  });

  it("decisions contain dates in YYYY-MM-DD format", () => {
    const dateMatches = content.match(/Date: \d{4}-\d{2}-\d{2}/g);
    expect(dateMatches).toBeDefined();
    expect(dateMatches!.length).toBeGreaterThanOrEqual(3);
  });
});
