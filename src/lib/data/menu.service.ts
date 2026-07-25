import { supabase } from "@/integrations/supabase/client";
import { menuToRow } from "./mappers";
import { getState, reloadTable, useAppState } from "./store";
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

export async function upsertMenuItem(input: Partial<MenuItem> & { id?: string }) {
  const row = menuToRow(input);
  const { error } = input.id
    ? await supabase.from("menu").update(row).eq("id", input.id)
    : await supabase.from("menu").insert(row);
  if (error) console.error("[menu] upsert", error);
  await reloadTable("menu");
}

export async function deleteMenuItem(id: string) {
  const { error } = await supabase.from("menu").delete().eq("id", id);
  if (error) console.error("[menu] delete", error);
  await reloadTable("menu");
}

export async function toggleFeatured(id: string) {
  const it = getState().menu.find((m) => m.id === id); if (!it) return;
  const { error } = await supabase.from("menu").update({ featured: !it.featured }).eq("id", id);
  if (error) console.error("[menu] toggleFeatured", error);
  await reloadTable("menu");
}

export async function toggleAvailable(id: string) {
  const it = getState().menu.find((m) => m.id === id); if (!it) return;
  const { error } = await supabase.from("menu").update({ available: !it.available }).eq("id", id);
  if (error) console.error("[menu] toggleAvailable", error);
  await reloadTable("menu");
}

export async function toggleOutOfStock(id: string) {
  const it = getState().menu.find((m) => m.id === id); if (!it) return;
  const { error } = await supabase.from("menu").update({ out_of_stock: !it.outOfStock }).eq("id", id);
  if (error) console.error("[menu] toggleOutOfStock", error);
  await reloadTable("menu");
}