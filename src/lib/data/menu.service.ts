import { getState, newId, setState, useAppState } from "./store";
import type { MenuItem } from "./types";

export function listMenu() {
  return getState().menu;
}

export function useMenu() {
  return useAppState((s) => s.menu);
}

export function useAvailableMenu() {
  return useAppState((s) => s.menu.filter((m) => m.available && !m.outOfStock));
}

export function useFeaturedMenu() {
  return useAppState((s) =>
    s.menu.filter((m) => m.featured && m.available && !m.outOfStock),
  );
}

export function getMenuItem(id: string) {
  return getState().menu.find((m) => m.id === id);
}

export function upsertMenuItem(input: Partial<MenuItem> & { id?: string }) {
  setState((s) => {
    const idx = input.id ? s.menu.findIndex((m) => m.id === input.id) : -1;
    if (idx >= 0) {
      const next = [...s.menu];
      next[idx] = { ...next[idx], ...input } as MenuItem;
      return { ...s, menu: next };
    }
    const item: MenuItem = {
      id: input.id ?? newId(),
      name: input.name ?? "New Item",
      description: input.description ?? "",
      price: input.price ?? 0,
      category: input.category ?? "Signature Shakes",
      image: input.image,
      sizes: input.sizes ?? [{ id: "reg", name: "Regular", priceDelta: 0 }],
      toppings: input.toppings ?? [],
      featured: input.featured ?? false,
      available: input.available ?? true,
      outOfStock: input.outOfStock ?? false,
      createdAt: new Date().toISOString(),
    };
    return { ...s, menu: [item, ...s.menu] };
  });
}

export function deleteMenuItem(id: string) {
  setState((s) => ({ ...s, menu: s.menu.filter((m) => m.id !== id) }));
}

export function toggleFeatured(id: string) {
  setState((s) => ({
    ...s,
    menu: s.menu.map((m) => (m.id === id ? { ...m, featured: !m.featured } : m)),
  }));
}

export function toggleAvailable(id: string) {
  setState((s) => ({
    ...s,
    menu: s.menu.map((m) => (m.id === id ? { ...m, available: !m.available } : m)),
  }));
}

export function toggleOutOfStock(id: string) {
  setState((s) => ({
    ...s,
    menu: s.menu.map((m) => (m.id === id ? { ...m, outOfStock: !m.outOfStock } : m)),
  }));
}