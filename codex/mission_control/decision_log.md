# GangsterGod Decision Log

Mission Control records strategic decisions so the system can learn from action instead of repeating chaos with better fonts.

## Decision format

```text
Decision ID:
Date:
Mission ID:
Signal type:
Decision:
Reason:
Proof:
Risk:
Rollback condition:
Owner:
Status:
```

## Decisions

### D-001: Create stabilization branch before expansion

Decision ID: D-001
Date: 2026-05-27
Mission ID: M-001
Signal type: deploy, repo, risk
Decision: Pause new Adalo and Base44 expansion until GitHub and Vercel deployment are stable.
Reason: Expanded app modules are not useful while preview and production deployment are untrusted.
Proof: PR #15, branch `stabilize/deploy-codex-foundation`, and `docs/DEPLOYMENT_STABILIZATION.md`.
Risk: medium
Rollback condition: none. This is a governance decision.
Owner: God-Head
Status: active

### D-002: Treat stale PRs as reference only

Decision ID: D-002
Date: 2026-05-27
Mission ID: M-002
Signal type: repo, risk
Decision: PR #1, PR #3, and PR #4 must not be merged directly without manual harvest into a clean branch.
Reason: They were observed as stale or non-mergeable and contain too much uncontrolled change surface.
Proof: PR #15 body and stabilization plan.
Risk: high if ignored
Rollback condition: close or supersede stale PRs after useful changes are harvested.
Owner: God-Head
Status: active

### D-003: Enforce proof-based autonomy

Decision ID: D-003
Date: 2026-05-27
Mission ID: M-003
Signal type: agent, proof, risk
Decision: Codex and future agents may analyze, draft, patch, and test, but may not silently merge or deploy.
Reason: Autonomous coding without governance creates outages with educational branding.
Proof: `codex/mission_control/signals.md`, `active_missions.md`, and `agent_reports.md`.
Risk: critical if ignored
Rollback condition: disable autonomous deploy path if an agent ships without approval.
Owner: God-Head
Status: active
