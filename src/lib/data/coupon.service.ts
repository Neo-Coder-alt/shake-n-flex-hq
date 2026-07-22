import { getState, newId, setState, useAppState } from "./store";
import type { Coupon } from "./types";

export function useCoupons() {
  return useAppState((s) => s.coupons);
}

export function upsertCoupon(input: Partial<Coupon> & { id?: string }) {
  setState((s) => {
    const idx = input.id ? s.coupons.findIndex((c) => c.id === input.id) : -1;
    if (idx >= 0) {
      const next = [...s.coupons];
      next[idx] = { ...next[idx], ...input } as Coupon;
      return { ...s, coupons: next };
    }
    const c: Coupon = {
      id: input.id ?? newId(),
      code: (input.code ?? "NEWCODE").toUpperCase(),
      type: input.type ?? "percent",
      value: input.value ?? 10,
      expiresAt: input.expiresAt ?? new Date(Date.now() + 30 * 86400000).toISOString(),
      active: input.active ?? true,
    };
    return { ...s, coupons: [c, ...s.coupons] };
  });
}

export function deleteCoupon(id: string) {
  setState((s) => ({ ...s, coupons: s.coupons.filter((c) => c.id !== id) }));
}

export function toggleCouponActive(id: string) {
  setState((s) => ({
    ...s,
    coupons: s.coupons.map((c) => (c.id === id ? { ...c, active: !c.active } : c)),
  }));
}

export function validateCoupon(code: string, subtotal: number) {
  const c = getState().coupons.find(
    (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.active,
  );
  if (!c) return { ok: false as const, reason: "Invalid code" };
  if (new Date(c.expiresAt).getTime() < Date.now())
    return { ok: false as const, reason: "Coupon expired" };
  const discount =
    c.type === "percent" ? Math.round((subtotal * c.value) / 100) : c.value;
  return { ok: true as const, discount, coupon: c };
}