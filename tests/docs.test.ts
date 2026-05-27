import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const DOCS_DIR = join(__dirname, "..", "docs");

function readDoc(filename: string): string {
  return readFileSync(join(DOCS_DIR, filename), "utf-8");
}

// ---------------------------------------------------------------------------
// docs/DEPLOYMENT_STABILIZATION.md
// ---------------------------------------------------------------------------
describe("docs/DEPLOYMENT_STABILIZATION.md – file integrity", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("DEPLOYMENT_STABILIZATION.md");
  });

  it("exists and is non-empty", () => {
    expect(content.trim().length).toBeGreaterThan(0);
  });

  it("has the correct top-level heading", () => {
    expect(content).toContain("# Deployment Stabilization Plan");
  });

  it("contains a Current baseline section", () => {
    expect(content).toContain("## Current baseline");
  });

  it("contains a 'Do not merge directly' section", () => {
    expect(content).toContain("## Do not merge directly");
  });

  it("contains a Recovery sequence section", () => {
    expect(content).toContain("## Recovery sequence");
  });

  it("contains a Codex guardrails section", () => {
    expect(content).toContain("## Codex guardrails");
  });

  it("contains an Expansion hold section", () => {
    expect(content).toContain("## Expansion hold");
  });
});

describe("docs/DEPLOYMENT_STABILIZATION.md – current baseline", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("DEPLOYMENT_STABILIZATION.md");
  });

  it("identifies main as the default branch", () => {
    expect(content).toContain("Default branch: `main`");
  });

  it("identifies the stabilization branch", () => {
    expect(content).toContain("stabilize/deploy-codex-foundation");
  });

  it("lists the stale reference PRs", () => {
    expect(content).toContain("Stale reference PRs: #1, #3, #4");
  });
});

describe("docs/DEPLOYMENT_STABILIZATION.md – do not merge directly", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("DEPLOYMENT_STABILIZATION.md");
  });

  it("lists PR #1 as a restricted merge", () => {
    expect(content).toContain("PR #1");
  });

  it("lists PR #3 as a restricted merge", () => {
    expect(content).toContain("PR #3");
  });

  it("lists PR #4 as a restricted merge", () => {
    expect(content).toContain("PR #4");
  });

  it("prohibits force-merging into main", () => {
    expect(content).toContain("should not be force-merged into `main`");
  });
});

describe("docs/DEPLOYMENT_STABILIZATION.md – recovery sequence", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("DEPLOYMENT_STABILIZATION.md");
  });

  it("step 1 requires keeping raw secrets out of the repository", () => {
    expect(content).toContain("Keep raw secrets out of the repository");
  });

  it("step 2 requires setting secrets in the Vercel dashboard", () => {
    expect(content).toContain("Set required secrets in the Vercel dashboard");
  });

  it("mentions OPENAI_API_KEY as a required secret", () => {
    expect(content).toContain("OPENAI_API_KEY");
  });

  it("includes npm install in local build commands", () => {
    expect(content).toContain("`npm install`");
  });

  it("includes npm run lint in local build commands", () => {
    expect(content).toContain("`npm run lint`");
  });

  it("includes npm run build in local build commands", () => {
    expect(content).toContain("`npm run build`");
  });

  it("requires preview deployment before production promotion", () => {
    const sequence = content.split("## Recovery sequence")[1]?.split("##")[0] ?? "";
    const deployPreviewIndex = sequence.indexOf("Deploy preview first");
    const promoteProductionIndex = sequence.indexOf("Promote production only after preview");
    expect(deployPreviewIndex).toBeGreaterThanOrEqual(0);
    expect(promoteProductionIndex).toBeGreaterThan(deployPreviewIndex);
  });
});

describe("docs/DEPLOYMENT_STABILIZATION.md – Codex guardrails", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("DEPLOYMENT_STABILIZATION.md");
  });

  it("permits Codex to analyze, draft, patch, and test", () => {
    expect(content).toContain("Codex may analyze, draft, patch, and test");
  });

  it("prohibits Codex from silently merging or deploying", () => {
    expect(content).toContain("Codex must not silently merge or deploy production changes");
  });

  it("requires human approval before merge", () => {
    expect(content).toContain("Human approval before merge");
  });

  it("requires human approval before production deployment", () => {
    expect(content).toContain("Human approval before production deployment");
  });

  it("prohibits raw API keys in commits, docs, or logs", () => {
    expect(content).toContain("No raw API keys in chat, commits, issues, pull requests, docs, or logs");
  });

  it("requires CI validation before deployment", () => {
    expect(content).toContain("CI validation before deployment");
  });

  it("mandates limited secret scope", () => {
    expect(content).toContain("Limited secret scope");
  });
});

