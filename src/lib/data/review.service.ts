import { getState, newId, setState, useAppState } from "./store";
import type { Review } from "./types";

export function useReviews() {
  return useAppState((s) => s.reviews);
}

export function listReviews() {
  return getState().reviews;
}

export function addReview(input: Omit<Review, "id" | "createdAt" | "pinned">) {
  const r: Review = {
    ...input,
    id: newId(),
    createdAt: new Date().toISOString(),
    pinned: false,
  };
  setState((s) => ({ ...s, reviews: [r, ...s.reviews] }));
}

export function deleteReview(id: string) {
  setState((s) => ({ ...s, reviews: s.reviews.filter((r) => r.id !== id) }));
}

export function togglePinReview(id: string) {
  setState((s) => ({
    ...s,
    reviews: s.reviews.map((r) => (r.id === id ? { ...r, pinned: !r.pinned } : r)),
  }));
}

export function replyToReview(id: string, reply: string) {
  setState((s) => ({
    ...s,
    reviews: s.reviews.map((r) => (r.id === id ? { ...r, reply } : r)),
  }));
}