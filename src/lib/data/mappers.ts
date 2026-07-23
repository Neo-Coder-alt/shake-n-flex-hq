import type { Category, Coupon, MenuItem, Order, OrderStatus, Review, SiteSettings, SizeOption, ToppingOption } from "./types";
import { DEFAULT_SETTINGS } from "./types";
import type { Database } from "@/integrations/supabase/types";

type MenuRow = Database["public"]["Tables"]["menu"]["Row"];
type MenuInsert = Database["public"]["Tables"]["menu"]["Insert"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
type CouponRow = Database["public"]["Tables"]["coupons"]["Row"];

export function menuFromRow(r: MenuRow): MenuItem {
  const sizes = Array.isArray(r.sizes) ? (r.sizes as unknown as SizeOption[]) : [];
  const toppings = Array.isArray(r.toppings) ? (r.toppings as unknown as ToppingOption[]) : [];
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    price: Number(r.price ?? 0),
    category: r.category,
    image: r.image ?? undefined,
    sizes: sizes.length ? sizes : [{ id: "reg", name: "Regular", priceDelta: 0 }],
    toppings,
    featured: !!r.featured,
    available: !!r.available,
    outOfStock: !!r.out_of_stock,
    createdAt: r.created_at,
  };
}

export function menuToRow(m: Partial<MenuItem>): MenuInsert {
  return {
    ...(m.id ? { id: m.id } : {}),
    name: m.name ?? "New Item",
    description: m.description ?? "",
    price: m.price ?? 0,
    category: m.category ?? "Signature Shakes",
    image: m.image ?? null,
    sizes: (m.sizes ?? []) as unknown as MenuInsert["sizes"],
    toppings: (m.toppings ?? []) as unknown as MenuInsert["toppings"],
    featured: m.featured ?? false,
    available: m.available ?? true,
    out_of_stock: m.outOfStock ?? false,
  };
}

export function categoryFromRow(r: CategoryRow): Category {
  return { id: r.id, name: r.name, slug: r.slug };
}

export function orderFromRow(r: OrderRow): Order {
  const lines = Array.isArray(r.lines) ? (r.lines as unknown as Order["lines"]) : [];
  return {
    id: r.order_number,
    createdAt: r.created_at,
    status: r.status as OrderStatus,
    customer: { name: r.customer_name, phone: r.phone, address: r.address },
    coords: r.lat != null && r.lng != null ? { lat: Number(r.lat), lng: Number(r.lng) } : null,
    notes: r.notes ?? undefined,
    payment: (r.payment as "cod" | "online") ?? "cod",
    lines,
    subtotal: Number(r.subtotal ?? 0),
    deliveryFee: Number(r.delivery_fee ?? 0),
    discount: Number(r.discount ?? 0),
    total: Number(r.total ?? 0),
    couponCode: r.coupon_code ?? undefined,
  };
}

export function reviewFromRow(r: ReviewRow): Review {
  return {
    id: r.id,
    author: r.author,
    rating: r.rating,
    text: r.text,
    createdAt: r.created_at,
    pinned: !!r.pinned,
    reply: r.reply ?? undefined,
  };
}

export function couponFromRow(r: CouponRow): Coupon {
  return {
    id: r.id,
    code: r.code,
    type: (r.type === "fixed" ? "fixed" : "percent"),
    value: Number(r.value),
    expiresAt: r.expires_at,
    active: !!r.active,
  };
}

export function settingsFromJson(v: unknown): SiteSettings {
  if (!v || typeof v !== "object") return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...(v as Partial<SiteSettings>) } as SiteSettings;
}