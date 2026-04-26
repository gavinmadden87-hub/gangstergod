"use client";

import { useEffect, useState } from "react";
import { ErrorBoundary } from "../../components/error-boundary";
import { useToast } from "../../components/toast";

const STORAGE_KEY = "dashboard_help_seen";

export default function DashboardPage() {
  const [showOverlay, setShowOverlay] = useState(false);
  const { pushToast } = useToast();

  useEffect(() => {
    const seen = window.localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      setShowOverlay(true);
    }
  }, []);

  const dismissOverlay = (): void => {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setShowOverlay(false);
    pushToast("Dashboard guide completed.");
  };

  return (
    <ErrorBoundary fallbackMessage="Dashboard failed to load.">
      <main className="min-h-screen bg-black px-8 py-10 text-zinc-100">
        <h1 className="text-4xl font-bold text-cyan-300 drop-shadow-[0_0_14px_rgba(34,211,238,0.6)]">Neon Operations Dashboard</h1>
        <p className="mt-3 text-zinc-300">Real-time swarm control with consensus and mutation observability.</p>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-cyan-500/30 bg-zinc-950 p-4">Consensus Engine: <span className="text-cyan-300">Online</span></div>
          <div className="rounded-xl border border-pink-500/30 bg-zinc-950 p-4">Blackboard Sync: <span className="text-pink-300">Streaming</span></div>
          <div className="rounded-xl border border-purple-500/30 bg-zinc-950 p-4">Outcome Log: <span className="text-purple-300">Writable</span></div>
        </section>

        {showOverlay ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-5">
            <div className="w-full max-w-xl rounded-2xl border border-cyan-400/60 bg-zinc-950 p-6 shadow-[0_0_30px_rgba(34,211,238,0.35)]">
              <h2 className="text-2xl font-semibold text-cyan-300">How-To: Dashboard Quickstart</h2>
              <ol className="mt-4 list-decimal space-y-2 pl-6 text-zinc-200">
                <li>Watch status cards for board consensus and logging health.</li>
                <li>Review revenue trends in Admin → Revenue.</li>
                <li>Run Strategy Mutation test to confirm weight history writes.</li>
              </ol>
              <button
                type="button"
                onClick={dismissOverlay}
                className="mt-6 rounded-lg border border-pink-500/70 bg-pink-500/20 px-4 py-2 text-pink-200 shadow-[0_0_18px_rgba(236,72,153,0.45)] hover:bg-pink-500/30"
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
