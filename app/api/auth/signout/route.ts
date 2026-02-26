import { NextResponse } from "next/server";
import {
  getSessionTokenFromRequest,
  deleteSessionByToken,
  clearSessionCookieHeader,
} from "@/lib/auth";

export async function POST(request: Request) {
  const token = getSessionTokenFromRequest(request);
  if (token) {
    await deleteSessionByToken(token).catch(() => {});
  }
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", clearSessionCookieHeader());
  return res;
}
