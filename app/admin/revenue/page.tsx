"use client";

import { useEffect, useState } from "react";
import { ErrorBoundary } from "../../../components/error-boundary";
import { useToast } from "../../../components/toast";
import { type BillingStatsResponse, trpcClient } from "../../../lib/trpc";

export default function AdminRevenuePage() {
  const [data, setData] = useState<BillingStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  useEffect(() => {
    const run = async (): Promise<void> => {
      try {
        const stats = await trpcClient.billing.getStats();
        setData(stats);
      } catch (error) {
        console.error(error);
        pushToast("Failed to load billing.getStats.");
      } finally {
        setLoading(false);
      }
    };

    run().catch((error: unknown) => {
      console.error(error);
      pushToast("Unexpected revenue loader failure.");
      setLoading(false);
    });
  }, [pushToast]);

  if (loading) {
    return <main className="min-h-screen bg-black p-8 text-cyan-300">Loading neon revenue signals...</main>;
  }

  if (!data) {
    return <main className="min-h-screen bg-black p-8 text-pink-300">No revenue data available.</main>;
  }

  const maxRevenue = Math.max(...data.points.map((point) => point.revenue));

  return (
    <ErrorBoundary fallbackMessage="Revenue chart crashed.">
      <main className="min-h-screen bg-black p-8 text-zinc-100">
        <h1 className="text-3xl font-bold text-pink-300 drop-shadow-[0_0_14px_rgba(236,72,153,0.6)]">Admin Revenue View</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-cyan-500/40 bg-zinc-950 p-4">Total Revenue: ${data.totalRevenue.toLocaleString()}</div>
          <div className="rounded-xl border border-pink-500/40 bg-zinc-950 p-4">MRR: ${data.mrr.toLocaleString()}</div>
        </div>

        <div className="mt-8 rounded-xl border border-cyan-400/40 bg-zinc-950 p-4 shadow-[0_0_24px_rgba(34,211,238,0.25)]">
          <p className="mb-4 text-cyan-200">billing.getStats() → Neon Revenue Bars</p>
          <div className="space-y-3">
            {data.points.map((point) => {
              const widthPercent = (point.revenue / maxRevenue) * 100;
              return (
                <div key={point.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cyan-300">{point.label}</span>
                    <span className="text-pink-300">${point.revenue.toLocaleString()}</span>
                  </div>
                  <div className="h-3 rounded-full bg-zinc-800">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-cyan-400 to-pink-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </ErrorBoundary>
  );
}
