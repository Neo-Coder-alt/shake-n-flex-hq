import { getState, newId, setState, useAppState } from "./store";
import type { Category } from "./types";

export function useCategories() {
  return useAppState((s) => s.categories);
}

export function listCategories() {
  return getState().categories;
}

export function addCategory(name: string) {
  const cat: Category = {
    id: newId(),
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
  };
  setState((s) => ({ ...s, categories: [...s.categories, cat] }));
}

export function updateCategory(id: string, name: string) {
  setState((s) => ({
    ...s,
    categories: s.categories.map((c) =>
      c.id === id
        ? { ...c, name, slug: name.toLowerCase().replace(/\s+/g, "-") }
        : c,
    ),
  }));
}

export function deleteCategory(id: string) {
  setState((s) => ({ ...s, categories: s.categories.filter((c) => c.id !== id) }));
}