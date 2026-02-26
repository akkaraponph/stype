"use client";

import { useCallback, useState, useEffect } from "react";
import type { TextMode, Duration } from "@/hooks/useTestTexts";

export interface TypingHistoryEntry {
  id: string;
  wpm: number;
  accuracy: number;
  avgIntervalMs: number;
  consistency?: number;
  mode: TextMode;
  duration: Duration;
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

export function useTypingHistory() {
  const [history, setHistory] = useState<TypingHistoryEntry[]>([]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const addEntry = useCallback(
    (entry: Omit<TypingHistoryEntry, "id" | "timestamp">) => {
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
    },
    []
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { history, addEntry, clearHistory };
}
