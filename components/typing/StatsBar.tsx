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
      className={`flex flex-wrap items-center gap-6 sm:gap-8 text-sm text-foreground ${className}`}
    >
      <span>
        <strong className="font-bold text-sub">WPM</strong>{" "}
        <span className="font-normal">{Math.round(wpm)}</span>
      </span>
      <span>
        <strong className="font-bold text-sub">Accuracy</strong>{" "}
        <span className="font-normal">{Math.round(accuracy)}%</span>
      </span>
      <span>
        <strong className="font-bold text-sub">Time</strong>{" "}
        <span className="font-normal">{timeStr}</span>
      </span>
      <span>
        <strong className="font-bold text-sub">Smoothness</strong>{" "}
        <span className="font-normal">{Math.round(avgKeyIntervalMs)} ms</span>
      </span>
      {consistency !== undefined && (
        <span>
          <strong className="font-bold text-sub">Consistency</strong>{" "}
          <span className="font-normal">{Math.round(consistency)}%</span>
        </span>
      )}
    </div>
  );
}
