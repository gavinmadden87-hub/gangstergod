# Deployment Stabilization Plan

This document creates a clean stabilization lane for GangsterGod deployment recovery and Codex governance.

## Current baseline

- Default branch: `main`
- Stabilization branch: `stabilize/deploy-codex-foundation`
- Stale reference PRs: #1, #3, #4
- Production priority: restore trusted preview and production deployment before expanding no-code modules.

## Do not merge directly

The following PRs are retained as reference material only until manually reviewed:

- PR #1: `Fix security`
- PR #3: `Vercel/install and configure vercel w 270snm`
- PR #4: `Fix and merge`

They were previously observed as non-mergeable and should not be force-merged into `main`.

## Recovery sequence

1. Keep raw secrets out of the repository.
2. Set required secrets in the Vercel dashboard, especially `OPENAI_API_KEY`.
3. Confirm local build commands:
   - `npm install`
   - `npm run lint`
   - `npm run typecheck`, if available
   - `npm run build`
4. Deploy preview first.
5. Promote production only after preview passes.
6. Monitor deployment failures and revert the last risky patch if failure frequency rises above baseline.

## Codex guardrails

Codex may analyze, draft, patch, and test. Codex must not silently merge or deploy production changes.

Required controls:

- Human approval before merge.
- Human approval before production deployment.
- Limited secret scope.
- No raw API keys in chat, commits, issues, pull requests, docs, or logs.
- CI validation before deployment.

## Expansion hold

Pause new Adalo and Base44 module expansion until deployment is stable. The expanded modules can resume after the GitHub and Vercel path is clean.
