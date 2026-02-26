import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import {
  DEFAULT_PREFERENCES,
  mergePreferences,
  parsePreferencesFromJson,
  parsePartialPreferencesFromJson,
} from "@/lib/preferences";

function getConnectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return url;
}

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const prisma = getPrisma(getConnectionString());
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { preferences: true },
  });
  const parsed = user?.preferences
    ? parsePreferencesFromJson(user.preferences)
    : null;
  const prefs = parsed ?? DEFAULT_PREFERENCES;
  return NextResponse.json({ preferences: prefs });
}

export async function PATCH(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const partial = parsePartialPreferencesFromJson(body);
  if (!partial) {
    return NextResponse.json({ error: "Invalid preferences shape" }, { status: 400 });
  }
  const prisma = getPrisma(getConnectionString());
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { preferences: true },
  });
  const current = user?.preferences
    ? parsePreferencesFromJson(user.preferences) ?? DEFAULT_PREFERENCES
    : DEFAULT_PREFERENCES;
  const merged = mergePreferences(current, partial as Parameters<typeof mergePreferences>[1]);
  await prisma.user.update({
    where: { id: session.userId },
    data: { preferences: merged as unknown as object },
  });
  return NextResponse.json({ preferences: merged });
}
