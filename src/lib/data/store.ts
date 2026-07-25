import { useSyncExternalStore, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  categoryFromRow,
  couponFromRow,
  menuFromRow,
  orderFromRow,
  reviewFromRow,
  settingsFromJson,
} from "./mappers";
import type { AppState } from "./types";
import { DEFAULT_SETTINGS } from "./types";

export function newId() {
  return (
    (globalThis.crypto?.randomUUID?.() as string | undefined) ??
    Math.random().toString(36).slice(2) + Date.now().toString(36)
  );
}

const EMPTY: AppState = {
  menu: [],
  categories: [],
  orders: [],
  reviews: [],
  coupons: [],
  settings: DEFAULT_SETTINGS,
  admin: { id: "", name: "", email: "", password: "" },
};

let state: AppState = EMPTY;
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

export function getState(): AppState {
  return state;
}

export function setState(fn: (s: AppState) => AppState) {
  state = fn(state);
  notify();
}

async function loadMenu() {
  const { data } = await supabase.from("menu").select("*").order("created_at", { ascending: false });
  setState((s) => ({ ...s, menu: (data ?? []).map(menuFromRow) }));
}
async function loadCategories() {
  const { data } = await supabase.from("categories").select("*").order("sort_order", { ascending: true }).order("name");
  setState((s) => ({ ...s, categories: (data ?? []).map(categoryFromRow) }));
}
async function loadOrders() {
  const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  setState((s) => ({ ...s, orders: (data ?? []).map(orderFromRow) }));
}
async function loadReviews() {
  const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
  setState((s) => ({ ...s, reviews: (data ?? []).map(reviewFromRow) }));
}
async function loadCoupons() {
  const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
  setState((s) => ({ ...s, coupons: (data ?? []).map(couponFromRow) }));
}
async function loadSettings() {
  const { data } = await supabase.from("website_settings").select("*").eq("id", "global").maybeSingle();
  setState((s) => ({ ...s, settings: settingsFromJson(data?.data) }));
}

const LOADERS: Record<string, () => Promise<void>> = {
  menu: loadMenu,
  categories: loadCategories,
  orders: loadOrders,
  reviews: loadReviews,
  coupons: loadCoupons,
  website_settings: loadSettings,
};

export async function reloadTable(table: keyof typeof LOADERS) {
  const fn = LOADERS[table];
  if (fn) await fn();
}

let bootstrapped = false;
function bootstrap() {
  if (bootstrapped || typeof window === "undefined") return;
  bootstrapped = true;
  Promise.all([
    loadMenu(),
    loadCategories(),
    loadOrders(),
    loadReviews(),
    loadCoupons(),
    loadSettings(),
  ]).catch((e) => console.error("[store] initial load failed", e));

  try {
    supabase
      .channel("public-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public" },
        (payload) => {
          const table = (payload as { table?: string }).table;
          if (table && LOADERS[table]) LOADERS[table]().catch(() => {});
        },
      )
      .subscribe();
  } catch (e) {
    console.warn("[store] realtime unavailable", e);
  }
}

function subscribe(l: () => void) {
  bootstrap();
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
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