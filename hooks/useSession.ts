"use client";

import { useCallback, useEffect, useState } from "react";

export interface SessionUser {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
}

export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { credentials: "include" });
      const data = (await res.json()) as { user: SessionUser | null };
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const signIn = useCallback(() => {
    window.location.href = "/api/auth/signin";
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/signout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  }, []);

  const signInWithCredentials = useCallback(
    async (email: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = (await res.json()) as { user?: SessionUser; error?: string };
      if (!res.ok) {
        return { ok: false, error: data.error ?? "Login failed" };
      }
      if (data.user) setUser(data.user);
      else await fetchSession();
      return { ok: true };
    },
    [fetchSession]
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      name?: string
    ): Promise<{ ok: true } | { ok: false; error: string }> => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
        credentials: "include",
      });
      const data = (await res.json()) as { user?: SessionUser; error?: string };
      if (!res.ok) {
        return { ok: false, error: data.error ?? "Registration failed" };
      }
      if (data.user) setUser(data.user);
      else await fetchSession();
      return { ok: true };
    },
    [fetchSession]
  );

  return {
    user,
    loading,
    signIn,
    signOut,
    signInWithCredentials,
    register,
    refetchSession: fetchSession,
  };
}
