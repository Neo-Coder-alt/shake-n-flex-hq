import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2, Check, X } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { addCategory, deleteCategory, updateCategory, useCategories } from "@/lib/data/category.service";
import { useMenu } from "@/lib/data/menu.service";

export const Route = createFileRoute("/admin/categories")({
  component: CategoriesAdmin,
});

function CategoriesAdmin() {
  const categories = useCategories();
  const menu = useMenu();
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const counts = new Map<string, number>();
  menu.forEach((m) => counts.set(m.category, (counts.get(m.category) ?? 0) + 1));

  return (
    <AdminShell title="Categories">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) { addCategory(name.trim()); setName(""); }
        }}
        className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="flex-1 min-w-52 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> Add category
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-border bg-card" style={{ boxShadow: "var(--shadow-card)" }}>
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Slug</th>
              <th className="px-4 py-3 text-left">Items</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium text-foreground">
                  {editing === c.id ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                      autoFocus
                    />
                  ) : (
                    c.name
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{c.slug}</td>
                <td className="px-4 py-3 text-muted-foreground">{counts.get(c.name) ?? 0}</td>
                <td className="px-4 py-3 text-right">
                  {editing === c.id ? (
                    <div className="inline-flex gap-1">
                      <button
                        onClick={() => { if (editName.trim()) { updateCategory(c.id, editName.trim()); setEditing(null); } }}
                        className="rounded-lg border border-border p-1.5 text-emerald-600 hover:border-emerald-500"
                        aria-label="Save"
                      ><Check className="h-4 w-4" /></button>
                      <button
                        onClick={() => setEditing(null)}
                        className="rounded-lg border border-border p-1.5 text-muted-foreground hover:border-destructive"
                        aria-label="Cancel"
                      ><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <div className="inline-flex gap-1">
                      <button
                        onClick={() => { setEditing(c.id); setEditName(c.name); }}
                        className="rounded-lg border border-border p-1.5 hover:border-primary hover:text-primary"
                        aria-label="Edit"
                      ><Pencil className="h-4 w-4" /></button>
                      <button
                        onClick={() => { if (confirm(`Delete category "${c.name}"?`)) deleteCategory(c.id); }}
                        className="rounded-lg border border-border p-1.5 text-muted-foreground hover:border-destructive hover:text-destructive"
                        aria-label="Delete"
                      ><Trash2 className="h-4 w-4" /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No categories yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}