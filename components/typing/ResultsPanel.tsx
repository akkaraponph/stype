"use client";

export interface ResultsPanelProps {
  wpm: number;
  accuracy: number;
  avgKeyIntervalMs: number;
  consistency?: number;
  wpmBuckets: number[];
  onRestartSame: () => void;
  onChangeSettings: () => void;
  className?: string;
}

function Sparkline({ buckets }: { buckets: number[] }) {
  if (buckets.length === 0) return null;
  const max = Math.max(...buckets, 1);
  const width = 200;
  const height = 40;
  const padding = 4;
  const divisor = Math.max(buckets.length - 1, 1);
  const points = buckets.map((w, i) => {
    const x = padding + (i / divisor) * (width - 2 * padding);
    const y = height - padding - (w / max) * (height - 2 * padding);
    return `${x},${y}`;
  });
  const pathD = `M ${points.join(" L ")}`;

  return (
    <svg
      width={width}
      height={height}
      className="text-zinc-400 dark:text-zinc-500"
      aria-hidden
    >
      <path
        d={pathD}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ResultsPanel({
  wpm,
  accuracy,
  avgKeyIntervalMs,
  consistency,
  wpmBuckets,
  onRestartSame,
  onChangeSettings,
  className = "",
}: ResultsPanelProps) {
  return (
    <div
      className={`rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 p-6 shadow-sm ${className}`}
    >
      <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">
        Results
      </h2>
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-zinc-500 dark:text-zinc-400">WPM</span>
          <p className="text-xl font-mono text-zinc-900 dark:text-zinc-100">
            {Math.round(wpm)}
          </p>
        </div>
        <div>
          <span className="text-zinc-500 dark:text-zinc-400">Accuracy</span>
          <p className="text-xl font-mono text-zinc-900 dark:text-zinc-100">
            {Math.round(accuracy)}%
          </p>
        </div>
        <div>
          <span className="text-zinc-500 dark:text-zinc-400">
            Avg key interval
          </span>
          <p className="text-xl font-mono text-zinc-900 dark:text-zinc-100">
            {Math.round(avgKeyIntervalMs)} ms
          </p>
        </div>
        {consistency !== undefined && (
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Consistency</span>
            <p className="text-xl font-mono text-zinc-900 dark:text-zinc-100">
              {Math.round(consistency)}%
            </p>
          </div>
        )}
      </div>
      {wpmBuckets.length > 0 && (
        <div className="mb-4">
          <span className="text-zinc-500 dark:text-zinc-400 text-sm">
            WPM over time
          </span>
          <div className="mt-1 flex justify-center">
            <Sparkline buckets={wpmBuckets} />
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onRestartSame}
          className="rounded-md bg-zinc-800 dark:bg-zinc-200 text-zinc-100 dark:text-zinc-900 px-4 py-2 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
        >
          Restart with same settings
        </button>
        <button
          type="button"
          onClick={onChangeSettings}
          className="rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          Change settings
        </button>
      </div>
    </div>
  );
}
