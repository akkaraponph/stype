import { useQuery } from "@tanstack/react-query";

export interface TypingHistoryEntry {
  id: string;
  wpm: number;
  accuracy: number;
  avgIntervalMs: number;
  timestamp: number;
}

/** Stub for future persistent history. Returns empty list. */
export function useTypingHistory() {
  return useQuery({
    queryKey: ["typingHistory"],
    queryFn: async (): Promise<TypingHistoryEntry[]> => [],
  });
}
