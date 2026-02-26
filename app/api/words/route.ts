import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import type { Language } from "@/lib/typing/generator";
import type { WordLevel } from "@/lib/typing/generator";

const VALID_LANGS: Language[] = ["en", "th"];
const VALID_LEVELS: WordLevel[] = ["easy", "medium", "hard"];

function getConnectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return url;
}

function wordToJson(w: { id: string; word: string; language: string; level: string; createdAt: Date }) {
  return {
    id: w.id,
    word: w.word,
    language: w.language,
    level: w.level,
    createdAt: new Date(w.createdAt).getTime(),
  };
}

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ words: [] });
  }

  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang");
  const level = searchParams.get("level");

  const prisma = getPrisma(getConnectionString());
  const where: { userId: string; language?: string; level?: string } = { userId: session.userId };
  if (lang && VALID_LANGS.includes(lang as Language)) where.language = lang;
  if (level && VALID_LEVELS.includes(level as WordLevel)) where.level = level;

  const words = await prisma.customWord.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ words: words.map(wordToJson) });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Sign in to add custom words" }, { status: 401 });
  }

  let body: { word?: string; language?: string; level?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rawWord = typeof body.word === "string" ? body.word.trim() : "";
  if (!rawWord) {
    return NextResponse.json({ error: "Word is required" }, { status: 400 });
  }

  const language = VALID_LANGS.includes((body.language ?? "en") as Language)
    ? (body.language as Language)
    : "en";
  const level = VALID_LEVELS.includes((body.level ?? "medium") as WordLevel)
    ? (body.level as WordLevel)
    : "medium";

  const prisma = getPrisma(getConnectionString());
  try {
    const customWord = await prisma.customWord.create({
      data: {
        userId: session.userId,
        word: rawWord,
        language,
        level,
      },
    });
    return NextResponse.json(wordToJson(customWord));
  } catch (e: unknown) {
    const isUnique = e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2002";
    if (isUnique) {
      return NextResponse.json({ error: "This word already exists for this language" }, { status: 409 });
    }
    throw e;
  }
}

export async function DELETE(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const prisma = getPrisma(getConnectionString());
  const deleted = await prisma.customWord.deleteMany({
    where: { id, userId: session.userId },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
