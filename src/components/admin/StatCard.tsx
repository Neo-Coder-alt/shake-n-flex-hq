import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  tint = "primary",
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tint?: "primary" | "success" | "warning" | "muted";
  hint?: string;
}) {
  const tintClass = {
    primary: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-600",
    warning: "bg-amber-500/10 text-amber-600",
    muted: "bg-muted text-muted-foreground",
  }[tint];
  return (
    <div
      className="rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 text-3xl font-black text-foreground">{value}</div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        <div className={"flex h-10 w-10 items-center justify-center rounded-xl " + tintClass}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}