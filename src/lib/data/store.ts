import { useSyncExternalStore, useRef } from "react";
import type { AppState, Category, Coupon, MenuItem, Order, Review } from "./types";
import { DEFAULT_SETTINGS } from "./types";

const KEY = "snf_state_v1";

export function newId() {
  return (
    (globalThis.crypto?.randomUUID?.() as string | undefined) ??
    Math.random().toString(36).slice(2) + Date.now().toString(36)
  );
}

function seed(): AppState {
  const cats: Category[] = [
    { id: newId(), name: "Signature Shakes", slug: "signature-shakes" },
    { id: newId(), name: "Fresh Juices", slug: "fresh-juices" },
    { id: newId(), name: "Coffee", slug: "coffee" },
    { id: newId(), name: "Smoothies", slug: "smoothies" },
    { id: newId(), name: "Desserts", slug: "desserts" },
  ];
  const items: Omit<MenuItem, "id" | "createdAt">[] = [
    { name: "Nutella Shake", description: "Rich Nutella blended with creamy milk.", price: 450, category: "Signature Shakes", sizes: [{ id: "r", name: "Regular", priceDelta: 0 }], toppings: [], featured: true, available: true, outOfStock: false },
    { name: "Oreo Shake", description: "Classic Oreo cookies & cream shake.", price: 400, category: "Signature Shakes", sizes: [{ id: "r", name: "Regular", priceDelta: 0 }], toppings: [], featured: true, available: true, outOfStock: false },
    { name: "Strawberry Shake", description: "Fresh strawberries blended smooth.", price: 380, category: "Signature Shakes", sizes: [{ id: "r", name: "Regular", priceDelta: 0 }], toppings: [], featured: true, available: true, outOfStock: false },
    { name: "Fresh Orange Juice", description: "100% freshly squeezed oranges.", price: 250, category: "Fresh Juices", sizes: [{ id: "r", name: "Regular", priceDelta: 0 }], toppings: [], featured: false, available: true, outOfStock: false },
    { name: "Sugarcane Juice", description: "Chilled sugarcane with lemon & mint.", price: 200, category: "Fresh Juices", sizes: [{ id: "r", name: "Regular", priceDelta: 0 }], toppings: [], featured: true, available: true, outOfStock: false },
    { name: "Cappuccino", description: "Espresso, steamed milk, foam.", price: 300, category: "Coffee", sizes: [{ id: "r", name: "Regular", priceDelta: 0 }], toppings: [], featured: false, available: true, outOfStock: false },
  ];
  const now = new Date().toISOString();
  const menu: MenuItem[] = items.map((i) => ({ ...i, id: newId(), createdAt: now }));
  const reviews: Review[] = [
    { id: newId(), author: "Ali", rating: 5, text: "Best shakes in Nazimabad!", createdAt: now, pinned: true },
    { id: newId(), author: "Sara", rating: 4, text: "Fresh juices, fast delivery.", createdAt: now, pinned: false },
  ];
  const coupons: Coupon[] = [
    { id: newId(), code: "WELCOME10", type: "percent", value: 10, expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(), active: true },
  ];
  const orders: Order[] = [];
  return {
    menu, categories: cats, orders, reviews, coupons,
    settings: DEFAULT_SETTINGS,
    admin: { id: newId(), name: "Admin", email: "admin@shakenflex.pk", password: "admin123" },
  };
}

let state: AppState = load();
const listeners = new Set<() => void>();

function load(): AppState {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as AppState;
  } catch {}
  const s = seed();
  try { window.localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  return s;
}

function persist() {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}

export function getState(): AppState {
  return state;
}

export function setState(fn: (s: AppState) => AppState) {
  state = fn(state);
  persist();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

function shallowEq(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    const ak = Object.keys(a); const bk = Object.keys(b);
    if (ak.length !== bk.length) return false;
    for (const k of ak) if ((a as Record<string, unknown>)[k] !== (b as Record<string, unknown>)[k]) return false;
    return true;
  }
  return false;
}

export function useAppState<T>(selector: (s: AppState) => T): T {
  const cache = useRef<{ src: AppState | null; out: T | undefined }>({ src: null, out: undefined });
  const getSnap = () => {
    if (cache.current.src === state) return cache.current.out as T;
    const next = selector(state);
    if (cache.current.out !== undefined && shallowEq(cache.current.out, next)) {
      cache.current.src = state;
      return cache.current.out as T;
    }
    cache.current = { src: state, out: next };
    return next;
  };
  return useSyncExternalStore(subscribe, getSnap, getSnap);
}