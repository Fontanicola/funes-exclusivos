import type { SupabaseClient } from "@supabase/supabase-js";

export const CATALOGO_BUCKET = "vehiculos";
export const CATALOGO_HERO_PATH = "catalogo/hero.jpg";

export async function getCatalogoHeroUrl(supabase: SupabaseClient) {
  const { data, error } = await supabase.storage.from(CATALOGO_BUCKET).list("catalogo", {
    search: "hero.jpg",
    limit: 10,
  });

  if (error || !data?.some((file) => file.name === "hero.jpg")) {
    return null;
  }

  return supabase.storage.from(CATALOGO_BUCKET).getPublicUrl(CATALOGO_HERO_PATH).data.publicUrl;
}
