import { useRef, useSyncExternalStore } from "react";
import type {
  AppState,
  Category,
  Coupon,
  MenuItem,
  Order,
  Review,
  SiteSettings,
  AdminUser,
} from "./types";

const KEY = "snf_data_v2";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function seedCategories(): Category[] {
  return [
    "Signature Shakes",
    "Fresh Juices",
    "Coffees",
    "Smoothies",
    "Lemonades",
    "Desserts",
  ].map((name) => ({ id: uid(), name, slug: name.toLowerCase().replace(/\s+/g, "-") }));
}

function seedMenu(): MenuItem[] {
  const base: Array<Omit<MenuItem, "sizes" | "toppings" | "featured" | "available" | "outOfStock" | "createdAt">> = [
    { id: "big-bang-brownie", name: "Big Bang Brownie", price: 580, category: "Signature Shakes", description: "Rich chocolate brownie blended with ice cream and milk." },
    { id: "the-feast-shake", name: "The Feast Shake", price: 680, category: "Signature Shakes", description: "Loaded shake with chocolate, cream and a scoop of ice cream." },
    { id: "kitkat-shake", name: "KitKat Shake", price: 520, category: "Signature Shakes", description: "Crushed KitKat blended with creamy milk and ice cream." },
    { id: "chocolate-oreo", name: "Chocolate Oreo", price: 540, category: "Signature Shakes", description: "Chocolate and Oreo cookies blended into a thick shake." },
    { id: "hazelnut-chocolate", name: "Hazelnut Chocolate", price: 620, category: "Signature Shakes", description: "Creamy hazelnut with a chocolate swirl." },
    { id: "strawberry-shake", name: "Strawberry Shake", price: 400, category: "Signature Shakes", description: "Fresh strawberries blended with milk and ice cream." },
    { id: "chiko-shake", name: "Chiko Shake", price: 420, category: "Signature Shakes", description: "Classic chikoo shake, thick and refreshing." },
    { id: "mango-juice", name: "Mango Juice", price: 350, category: "Fresh Juices", description: "Freshly blended seasonal mango." },
    { id: "orange-juice", name: "Orange Juice", price: 320, category: "Fresh Juices", description: "100% fresh squeezed orange." },
    { id: "apple-juice", name: "Apple Juice", price: 340, category: "Fresh Juices", description: "Crisp, cold pressed apple juice." },
    { id: "iced-latte", name: "Iced Latte", price: 380, category: "Coffees", description: "Espresso, cold milk and ice." },
    { id: "wicked-vanilla-coffee", name: "Wicked Vanilla Coffee", price: 460, category: "Coffees", description: "Bold coffee with a vanilla cream finish." },
    { id: "pistachio-frappe", name: "Pistachio Frappe", price: 520, category: "Coffees", description: "Blended pistachio and coffee frappe." },
    { id: "chocolate-smoothie", name: "Chocolate Smoothie", price: 480, category: "Smoothies", description: "Thick chocolate smoothie, cold and creamy." },
    { id: "banana-smoothie", name: "Banana Smoothie", price: 420, category: "Smoothies", description: "Banana blended with yoghurt and honey." },
    { id: "mint-margarita", name: "Mint Margarita", price: 280, category: "Lemonades", description: "Refreshing mint, lemon and soda." },
    { id: "mint-lemonade", name: "Mint Lemonade", price: 260, category: "Lemonades", description: "Classic mint lemonade, ice cold." },
    { id: "kitkat-kalato", name: "Kit Kat Kalato", price: 460, category: "Desserts", description: "Ice cream dessert loaded with KitKat." },
    { id: "cream-dessert", name: "Cream", price: 380, category: "Desserts", description: "House cream dessert cup." },
  ];
  const featured = new Set([
    "big-bang-brownie",
    "the-feast-shake",
    "hazelnut-chocolate",
    "mint-margarita",
    "iced-latte",
    "strawberry-shake",
  ]);
  return base.map((b) => ({
    ...b,
    sizes: [
      { id: "reg", name: "Regular", priceDelta: 0 },
      { id: "lg", name: "Large", priceDelta: 100 },
    ],
    toppings: [
      { id: "cream", name: "Whipped Cream", priceDelta: 50 },
      { id: "choco", name: "Extra Chocolate", priceDelta: 80 },
    ],
    featured: featured.has(b.id),
    available: true,
    outOfStock: false,
    createdAt: new Date().toISOString(),
  }));
}

function seedReviews(): Review[] {
  return [
    { id: uid(), author: "Ahmed K.", rating: 5, text: "Best brownie shake in Nazimabad!", createdAt: new Date().toISOString(), pinned: true },
    { id: uid(), author: "Sana M.", rating: 4, text: "Delivery was quick, mint margarita was perfect.", createdAt: new Date(Date.now() - 86400000).toISOString(), pinned: false },
    { id: uid(), author: "Bilal R.", rating: 5, text: "The Feast Shake is a whole meal. Loved it.", createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), pinned: false },
  ];
}

