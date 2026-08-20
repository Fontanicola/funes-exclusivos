import { isDemoMode } from "@/lib/demo-mode";
import { mockCatalogoConfig, mockEmpleados } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PublicCatalogConfig = {
  activo: boolean | null;
  titulo: string | null;
  descripcion: string | null;
  whatsapp_contacto: string | null;
  instagram_url: string | null;
};

export type PublicCatalogContact = {
  id: string;
  nombre: string;
  telefono: string;
  avatar_url?: string | null;
};

export async function getPublicCatalogConfig() {
  if (isDemoMode) {
    return {
      config: mockCatalogoConfig as PublicCatalogConfig,
      contacts: mockEmpleados
        .filter((employee) => employee.activo && employee.rol === "vendedor" && employee.telefono)
        .map((employee) => ({ id: employee.id, nombre: employee.nombre, telefono: employee.telefono, avatar_url: employee.avatar_url })),
    };
  }

  const supabase = createSupabaseServerClient();
  const [configResult, contactsResult] = await Promise.all([
    supabase
      .from("catalogo_config")
      .select("activo,titulo,descripcion,whatsapp_contacto,instagram_url")
      .eq("id", true)
      .maybeSingle<PublicCatalogConfig>(),
    supabase
      .from("empleados")
      .select("id,nombre,telefono,avatar_url")
      .eq("activo", true)
      .eq("rol", "vendedor")
      .not("telefono", "is", null)
      .order("nombre", { ascending: true }),
  ]);

  return {
    config: configResult.data ?? (mockCatalogoConfig as PublicCatalogConfig),
    contacts: (contactsResult.data ?? []) as PublicCatalogContact[],
  };
}

export function normalizeWhatsapp(value: string | null | undefined) {
  return (value ?? "").replace(/[+\s()-]/g, "");
}
