import { setState, useAppState } from "./store";
import type { SiteSettings } from "./types";

export function useSettings() {
  return useAppState((s) => s.settings);
}

export function updateSettings(patch: Partial<SiteSettings>) {
  setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
}

export function addGalleryImage(dataUrl: string) {
  setState((s) => ({
    ...s,
    settings: { ...s.settings, gallery: [dataUrl, ...s.settings.gallery] },
  }));
}

export function removeGalleryImage(url: string) {
  setState((s) => ({
    ...s,
    settings: { ...s.settings, gallery: s.settings.gallery.filter((u) => u !== url) },
  }));
}