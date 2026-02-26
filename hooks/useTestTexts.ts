import { useQuery } from "@tanstack/react-query";

export type TextMode = "words" | "quotes";
export type Duration = 30 | 60;

export interface TestTextResponse {
  text: string;
  mode: TextMode;
  duration: number;
}

async function fetchTestTexts(
  mode: TextMode,
  duration: Duration
): Promise<TestTextResponse> {
  const params = new URLSearchParams({ mode, duration: String(duration) });
  const res = await fetch(`/api/texts?${params}`);
  if (!res.ok) throw new Error("Failed to fetch test text");
  return res.json();
}

export function useTestTexts(mode: TextMode, duration: Duration) {
  return useQuery({
    queryKey: ["testTexts", mode, duration],
    queryFn: () => fetchTestTexts(mode, duration),
    enabled: true,
  });
}