function seedOrders(): Order[] {
  const now = Date.now();
  const mk = (daysAgo: number, status: Order["status"], items: Array<{ id: string; name: string; price: number; qty: number }>): Order => {
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    return {
      id: "SNF-" + Math.floor(now - daysAgo * 86400000).toString(36).toUpperCase(),
      createdAt: new Date(now - daysAgo * 86400000).toISOString(),
      status,
      customer: { name: "Guest", phone: "03XX-XXXXXXX", address: "Block 4, Nazimabad, Karachi" },
      coords: null,
      payment: "cod",
      lines: items.map((i) => ({ itemId: i.id, name: i.name, qty: i.qty, price: i.price })),
      subtotal,
      deliveryFee: 80,
      discount: 0,
      total: subtotal + 80,
    };
  };
  return [
    mk(0, "Pending", [{ id: "big-bang-brownie", name: "Big Bang Brownie", price: 580, qty: 2 }]),
    mk(0, "Preparing", [{ id: "kitkat-shake", name: "KitKat Shake", price: 520, qty: 1 }, { id: "iced-latte", name: "Iced Latte", price: 380, qty: 1 }]),
    mk(1, "Completed", [{ id: "the-feast-shake", name: "The Feast Shake", price: 680, qty: 1 }]),
    mk(2, "Completed", [{ id: "hazelnut-chocolate", name: "Hazelnut Chocolate", price: 620, qty: 2 }]),
    mk(3, "Completed", [{ id: "mint-margarita", name: "Mint Margarita", price: 280, qty: 3 }]),
    mk(4, "Cancelled", [{ id: "banana-smoothie", name: "Banana Smoothie", price: 420, qty: 1 }]),
    mk(5, "Completed", [{ id: "big-bang-brownie", name: "Big Bang Brownie", price: 580, qty: 1 }, { id: "strawberry-shake", name: "Strawberry Shake", price: 400, qty: 1 }]),
    mk(6, "Completed", [{ id: "chocolate-oreo", name: "Chocolate Oreo", price: 540, qty: 2 }]),
    mk(7, "Completed", [{ id: "big-bang-brownie", name: "Big Bang Brownie", price: 580, qty: 1 }]),
    mk(9, "Completed", [{ id: "iced-latte", name: "Iced Latte", price: 380, qty: 2 }]),
  ];
}

function seedCoupons(): Coupon[] {
  const inDays = (d: number) => new Date(Date.now() + d * 86400000).toISOString();
  return [
    { id: uid(), code: "WELCOME10", type: "percent", value: 10, expiresAt: inDays(30), active: true },
    { id: uid(), code: "FLAT100", type: "fixed", value: 100, expiresAt: inDays(15), active: true },
  ];
}

function seedSettings(): SiteSettings {
  return {
    brandName: "Shake N Flex",
    tagline: "Drink & Relax",
    about: "Fresh juices, thick shakes and specialty coffee blended fresh every day in Nazimabad, Karachi.",
    phone: "+92 316 6521118",
    whatsapp: "923166521118",
    email: "hello@shakenflex.pk",
    address: "Adjacent to Bina Beauty Parlour, Block 4, Nazimabad No. 4, Karachi 74600",
    hours: "4:00 PM – 1:30 AM (Daily)",
    deliveryFee: 80,
    social: { instagram: "https://instagram.com/shakenflex", facebook: "https://facebook.com/shakenflex" },
    gallery: [],
  };
}

function seedAdmin(): AdminUser {
  return { id: uid(), name: "Shake N Flex Admin", email: "admin@shakenflex.pk", password: "admin123" };
}

function seed(): AppState {
  return {
    menu: seedMenu(),
    categories: seedCategories(),
    orders: seedOrders(),
    reviews: seedReviews(),
    coupons: seedCoupons(),
    settings: seedSettings(),
    admin: seedAdmin(),
  };
}

function load(): AppState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
}

let state: AppState = typeof window === "undefined" ? seed() : load() ?? seed();

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

// cross-tab sync
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY && e.newValue) {
      try {
        state = JSON.parse(e.newValue);
        emit();
      } catch {}
    }
  });
}

export function getState(): AppState {
  return state;
}

export function setState(updater: (s: AppState) => AppState) {
  state = updater(state);
  persist();
  emit();
}

function shallowEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!Object.is(a[i], b[i])) return false;
    return true;
  }
  const ak = Object.keys(a as Record<string, unknown>);
  const bk = Object.keys(b as Record<string, unknown>);
  if (ak.length !== bk.length) return false;
  for (const k of ak) {
    if (!Object.is((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) return false;
  }
  return true;
}

export function useAppState<T>(selector: (s: AppState) => T): T {
  const cacheRef = useRef<{ state: AppState; value: T } | null>(null);
  const getSnapshot = () => {
    const cache = cacheRef.current;
    if (cache && cache.state === state) return cache.value;
    const next = selector(state);
    if (cache && shallowEqual(cache.value, next)) {
      cacheRef.current = { state, value: cache.value };
      return cache.value;
    }
    cacheRef.current = { state, value: next };
    return next;
  };
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function resetStore() {
  state = seed();
  persist();
  emit();
}

export function newId() {
  return uid();
}