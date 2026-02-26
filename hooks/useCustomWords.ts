import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Language, WordLevel } from "@/lib/typing/generator";

export interface CustomWordItem {
  id: string;
  word: string;
  language: string;
  level: string;
  createdAt: number;
}

async function fetchWords(lang?: string, level?: string): Promise<CustomWordItem[]> {
  const params = new URLSearchParams();
  if (lang) params.set("lang", lang);
  if (level) params.set("level", level);
  const url = `/api/words${params.toString() ? `?${params}` : ""}`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch custom words");
  const data = await res.json();
  return data.words ?? [];
}

export function useCustomWords(lang?: Language, level?: WordLevel) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["customWords", lang ?? "all", level ?? "all"],
    queryFn: () => fetchWords(lang, level),
    enabled: true,
  });

  const addMutation = useMutation({
    mutationFn: async (body: { word: string; language: Language; level: WordLevel }) => {
      const res = await fetch("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to add word");
      }
      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["customWords"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/words?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete word");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["customWords"] });
    },
  });

  return {
    words: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    addWord: addMutation.mutateAsync,
    addPending: addMutation.isPending,
    addError: addMutation.error,
    deleteWord: deleteMutation.mutateAsync,
    deletePending: deleteMutation.isPending,
  };
}
