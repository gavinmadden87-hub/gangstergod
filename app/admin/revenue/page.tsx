"use client";

import { useEffect, useMemo, useState } from "react";
import { ErrorBoundary } from "../../../components/error-boundary";
import { NeonChartJsLineChart, type ChartJsLineData, type ChartJsLineOptions } from "../../../components/neon-chartjs-line-chart";
import { useToast } from "../../../components/toast";
import { type BillingStatsResponse, trpcClient } from "../../../lib/trpc";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function mapBillingStatsToChartJs(data: BillingStatsResponse): ChartJsLineData {
  return {
    labels: data.points.map((point) => point.label),
    datasets: [
      {
        label: "Revenue",
        data: data.points.map((point) => point.revenue),
        borderColor: "#22d3ee",
        backgroundColor: "rgba(34, 211, 238, 0.18)",
      },
      {
        label: "Expansion",
        data: data.points.map((point) => point.expansion),
        borderColor: "#ec4899",
        backgroundColor: "rgba(236, 72, 153, 0.18)",
        borderDash: [8, 10],
      },
      {
        label: "Churn",
        data: data.points.map((point) => point.churn),
        borderColor: "#a855f7",
        backgroundColor: "rgba(168, 85, 247, 0.14)",
        borderDash: [3, 8],
      },
    ],
  };
}

const neonChartOptions: ChartJsLineOptions = {
  plugins: {
    legend: {
      labels: {
        color: "#a5f3fc",
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: "#a5f3fc",
      },
      grid: {
        color: "#164e63",
      },
    },
    y: {
      ticks: {
        color: "#f9a8d4",
      },
      grid: {
        color: "#164e63",
      },
    },
  },
};

export default function AdminRevenuePage() {
  const [data, setData] = useState<BillingStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  useEffect(() => {
    const run = async (): Promise<void> => {
      try {
        const stats = await trpcClient.billing.getStats();
        setData(stats);
        pushToast("billing.getStats mapped to Chart.js neon chart.");
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

  const chartData = useMemo(() => (data ? mapBillingStatsToChartJs(data) : null), [data]);

  if (loading) {
    return <main className="min-h-screen bg-black p-8 text-cyan-300">Loading neon revenue signals...</main>;
  }

  if (!data || !chartData) {
    return <main className="min-h-screen bg-black p-8 text-pink-300">No revenue data available.</main>;
  }

  return (
    <ErrorBoundary fallbackMessage="Revenue chart crashed.">
      <main className="min-h-screen bg-black p-8 text-zinc-100">
        <h1 className="text-3xl font-bold text-pink-300 drop-shadow-[0_0_14px_rgba(236,72,153,0.6)]">Admin Revenue View</h1>
        <p className="mt-3 text-zinc-300">tRPC billing telemetry rendered through a Chart.js-compatible neon palette and realtime signal cards.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-cyan-500/40 bg-zinc-950 p-4 shadow-[0_0_18px_rgba(34,211,238,0.18)]">Total Revenue: <span className="text-cyan-200">{formatCurrency(data.totalRevenue)}</span></div>
          <div className="rounded-xl border border-pink-500/40 bg-zinc-950 p-4 shadow-[0_0_18px_rgba(236,72,153,0.18)]">MRR: <span className="text-pink-200">{formatCurrency(data.mrr)}</span></div>
          <div className="rounded-xl border border-purple-500/40 bg-zinc-950 p-4 shadow-[0_0_18px_rgba(168,85,247,0.18)]">ARR: <span className="text-purple-200">{formatCurrency(data.arr)}</span></div>
        </div>

        <div className="mt-8">
          <NeonChartJsLineChart data={chartData} options={neonChartOptions} />
        </div>
      </main>
    </ErrorBoundary>
  );
}
