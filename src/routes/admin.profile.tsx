import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Save, Upload, User } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAdminAuth } from "@/lib/auth/admin-auth";
import { getState } from "@/lib/data/store";

export const Route = createFileRoute("/admin/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, updateProfile, updatePassword } = useAdminAuth();
  const admin = getState().admin;
  const [name, setName] = useState(user?.name ?? admin.name);
  const [email, setEmail] = useState(user?.email ?? admin.email);
  const [avatar, setAvatar] = useState<string | undefined>(admin.avatar);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const readFile = (f: File) => {
    const r = new FileReader();
    r.onload = () => setAvatar(r.result as string);
    r.readAsDataURL(f);
  };

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email, avatar });
    setProfileMsg("Profile updated");
    setTimeout(() => setProfileMsg(null), 2000);
  };

  const changePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirmPw) return setPwMsg({ ok: false, text: "Passwords do not match" });
    const res = updatePassword(current, next);
    setPwMsg({ ok: res.ok, text: res.ok ? "Password changed" : (res.error ?? "Failed") });
    if (res.ok) { setCurrent(""); setNext(""); setConfirmPw(""); }
  };

  return (
    <AdminShell title="Profile">
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={saveProfile} className="rounded-2xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
          <h3 className="font-bold text-foreground">Profile</h3>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
              {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <User className="h-7 w-7" />}
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold hover:border-primary hover:text-primary">
              <Upload className="h-3.5 w-3.5" /> Upload photo
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f); }} />
            </label>
          </div>
          <div className="mt-4 space-y-3">
            <Field label="Name"><input className="input-c" value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="Email"><input type="email" className="input-c" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          </div>
          <div className="mt-4 flex items-center justify-end gap-3">
            {profileMsg && <span className="text-sm text-emerald-600">{profileMsg}</span>}
            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
              <Save className="h-4 w-4" /> Save
            </button>
          </div>
        </form>

        <form onSubmit={changePassword} className="rounded-2xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
          <h3 className="font-bold text-foreground">Change password</h3>
          <div className="mt-4 space-y-3">
            <Field label="Current password"><input required type="password" className="input-c" value={current} onChange={(e) => setCurrent(e.target.value)} /></Field>
            <Field label="New password"><input required type="password" className="input-c" value={next} onChange={(e) => setNext(e.target.value)} /></Field>
            <Field label="Confirm new password"><input required type="password" className="input-c" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} /></Field>
          </div>
          {pwMsg && (
            <div className={"mt-3 rounded-lg p-2 text-xs " + (pwMsg.ok ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive")}>
              {pwMsg.text}
            </div>
          )}
          <div className="mt-4 flex justify-end">
            <button className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">Update password</button>
          </div>
        </form>
      </div>
      <style>{`.input-c{width:100%;border-radius:.75rem;border:1px solid var(--border);background:var(--background);padding:.55rem .75rem;font-size:.875rem;color:var(--foreground);outline:none}.input-c:focus{border-color:var(--primary)}`}</style>
    </AdminShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}