import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ user: null, hasPassword: false, hasGitHub: false }, { status: 200 });
  }
  return NextResponse.json({
    user: session.user,
    hasPassword: session.hasPassword,
    hasGitHub: session.hasGitHub,
  });
}
