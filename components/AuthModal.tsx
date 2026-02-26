"use client";

import { useCallback, useEffect, useState } from "react";

type Tab = "login" | "register";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: Tab;
  signInWithCredentials: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  register: (email: string, password: string, name?: string) => Promise<{ ok: true } | { ok: false; error: string }>;
}

export function AuthModal({
  open,
  onClose,
  initialTab = "login",
  signInWithCredentials,
  register,
}: AuthModalProps) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [email, setEmail] = useState("");
  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setError(null);
    setEmail("");
    setPassword("");
    setName("");
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    setTab(initialTab);
    onClose();
  }, [initialTab, onClose, resetForm]);

  const handleTabChange = useCallback((t: Tab) => {
    setTab(t);
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSubmitting(true);
      try {
        if (tab === "login") {
          const result = await signInWithCredentials(email, password);
          if (result.ok) {
            handleClose();
            return;
          }
          setError(result.error);
        } else {
          const result = await register(email, password, name.trim() || undefined);
          if (result.ok) {
            handleClose();
            return;
          }
          setError(result.error);
        }
      } finally {
        setSubmitting(false);
      }
    },
    [tab, email, password, name, signInWithCredentials, register, handleClose]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="w-full max-w-md rounded-xl border border-sub/30 bg-background p-6 shadow-xl animate-in fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="auth-modal-title" className="text-xl font-bold text-foreground">
            {tab === "login" ? "Sign in" : "Create account"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-sub hover:text-foreground transition-colors p-1 rounded"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex gap-2 mb-6 border-b border-sub/20">
          <button
            type="button"
            onClick={() => handleTabChange("login")}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              tab === "login"
                ? "border-main text-main"
                : "border-transparent text-sub hover:text-foreground"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("register")}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              tab === "register"
                ? "border-main text-main"
                : "border-transparent text-sub hover:text-foreground"
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-sm font-medium text-foreground mb-1">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-sub/30 bg-background px-3 py-2 text-foreground placeholder:text-sub focus:outline-none focus:border-main"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-sm font-medium text-foreground mb-1">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              autoComplete={tab === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-sub/30 bg-background px-3 py-2 text-foreground placeholder:text-sub focus:outline-none focus:border-main"
              placeholder={tab === "login" ? "••••••••" : "At least 8 characters"}
              required
              minLength={tab === "register" ? 8 : undefined}
            />
          </div>

          {tab === "register" && (
            <div>
              <label htmlFor="auth-name" className="block text-sm font-medium text-foreground mb-1">
                Name <span className="text-sub font-normal">(optional)</span>
              </label>
              <input
                id="auth-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-sub/30 bg-background px-3 py-2 text-foreground placeholder:text-sub focus:outline-none focus:border-main"
                placeholder="Your name"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-lg bg-main/20 hover:bg-main/30 border border-main/50 text-foreground font-medium py-2.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "..." : tab === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        {tab === "login" && (
          <p className="mt-4 text-center text-sub text-xs">
            <button type="button" className="hover:text-foreground transition-colors cursor-pointer" disabled>
              Forgot password?
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
