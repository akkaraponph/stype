"use client";

import type { TypingHistoryEntry } from "@/hooks/useTypingHistory";

interface HistoryPanelProps {
  history: TypingHistoryEntry[];
  onClear: () => void;
  loading?: boolean;
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

export default function HistoryPanel({
  history,
  onClear,
  loading = false,
  className = "",
}: HistoryPanelProps) {
  if (loading) {
    return (
      <div className={`p-8 text-center text-sub border border-sub/10 rounded-xl ${className}`}>
        Loading history...
      </div>
    );
  }
  if (history.length === 0) {
    return (
      <div className={`p-8 text-center text-sub border border-sub/10 rounded-xl ${className}`}>
        No typing sessions yet. Start typing to see your history!
      </div>
    );
  }

  const bestWpm = history.length > 0 ? Math.max(...history.map((e) => e.wpm)).toFixed(2) : "0.00";
  const avgAcc = history.length > 0 ? (history.reduce((a, b) => a + b.accuracy, 0) / history.length).toFixed(2) : "0.00";

  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-sub/5 p-6 rounded-xl border border-sub/10">
          <div className="text-xs text-sub uppercase font-bold tracking-widest mb-1">Personal Best</div>
          <div className="text-4xl font-bold text-main">{bestWpm} WPM</div>
        </div>
        <div className="bg-sub/5 p-6 rounded-xl border border-sub/10">
          <div className="text-xs text-sub uppercase font-bold tracking-widest mb-1">Typing completed</div>
          <div className="text-4xl font-bold text-foreground">{history.length}</div>
        </div>
        <div className="bg-sub/5 p-6 rounded-xl border border-sub/10">
          <div className="text-xs text-sub uppercase font-bold tracking-widest mb-1">Avg. Accuracy</div>
          <div className="text-4xl font-bold text-foreground">{avgAcc}%</div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-foreground">Recent History</h3>
        <button
          onClick={onClear}
          className="text-xs text-sub hover:text-error transition-colors cursor-pointer"
        >
          Clear all history
        </button>
      </div>

      <div className="space-y-2">
        {history.slice(0, 50).map((item) => (
          <div key={item.id} className="flex justify-between items-center bg-sub/5 p-4 rounded-lg hover:bg-sub/10 transition-all border border-transparent hover:border-sub/10">
            <div className="flex gap-8 items-center">
              <span className="text-2xl font-bold text-main w-16 text-center">{item.wpm.toFixed(2)}</span>
              <div className="flex flex-col">
                <span className="text-xs uppercase text-sub font-bold tracking-tighter">{item.mode} {item.duration}</span>
                <span className="text-sm font-semibold text-foreground">{item.accuracy.toFixed(2)}% acc</span>
              </div>
            </div>
            <span className="text-xs text-sub font-mono">{formatDate(item.timestamp)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
