import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getState, setState } from "@/lib/data/store";
import type { AdminUser } from "@/lib/data/types";

type Session = { userId: string; email: string; name: string } | null;

type Ctx = {
  user: Session;
  signIn: (email: string, password: string, remember?: boolean) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => void;
  requestPasswordReset: (email: string) => { ok: boolean; token?: string; error?: string };
  updatePassword: (current: string, next: string) => { ok: boolean; error?: string };
  updateProfile: (patch: Partial<AdminUser>) => void;
};

const AdminAuthContext = createContext<Ctx | null>(null);
const SESSION_KEY = "snf_admin_session_v1";

function readSession(): Session {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY) ?? window.sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function writeSession(session: Session, remember: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
  window.sessionStorage.removeItem(SESSION_KEY);
  if (!session) return;
  const target = remember ? window.localStorage : window.sessionStorage;
  target.setItem(SESSION_KEY, JSON.stringify(session));
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Session>(null);

  useEffect(() => {
    setUser(readSession());
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      user,
      signIn: async (email, password, remember = false) => {
        const admin = getState().admin;
        if (email.trim().toLowerCase() !== admin.email.toLowerCase())
          return { ok: false, error: "No admin found with that email." };
        if (password !== admin.password) return { ok: false, error: "Incorrect password." };
        const session: Session = { userId: admin.id, email: admin.email, name: admin.name };
        writeSession(session, remember);
        setUser(session);
        return { ok: true };
      },
      signOut: () => {
        writeSession(null, false);
        setUser(null);
      },
      requestPasswordReset: (email) => {
        const admin = getState().admin;
        if (email.trim().toLowerCase() !== admin.email.toLowerCase())
          return { ok: false, error: "No admin found with that email." };
        const token = Math.random().toString(36).slice(2, 10).toUpperCase();
        return { ok: true, token };
      },
      updatePassword: (current, next) => {
        const admin = getState().admin;
        if (current !== admin.password) return { ok: false, error: "Current password is wrong." };
        if (next.length < 6) return { ok: false, error: "New password must be at least 6 characters." };
        setState((s) => ({ ...s, admin: { ...s.admin, password: next } }));
        return { ok: true };
      },
      updateProfile: (patch) => {
        setState((s) => ({ ...s, admin: { ...s.admin, ...patch } }));
        setUser((u) =>
          u ? { ...u, name: patch.name ?? u.name, email: patch.email ?? u.email } : u,
        );
      },
    }),
    [user],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const c = useContext(AdminAuthContext);
  if (!c) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return c;
}