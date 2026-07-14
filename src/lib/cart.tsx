import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { MenuItem } from "./menu";

export type CartLine = { item: MenuItem; qty: number };

type CartCtx = {
  lines: CartLine[];
  add: (item: MenuItem) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  total: number;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "snf_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines]);

  const value = useMemo<CartCtx>(() => {
    const count = lines.reduce((s, l) => s + l.qty, 0);
    const total = lines.reduce((s, l) => s + l.qty * l.item.price, 0);
    return {
      lines,
      count,
      total,
      add: (item) =>
        setLines((prev) => {
          const idx = prev.findIndex((l) => l.item.id === item.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
            return next;
          }
          return [...prev, { item, qty: 1 }];
        }),
      remove: (id) => setLines((prev) => prev.filter((l) => l.item.id !== id)),
      setQty: (id, qty) =>
        setLines((prev) =>
          qty <= 0
            ? prev.filter((l) => l.item.id !== id)
            : prev.map((l) => (l.item.id === id ? { ...l, qty } : l)),
        ),
      clear: () => setLines([]),
    };
  }, [lines]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