describe("docs/DEPLOYMENT_STABILIZATION.md – expansion hold", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("DEPLOYMENT_STABILIZATION.md");
  });

  it("pauses Adalo and Base44 expansion until deployment is stable", () => {
    expect(content).toContain("Pause new Adalo and Base44 module expansion until deployment is stable");
  });

  it("states expansion may resume after the deploy path is clean", () => {
    expect(content).toContain("resume after the GitHub and Vercel path is clean");
  });
});

// ---------------------------------------------------------------------------
// docs/OPERATOR_PROTOCOL.md
// ---------------------------------------------------------------------------
describe("docs/OPERATOR_PROTOCOL.md – file integrity", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("OPERATOR_PROTOCOL.md");
  });

  it("exists and is non-empty", () => {
    expect(content.trim().length).toBeGreaterThan(0);
  });

  it("has the correct top-level heading", () => {
    expect(content).toContain("# GangsterGod Operator Protocol");
  });

  it("contains an Authority model section", () => {
    expect(content).toContain("## Authority model");
  });

  it("contains a Non-negotiable rules section", () => {
    expect(content).toContain("## Non-negotiable rules");
  });

  it("contains a Proof requirements section", () => {
    expect(content).toContain("## Proof requirements");
  });

  it("contains a Mission loop section", () => {
    expect(content).toContain("## Mission loop");
  });

  it("contains a Deployment rule section", () => {
    expect(content).toContain("## Deployment rule");
  });

  it("contains a Codex rule section", () => {
    expect(content).toContain("## Codex rule");
  });

  it("contains a Revenue integration rule section", () => {
    expect(content).toContain("## Revenue integration rule");
  });

  it("contains a Current command state section", () => {
    expect(content).toContain("## Current command state");
  });
});

describe("docs/OPERATOR_PROTOCOL.md – authority model", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("OPERATOR_PROTOCOL.md");
  });

  it("assigns strategy ownership to God-Head", () => {
    expect(content).toContain("The God-Head owns strategy");
  });

  it("assigns implementation acceleration to Codex", () => {
    expect(content).toContain("Codex accelerates implementation");
  });

  it("assigns proof recording to GitHub", () => {
    expect(content).toContain("GitHub records proof");
  });

  it("assigns deployment proof to Vercel", () => {
    expect(content).toContain("Vercel proves deployment");
  });

  it("assigns merge and production release approval to human operator", () => {
    expect(content).toContain("The human operator approves merge and production release");
  });
});

describe("docs/OPERATOR_PROTOCOL.md – non-negotiable rules", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("OPERATOR_PROTOCOL.md");
  });

  it("rule 1 prohibits raw secrets in repository files", () => {
    expect(content).toContain("No raw secrets in repository files");
  });

  it("rule 2 prohibits autonomous production deployment without human approval", () => {
    expect(content).toContain("No autonomous production deployment without human approval");
  });

  it("rule 3 requires proof before merge", () => {
    expect(content).toContain("No merge without proof");
  });

  it("rule 4 prohibits feature expansion while deployment is failing", () => {
    expect(content).toContain("No feature expansion while deployment is failing");
  });

  it("rule 5 prohibits stale PR merge without manual harvest", () => {
    expect(content).toContain("No stale PR merge without manual harvest into a clean branch");
  });

  it("rule 6 requires every mission to include proof, risk, and next move", () => {
    expect(content).toContain("Every mission must include proof, risk, and next move");
  });

  it("has exactly 6 non-negotiable rules", () => {
    const rulesSection =
      content.split("## Non-negotiable rules")[1]?.split("## ")[0] ?? "";
    const ruleMatches = rulesSection.match(/^\d+\./gm);
    expect(ruleMatches).toBeDefined();
    expect(ruleMatches!.length).toBe(6);
  });
});

describe("docs/OPERATOR_PROTOCOL.md – proof requirements", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("OPERATOR_PROTOCOL.md");
  });

  const requiredProofTypes = [
    "Commit SHA",
    "Pull request number",
    "Passing CI result",
    "Build log summary",
    "Preview deployment link",
    "Production deployment result",
    "Lead record",
    "Client message",
    "Revenue record",
    "Decision log entry",
    "Rollback note",
  ];

  for (const proofType of requiredProofTypes) {
    it(`lists '${proofType}' as an accepted proof artifact`, () => {
      expect(content).toContain(proofType);
    });
  }
});

