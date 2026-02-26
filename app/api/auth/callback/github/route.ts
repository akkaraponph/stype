import { NextResponse } from "next/server";
import {
  exchangeCodeForUser,
  createSessionForUser,
  sessionCookieHeader,
} from "@/lib/auth";

const SESSION_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const baseUrl = process.env.BETTER_AUTH_URL || process.env.VERCEL_URL || "http://localhost:3000";
  const origin = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
  const redirectTo = `${origin}/`;

  if (error) {
    return NextResponse.redirect(redirectTo + "?auth_error=" + encodeURIComponent(error));
  }

  if (!code) {
    return NextResponse.redirect(redirectTo + "?auth_error=missing_code");
  }

  try {
    const user = await exchangeCodeForUser(code);
    const token = await createSessionForUser(user.id);
    const res = NextResponse.redirect(redirectTo);
    res.headers.set("Set-Cookie", sessionCookieHeader(token, SESSION_AGE_SECONDS));
    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Auth failed";
    return NextResponse.redirect(redirectTo + "?auth_error=" + encodeURIComponent(message));
  }
}
