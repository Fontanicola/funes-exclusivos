import Link from "next/link";
import { DashboardChartCard } from "@/components/dashboard/dashboard-chart-card";
import { formatCurrencyByCurrency } from "@/lib/dashboard-metrics";

type VendorActivityItem = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  leadsActivos: number;
  ventasMes: number;
  conversacionesActivas: number;
  conversacionesAtencion: number;
  comisionesGeneradas: {
    ARS: number;
    USD: number;
    other: Record<string, number>;
  };
  leadsSeguimiento: number;
};

export function VendorActivitySummary({ vendors }: { vendors: VendorActivityItem[] }) {
  const visibleVendors = vendors.slice(0, 5);

  return (
    <DashboardChartCard
      title="Actividad vendedores"
      description="Lectura rápida por vendedor, sin competir con el bloque financiero."
      action={
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/crm" className="text-[#8A1538] underline decoration-[#D8A1B2] underline-offset-4 hover:text-[#6F102D]">
            CRM
          </Link>
          <Link href="/comisiones" className="text-[#8A1538] underline decoration-[#D8A1B2] underline-offset-4 hover:text-[#6F102D]">
            Comisiones
          </Link>
        </div>
      }
    >
      {visibleVendors.length ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visibleVendors.map((vendor) => (
              <article key={vendor.id} className="rounded-md border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">{vendor.nombre}</p>
                    <p className="text-xs text-[#6B7280]">{vendor.rol}</p>
                  </div>
                  <p className="text-xs text-[#6B7280]">{vendor.leadsSeguimiento} seguimientos</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <MiniStat label="Leads" value={vendor.leadsActivos} />
                  <MiniStat label="Ventas" value={vendor.ventasMes} />
                  <MiniStat label="Chats" value={vendor.conversacionesActivas} />
                  <MiniStat label="Atención" value={vendor.conversacionesAtencion} tone="rose" />
                </div>
                <div className="mt-4 rounded-md border border-[#E5E7EB] bg-white px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B7280]">Comisiones generadas</p>
                  <p className="mt-1 text-sm font-semibold text-[#111827]">
                    {formatCurrencyByCurrency(vendor.comisionesGeneradas)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-5 py-8 text-sm text-[#6B7280]">
          No hay actividad de vendedores para mostrar.
        </div>
      )}
    </DashboardChartCard>
  );
}

function MiniStat({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: number;
  tone?: "slate" | "rose";
}) {
  const toneClass =
    tone === "rose"
      ? "border-rose-200 bg-rose-50/80 text-rose-900"
      : "border-slate-200 bg-white text-[#111827]";

  return (
    <div className={["rounded-md border px-3 py-2", toneClass].join(" ")}>
      <p className="text-[10px] uppercase tracking-[0.14em] opacity-70">{label}</p>
      <p className="mt-1 text-base font-semibold">{value}</p>
    </div>
  );
}
