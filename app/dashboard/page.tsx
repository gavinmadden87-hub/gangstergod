"use client";

import { useEffect, useState } from "react";
import { ErrorBoundary } from "../../components/error-boundary";
import { useToast } from "../../components/toast";

const STORAGE_KEY = "dashboard_help_seen";

type GuideStep = {
  title: string;
  body: string;
  accent: "cyan" | "pink" | "purple";
};

const guideSteps: GuideStep[] = [
  {
    title: "Read swarm status first",
    body: "Use the live cards to confirm ConsensusEngine health, Blackboard sync, and outcome_log write access before acting.",
    accent: "cyan",
  },
  {
    title: "Audit revenue pressure",
    body: "Open Admin → Revenue to inspect billing.getStats trends in the neon chart before changing routing weights.",
    accent: "pink",
  },
  {
    title: "Close the loop",
    body: "Run Strategy Mutation to prove every agent action logs to outcome_log and mutates weight_history.",
    accent: "purple",
  },
];

function getAccentClasses(accent: GuideStep["accent"]): string {
  if (accent === "pink") {
    return "border-pink-400/50 text-pink-200 shadow-[0_0_18px_rgba(236,72,153,0.22)]";
  }

  if (accent === "purple") {
    return "border-purple-400/50 text-purple-200 shadow-[0_0_18px_rgba(168,85,247,0.22)]";
  }

  return "border-cyan-400/50 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.22)]";
}

export default function DashboardPage() {
  const [showOverlay, setShowOverlay] = useState(false);
  const { pushToast } = useToast();

  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        setShowOverlay(true);
      }
    } catch (error) {
      console.error(error);
      setShowOverlay(true);
      pushToast("Dashboard guide opened; local storage is unavailable.");
    }
  }, [pushToast]);

  const dismissOverlay = (): void => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch (error) {
      console.error(error);
      pushToast("Could not save dashboard guide preference.");
    }

    setShowOverlay(false);
    pushToast("Dashboard guide completed.");
  };

  return (
    <ErrorBoundary fallbackMessage="Dashboard failed to load.">
      <main className="min-h-screen bg-black px-8 py-10 text-zinc-100">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">Phase 13 command deck</p>
            <h1 className="mt-2 text-4xl font-bold text-cyan-300 drop-shadow-[0_0_14px_rgba(34,211,238,0.6)]">Neon Operations Dashboard</h1>
            <p className="mt-3 text-zinc-300">Real-time swarm control with consensus and mutation observability.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowOverlay(true)}
            className="rounded-lg border border-pink-500/70 bg-pink-500/10 px-4 py-2 text-pink-200 shadow-[0_0_18px_rgba(236,72,153,0.35)] transition hover:bg-pink-500/20"
          >
            Reopen How-To
          </button>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-cyan-500/30 bg-zinc-950 p-4 shadow-[0_0_18px_rgba(34,211,238,0.16)]">Consensus Engine: <span className="text-cyan-300">Online</span></div>
          <div className="rounded-xl border border-pink-500/30 bg-zinc-950 p-4 shadow-[0_0_18px_rgba(236,72,153,0.16)]">Blackboard Sync: <span className="text-pink-300">Streaming</span></div>
          <div className="rounded-xl border border-purple-500/30 bg-zinc-950 p-4 shadow-[0_0_18px_rgba(168,85,247,0.16)]">Outcome Log: <span className="text-purple-300">Writable</span></div>
        </section>

        {showOverlay ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/85 p-5 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl border border-cyan-400/60 bg-zinc-950 p-6 shadow-[0_0_34px_rgba(34,211,238,0.38)]">
              <p className="text-sm uppercase tracking-[0.35em] text-pink-200/80">First-visit overlay</p>
              <h2 className="mt-2 text-2xl font-semibold text-cyan-300">How-To: Dashboard Quickstart</h2>
              <div className="mt-5 grid gap-3">
                {guideSteps.map((step, index) => (
                  <div key={step.title} className={`rounded-xl border bg-black/40 p-4 ${getAccentClasses(step.accent)}`}>
                    <p className="text-sm uppercase tracking-[0.25em]">Step {index + 1}</p>
                    <h3 className="mt-1 text-lg font-semibold text-white">{step.title}</h3>
                    <p className="mt-1 text-zinc-300">{step.body}</p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={dismissOverlay}
                className="mt-6 rounded-lg border border-pink-500/70 bg-pink-500/20 px-4 py-2 text-pink-200 shadow-[0_0_18px_rgba(236,72,153,0.45)] transition hover:bg-pink-500/30"
              >
                Got it — enter dashboard
              </button>
            </div>
          </div>
        ) : null}
      </main>
    </ErrorBoundary>
  );
}
