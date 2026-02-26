"use client";

export interface StatsVisibility {
  wpm?: boolean;
  accuracy?: boolean;
  time?: boolean;
  smoothness?: boolean;
  consistency?: boolean;
}

export interface StatsBarProps {
  wpm: number;
  accuracy: number;
  elapsedSeconds: number;
  avgKeyIntervalMs: number;
  consistency?: number;
  visibleStats?: StatsVisibility;
  className?: string;
}

export default function StatsBar({
  wpm,
  accuracy,
  elapsedSeconds,
  avgKeyIntervalMs,
  consistency,
  visibleStats,
  className = "",
}: StatsBarProps) {
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;

  const show = (key: keyof StatsVisibility) => visibleStats?.[key] !== false;

  return (
    <div
      className={`flex flex-wrap items-center gap-6 sm:gap-8 text-sm text-foreground ${className}`}
    >
      {show("wpm") && (
        <span>
          <strong className="font-bold text-sub">WPM</strong>{" "}
          <span className="font-normal">{Math.round(wpm)}</span>
        </span>
      )}
      {show("accuracy") && (
        <span>
          <strong className="font-bold text-sub">Accuracy</strong>{" "}
          <span className="font-normal">{Math.round(accuracy)}%</span>
        </span>
      )}
      {show("time") && (
        <span>
          <strong className="font-bold text-sub">Time</strong>{" "}
          <span className="font-normal">{timeStr}</span>
        </span>
      )}
      {show("smoothness") && (
        <span>
          <strong className="font-bold text-sub">Smoothness</strong>{" "}
          <span className="font-normal">{Math.round(avgKeyIntervalMs)} ms</span>
        </span>
      )}
      {show("consistency") && consistency !== undefined && (
        <span>
          <strong className="font-bold text-sub">Consistency</strong>{" "}
          <span className="font-normal">{Math.round(consistency)}%</span>
        </span>
      )}
    </div>
  );
}
