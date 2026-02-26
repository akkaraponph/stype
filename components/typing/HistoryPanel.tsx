"use client";

import { useState } from "react";
import type { TypingHistoryEntry } from "@/hooks/useTypingHistory";
import { Sparkline } from "@/components/typing/ResultsPanel";

interface HistoryPanelProps {
  history: TypingHistoryEntry[];
  onClear: () => void;
  className?: string;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PersonalBests({ history }: { history: TypingHistoryEntry[] }) {
  if (history.length === 0) return null;

  const bestWpm = Math.max(...history.map((e) => e.wpm));
  const bestAccuracy = Math.max(...history.map((e) => e.accuracy));
  const withConsistency = history.filter((e) => e.consistency !== undefined);
  const bestConsistency =
    withConsistency.length > 0
      ? Math.max(...withConsistency.map((e) => e.consistency!))
      : undefined;

  return (
    <div className="grid grid-cols-3 gap-4 mb-4 text-center">
      <div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Best WPM
        </span>
        <p className="text-lg font-mono text-zinc-900 dark:text-zinc-100">
          {Math.round(bestWpm)}
        </p>
      </div>
      <div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Best Accuracy
        </span>
        <p className="text-lg font-mono text-zinc-900 dark:text-zinc-100">
          {Math.round(bestAccuracy)}%
        </p>
      </div>
      {bestConsistency !== undefined && (
        <div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Best Consistency
          </span>
          <p className="text-lg font-mono text-zinc-900 dark:text-zinc-100">
            {Math.round(bestConsistency)}%
          </p>
        </div>
      )}
    </div>
  );
}

export default function HistoryPanel({
  history,
  onClear,
  className = "",
}: HistoryPanelProps) {
  const [open, setOpen] = useState(false);

  if (history.length === 0) return null;

  return (
    <div className={`w-full max-w-3xl ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
      >
        <span
          className="inline-block transition-transform"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          &#9654;
        </span>
        History ({history.length})
      </button>

      {open && (
        <div className="mt-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 p-4 shadow-sm">
          <PersonalBests history={history} />

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700">
                  <th className="pb-2 pr-3 font-medium">Date</th>
                  <th className="pb-2 pr-3 font-medium">Lang</th>
                  <th className="pb-2 pr-3 font-medium">Mode</th>
                  <th className="pb-2 pr-3 font-medium">Duration</th>
                  <th className="pb-2 pr-3 font-medium">WPM</th>
                  <th className="pb-2 pr-3 font-medium">Accuracy</th>
                  <th className="pb-2 pr-3 font-medium">Consistency</th>
                  <th className="pb-2 font-medium">Trend</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                  >
                    <td className="py-2 pr-3 text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                      {formatDate(entry.timestamp)}
                    </td>
                    <td className="py-2 pr-3 text-zinc-600 dark:text-zinc-300">
                      {entry.language === "th" ? "Th" : "En"}
                    </td>
                    <td className="py-2 pr-3 text-zinc-600 dark:text-zinc-300">
                      {entry.mode}
                    </td>
                    <td className="py-2 pr-3 font-mono text-zinc-700 dark:text-zinc-200">
                      {entry.duration}s
                    </td>
                    <td className="py-2 pr-3 font-mono text-zinc-900 dark:text-zinc-100">
                      {Math.round(entry.wpm)}
                    </td>
                    <td className="py-2 pr-3 font-mono text-zinc-900 dark:text-zinc-100">
                      {Math.round(entry.accuracy)}%
                    </td>
                    <td className="py-2 pr-3 font-mono text-zinc-900 dark:text-zinc-100">
                      {entry.consistency !== undefined
                        ? `${Math.round(entry.consistency)}%`
                        : "—"}
                    </td>
                    <td className="py-2">
                      {entry.wpmBuckets.length > 0 && (
                        <Sparkline buckets={entry.wpmBuckets} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              Clear history
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
