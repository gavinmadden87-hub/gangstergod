"use client";

import { useState } from "react";
import { ErrorBoundary } from "../../../components/error-boundary";
import { useToast } from "../../../components/toast";
import { trpcClient, type StrategyMutationResponse } from "../../../lib/trpc";

export default function MutationTestPage() {
  const [lastResult, setLastResult] = useState<StrategyMutationResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const { pushToast } = useToast();

  const runMutation = async (): Promise<void> => {
    setIsRunning(true);
    try {
      const result = await trpcClient.swarm.triggerStrategyMutation();
      setLastResult(result);
      pushToast(`Mutation persisted. weight_history rows: ${result.weightHistorySize}`);
    } catch (error) {
      console.error(error);
      pushToast("Mutation trigger failed before weight_history confirmation.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <ErrorBoundary fallbackMessage="Mutation test panel failed.">
      <main className="min-h-screen bg-black p-8 text-zinc-100">
        <h1 className="text-3xl font-bold text-cyan-300 drop-shadow-[0_0_14px_rgba(34,211,238,0.6)]">Strategy Mutation E2E Check</h1>
        <p className="mt-3 text-zinc-300">Manual tRPC trigger validates Blackboard → ConsensusEngine → outcome_log → weight_history.</p>
        <button
          type="button"
          onClick={() => {
            runMutation().catch((error: unknown) => {
              console.error(error);
              pushToast("Unexpected mutation CTA failure.");
            });
          }}
          disabled={isRunning}
          className="mt-6 rounded-lg border border-cyan-500/70 bg-cyan-500/20 px-4 py-2 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.45)] transition hover:bg-cyan-500/30 disabled:cursor-wait disabled:opacity-60"
        >
          {isRunning ? "Mutating strategy..." : "Run Strategy Mutation"}
        </button>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-pink-500/30 bg-zinc-950 p-4 shadow-[0_0_18px_rgba(236,72,153,0.18)]">
            <p className="text-sm uppercase tracking-[0.3em] text-pink-200/80">weight_history</p>
            <p className="mt-3 text-2xl text-pink-100">Rows: {lastResult?.weightHistorySize ?? 0}</p>
            <p className="mt-2 text-zinc-300">Last run: {lastResult?.historyEntry.createdAt ?? "Never"}</p>
            <p className="text-zinc-300">New weight: {lastResult?.historyEntry.newWeight ?? "Pending"}</p>
          </div>

          <div className="rounded-xl border border-cyan-500/30 bg-zinc-950 p-4 shadow-[0_0_18px_rgba(34,211,238,0.18)]">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">outcome_log</p>
            <p className="mt-3 text-2xl text-cyan-100">Rows: {lastResult?.outcomeLogSize ?? 0}</p>
            <p className="mt-2 text-zinc-300">Consensus score: {lastResult ? lastResult.outcomeEntry.consensusScore.toFixed(2) : "Pending"}</p>
            <p className="text-zinc-300">Accepted: {lastResult ? String(lastResult.outcomeEntry.accepted) : "Pending"}</p>
          </div>
        </div>

        {lastResult ? (
          <div className="mt-6 rounded-xl border border-purple-500/30 bg-zinc-950 p-4 text-sm text-zinc-300 shadow-[0_0_18px_rgba(168,85,247,0.18)]">
            <p className="text-purple-200">Confirmed persisted row: {lastResult.historyEntry.id}</p>
            <p>Outcome link: {lastResult.historyEntry.outcomeLogId}</p>
            <p>Delta: {lastResult.historyEntry.delta}</p>
            <p>Reason: {lastResult.historyEntry.reason}</p>
          </div>
        ) : null}
      </main>
    </ErrorBoundary>
  );
}
