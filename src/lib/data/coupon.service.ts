import { supabase } from "@/integrations/supabase/client";
import { getState, reloadTable, useAppState } from "./store";
import type { Coupon } from "./types";

export function useCoupons() {
  return useAppState((s) => s.coupons);
}

export async function upsertCoupon(input: Partial<Coupon> & { id?: string }) {
  const row = {
    code: (input.code ?? "NEWCODE").toUpperCase(),
    type: input.type ?? "percent",
    value: input.value ?? 10,
    expires_at: input.expiresAt ?? new Date(Date.now() + 30 * 86400000).toISOString(),
    active: input.active ?? true,
  };
  const { error } = input.id
    ? await supabase.from("coupons").update(row).eq("id", input.id)
    : await supabase.from("coupons").insert(row);
  if (error) console.error("[coupons] upsert", error);
  await reloadTable("coupons");
}

export async function deleteCoupon(id: string) {
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) console.error("[coupons] delete", error);
  await reloadTable("coupons");
}

export async function toggleCouponActive(id: string) {
  const c = getState().coupons.find((x) => x.id === id); if (!c) return;
  const { error } = await supabase.from("coupons").update({ active: !c.active }).eq("id", id);
  if (error) console.error("[coupons] toggle", error);
  await reloadTable("coupons");
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