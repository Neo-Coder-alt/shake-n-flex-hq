import { supabase } from "@/integrations/supabase/client";
import { getState, reloadTable, useAppState } from "./store";
import type { Review } from "./types";

export function useReviews() {
  return useAppState((s) => s.reviews);
}

export function listReviews() {
  return getState().reviews;
}

export async function addReview(input: Omit<Review, "id" | "createdAt" | "pinned">) {
  const { error } = await supabase.from("reviews").insert({
    author: input.author,
    rating: input.rating,
    text: input.text,
    reply: input.reply ?? null,
  });
  if (error) console.error("[reviews] add", error);
  await reloadTable("reviews");
}

export async function deleteReview(id: string) {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) console.error("[reviews] delete", error);
  await reloadTable("reviews");
}

export async function togglePinReview(id: string) {
  const r = getState().reviews.find((x) => x.id === id); if (!r) return;
  const { error } = await supabase.from("reviews").update({ pinned: !r.pinned }).eq("id", id);
  if (error) console.error("[reviews] pin", error);
  await reloadTable("reviews");
}

export async function replyToReview(id: string, reply: string) {
  const { error } = await supabase.from("reviews").update({ reply }).eq("id", id);
  if (error) console.error("[reviews] reply", error);
  await reloadTable("reviews");
}