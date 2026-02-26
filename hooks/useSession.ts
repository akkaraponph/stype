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

  const [hasPassword, setHasPassword] = useState(false);
  const [hasGitHub, setHasGitHub] = useState(false);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { credentials: "include" });
      const raw = await res.text();
      type SessionData = {
        user: SessionUser | null;
        hasPassword?: boolean;
        hasGitHub?: boolean;
      };
      let data: SessionData;
      try {
        data = raw ? (JSON.parse(raw) as SessionData) : { user: null };
      } catch {
        data = { user: null };
      }
      setUser(data.user ?? null);
      setHasPassword(data.hasPassword ?? false);
      setHasGitHub(data.hasGitHub ?? false);
    } catch {
      setUser(null);
      setHasPassword(false);
      setHasGitHub(false);
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

  const updateProfile = useCallback(
    async (data: {
      name?: string;
      email?: string;
      password?: string;
      currentPassword?: string;
    }): Promise<{ ok: true } | { ok: false; error: string }> => {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const raw = await res.text();
      let body: { user?: SessionUser; error?: string };
      try {
        body = raw ? (JSON.parse(raw) as { user?: SessionUser; error?: string }) : {};
      } catch {
        body = { error: res.status === 404 ? "Profile endpoint not available" : "Update failed" };
      }
      if (!res.ok) {
        return { ok: false, error: body.error ?? (res.statusText || "Update failed") };
      }
      if (body.user) setUser(body.user);
      await fetchSession();
      return { ok: true };
    },
    [fetchSession]
  );

  return {
    user,
    loading,
    hasPassword,
    hasGitHub,
    signIn,
    signOut,
    signInWithCredentials,
    register,
    updateProfile,
    refetchSession: fetchSession,
  };
}
