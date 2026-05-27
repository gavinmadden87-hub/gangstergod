import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";

const WORKFLOW_PATH = join(
  __dirname,
  "..",
  ".github",
  "workflows",
  "vercelbot-deploy.yml"
);

type WorkflowStep = {
  name: string;
  uses?: string;
  run?: string;
  with?: Record<string, unknown>;
  env?: Record<string, string>;
  id?: string;
};

type WorkflowJob = {
  name: string;
  "runs-on": string;
  needs?: string | string[];
  if?: string;
  permissions?: Record<string, string>;
  steps: WorkflowStep[];
};

type WorkflowTrigger = {
  branches?: string[];
};

type Workflow = {
  name: string;
  on: {
    workflow_dispatch?: unknown;
    pull_request?: WorkflowTrigger;
    push?: WorkflowTrigger;
  };
  concurrency?: {
    group: string;
    "cancel-in-progress": boolean;
  };
  jobs: Record<string, WorkflowJob>;
};

let workflow: Workflow;

beforeAll(() => {
  const raw = readFileSync(WORKFLOW_PATH, "utf-8");
  workflow = yaml.load(raw) as Workflow;
});

describe("vercelbot-deploy.yml – workflow metadata", () => {
  it("has the expected workflow name", () => {
    expect(workflow.name).toBe("Vercelbot Deploy");
  });

  it("is a valid YAML file that parses without errors", () => {
    expect(workflow).toBeDefined();
    expect(typeof workflow).toBe("object");
  });
});

describe("vercelbot-deploy.yml – triggers", () => {
  it("triggers on workflow_dispatch", () => {
    expect(workflow.on).toHaveProperty("workflow_dispatch");
  });

  it("triggers on pull_request targeting main", () => {
    expect(workflow.on.pull_request).toBeDefined();
    expect(workflow.on.pull_request?.branches).toContain("main");
  });

  it("triggers on push to main", () => {
    expect(workflow.on.push).toBeDefined();
    expect(workflow.on.push?.branches).toContain("main");
  });

  it("triggers on push to work branch", () => {
    expect(workflow.on.push?.branches).toContain("work");
  });

  it("does not trigger on push to arbitrary branch names", () => {
    const branches = workflow.on.push?.branches ?? [];
    expect(branches).not.toContain("feature/random");
    expect(branches).not.toContain("develop");
  });
});

describe("vercelbot-deploy.yml – concurrency", () => {
  it("defines a concurrency group", () => {
    expect(workflow.concurrency).toBeDefined();
    expect(workflow.concurrency?.group).toContain("vercelbot-");
  });

  it("cancels in-progress runs", () => {
    expect(workflow.concurrency?.["cancel-in-progress"]).toBe(true);
  });

  it("uses github.ref in the concurrency group key", () => {
    expect(workflow.concurrency?.group).toContain("github.ref");
  });
});

describe("vercelbot-deploy.yml – jobs structure", () => {
  it("defines exactly two jobs", () => {
    expect(Object.keys(workflow.jobs)).toHaveLength(2);
  });

  it("has a validate job", () => {
    expect(workflow.jobs).toHaveProperty("validate");
  });

  it("has a deploy-production job", () => {
    expect(workflow.jobs).toHaveProperty("deploy-production");
  });
});

describe("vercelbot-deploy.yml – validate job", () => {
  let job: WorkflowJob;

  beforeAll(() => {
    job = workflow.jobs["validate"];
  });

  it("has the correct display name", () => {
    expect(job.name).toBe("Validate build");
  });

  it("runs on ubuntu-latest", () => {
    expect(job["runs-on"]).toBe("ubuntu-latest");
  });

  it("has only read permissions for contents", () => {
    expect(job.permissions?.contents).toBe("read");
  });

  it("has only read permissions for pull-requests", () => {
    expect(job.permissions?.["pull-requests"]).toBe("read");
  });

  it("does not have deployments permission", () => {
    expect(job.permissions?.deployments).toBeUndefined();
  });

  it("does not have write permissions for pull-requests", () => {
    expect(job.permissions?.["pull-requests"]).not.toBe("write");
  });

  it("has a checkout step", () => {
    const step = job.steps.find((s) => s.name === "Checkout code");
    expect(step).toBeDefined();
    expect(step?.uses).toBe("actions/checkout@v4");
  });

  it("has a setup-node step targeting Node 20", () => {
    const step = job.steps.find((s) => s.name === "Setup Node.js");
    expect(step).toBeDefined();
    expect(step?.uses).toBe("actions/setup-node@v4");
    expect(step?.with?.["node-version"]).toBe(20);
  });

  it("caches npm dependencies", () => {
    const step = job.steps.find((s) => s.name === "Setup Node.js");
    expect(step?.with?.cache).toBe("npm");
    expect(step?.with?.["cache-dependency-path"]).toBe("package.json");
  });

  it("installs dependencies with legacy-peer-deps", () => {
    const step = job.steps.find((s) => s.name === "Install dependencies");
    expect(step).toBeDefined();
    expect(step?.run).toContain("npm install --legacy-peer-deps");
  });

  it("runs lint step", () => {
    const step = job.steps.find((s) => s.name === "Lint");
    expect(step).toBeDefined();
    expect(step?.run).toContain("npm run lint");
  });

  it("runs build step", () => {
    const step = job.steps.find((s) => s.name === "Build");
    expect(step).toBeDefined();
    expect(step?.run).toContain("npm run build");
  });

  it("lint runs before build (order check)", () => {
    const lintIndex = job.steps.findIndex((s) => s.name === "Lint");
    const buildIndex = job.steps.findIndex((s) => s.name === "Build");
    expect(lintIndex).toBeGreaterThanOrEqual(0);
    expect(buildIndex).toBeGreaterThanOrEqual(0);
    expect(lintIndex).toBeLessThan(buildIndex);
  });

  it("does not have Vercel deployment steps", () => {
    const vercelSteps = job.steps.filter(
      (s) => s.run?.includes("vercel") || s.name?.toLowerCase().includes("vercel")
    );
    expect(vercelSteps).toHaveLength(0);
  });
});

