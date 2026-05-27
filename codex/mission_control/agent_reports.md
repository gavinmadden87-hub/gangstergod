# GangsterGod Agent Reports

Every agent report must create evidence. Confidence without proof is just theater wearing a hoodie.

## Required report format

Each agent output must include:

- Agent name
- Mission ID
- Observation
- Action taken or proposed
- Proof artifact
- Risk level
- Next recommended move

## Report template

```text
Agent:
Mission ID:
Signal type:
Observation:
Action:
Proof:
Risk:
Next move:
Status:
```

## Proof artifacts

Acceptable proof includes:

- Commit SHA
- Pull request link or number
- Test result
- Build log summary
- Deployment link
- Lead record
- Client message
- Revenue record
- Decision log entry
- Rollback note

## Rejection rule

Reject outputs that do not include proof, risk, and next move.

## Current reports

### God-Head / Mission Control

Mission ID: M-001, M-002, M-003
Signal type: repo, deploy, agent
Observation: Stabilization branch and PR #15 exist. Mission Control protocol is being added to the stabilization lane.
Action: Added signal registry and active mission queue.
Proof: commits `439f4cdf5999399e1d7d3baf6d42c60aa387dca4` and `9ed79956c2b7862065c457f58138ba8bbb4277f2`.
Risk: medium
Next move: add decision log and operator protocol, then verify CI/deploy path.
Status: active
