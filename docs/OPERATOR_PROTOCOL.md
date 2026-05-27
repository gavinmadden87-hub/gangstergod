# GangsterGod Operator Protocol

This protocol defines how the God-Head, Codex, agents, and human operator coordinate work without turning the repository into a burning shopping cart.

## Authority model

The God-Head owns strategy.
Codex accelerates implementation.
Agents produce signals, drafts, and reports.
GitHub records proof.
Vercel proves deployment.
The human operator approves merge and production release.

## Non-negotiable rules

1. No raw secrets in repository files, chat logs, PRs, issues, docs, screenshots, or build logs.
2. No autonomous production deployment without human approval.
3. No merge without proof.
4. No feature expansion while deployment is failing.
5. No stale PR merge without manual harvest into a clean branch.
6. Every mission must include proof, risk, and next move.

## Proof requirements

A completed task must include at least one proof artifact:

- Commit SHA
- Pull request number
- Passing CI result
- Build log summary
- Preview deployment link
- Production deployment result
- Lead record
- Client message
- Revenue record
- Decision log entry
- Rollback note

## Mission loop

```text
observe signals
rank mission
assign owner
draft change
validate proof
review risk
approve or reject
merge only when clean
deploy preview first
promote production after proof
monitor regression
```

## Deployment rule

Preview is the proving ground. Production is guarded territory.

Required before production:

- Secrets set in Vercel dashboard, not repo.
- Build passes.
- Preview deploy works.
- Relevant mission has proof.
- Human operator approves.

## Codex rule

Codex may:

- analyze repository structure
- draft patches
- generate tests
- propose refactors
- summarize risk
- prepare pull requests

Codex may not:

- silently merge
- silently deploy production
- broaden secret access
- mutate architecture without a decision log entry
- treat its own confidence as proof

## Revenue integration rule

GangsterGod must optimize for both system stability and money creation.

Revenue missions can include:

- premium wedding photography lead capture
- inquiry response automation
- follow-up timing
- pricing guide strategy
- AI Studio Boss System delivery
- photographer SaaS validation

Revenue work resumes after deployment trust is restored unless the mission is manually marked critical.

## Current command state

- PR #15 is the stabilization and governance lane.
- PR #1, PR #3, and PR #4 are reference only.
- Vercel must be verified before expansion.
- Codex key setup must be completed securely.

The empire does not scale from vibes. It scales from proof, repeatable systems, and fewer humans panic-clicking merge buttons at midnight.
