import { supabase } from "@/integrations/supabase/client";
import { getState, reloadTable, useAppState } from "./store";
import type { Database } from "@/integrations/supabase/types";
import type { SiteSettings } from "./types";

type SettingsInsert = Database["public"]["Tables"]["website_settings"]["Insert"];

export function useSettings() {
  return useAppState((s) => s.settings);
}

export async function updateSettings(patch: Partial<SiteSettings>) {
  const next: SiteSettings = { ...getState().settings, ...patch };
  const row: SettingsInsert = {
    id: "global",
    data: next as unknown as SettingsInsert["data"],
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("website_settings").upsert(row, { onConflict: "id" });
  if (error) console.error("[settings] update", error);
  await reloadTable("website_settings");
}

export async function addGalleryImage(url: string) {
  await updateSettings({ gallery: [url, ...getState().settings.gallery] });
}

export async function removeGalleryImage(url: string) {
  await updateSettings({ gallery: getState().settings.gallery.filter((u) => u !== url) });
}