import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Save, Trash2, Upload } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { addGalleryImage, removeGalleryImage, updateSettings, useSettings } from "@/lib/data/settings.service";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const s = useSettings();
  const [form, setForm] = useState(s);
  const [saved, setSaved] = useState(false);

  const patch = <K extends keyof typeof s>(k: K, v: (typeof s)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const readFile = (f: File, cb: (data: string) => void) => {
    const r = new FileReader();
    r.onload = () => cb(r.result as string);
    r.readAsDataURL(f);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AdminShell title="Website settings">
      <form onSubmit={save} className="space-y-6">
        <Section title="Brand">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Brand name"><input className="input-b" value={form.brandName} onChange={(e) => patch("brandName", e.target.value)} /></Field>
            <Field label="Tagline"><input className="input-b" value={form.tagline} onChange={(e) => patch("tagline", e.target.value)} /></Field>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-[180px_1fr]">
            <ImageBox label="Logo" src={form.logo} onFile={(f) => readFile(f, (d) => patch("logo", d))} onClear={() => patch("logo", undefined)} />
            <ImageBox label="Hero banner" src={form.heroBanner} onFile={(f) => readFile(f, (d) => patch("heroBanner", d))} onClear={() => patch("heroBanner", undefined)} tall />
          </div>
          <Field label="About"><textarea rows={3} className="input-b resize-none" value={form.about} onChange={(e) => patch("about", e.target.value)} /></Field>
        </Section>

        <Section title="Contact & delivery">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone"><input className="input-b" value={form.phone} onChange={(e) => patch("phone", e.target.value)} /></Field>
            <Field label="WhatsApp (digits)"><input className="input-b" value={form.whatsapp} onChange={(e) => patch("whatsapp", e.target.value)} /></Field>
            <Field label="Email"><input className="input-b" type="email" value={form.email} onChange={(e) => patch("email", e.target.value)} /></Field>
            <Field label="Opening hours"><input className="input-b" value={form.hours} onChange={(e) => patch("hours", e.target.value)} /></Field>
            <Field label="Address" full><input className="input-b" value={form.address} onChange={(e) => patch("address", e.target.value)} /></Field>
            <Field label="Delivery charges (Rs.)"><input className="input-b" type="number" value={form.deliveryFee} onChange={(e) => patch("deliveryFee", Number(e.target.value))} /></Field>
          </div>
        </Section>

        <Section title="Social">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Instagram URL"><input className="input-b" value={form.social.instagram} onChange={(e) => patch("social", { ...form.social, instagram: e.target.value })} /></Field>
            <Field label="Facebook URL"><input className="input-b" value={form.social.facebook} onChange={(e) => patch("social", { ...form.social, facebook: e.target.value })} /></Field>
          </div>
        </Section>

        <div className="sticky bottom-4 flex items-center justify-end gap-3 rounded-2xl border border-border bg-background p-3" style={{ boxShadow: "var(--shadow-card)" }}>
          {saved && <span className="text-sm text-emerald-600">Saved</span>}
          <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <Save className="h-4 w-4" /> Save settings
          </button>
        </div>
      </form>

      <div className="mt-8 rounded-2xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
        <h3 className="font-bold text-foreground">Gallery / promotional images</h3>
        <p className="mt-1 text-xs text-muted-foreground">Upload promo banners and shake photos. Shows up in future promotional carousels.</p>
        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-secondary/40 px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary">
          <Upload className="h-4 w-4" /> Upload image
          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) readFile(f, addGalleryImage);
          }} />
        </label>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {s.gallery.map((url) => (
            <div key={url} className="group relative aspect-video overflow-hidden rounded-xl border border-border">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => removeGalleryImage(url)}
                className="absolute right-2 top-2 hidden rounded-full bg-white/90 p-1.5 text-destructive group-hover:block"
                aria-label="Remove"
              ><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          {s.gallery.length === 0 && (
            <div className="col-span-full text-sm text-muted-foreground">No gallery images yet.</div>
          )}
        </div>
      </div>

      <style>{`.input-b{width:100%;border-radius:.75rem;border:1px solid var(--border);background:var(--background);padding:.55rem .75rem;font-size:.875rem;color:var(--foreground);outline:none}.input-b:focus{border-color:var(--primary)}`}</style>
    </AdminShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
      <h3 className="font-bold text-foreground">{title}</h3>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={"block " + (full ? "sm:col-span-2" : "")}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function ImageBox({ label, src, onFile, onClear, tall }: { label: string; src?: string; onFile: (f: File) => void; onClear: () => void; tall?: boolean }) {
  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <label className={"block overflow-hidden rounded-xl border border-dashed border-border bg-secondary/30 hover:border-primary " + (tall ? "aspect-[3/1]" : "aspect-square")}>
        {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-xs text-muted-foreground">
            <Upload className="h-5 w-5" /> Upload
          </div>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      </label>
      {src && <button type="button" onClick={onClear} className="mt-1 text-xs text-muted-foreground hover:text-destructive">Remove</button>}
    </div>
  );
}