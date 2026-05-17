"use client";

import { useMemo } from "react";

type ChartJsDataset = {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  borderDash?: number[];
};

export type ChartJsLineData = {
  labels: string[];
  datasets: [ChartJsDataset, ...ChartJsDataset[]];
};

export type ChartJsLineOptions = {
  plugins: {
    legend: {
      labels: {
        color: string;
      };
    };
  };
  scales: {
    x: {
      ticks: {
        color: string;
      };
      grid: {
        color: string;
      };
    };
    y: {
      ticks: {
        color: string;
      };
      grid: {
        color: string;
      };
    };
  };
};

type RenderPoint = {
  label: string;
  x: number;
  y: number;
  value: number;
};

type RenderDataset = ChartJsDataset & {
  points: RenderPoint[];
  path: string;
};

const CHART_WIDTH = 760;
const CHART_HEIGHT = 320;
const CHART_PADDING = 42;

function toPath(points: RenderPoint[]): string {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
}

export function NeonChartJsLineChart({ data, options }: { data: ChartJsLineData; options: ChartJsLineOptions }) {
  const renderedDatasets = useMemo<RenderDataset[]>(() => {
    const maxValue = Math.max(...data.datasets.flatMap((dataset) => dataset.data), 1);
    const usableWidth = CHART_WIDTH - CHART_PADDING * 2;
    const usableHeight = CHART_HEIGHT - CHART_PADDING * 2;

    return data.datasets.map((dataset) => {
      const points = dataset.data.map((value, index) => {
        const x = CHART_PADDING + (usableWidth / Math.max(data.labels.length - 1, 1)) * index;
        const y = CHART_HEIGHT - CHART_PADDING - (value / maxValue) * usableHeight;

        return {
          label: data.labels[index] ?? String(index + 1),
          x,
          y,
          value,
        };
      });

      return {
        ...dataset,
        points,
        path: toPath(points),
      };
    });
  }, [data.datasets, data.labels]);

  return (
    <div className="rounded-2xl border border-cyan-400/40 bg-zinc-950/90 p-4 shadow-[0_0_30px_rgba(34,211,238,0.22)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">Chart.js data contract</p>
          <h2 className="text-2xl font-semibold text-white">Neon Revenue Signal Chart</h2>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          {data.datasets.map((dataset) => (
            <span
              key={dataset.label}
              className="rounded-full border px-3 py-1 shadow-[0_0_14px_rgba(34,211,238,0.25)]"
              style={{ borderColor: dataset.borderColor, color: dataset.borderColor }}
            >
              {dataset.label}
            </span>
          ))}
        </div>
      </div>

      <svg className="h-auto w-full" viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img" aria-label="Chart.js-compatible neon revenue chart mapped from billing.getStats">
        <defs>
          <filter id="chartJsSoftGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {[0, 1, 2, 3].map((line) => {
          const y = CHART_PADDING + ((CHART_HEIGHT - CHART_PADDING * 2) / 3) * line;
          return <line key={line} x1={CHART_PADDING} x2={CHART_WIDTH - CHART_PADDING} y1={y} y2={y} stroke={options.scales.y.grid.color} strokeDasharray="6 8" strokeOpacity="0.42" />;
        })}
        {renderedDatasets.map((dataset) => (
          <g key={dataset.label}>
            <path
              d={dataset.path}
              fill="none"
              stroke={dataset.borderColor}
              strokeDasharray={dataset.borderDash?.join(" ")}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
              filter="url(#chartJsSoftGlow)"
            />
            {dataset.points.map((point) => (
              <circle key={`${dataset.label}-${point.label}`} cx={point.x} cy={point.y} r="5" fill="#020617" stroke={dataset.borderColor} strokeWidth="3" filter="url(#chartJsSoftGlow)" />
            ))}
          </g>
        ))}
        {data.labels.map((label, index) => {
          const x = CHART_PADDING + ((CHART_WIDTH - CHART_PADDING * 2) / Math.max(data.labels.length - 1, 1)) * index;
          return <text key={label} x={x} y={CHART_HEIGHT - 14} fill={options.scales.x.ticks.color} fontSize="13" textAnchor="middle">{label}</text>;
        })}
      </svg>
    </div>
  );
}
