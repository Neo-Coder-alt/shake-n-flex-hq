import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Ticket, X } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { deleteCoupon, toggleCouponActive, upsertCoupon, useCoupons } from "@/lib/data/coupon.service";
import type { Coupon } from "@/lib/data/types";

export const Route = createFileRoute("/admin/coupons")({
  component: CouponsAdmin,
});

function CouponsAdmin() {
  const coupons = useCoupons();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);

  return (
    <AdminShell title="Coupons">
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => { setEditing(null); setOpen(true); }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          style={{ boxShadow: "var(--shadow-brand)" }}
        >
          <Plus className="h-4 w-4" /> New coupon
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((c) => {
          const expired = new Date(c.expiresAt).getTime() < Date.now();
          return (
            <div key={c.id} className="rounded-2xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Ticket className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-black text-foreground">{c.code}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.type === "percent" ? `${c.value}% off` : `Rs. ${c.value} off`}
                    </div>
                  </div>
                </div>
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" checked={c.active} onChange={() => toggleCouponActive(c.id)} className="accent-[color:var(--primary)]" />
                  Active
                </label>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Expires {new Date(c.expiresAt).toLocaleDateString()}
                {expired && <span className="ml-2 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">Expired</span>}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => { setEditing(c); setOpen(true); }}
                  className="flex-1 rounded-lg border border-border py-1.5 text-xs font-semibold hover:border-primary hover:text-primary"
                >Edit</button>
                <button
                  onClick={() => { if (confirm(`Delete ${c.code}?`)) deleteCoupon(c.id); }}
                  className="rounded-lg border border-border p-1.5 text-muted-foreground hover:border-destructive hover:text-destructive"
                  aria-label="Delete"
                ><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          );
        })}
        {coupons.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No coupons yet.
          </div>
        )}
      </div>

      {open && <CouponDialog coupon={editing} onClose={() => setOpen(false)} />}
    </AdminShell>
  );
}

function CouponDialog({ coupon, onClose }: { coupon: Coupon | null; onClose: () => void }) {
  const [code, setCode] = useState(coupon?.code ?? "");
  const [type, setType] = useState<Coupon["type"]>(coupon?.type ?? "percent");
  const [value, setValue] = useState(coupon?.value ?? 10);
  const [expiresAt, setExpiresAt] = useState((coupon?.expiresAt ?? new Date(Date.now() + 30 * 86400000).toISOString()).slice(0, 10));
  const [active, setActive] = useState(coupon?.active ?? true);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertCoupon({
      id: coupon?.id,
      code: code.trim().toUpperCase(),
      type,
      value: Number(value),
      expiresAt: new Date(expiresAt).toISOString(),
      active,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <form onSubmit={submit} className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-background" style={{ boxShadow: "var(--shadow-brand)" }}>
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-bold text-foreground">{coupon ? "Edit coupon" : "New coupon"}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3 p-4 text-sm">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Code</span>
            <input required value={code} onChange={(e) => setCode(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary" placeholder="SUMMER10" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</span>
              <select value={type} onChange={(e) => setType(e.target.value as Coupon["type"])} className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary">
                <option value="percent">Percent %</option>
                <option value="fixed">Fixed Rs.</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Value</span>
              <input required type="number" min={0} value={value} onChange={(e) => setValue(Number(e.target.value))} className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary" />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Expires</span>
            <input required type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary" />
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-[color:var(--primary)]" />
            Active
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-border bg-secondary/40 p-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold">Cancel</button>
          <button type="submit" className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">Save</button>
        </div>
      </form>
    </div>
  );
}