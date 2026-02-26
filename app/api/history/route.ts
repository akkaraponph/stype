import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

const MAX_ENTRIES = 50;

function getConnectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return url;
}

function entryToJson(entry: {
  id: string;
  wpm: number;
  accuracy: number;
  avgIntervalMs: number;
  consistency: number | null;
  mode: string;
  duration: number;
  language: string | null;
  wpmBuckets: unknown;
  timestamp: Date;
}) {
  return {
    id: entry.id,
    wpm: entry.wpm,
    accuracy: entry.accuracy,
    avgIntervalMs: entry.avgIntervalMs,
    consistency: entry.consistency ?? undefined,
    mode: entry.mode,
    duration: entry.duration,
    language: entry.language ?? undefined,
    wpmBuckets: Array.isArray(entry.wpmBuckets) ? entry.wpmBuckets : [],
    timestamp: new Date(entry.timestamp).getTime(),
  };
}

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = getPrisma(getConnectionString());
  const entries = await prisma.typingHistoryEntry.findMany({
    where: { userId: session.userId },
    orderBy: { timestamp: "desc" },
    take: MAX_ENTRIES,
  });

  return NextResponse.json(entries.map(entryToJson));
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    wpm: number;
    accuracy: number;
    avgIntervalMs: number;
    consistency?: number;
    mode: string;
    duration: number;
    language?: string;
    wpmBuckets: number[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { wpm, accuracy, avgIntervalMs, mode, duration, wpmBuckets } = body;
  const consistency = body.consistency;
  const language = body.language;

  if (
    typeof wpm !== "number" ||
    typeof accuracy !== "number" ||
    typeof avgIntervalMs !== "number" ||
    typeof mode !== "string" ||
    typeof duration !== "number" ||
    !Array.isArray(wpmBuckets)
  ) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  const prisma = getPrisma(getConnectionString());
  const entry = await prisma.typingHistoryEntry.create({
    data: {
      userId: session.userId,
      wpm,
      accuracy,
      avgIntervalMs,
      consistency: consistency ?? null,
      mode,
      duration,
      language: language ?? null,
      wpmBuckets,
    },
  });

  return NextResponse.json(entryToJson(entry));
}

export async function DELETE(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = getPrisma(getConnectionString());
  await prisma.typingHistoryEntry.deleteMany({
    where: { userId: session.userId },
  });

  return new NextResponse(null, { status: 204 });
}
