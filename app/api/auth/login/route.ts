import { NextResponse } from "next/server";
import {
  verifyCredentials,
  createSessionForUser,
  sessionCookieHeader,
  validateEmailFormat,
} from "@/lib/auth";

const SESSION_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  if (!validateEmailFormat(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }
  if (!password) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  const user = await verifyCredentials(email, password);
  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const token = await createSessionForUser(user.id);
  const res = NextResponse.json({ user });
  res.headers.set("Set-Cookie", sessionCookieHeader(token, SESSION_AGE_SECONDS));
  return res;
}
