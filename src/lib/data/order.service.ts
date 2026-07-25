import { supabase } from "@/integrations/supabase/client";
import { getState, reloadTable, useAppState } from "./store";
import type { Database } from "@/integrations/supabase/types";
import type { Order, OrderStatus } from "./types";

type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];

export function useOrders() {
  return useAppState((s) => s.orders);
}

export function listOrders() {
  return getState().orders;
}

export async function createOrder(order: Order) {
  const row: OrderInsert = {
    order_number: order.id,
    customer_name: order.customer.name,
    phone: order.customer.phone,
    address: order.customer.address,
    lat: order.coords?.lat ?? null,
    lng: order.coords?.lng ?? null,
    notes: order.notes ?? null,
    payment: order.payment,
    lines: order.lines as unknown as OrderInsert["lines"],
    subtotal: order.subtotal,
    delivery_fee: order.deliveryFee,
    discount: order.discount,
    total: order.total,
    coupon_code: order.couponCode ?? null,
    status: order.status,
  };
  const { error } = await supabase.from("orders").insert(row);
  if (error) console.error("[orders] create", error);
  await reloadTable("orders");
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const { error } = await supabase.from("orders").update({ status }).eq("order_number", id);
  if (error) console.error("[orders] status", error);
  await reloadTable("orders");
}

export async function deleteOrder(id: string) {
  const { error } = await supabase.from("orders").delete().eq("order_number", id);
  if (error) console.error("[orders] delete", error);
  await reloadTable("orders");
}