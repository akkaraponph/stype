import { NextResponse } from "next/server";
import {
  createUserWithPassword,
  createSessionForUser,
  sessionCookieHeader,
  validateEmailFormat,
  validatePasswordLength,
} from "@/lib/auth";

const SESSION_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

export async function POST(request: Request) {
  let body: { email?: string; password?: string; name?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string; name?: string };
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";
  const name = typeof body.name === "string" ? body.name : undefined;

  if (!email.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  if (!validateEmailFormat(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }
  if (!password) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }
  if (!validatePasswordLength(password)) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  try {
    const user = await createUserWithPassword({ email, password, name });
    const token = await createSessionForUser(user.id);
    const res = NextResponse.json({ user });
    res.headers.set("Set-Cookie", sessionCookieHeader(token, SESSION_AGE_SECONDS));
    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Registration failed";
    if (message.includes("already exists")) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
