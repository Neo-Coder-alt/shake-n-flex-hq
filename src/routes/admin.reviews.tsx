import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pin, PinOff, Star, Trash2, MessageSquare } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { deleteReview, replyToReview, togglePinReview, useReviews } from "@/lib/data/review.service";

export const Route = createFileRoute("/admin/reviews")({
  component: ReviewsAdmin,
});

function ReviewsAdmin() {
  const reviews = useReviews();
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const sorted = [...reviews].sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <AdminShell title="Reviews">
      <div className="grid gap-4 md:grid-cols-2">
        {sorted.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {r.author.slice(0, 1)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{r.author}</div>
                    <div className="text-[11px] text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={"h-4 w-4 " + (i < r.rating ? "fill-primary text-primary" : "text-muted-foreground/40")} />
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm text-foreground/90">{r.text}</p>
            {r.reply && (
              <div className="mt-3 rounded-xl bg-secondary/70 p-3 text-sm">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">Owner reply</div>
                <div className="mt-1 text-foreground">{r.reply}</div>
              </div>
            )}
            {replyingId === r.id ? (
              <div className="mt-3 space-y-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={2}
                  placeholder="Write a reply…"
                  className="w-full rounded-xl border border-border bg-background p-2 text-sm outline-none focus:border-primary"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { replyToReview(r.id, replyText); setReplyingId(null); setReplyText(""); }}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                  >Post reply</button>
                  <button onClick={() => setReplyingId(null)} className="rounded-lg border border-border px-3 py-1.5 text-xs">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => { setReplyingId(r.id); setReplyText(r.reply ?? ""); }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:border-primary hover:text-primary"
                >
                  <MessageSquare className="h-3.5 w-3.5" /> {r.reply ? "Edit reply" : "Reply"}
                </button>
                <button
                  onClick={() => togglePinReview(r.id)}
                  className={"inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold " + (r.pinned ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary hover:text-primary")}
                >
                  {r.pinned ? <><PinOff className="h-3.5 w-3.5" /> Unpin</> : <><Pin className="h-3.5 w-3.5" /> Pin</>}
                </button>
                <button
                  onClick={() => { if (confirm("Delete this review?")) deleteReview(r.id); }}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        ))}
        {sorted.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No reviews yet.
          </div>
        )}
      </div>
    </AdminShell>
  );
}