import type { Metadata } from "next";
import { isDemoMode } from "@/lib/demo-mode";
import { mockConfiguracionGeneral } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ConfiguracionGeneralForm } from "@/components/configuracion/configuracion-general-form";
import { ConfiguracionSummary } from "@/components/configuracion/configuracion-summary";

export const metadata: Metadata = {
  title: "Configuración | Funes Exclusivos",
};

export const dynamic = "force-dynamic";

type ConfiguracionGeneral = {
  id: boolean;
  empresa_nombre: string | null;
  empresa_razon_social: string | null;
  empresa_cuit: string | null;
  empresa_direccion: string | null;
  empresa_telefono: string | null;
  empresa_email: string | null;
  empresa_website: string | null;
  moneda_principal: string | null;
  moneda_secundaria: string | null;
  porcentaje_comision_default: number | null;
  dias_alerta_gestoria: number | null;
  dias_alerta_leads: number | null;
  whatsapp_alertas_activas: boolean | null;
  catalogo_auto_publicar_stock: boolean | null;
};

const defaultConfig: ConfiguracionGeneral = {
  id: true,
  empresa_nombre: null,
  empresa_razon_social: null,
  empresa_cuit: null,
  empresa_direccion: null,
  empresa_telefono: null,
  empresa_email: null,
  empresa_website: null,
  moneda_principal: "USD",
  moneda_secundaria: "ARS",
  porcentaje_comision_default: 0,
  dias_alerta_gestoria: 0,
  dias_alerta_leads: 0,
  whatsapp_alertas_activas: false,
  catalogo_auto_publicar_stock: false,
};

export default async function ConfiguracionPage() {
  let config: ConfiguracionGeneral = isDemoMode
    ? (mockConfiguracionGeneral as ConfiguracionGeneral)
    : defaultConfig;

  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("configuracion_general")
      .select(
        "id,empresa_nombre,empresa_razon_social,empresa_cuit,empresa_direccion,empresa_telefono,empresa_email,empresa_website,moneda_principal,moneda_secundaria,porcentaje_comision_default,dias_alerta_gestoria,dias_alerta_leads,whatsapp_alertas_activas,catalogo_auto_publicar_stock"
      )
      .eq("id", true)
      .maybeSingle<ConfiguracionGeneral>();

    config = data ?? defaultConfig;
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">Configuración</h1>
        <p className="max-w-2xl text-sm leading-6 text-[#6B7280]">
          Datos de empresa y parámetros operativos del sistema.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <ConfiguracionGeneralForm config={config} />
        <ConfiguracionSummary config={config} />
      </div>
    </section>
  );
}
