import { getQuote, getWords } from "@/lib/typing/generator";
import { NextRequest, NextResponse } from "next/server";

export type TextMode = "words" | "quotes";
export type Duration = 30 | 60;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = (searchParams.get("mode") ?? "words") as TextMode;
  const duration = Number(searchParams.get("duration") ?? 60) as Duration;

  const validDurations = [30, 60];
  const d = validDurations.includes(duration) ? duration : 60;
  const m = mode === "quotes" ? "quotes" : "words";

  let text: string;
  if (m === "quotes") {
    text = getQuote();
  } else {
    const wordCount = d === 30 ? 30 : 60;
    text = getWords(wordCount);
  }

  return NextResponse.json({ text, mode: m, duration: d });
}
