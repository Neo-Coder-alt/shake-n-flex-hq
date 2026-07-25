import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type Session = { userId: string; email: string; name: string; avatar?: string } | null;

type Ctx = {
  user: Session;
  loading: boolean;
  signIn: (email: string, password: string, remember?: boolean) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ ok: boolean; error?: string }>;
  updatePassword: (current: string, next: string) => Promise<{ ok: boolean; error?: string }>;
  updateProfile: (patch: { name?: string; email?: string; avatar?: string }) => Promise<void>;
};

const AdminAuthContext = createContext<Ctx | null>(null);

async function ensureProfile(userId: string, email: string): Promise<Session> {
  const { data: existing } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (existing) {
    return {
      userId,
      email: existing.email ?? email,
      name: existing.name ?? (existing.email ?? email).split("@")[0],
      avatar: (existing as { avatar_url?: string | null }).avatar_url ?? undefined,
    };
  }
  const name = email.split("@")[0];
  await supabase.from("profiles").insert({ id: userId, email, name });
  return { userId, email, name };
}

async function verifyAdmin(userId: string): Promise<boolean> {
  try { await supabase.rpc("claim_first_admin" as never); } catch { /* ignore */ }
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).some((r) => r.role === "admin");
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Session>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session?.user) { setUser(null); return; }
      setTimeout(async () => {
        const isAdmin = await verifyAdmin(session.user.id);
        if (!isAdmin) { setUser(null); return; }
        const s = await ensureProfile(session.user.id, session.user.email ?? "");
        if (mounted) setUser(s);
      }, 0);
    });

    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (session?.user) {
        const isAdmin = await verifyAdmin(session.user.id);
        if (isAdmin) {
          const s = await ensureProfile(session.user.id, session.user.email ?? "");
          if (mounted) setUser(s);
        }
      }
      if (mounted) setLoading(false);
    })();

    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  const value = useMemo<Ctx>(() => ({
    user,
    loading,
    signIn: async (email, password) => {
      const cleaned = email.trim();
      const signInRes = await supabase.auth.signInWithPassword({ email: cleaned, password });
      let userId = signInRes.data?.user?.id;
      let userEmail = signInRes.data?.user?.email;
      if (signInRes.error) {
        if (/invalid/i.test(signInRes.error.message)) {
          const { data: su, error: signUpErr } = await supabase.auth.signUp({
            email: cleaned,
            password,
            options: { emailRedirectTo: window.location.origin + "/admin" },
          });
          if (signUpErr) return { ok: false, error: signUpErr.message };
          if (!su.session) return { ok: false, error: "Check your email to confirm your account, then sign in." };
          userId = su.user?.id;
          userEmail = su.user?.email ?? undefined;
        } else {
          return { ok: false, error: signInRes.error.message };
        }
      }
      const uid = userId;
      if (!uid) return { ok: false, error: "Sign-in failed." };
      const isAdmin = await verifyAdmin(uid);
      if (!isAdmin) {
        await supabase.auth.signOut();
        return { ok: false, error: "This account does not have admin access." };
      }
      const s = await ensureProfile(uid, userEmail ?? cleaned);
      setUser(s);
      return { ok: true };
    },
    signOut: async () => { await supabase.auth.signOut(); setUser(null); },
    requestPasswordReset: async (email) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + "/admin",
      });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    },
    updatePassword: async (_current, next) => {
      if (next.length < 6) return { ok: false, error: "New password must be at least 6 characters." };
      const { error } = await supabase.auth.updateUser({ password: next });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    },
    updateProfile: async (patch) => {
      if (!user) return;
      const updates: { name?: string; email?: string; avatar_url?: string } = {};
      if (patch.name !== undefined) updates.name = patch.name;
      if (patch.email !== undefined) updates.email = patch.email;
      if (patch.avatar !== undefined) updates.avatar_url = patch.avatar;
      if (Object.keys(updates).length) {
        await supabase.from("profiles").update(updates).eq("id", user.userId);
      }
      if (patch.email && patch.email !== user.email) {
        await supabase.auth.updateUser({ email: patch.email });
      }
      setUser({
        ...user,
        name: patch.name ?? user.name,
        email: patch.email ?? user.email,
        avatar: patch.avatar !== undefined ? patch.avatar : user.avatar,
      });
    },
  }), [user, loading]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const c = useContext(AdminAuthContext);
  if (!c) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return c;
}