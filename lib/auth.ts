/**
 * Custom GitHub OAuth and session helpers. Session = opaque token in DB + httpOnly cookie.
 * Email/password auth uses Web Crypto PBKDF2 for Cloudflare Workers compatibility.
 */
import { getPrisma } from "@/lib/db";

const COOKIE_NAME = "slowlytype_session";
const SESSION_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const PBKDF2_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const HASH_BYTES = 32;

function getConnectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return url;
}

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
}

export function getSessionTokenFromRequest(request: Request): string | null {
  const cookie = request.headers.get("Cookie");
  if (!cookie) return null;
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1].trim()) : null;
}

export async function getSessionFromRequest(request: Request): Promise<{
  userId: string;
  user: AuthUser;
} | null> {
  const token = getSessionTokenFromRequest(request);
  if (!token) return null;

  const prisma = getPrisma(getConnectionString());
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return {
    userId: session.userId,
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    },
  };
}

export function sessionCookieHeader(token: string, maxAgeSeconds: number): string {
  const isProd = process.env.NODE_ENV === "production";
  return [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
    ...(isProd ? ["Secure"] : []),
  ].join("; ");
}

export function clearSessionCookieHeader(): string {
  return [
    `${COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ].join("; ");
}

export async function createSessionForUser(userId: string): Promise<string> {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_AGE_MS);

  const prisma = getPrisma(getConnectionString());
  await prisma.session.create({
    data: { token, userId, expiresAt },
  });

  return token;
}

export async function deleteSessionByToken(token: string): Promise<void> {
  const prisma = getPrisma(getConnectionString());
  await prisma.session.deleteMany({ where: { token } });
}

// ——— Email/password (Web Crypto PBKDF2) ———

function encodeBase64(bytes: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

function decodeBase64(str: string): Uint8Array {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(plain),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    HASH_BYTES * 8
  );
  return `pbkdf2$${PBKDF2_ITERATIONS}$${encodeBase64(salt)}$${encodeBase64(derived)}`;
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = parseInt(parts[1], 10);
  if (!Number.isFinite(iterations) || iterations < 1) return false;
  const salt = decodeBase64(parts[2]);
  const expected = decodeBase64(parts[3]);
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(plain),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    HASH_BYTES * 8
  );
  if (expected.length !== derived.byteLength) return false;
  const a = new Uint8Array(derived);
  const b = new Uint8Array(expected);
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a[i]! ^ b[i]!;
  return out === 0;
}

export async function findUserByEmail(email: string): Promise<AuthUser | null> {
  const prisma = getPrisma(getConnectionString());
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) return null;
  return { id: user.id, email: user.email, name: user.name, image: user.image };
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export async function createUserWithPassword(params: {
  email: string;
  password: string;
  name?: string;
}): Promise<AuthUser> {
  const email = params.email.trim().toLowerCase();
  if (!isValidEmail(email)) throw new Error("Invalid email format");
  if (params.password.length < MIN_PASSWORD_LENGTH)
    throw new Error("Password must be at least 8 characters");

  const prisma = getPrisma(getConnectionString());
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("An account with this email already exists");

  const passwordHash = await hashPassword(params.password);
  const user = await prisma.user.create({
    data: {
      email,
      name: params.name?.trim() || null,
      passwordHash,
      githubId: null,
    },
  });
  return { id: user.id, email: user.email, name: user.name, image: user.image };
}

export async function verifyCredentials(email: string, password: string): Promise<AuthUser | null> {
  const emailNorm = email.trim().toLowerCase();
  if (!emailNorm || !password) return null;

  const prisma = getPrisma(getConnectionString());
  const user = await prisma.user.findUnique({ where: { email: emailNorm } });
  if (!user || !user.passwordHash) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  return { id: user.id, email: user.email, name: user.name, image: user.image };
}

export function validateEmailFormat(email: string): boolean {
  return isValidEmail(email);
}

export function validatePasswordLength(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH;
}

export function githubAuthUrl(state: string): string {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) throw new Error("GITHUB_CLIENT_ID is not set");
  const baseUrl = process.env.BETTER_AUTH_URL || process.env.VERCEL_URL || "http://localhost:3000";
  const origin = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
  const redirectUri = `${origin}/api/auth/callback/github`;
  const scope = "read:user user:email";
  return `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}`;
}

export async function exchangeCodeForUser(
  code: string,
  options?: { redirectUri?: string }
): Promise<AuthUser> {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("GitHub OAuth env not set");

  const redirectUri =
    options?.redirectUri ??
    (() => {
      const baseUrl = process.env.BETTER_AUTH_URL || process.env.VERCEL_URL || "http://localhost:3000";
      const origin = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
      return `${origin}/api/auth/callback/github`;
    })();

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) throw new Error("Failed to exchange code");
  const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };
  if (tokenData.error || !tokenData.access_token) throw new Error(tokenData.error || "No access token");

  const ghApiHeaders: Record<string, string> = {
    Authorization: `Bearer ${tokenData.access_token}`,
    "User-Agent": "Slowlytype-OAuth",
    Accept: "application/vnd.github+json",
  };

  const userRes = await fetch("https://api.github.com/user", {
    headers: ghApiHeaders,
  });
  if (!userRes.ok) throw new Error(`Failed to fetch GitHub user (${userRes.status})`);
  const ghUser = (await userRes.json()) as { id: number; login: string; name: string | null; avatar_url: string | null; email?: string };

  let email = ghUser.email ?? null;
  if (!email) {
    const emRes = await fetch("https://api.github.com/user/emails", {
      headers: ghApiHeaders,
    });
    if (emRes.ok) {
      const emails = (await emRes.json()) as Array<{ email: string; primary: boolean }>;
      const primary = emails.find((e) => e.primary);
      email = primary?.email ?? emails[0]?.email ?? null;
    }
  }

  const prisma = getPrisma(getConnectionString());
  const githubId = String(ghUser.id);
  const user = await prisma.user.upsert({
    where: { githubId },
    create: {
      githubId,
      email: email ?? undefined,
      name: ghUser.name ?? ghUser.login,
      image: ghUser.avatar_url ?? undefined,
    },
    update: {
      email: email ?? undefined,
      name: ghUser.name ?? ghUser.login,
      image: ghUser.avatar_url ?? undefined,
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
  };
}
