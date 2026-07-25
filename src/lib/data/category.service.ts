import { supabase } from "@/integrations/supabase/client";
import { getState, reloadTable, useAppState } from "./store";

export function useCategories() {
  return useAppState((s) => s.categories);
}

export function listCategories() {
  return getState().categories;
}

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export async function addCategory(name: string) {
  const { error } = await supabase.from("categories").insert({ name, slug: slugify(name) });
  if (error) console.error("[categories] add", error);
  await reloadTable("categories");
}

export async function updateCategory(id: string, name: string) {
  const { error } = await supabase.from("categories").update({ name, slug: slugify(name) }).eq("id", id);
  if (error) console.error("[categories] update", error);
  await reloadTable("categories");
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) console.error("[categories] delete", error);
  await reloadTable("categories");
}