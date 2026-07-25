import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { useAdminAuth } from "@/lib/auth/admin-auth";

export const Route = createFileRoute("/admin/")({
  component: AdminLogin,
});

function AdminLogin() {
  const { signIn, requestPasswordReset } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@shakenflex.pk");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn(email, password, remember);
    setLoading(false);
    if (!res.ok) return setError(res.error ?? "Sign in failed");
    navigate({ to: "/admin/dashboard" });
  };

  const onForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await requestPasswordReset(email);
    setForgotMsg(res.ok ? "Password reset email sent. Check your inbox." : (res.error ?? "Unable to send reset"));
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: "var(--gradient-soft)" }}
    >
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-black text-primary-foreground"
            style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-brand)" }}
          >
            SF
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-foreground">
            Shake N Flex Admin
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to manage the store
          </p>
        </div>

        <div
          className="rounded-2xl border border-border bg-card p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          {forgot ? (
            <form onSubmit={onForgot} className="space-y-4">
              <h2 className="text-lg font-bold text-foreground">Reset password</h2>
              <p className="text-sm text-muted-foreground">
                Enter your admin email and we'll send you a reset token.
              </p>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm text-foreground outline-none focus:border-primary"
                  />
                </div>
              </label>
              {forgotMsg && (
                <div className="rounded-lg bg-primary/10 p-3 text-xs text-primary">{forgotMsg}</div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setForgot(false); setForgotMsg(null); }}
                  className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-foreground hover:border-primary"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  Send reset
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm text-foreground outline-none focus:border-primary"
                    placeholder="admin@shakenflex.pk"
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</span>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-10 text-sm text-foreground outline-none focus:border-primary"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:text-foreground"
                    aria-label="Toggle password"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-foreground/80">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-[color:var(--primary)]"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => setForgot(true)}
                  className="font-medium text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">{error}</div>
              )}

              <button
                disabled={loading}
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-70"
                style={{ boxShadow: "var(--shadow-brand)" }}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign in
              </button>

              <div className="rounded-lg bg-secondary p-3 text-[11px] text-muted-foreground">
                Demo admin: <b>admin@shakenflex.pk</b> / <b>admin123</b>
              </div>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <a href="/" className="hover:text-primary">← Back to website</a>
        </p>
      </div>
    </div>
  );
}