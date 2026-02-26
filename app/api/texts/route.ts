import {
  getQuote,
  getWords,
  type Language,
  type WordLevel,
} from "@/lib/typing/generator";
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getPrisma } from "@/lib/db";

function getConnectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return url;
}

export type TextMode = "words" | "quotes";
export type Duration = 10 | 15 | 25 | 30 | 50 | 60 | 100 | 120;

const VALID_LANGS: Language[] = ["en", "th"];
const VALID_DURATIONS: Duration[] = [10, 15, 25, 30, 50, 60, 100, 120];
const VALID_LEVELS: WordLevel[] = ["easy", "medium", "hard"];

function parseLevels(levelsParam: string | null): WordLevel[] {
  if (!levelsParam?.trim()) return ["easy", "medium", "hard"];
  const parts = levelsParam.split(",").map((s) => s.trim().toLowerCase());
  const levels = parts.filter((p): p is WordLevel =>
    VALID_LEVELS.includes(p as WordLevel)
  );
  return levels.length ? levels : ["easy", "medium", "hard"];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = (searchParams.get("mode") ?? "words") as TextMode;
  const duration = Number(searchParams.get("duration") ?? 60) as number;
  const langParam = searchParams.get("lang") ?? "en";
  const lang = VALID_LANGS.includes(langParam as Language)
    ? (langParam as Language)
    : "en";
  const levels = parseLevels(searchParams.get("levels"));

  const d = VALID_DURATIONS.includes(duration as Duration) ? (duration as Duration) : 60;
  const m = mode === "quotes" ? "quotes" : "words";

  let extraWords: string[] = [];
  const session = await getSessionFromRequest(request);
  if (session && m === "words") {
    const prisma = getPrisma(getConnectionString());
    const custom = await prisma.customWord.findMany({
      where: {
        userId: session.userId,
        language: lang,
        level: { in: levels },
      },
      select: { word: true },
    });
    extraWords = custom.map((c) => c.word);
  }

  let text: string;
  if (m === "quotes") {
    text = getQuote(lang);
  } else {
    const wordCountMap: Record<number, number> = {
      10: 80,
      15: 120,
      25: 200,
      30: 250,
      50: 400,
      60: 500,
      100: 800,
      120: 1000,
    };
    const wordCount = wordCountMap[d] ?? Math.max(d * 8, 80);
    text = getWords(wordCount, lang, levels, extraWords);
  }

  return NextResponse.json({ text, mode: m, duration: d, lang });
}