describe("docs/OPERATOR_PROTOCOL.md – mission loop", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("OPERATOR_PROTOCOL.md");
  });

  const missionSteps = [
    "observe signals",
    "rank mission",
    "assign owner",
    "draft change",
    "validate proof",
    "review risk",
    "approve or reject",
    "merge only when clean",
    "deploy preview first",
    "promote production after proof",
    "monitor regression",
  ];

  for (const step of missionSteps) {
    it(`mission loop includes step '${step}'`, () => {
      expect(content).toContain(step);
    });
  }

  it("deploy preview step comes before promote production step", () => {
    const loopSection =
      content.split("## Mission loop")[1]?.split("## ")[0] ?? "";
    const previewIndex = loopSection.indexOf("deploy preview first");
    const productionIndex = loopSection.indexOf("promote production after proof");
    expect(previewIndex).toBeGreaterThanOrEqual(0);
    expect(productionIndex).toBeGreaterThan(previewIndex);
  });
});

describe("docs/OPERATOR_PROTOCOL.md – deployment rule", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("OPERATOR_PROTOCOL.md");
  });

  it("describes preview as the proving ground", () => {
    expect(content).toContain("Preview is the proving ground");
  });

  it("describes production as guarded territory", () => {
    expect(content).toContain("Production is guarded territory");
  });

  it("requires secrets set in Vercel dashboard (not repo)", () => {
    expect(content).toContain("Secrets set in Vercel dashboard, not repo");
  });

  it("requires human operator approval before production", () => {
    expect(content).toContain("Human operator approves");
  });

  it("requires build to pass before production", () => {
    expect(content).toContain("Build passes");
  });

  it("requires preview deploy to work before production", () => {
    expect(content).toContain("Preview deploy works");
  });
});

describe("docs/OPERATOR_PROTOCOL.md – Codex rule", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("OPERATOR_PROTOCOL.md");
  });

  const codexMayActions = [
    "analyze repository structure",
    "draft patches",
    "generate tests",
    "propose refactors",
    "summarize risk",
    "prepare pull requests",
  ];

  for (const action of codexMayActions) {
    it(`Codex is permitted to '${action}'`, () => {
      expect(content).toContain(action);
    });
  }

  const codexMayNotActions = [
    "silently merge",
    "silently deploy production",
    "broaden secret access",
    "mutate architecture without a decision log entry",
    "treat its own confidence as proof",
  ];

  for (const action of codexMayNotActions) {
    it(`Codex is prohibited from '${action}'`, () => {
      expect(content).toContain(action);
    });
  }
});

describe("docs/OPERATOR_PROTOCOL.md – revenue integration rule", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("OPERATOR_PROTOCOL.md");
  });

  it("states that revenue work resumes after deployment trust is restored", () => {
    expect(content).toContain("Revenue work resumes after deployment trust is restored");
  });

  it("lists premium wedding photography lead capture as a revenue mission type", () => {
    expect(content).toContain("premium wedding photography lead capture");
  });

  it("allows manual override to mark a revenue mission as critical", () => {
    expect(content).toContain("manually marked critical");
  });
});

describe("docs/OPERATOR_PROTOCOL.md – current command state", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("OPERATOR_PROTOCOL.md");
  });

  it("identifies PR #15 as the stabilization and governance lane", () => {
    expect(content).toContain("PR #15 is the stabilization and governance lane");
  });

  it("marks PR #1, #3, and #4 as reference only", () => {
    const state = content.split("## Current command state")[1] ?? "";
    expect(state).toContain("PR #1");
    expect(state).toContain("PR #3");
    expect(state).toContain("PR #4");
    expect(state).toContain("reference only");
  });

  it("requires Vercel verification before expansion", () => {
    const state = content.split("## Current command state")[1] ?? "";
    expect(state).toContain("Vercel must be verified before expansion");
  });

  it("requires Codex key setup to be completed securely", () => {
    const state = content.split("## Current command state")[1] ?? "";
    expect(state).toContain("Codex key setup must be completed securely");
  });
});

describe("docs/OPERATOR_PROTOCOL.md – secret hygiene (negative tests)", () => {
  let content: string;

  beforeAll(() => {
    content = readDoc("OPERATOR_PROTOCOL.md");
  });

  it("does not contain AWS access key patterns", () => {
    expect(content).not.toMatch(/AKIA[A-Z0-9]{16}/);
  });

  it("does not contain OpenAI API key patterns", () => {
    expect(content).not.toMatch(/sk-[A-Za-z0-9]{32,}/);
  });

  it("does not contain a raw token value", () => {
    expect(content).not.toMatch(/Bearer\s+[A-Za-z0-9._\-]{20,}/);
  });
});