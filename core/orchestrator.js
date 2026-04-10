import { streetAgent } from "../agents/acquisition/street.agent.js";
import { offerAgent } from "../agents/conversion/offer.agent.js";
import { contentAgent } from "../agents/content/content.agent.js";
import { dataAgent } from "../agents/intelligence/data.agent.js";

import { evaluatorAgent } from "../agents/intelligence/evaluator.agent.js";
import { healerAgent } from "../agents/intelligence/healer.agent.js";

import { saveRun } from "./memory.js";

export function runSystem() {
  console.log("\n🧠 ORCHESTRATOR ONLINE\n");

  // EXECUTION PHASE
  streetAgent();
  offerAgent();
  contentAgent();
  dataAgent();

  // SIMULATED INPUT (replace with real tracking later)
  const runData = {
    tasksCompleted: 3,
    moneyMade: 25,
    consistency: true
  };

  // EVALUATION
  const evaluation = evaluatorAgent(runData);

  // HEALING
  healerAgent(evaluation);

  // MEMORY SAVE
  saveRun({
    ...runData,
    evaluation
  });

  console.log("\n🔁 SYSTEM SELF-UPDATED\n");
}