describe("vercelbot-deploy.yml – deploy-production job", () => {
  let job: WorkflowJob;

  beforeAll(() => {
    job = workflow.jobs["deploy-production"];
  });

  it("has the correct display name", () => {
    expect(job.name).toBe("Deploy production manually");
  });

  it("runs on ubuntu-latest", () => {
    expect(job["runs-on"]).toBe("ubuntu-latest");
  });

  it("depends on the validate job", () => {
    const needs = Array.isArray(job.needs) ? job.needs : [job.needs];
    expect(needs).toContain("validate");
  });

  it("is gated behind workflow_dispatch only", () => {
    expect(job.if).toContain("workflow_dispatch");
  });

  it("has write permission for deployments", () => {
    expect(job.permissions?.deployments).toBe("write");
  });

  it("has write permission for pull-requests", () => {
    expect(job.permissions?.["pull-requests"]).toBe("write");
  });

  it("has read permission for contents", () => {
    expect(job.permissions?.contents).toBe("read");
  });

  it("does not run on pull_request events (guarded by if condition)", () => {
    expect(job.if).not.toContain("pull_request");
  });

  it("has a checkout step", () => {
    const step = job.steps.find((s) => s.name === "Checkout code");
    expect(step).toBeDefined();
    expect(step?.uses).toBe("actions/checkout@v4");
  });

  it("has a setup-node step targeting Node 20", () => {
    const step = job.steps.find((s) => s.name === "Setup Node.js");
    expect(step).toBeDefined();
    expect(step?.with?.["node-version"]).toBe(20);
  });

  it("pulls Vercel project settings with production environment", () => {
    const step = job.steps.find((s) => s.name === "Pull Vercel project settings");
    expect(step).toBeDefined();
    expect(step?.run).toContain("vercel@latest pull");
    expect(step?.run).toContain("--environment=production");
  });

  it("uses VERCEL_TOKEN secret for pull step", () => {
    const step = job.steps.find((s) => s.name === "Pull Vercel project settings");
    expect(step?.env?.VERCEL_TOKEN).toContain("secrets.VERCEL_TOKEN");
  });

  it("uses VERCEL_ORG_ID secret", () => {
    const step = job.steps.find((s) => s.name === "Pull Vercel project settings");
    expect(step?.env?.VERCEL_ORG_ID).toContain("secrets.VERCEL_ORG_ID");
  });

  it("uses VERCEL_PROJECT_ID secret", () => {
    const step = job.steps.find((s) => s.name === "Pull Vercel project settings");
    expect(step?.env?.VERCEL_PROJECT_ID).toContain("secrets.VERCEL_PROJECT_ID");
  });

  it("builds the Vercel artifact for production", () => {
    const step = job.steps.find((s) => s.name === "Build Vercel artifact");
    expect(step).toBeDefined();
    expect(step?.run).toContain("vercel@latest build --prod");
  });

  it("deploys the prebuilt artifact", () => {
    const step = job.steps.find((s) => s.name === "Deploy prebuilt artifact");
    expect(step).toBeDefined();
    expect(step?.run).toContain("deploy --prebuilt --prod");
  });

  it("captures deployment URL as a step output", () => {
    const step = job.steps.find((s) => s.name === "Deploy prebuilt artifact");
    expect(step?.id).toBe("deploy");
    expect(step?.run).toContain("GITHUB_OUTPUT");
    expect(step?.run).toContain("deployment_url");
  });

  it("publishes a deployment summary to GITHUB_STEP_SUMMARY", () => {
    const step = job.steps.find((s) => s.name === "Publish deployment summary");
    expect(step).toBeDefined();
    expect(step?.run).toContain("GITHUB_STEP_SUMMARY");
  });

  it("summary mentions 'production deployment'", () => {
    const step = job.steps.find((s) => s.name === "Publish deployment summary");
    expect(step?.run).toContain("production deployment");
  });

  it("does not hardcode raw secrets in any step", () => {
    for (const step of job.steps) {
      if (step.run) {
        expect(step.run).not.toMatch(/AKIA[A-Z0-9]{16}/);
        expect(step.run).not.toMatch(/sk-[A-Za-z0-9]{32,}/);
      }
    }
  });
});