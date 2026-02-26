"use client";

export interface StatsBarProps {
  wpm: number;
  accuracy: number;
  elapsedSeconds: number;
  avgKeyIntervalMs: number;
  consistency?: number;
  className?: string;
}

export default function StatsBar({
  wpm,
  accuracy,
  elapsedSeconds,
  avgKeyIntervalMs,
  consistency,
  className = "",
}: StatsBarProps) {
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-zinc-500 dark:text-zinc-400 ${className}`}
    >
      <span>
        <strong className="text-zinc-700 dark:text-zinc-300">WPM</strong>{" "}
        {Math.round(wpm)}
      </span>
      <span>
        <strong className="text-zinc-700 dark:text-zinc-300">Accuracy</strong>{" "}
        {Math.round(accuracy)}%
      </span>
      <span>
        <strong className="text-zinc-700 dark:text-zinc-300">Time</strong>{" "}
        {timeStr}
      </span>
      <span>
        <strong className="text-zinc-700 dark:text-zinc-300">Smoothness</strong>{" "}
        {Math.round(avgKeyIntervalMs)} ms
      </span>
      {consistency !== undefined && (
        <span>
          <strong className="text-zinc-700 dark:text-zinc-300">
            Consistency
          </strong>{" "}
          {Math.round(consistency)}%
        </span>
      )}
    </div>
  );
}
