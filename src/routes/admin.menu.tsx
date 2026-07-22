import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Star, Trash2, Upload, X } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  deleteMenuItem,
  toggleAvailable,
  toggleFeatured,
  toggleOutOfStock,
  upsertMenuItem,
  useMenu,
} from "@/lib/data/menu.service";
import { useCategories } from "@/lib/data/category.service";
import type { MenuItem } from "@/lib/data/types";

export const Route = createFileRoute("/admin/menu")({
  component: MenuAdmin,
});

function MenuAdmin() {
  const menu = useMenu();
  const categories = useCategories();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    return menu.filter(
      (m) =>
        (cat === "All" || m.category === cat) &&
        (q === "" || m.name.toLowerCase().includes(q.toLowerCase())),
    );
  }, [menu, q, cat]);

  return (
    <AdminShell title="Menu">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search items…"
            className="w-full rounded-xl border border-border bg-background py-2 pl-10 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option>All</option>
          {categories.map((c) => (
            <option key={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          style={{ boxShadow: "var(--shadow-brand)" }}
        >
          <Plus className="h-4 w-4" /> Add shake
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((m) => (
          <div
            key={m.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="relative aspect-video overflow-hidden bg-secondary">
              {m.image ? (
                <img src={m.image} alt={m.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-3xl font-black text-primary/40">
                  {m.name.slice(0, 1)}
                </div>
              )}
              {m.featured && (
                <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                  Featured
                </span>
              )}
              {m.outOfStock && (
                <span className="absolute right-2 top-2 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground">
                  Out of stock
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-primary">{m.category}</div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <div className="font-bold text-foreground">{m.name}</div>
                <div className="text-sm font-bold text-foreground">Rs. {m.price}</div>
              </div>
              <p className="mt-1 line-clamp-2 flex-1 text-xs text-muted-foreground">{m.description}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <label className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1">
                  <input type="checkbox" checked={m.available} onChange={() => toggleAvailable(m.id)} className="h-3 w-3 accent-[color:var(--primary)]" />
                  Available
                </label>
                <label className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1">
                  <input type="checkbox" checked={m.outOfStock} onChange={() => toggleOutOfStock(m.id)} className="h-3 w-3 accent-[color:var(--primary)]" />
                  Out of stock
                </label>
                <button
                  onClick={() => toggleFeatured(m.id)}
                  className={"inline-flex items-center gap-1 rounded-full border px-2 py-1 " + (m.featured ? "border-primary bg-primary/10 text-primary" : "border-border")}
                >
                  <Star className={"h-3 w-3 " + (m.featured ? "fill-primary" : "")} /> Featured
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setEditing(m)}
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-border py-1.5 text-xs font-semibold hover:border-primary hover:text-primary"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete ${m.name}?`)) deleteMenuItem(m.id);
                  }}
                  className="inline-flex items-center justify-center rounded-lg border border-border p-1.5 text-muted-foreground hover:border-destructive hover:text-destructive"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No items match your filters.
          </div>
        )}
      </div>

      {(editing || creating) && (
        <MenuItemDialog
          item={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
        />
      )}
    </AdminShell>
  );
}

function MenuItemDialog({ item, onClose }: { item: MenuItem | null; onClose: () => void }) {
  const categories = useCategories();
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState(item?.price ?? 0);
  const [category, setCategory] = useState(item?.category ?? categories[0]?.name ?? "Signature Shakes");
  const [image, setImage] = useState<string | undefined>(item?.image);
  const [featured, setFeatured] = useState(item?.featured ?? false);
  const [available, setAvailable] = useState(item?.available ?? true);
  const [outOfStock, setOutOfStock] = useState(item?.outOfStock ?? false);
  const [sizes, setSizes] = useState(item?.sizes ?? [{ id: "reg", name: "Regular", priceDelta: 0 }]);
  const [toppings, setToppings] = useState(item?.toppings ?? []);

  const onFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(f);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertMenuItem({
      id: item?.id,
      name, description, price: Number(price) || 0, category, image,
      featured, available, outOfStock, sizes, toppings,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <form
        onSubmit={submit}
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-background"
        style={{ boxShadow: "var(--shadow-brand)" }}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-bold text-foreground">{item ? "Edit item" : "Add new item"}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-secondary" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-auto p-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
            <div className="space-y-3">
              <Field label="Name" required>
                <input required value={name} onChange={(e) => setName(e.target.value)} className="input-a" />
              </Field>
              <Field label="Description">
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input-a resize-none" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Price (Rs.)" required>
                  <input required type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="input-a" />
                </Field>
                <Field label="Category">
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-a">
                    {categories.map((c) => <option key={c.id}>{c.name}</option>)}
                  </select>
                </Field>
              </div>
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Image</span>
              <label className="block aspect-square overflow-hidden rounded-xl border border-dashed border-border bg-secondary/30 hover:border-primary">
                {image ? (
                  <img src={image} alt="preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Upload className="h-5 w-5" />
                    Upload
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onFile(f);
                  }}
                />
              </label>
              {image && (
                <button type="button" onClick={() => setImage(undefined)} className="mt-2 w-full text-xs text-muted-foreground hover:text-destructive">
                  Remove image
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <VariantEditor title="Sizes" items={sizes} onChange={setSizes} />
            <VariantEditor title="Toppings" items={toppings} onChange={setToppings} />
          </div>

          <div className="flex flex-wrap gap-4 rounded-xl border border-border bg-secondary/40 p-3 text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="accent-[color:var(--primary)]" /> Featured
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} className="accent-[color:var(--primary)]" /> Available
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={outOfStock} onChange={(e) => setOutOfStock(e.target.checked)} className="accent-[color:var(--primary)]" /> Out of stock
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border bg-secondary/40 p-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:border-primary">Cancel</button>
          <button type="submit" className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
            {item ? "Save changes" : "Create item"}
          </button>
        </div>
        <style>{`.input-a{width:100%;border-radius:.75rem;border:1px solid var(--border);background:var(--background);padding:.55rem .75rem;font-size:.875rem;color:var(--foreground);outline:none}.input-a:focus{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in oklab, var(--primary) 20%, transparent)}`}</style>
      </form>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}{required && <span className="text-primary"> *</span>}
      </span>
      {children}
    </label>
  );
}

function VariantEditor({
  title,
  items,
  onChange,
}: {
  title: string;
  items: { id: string; name: string; priceDelta: number }[];
  onChange: (v: { id: string; name: string; priceDelta: number }[]) => void;
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
        <button
          type="button"
          onClick={() => onChange([...items, { id: Math.random().toString(36).slice(2, 8), name: "", priceDelta: 0 }])}
          className="text-xs font-semibold text-primary hover:underline"
        >
          + Add
        </button>
      </div>
      <div className="mt-2 space-y-2">
        {items.map((v, i) => (
          <div key={v.id} className="flex items-center gap-2">
            <input
              value={v.name}
              onChange={(e) => {
                const next = [...items]; next[i] = { ...v, name: e.target.value }; onChange(next);
              }}
              placeholder="Name"
              className="input-a flex-1"
            />
            <input
              type="number"
              value={v.priceDelta}
              onChange={(e) => {
                const next = [...items]; next[i] = { ...v, priceDelta: Number(e.target.value) }; onChange(next);
              }}
              className="input-a w-24"
              placeholder="+Rs"
            />
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        {items.length === 0 && <div className="text-xs text-muted-foreground">None yet.</div>}
      </div>
    </div>
  );
}