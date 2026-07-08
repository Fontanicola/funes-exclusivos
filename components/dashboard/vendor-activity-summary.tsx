import Link from "next/link";
import { DashboardChartCard } from "@/components/dashboard/dashboard-chart-card";
import { SimpleBarChart } from "@/components/dashboard/simple-bar-chart";
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
  const chartItems = vendors.slice(0, 5).map((vendor) => ({
    label: vendor.nombre,
    value: vendor.ventasMes,
    tone: "emerald" as const,
    helper: `${vendor.leadsActivos} leads · ${vendor.conversacionesActivas} chats`,
  }));

  return (
    <DashboardChartCard
      title="Actividad por vendedor"
      description="Seguimiento comercial, conversiones y carga operativa."
      action={
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/crm" className="text-[#6B7280] underline-offset-4 hover:text-[#111827] hover:underline">
            CRM
          </Link>
          <Link href="/comisiones" className="text-[#6B7280] underline-offset-4 hover:text-[#111827] hover:underline">
            Comisiones
          </Link>
        </div>
      }
    >
      {vendors.length ? (
        <div className="space-y-5">
          <SimpleBarChart
            items={chartItems}
            emptyLabel="Sin actividad registrada."
            compact
            formatValue={(value) => `${value} ventas`}
          />

          <div className="overflow-hidden rounded-[28px] border border-[#E5E7EB]">
            <div className="grid grid-cols-[minmax(0,1.3fr)_repeat(5,minmax(0,1fr))] border-b border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
              <span>Vendedor</span>
              <span>Leads</span>
              <span>Ventas</span>
              <span>Chats</span>
              <span>Atención</span>
              <span>Comisiones</span>
            </div>
            <div className="divide-y divide-[#E5E7EB]">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="grid grid-cols-[minmax(0,1.3fr)_repeat(5,minmax(0,1fr))] items-center gap-3 px-4 py-4 text-sm">
                  <div>
                    <p className="font-medium text-[#111827]">{vendor.nombre}</p>
                    <p className="text-xs text-[#6B7280]">{vendor.rol}</p>
                  </div>
                  <StatCell value={vendor.leadsActivos} />
                  <StatCell value={vendor.ventasMes} tone="emerald" />
                  <StatCell value={vendor.conversacionesActivas} />
                  <StatCell value={vendor.conversacionesAtencion} tone="rose" />
                  <div className="text-[#111827]">
                    <p className="font-medium">{formatCurrencyByCurrency(vendor.comisionesGeneradas)}</p>
                    <p className="text-xs text-[#6B7280]">{vendor.leadsSeguimiento} seguimientos</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-5 py-8 text-sm text-[#6B7280]">
          No hay actividad de vendedores para mostrar.
        </div>
      )}
    </DashboardChartCard>
  );
}

function StatCell({ value, tone = "default" }: { value: number; tone?: "default" | "emerald" | "rose" }) {
  const toneClass =
    tone === "emerald"
      ? "text-emerald-700"
      : tone === "rose"
        ? "text-rose-700"
        : "text-[#111827]";

  return <span className={["font-medium", toneClass].join(" ")}>{value}</span>;
}
