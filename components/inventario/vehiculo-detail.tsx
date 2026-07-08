import type { ReactNode } from "react";
import Link from "next/link";
import { CalendarDays, Camera, Gauge, MapPin, ShieldCheck, Tag, Wrench } from "lucide-react";
import { VehiculoStatusBadge } from "./vehiculo-status-badge";

type Vehiculo = {
  id: string;
  marca: string | null;
  modelo: string | null;
  version: string | null;
  anio: number | null;
  color: string | null;
  km: number | null;
  dominio: string | null;
  motor: string | null;
  ubicacion: string | null;
  nro_operacion: string | null;
  proveedor_id: string | null;
  fecha_compra: string | null;
  costo_adquisicion: number | null;
  costo_moneda: string | null;
  precio_venta: number | null;
  precio_moneda: string | null;
  precio_infoauto_compra: number | null;
  precio_infoauto_actual: number | null;
  precio_infoauto_anterior: number | null;
  precio_permuta: number | null;
  precio_contado: number | null;
  costo_reposicion: number | null;
  estado: string | null;
  estado_preparacion: string | null;
  chapero: string | null;
  preparacion_comentarios: string | null;
  publicado_mercadolibre: boolean | null;
  publicado_rodados_google: boolean | null;
  fotos: string[] | string | null;
  fecha_ingreso: string | null;
  descripcion: string | null;
  observaciones: string | null;
  proveedor?: {
    id: string;
    nombre: string | null;
    categoria: string | null;
  } | null;
};

function formatCurrency(value: number | null, currency: string | null) {
  if (value == null) return "—";
  const resolved = (currency ?? "").toLowerCase() === "usd" ? "USD" : "ARS";
  const symbol = resolved === "USD" ? "US$" : "$";
  return `${symbol} ${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(value)}`;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat("es-AR").format(parsed);
}

function getPhotoUrl(fotos: Vehiculo["fotos"]) {
  if (Array.isArray(fotos)) return fotos[0] ?? null;
  if (typeof fotos === "string") {
    try {
      const parsed = JSON.parse(fotos);
      if (Array.isArray(parsed)) return parsed[0] ?? null;
      return fotos;
    } catch {
      return fotos;
    }
  }
  return null;
}

function getVehicleTitle(vehiculo: Vehiculo) {
  return [vehiculo.marca, vehiculo.modelo, vehiculo.version].filter(Boolean).join(" ");
}

export function VehiculoDetail({
  vehiculo,
  canEdit = true,
}: {
  vehiculo: Vehiculo;
  canEdit?: boolean;
}) {
  const photoUrl = getPhotoUrl(vehiculo.fotos);
  const publicationItems = [
    {
      label: "MercadoLibre",
      value: vehiculo.publicado_mercadolibre ? "Publicado" : "No publicado",
      tone: vehiculo.publicado_mercadolibre ? "emerald" : "slate",
    },
    {
      label: "Rodados Google",
      value: vehiculo.publicado_rodados_google ? "Publicado" : "No publicado",
      tone: vehiculo.publicado_rodados_google ? "emerald" : "slate",
    },
  ] as const;

  return (
    <section className="overflow-hidden rounded-[32px] border border-[#E5E7EB] bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="relative min-h-[320px] bg-[#FAFAFA]">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={getVehicleTitle(vehiculo)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[320px] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(17,24,39,0.08),_transparent_36%),linear-gradient(180deg,#FAFAFA,#F9FAFB)]">
              <div className="text-center">
                <Camera className="mx-auto h-10 w-10 text-[#9CA3AF]" />
                <p className="mt-3 text-sm font-medium text-[#111827]">Sin foto principal</p>
                <p className="mt-1 text-sm text-[#6B7280]">El vehículo todavía no tiene imágenes cargadas.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between gap-6 p-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <VehiculoStatusBadge status={vehiculo.estado} />
              <span className="rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-2.5 py-1 text-xs font-medium text-[#6B7280]">
                {vehiculo.estado_preparacion ?? "Sin preparación"}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-[#6B7280]">
                {vehiculo.dominio ?? "Sin dominio"}
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-[#111827]">
                {getVehicleTitle(vehiculo)}
              </h2>
              <p className="text-sm leading-6 text-[#6B7280]">
                {[vehiculo.anio, vehiculo.color].filter(Boolean).join(" · ") || "Ficha técnica interna del vehículo."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <StatCard
                icon={<Gauge className="h-4 w-4" />}
                label="KM"
                value={vehiculo.km != null ? new Intl.NumberFormat("es-AR").format(vehiculo.km) : "—"}
              />
              <StatCard
                icon={<CalendarDays className="h-4 w-4" />}
                label="Fecha compra"
                value={formatDate(vehiculo.fecha_compra)}
              />
              <StatCard
                icon={<MapPin className="h-4 w-4" />}
                label="Ubicación"
                value={vehiculo.ubicacion ?? "—"}
              />
              <StatCard
                icon={<Wrench className="h-4 w-4" />}
                label="Chapero"
                value={vehiculo.chapero ?? "—"}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard label="Precio contado" value={formatCurrency(vehiculo.precio_contado, vehiculo.precio_moneda)} />
            <MetricCard label="Precio permuta" value={formatCurrency(vehiculo.precio_permuta, vehiculo.precio_moneda)} />
            <MetricCard label="Precio venta" value={formatCurrency(vehiculo.precio_venta, vehiculo.precio_moneda)} />
            <MetricCard label="Infoauto actual" value={formatCurrency(vehiculo.precio_infoauto_actual, vehiculo.precio_moneda)} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {publicationItems.map((item) => (
              <div key={item.label} className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
                  {item.label}
                </p>
                <p className={["mt-2 text-sm font-medium", item.tone === "emerald" ? "text-emerald-700" : "text-[#111827]"].join(" ")}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoCard
              label="Proveedor"
              value={vehiculo.proveedor?.nombre ?? vehiculo.proveedor_id ?? "Sin proveedor"}
              detail={vehiculo.proveedor?.categoria ?? "Información operativa"}
            />
            <InfoCard
              label="Operación"
              value={vehiculo.nro_operacion ?? "Sin operación"}
              detail={vehiculo.fecha_ingreso ? `Ingresado ${formatDate(vehiculo.fecha_ingreso)}` : "Sin fecha de ingreso"}
            />
          </div>

          {vehiculo.observaciones || vehiculo.descripcion ? (
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B7280]">Observaciones</p>
              <p className="mt-2 text-sm leading-6 text-[#111827]">
                {vehiculo.descripcion ?? vehiculo.observaciones ?? "Sin observaciones."}
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 text-xs text-[#6B7280]">
            <span className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-2.5 py-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Ficha interna operativa
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-2.5 py-1">
              <Tag className="h-3.5 w-3.5" />
              {vehiculo.costo_moneda ?? "ARS"}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {canEdit ? (
              <Link
                href={`/inventario/${vehiculo.id}/editar`}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-[#18181B] px-4 text-sm font-medium text-white transition hover:bg-[#27272A]"
              >
                Editar vehículo
              </Link>
            ) : (
              <span className="inline-flex h-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 text-sm font-medium text-[#6B7280]">
                Solo lectura
              </span>
            )}
            <Link
              href="/inventario"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
            >
              Volver al inventario
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#6B7280]">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-sm font-medium text-[#111827]">{value}</p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-[#111827]">{value}</p>
    </div>
  );
}

function InfoCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-[#111827]">{value}</p>
      <p className="mt-1 text-xs text-[#6B7280]">{detail}</p>
    </div>
  );
}
