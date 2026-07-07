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

function ValueRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <p className="text-sm text-[#6B7280]">{label}</p>
      <p className="text-right text-sm font-medium text-[#111827]">{value}</p>
    </div>
  );
}

export function ConfiguracionSummary({ config }: { config: ConfiguracionGeneral }) {
  const empresa = config.empresa_nombre ?? "Sin configurar";
  const monedaPrincipal = config.moneda_principal ?? "—";
  const monedaSecundaria = config.moneda_secundaria ?? "—";
  const comision = config.porcentaje_comision_default ?? 0;
  const alertasGestoria = config.dias_alerta_gestoria ?? 0;
  const alertasLeads = config.dias_alerta_leads ?? 0;

  return (
    <aside className="space-y-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-base font-semibold text-[#111827]">Resumen operativo</h2>
        <p className="mt-1 text-sm text-[#6B7280]">Lectura rápida de la configuración vigente.</p>
      </div>

      <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3">
        <p className="text-xs uppercase tracking-[0.14em] text-[#6B7280]">Empresa</p>
        <p className="mt-1 text-lg font-semibold text-[#111827]">{empresa}</p>
        {config.empresa_razon_social ? (
          <p className="mt-1 text-sm text-[#6B7280]">{config.empresa_razon_social}</p>
        ) : null}
      </div>

      <div>
        <ValueRow label="Moneda principal" value={monedaPrincipal} />
        <ValueRow label="Moneda secundaria" value={monedaSecundaria} />
        <div className="my-1 border-t border-[#E5E7EB]" />
        <ValueRow label="Comisión default" value={`${comision}%`} />
        <ValueRow label="Alerta gestoría" value={`${alertasGestoria} días`} />
        <ValueRow label="Alerta leads" value={`${alertasLeads} días`} />
        <div className="my-1 border-t border-[#E5E7EB]" />
        <ValueRow label="WhatsApp alertas" value={config.whatsapp_alertas_activas ? "Activas" : "Inactivas"} />
        <ValueRow
          label="Auto-publicación catálogo"
          value={config.catalogo_auto_publicar_stock ? "Activa" : "Inactiva"}
        />
      </div>

      <div className="space-y-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-sm text-[#6B7280]">
        <p>La comisión default se usará como sugerencia al generar comisiones.</p>
        <p>Los días de alerta se usarán para vencimientos y próximos contactos.</p>
        <p>La auto-publicación de catálogo queda preparada para una automatización posterior.</p>
      </div>
    </aside>
  );
}
