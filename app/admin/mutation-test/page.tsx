"use client";

import { useState } from "react";
import { ErrorBoundary } from "../../../components/error-boundary";
import { useToast } from "../../../components/toast";
import { triggerStrategyMutation, weightHistory } from "../../../lib/swarm";

export default function MutationTestPage() {
  const [lastRun, setLastRun] = useState<string>("Never");
  const [historySize, setHistorySize] = useState<number>(weightHistory.length);
  const { pushToast } = useToast();

  const runMutation = (): void => {
    try {
      const result = triggerStrategyMutation({
        agentId: "swarm-commander",
        strategy: "risk-weighted-routing",
        previousWeight: 0.7,
        signalStrength: 0.9,
        reason: "manual-phase-13-validation",
      });
      setLastRun(result.createdAt);
      setHistorySize(weightHistory.length);
      pushToast(`Mutation complete. New weight: ${result.newWeight}`);
    } catch (error) {
      console.error(error);
      pushToast("Mutation trigger failed.");
    }
  };

  return (
    <ErrorBoundary fallbackMessage="Mutation test panel failed.">
      <main className="min-h-screen bg-black p-8 text-zinc-100">
        <h1 className="text-3xl font-bold text-cyan-300">Strategy Mutation E2E Check</h1>
        <p className="mt-3 text-zinc-300">Trigger evaluator → outcome_log → weight_history write pipeline.</p>
        <button
          type="button"
          onClick={runMutation}
          className="mt-6 rounded-lg border border-cyan-500/70 bg-cyan-500/20 px-4 py-2 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.45)] hover:bg-cyan-500/30"
        >
          Run Strategy Mutation
        </button>

        <div className="mt-6 rounded-xl border border-pink-500/30 bg-zinc-950 p-4">
          <p>Last run: {lastRun}</p>
          <p>weight_history rows: {historySize}</p>
        </div>
      </main>
    </ErrorBoundary>
  );
}
