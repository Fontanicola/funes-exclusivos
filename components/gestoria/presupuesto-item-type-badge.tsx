type PresupuestoItemType =
  | "valor_tabla_dnrpa"
  | "valor_tabla_api"
  | "ceta_factura"
  | "aranceles"
  | "impuesto_sellos"
  | "certificaciones"
  | "formularios"
  | "honorarios"
  | "registro"
  | "patentes"
  | "otro"
  | string
  | null
  | undefined;

const labels: Record<string, string> = {
  valor_tabla_dnrpa: "Tabla DNRPA",
  valor_tabla_api: "Tabla API",
  ceta_factura: "CETA / Factura",
  aranceles: "Aranceles",
  impuesto_sellos: "Impuesto de sellos",
  certificaciones: "Certificaciones",
  formularios: "Formularios",
  honorarios: "Honorarios",
  registro: "Registro",
  patentes: "Patentes",
  otro: "Otro",
};

export function PresupuestoItemTypeBadge({ type }: { type: PresupuestoItemType }) {
  const normalized = (type ?? "").toLowerCase();

  return (
    <span className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-2.5 py-1 text-xs font-medium text-[#111827]">
      {labels[normalized] ?? "Otro"}
    </span>
  );
}

