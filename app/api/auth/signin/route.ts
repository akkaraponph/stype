import { NextResponse } from "next/server";
import { githubAuthUrl } from "@/lib/auth";

export async function GET(request: Request) {
  if (!process.env.GITHUB_CLIENT_ID) {
    return NextResponse.redirect(new URL("/?error=oauth_not_configured", request.url));
  }
  const state = crypto.randomUUID();
  const url = githubAuthUrl(state);
  return NextResponse.redirect(url);
}
