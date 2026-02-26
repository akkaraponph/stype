import { NextResponse } from "next/server";
import {
  exchangeCodeForUser,
  createSessionForUser,
  sessionCookieHeader,
} from "@/lib/auth";

const SESSION_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

/**
 * Legacy callback route for when GitHub redirects to /oauth/signin/api/auth/callback/github
 * (e.g. if BETTER_AUTH_URL was set with a path). Uses the request URL as redirect_uri
 * so the token exchange matches what was sent in the authorize request.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams } = url;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const origin = url.origin;
  const redirectTo = `${origin}/`;

  if (error) {
    return NextResponse.redirect(redirectTo + "?auth_error=" + encodeURIComponent(error));
  }

  if (!code) {
    return NextResponse.redirect(redirectTo + "?auth_error=missing_code");
  }

  const redirectUri = origin + url.pathname;

  try {
    const user = await exchangeCodeForUser(code, { redirectUri });
    const token = await createSessionForUser(user.id);
    const res = NextResponse.redirect(redirectTo);
    res.headers.set("Set-Cookie", sessionCookieHeader(token, SESSION_AGE_SECONDS));
    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Auth failed";
    return NextResponse.redirect(redirectTo + "?auth_error=" + encodeURIComponent(message));
  }
}
