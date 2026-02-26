"use client";

import { useCallback, useState, useEffect } from "react";
import type { TextMode, Duration, Language } from "@/hooks/useTypingTexts";
import type { SessionUser } from "@/hooks/useSession";

export interface TypingHistoryEntry {
  id: string;
  wpm: number;
  accuracy: number;
  avgIntervalMs: number;
  consistency?: number;
  mode: TextMode;
  duration: Duration;
  language?: Language;
  wpmBuckets: number[];
  timestamp: number;
}

const STORAGE_KEY = "slowlytype-history";
const MAX_ENTRIES = 50;

function loadHistory(): TypingHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: TypingHistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

function entryToPayload(entry: TypingHistoryEntry) {
  return {
    wpm: entry.wpm,
    accuracy: entry.accuracy,
    avgIntervalMs: entry.avgIntervalMs,
    consistency: entry.consistency,
    mode: entry.mode,
    duration: entry.duration,
    language: entry.language,
    wpmBuckets: Array.isArray(entry.wpmBuckets) ? entry.wpmBuckets : [],
  };
}

export function useTypingHistory(user: SessionUser | null) {
  const [history, setHistory] = useState<TypingHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(!!user);

  // When logged in: sync localStorage → API, clear localStorage, then fetch. When not: hydrate from localStorage.
  useEffect(() => {
    if (user) {
      setHistoryLoading(true);
      const pending = loadHistory();
      const syncThenFetch = async () => {
        if (pending.length > 0) {
          for (const entry of pending) {
            const payload = entryToPayload(entry);
            try {
              await fetch("/api/history", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
            } catch {
              // best-effort: continue with rest
            }
          }
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch {
            // ignore
          }
        }
        try {
          const res = await fetch("/api/history", { credentials: "include" });
          const data = res.ok ? (await res.json()) : [];
          setHistory(Array.isArray(data) ? data : []);
        } catch {
          setHistory([]);
        } finally {
          setHistoryLoading(false);
        }
      };
      syncThenFetch();
    } else {
      setHistory(loadHistory());
      setHistoryLoading(false);
    }
  }, [user?.id]);

  const addEntry = useCallback(
    (entry: Omit<TypingHistoryEntry, "id" | "timestamp">) => {
      if (user) {
        const payload = {
          ...entry,
          wpmBuckets: entry.wpmBuckets ?? [],
        };
        fetch("/api/history", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((created: TypingHistoryEntry | null) => {
            if (created) {
              setHistory((prev) => [created, ...prev].slice(0, MAX_ENTRIES));
            }
          })
          .catch(() => {});
      } else {
        setHistory((prev) => {
          const newEntry: TypingHistoryEntry = {
            ...entry,
            id: Date.now().toString(36),
            timestamp: Date.now(),
          };
          const next = [newEntry, ...prev].slice(0, MAX_ENTRIES);
          saveHistory(next);
          return next;
        });
      }
    },
    [user]
  );

  const clearHistory = useCallback(() => {
    if (user) {
      fetch("/api/history", { method: "DELETE", credentials: "include" })
        .then(() => setHistory([]))
        .catch(() => {});
    } else {
      setHistory([]);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }, [user]);

  return { history, addEntry, clearHistory, historyLoading };
}
