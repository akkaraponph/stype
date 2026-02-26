import { NextResponse } from "next/server";
import {
  getSessionFromRequest,
  updateUserProfile,
  setPasswordForUser,
  changePasswordForUser,
} from "@/lib/auth";

type Body = {
  name?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
};

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { userId, user, hasPassword } = session;
  const name = typeof body.name === "string" ? body.name : undefined;
  const email = typeof body.email === "string" ? body.email : undefined;
  const password = typeof body.password === "string" ? body.password : undefined;
  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : undefined;

  try {
    if (password !== undefined) {
      if (hasPassword) {
        if (!currentPassword) {
          return NextResponse.json(
            { error: "Current password is required to change password" },
            { status: 400 }
          );
        }
        await changePasswordForUser(userId, currentPassword, password);
      } else {
        const emailForPassword = email ?? user.email;
        if (!emailForPassword || !emailForPassword.trim()) {
          return NextResponse.json(
            { error: "Email is required to set a password" },
            { status: 400 }
          );
        }
        await setPasswordForUser(userId, emailForPassword, password);
      }
    }

    if (name !== undefined || (email !== undefined && (password === undefined || hasPassword))) {
      await updateUserProfile(userId, { name, email });
    } else if (password !== undefined && !hasPassword && name !== undefined) {
      await updateUserProfile(userId, { name });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const updated = await getSessionFromRequest(request);
  return NextResponse.json({
    user: updated ? updated.user : session.user,
  });
}
