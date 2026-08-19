import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const CATALOGO_BUCKET = "vehiculos";
export const CATALOGO_HERO_PATH = "catalogo/hero.jpg";

export async function getCatalogoHeroUrl(supabase: SupabaseClient) {
  // La lectura del listado tambien puede estar restringida por Storage RLS.
  // Preferimos el cliente admin en server y conservamos fallback para entornos
  // locales donde todavia no se haya configurado la service role.
  let storage = supabase.storage;
  try {
    storage = createSupabaseAdminClient().storage;
  } catch {
    // El fallback permite que el catalogo siga funcionando sin esta variable.
  }

  const { data, error } = await storage.from(CATALOGO_BUCKET).list("catalogo", {
    search: "hero.jpg",
    limit: 10,
  });

  if (error || !data?.some((file) => file.name === "hero.jpg")) {
    return null;
  }

  return storage.from(CATALOGO_BUCKET).getPublicUrl(CATALOGO_HERO_PATH).data.publicUrl;
}
