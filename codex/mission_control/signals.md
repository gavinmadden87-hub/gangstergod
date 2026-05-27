# GangsterGod Mission Control Signals

Mission Control ranks work by signals, not vibes.

## Signal types

| Signal | Meaning | Default priority |
| --- | --- | --- |
| deploy | Build, preview, production, rollback, uptime | critical |
| repo | PR state, mergeability, stale branches, CI checks | high |
| lead | Inquiry, reply, booking, follow-up, proposal | high |
| revenue | Paid booking, offer value, pipeline value, churn risk | high |
| agent | Agent action, output, proposed patch, automation result | medium |
| proof | Commit, PR, test result, deployment link, client message, invoice | critical |
| risk | Security, secret exposure, broken production, bad merge | critical |

## Ranking rule

A mission without proof is not complete.

If a signal increases stability or revenue, it moves up.
If a signal creates risk without proof, it moves down or gets blocked.

## Current baseline signals

- PR #15 exists as the stabilization lane.
- PR #1, PR #3, and PR #4 are stale reference PRs only.
- Vercel deployment must be verified before expansion resumes.
- Codex may draft and test, but may not silently merge or deploy.
