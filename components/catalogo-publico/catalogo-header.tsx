import Link from "next/link";

function normalizeWhatsapp(value: string | null | undefined) {
  return (value ?? "").replace(/[+\s()-]/g, "");
}

export function CatalogoHeader({
  title,
  description,
  vehicleCount,
  whatsappContacto,
  instagramUrl,
}: {
  title: string | null;
  description: string | null;
  vehicleCount: number;
  whatsappContacto: string | null;
  instagramUrl: string | null;
}) {
  const phone = normalizeWhatsapp(whatsappContacto);
  const whatsappHref = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(
        "Hola, vi el catálogo de Funes Exclusivos y quiero consultar por un vehículo."
      )}`
    : null;

  return (
    <header className="overflow-hidden rounded-md border border-[#E5E7EB] bg-white">
      <div className="bg-[radial-gradient(circle_at_top_left,_rgba(17,24,39,0.04),_transparent_34%),linear-gradient(180deg,#FFFFFF_0%,#F9FAFB_100%)] px-6 py-8 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-md border border-[#E5E7EB] bg-white">
                <img src="/logo-funes.svg" alt="Funes Exclusivos" className="h-9 w-9 object-contain" />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6B7280]">Funes Exclusivos</p>
                <h1 className="text-3xl font-semibold tracking-tight text-[#111827] sm:text-4xl">
                  {title ?? "Vehículos seleccionados"}
                </h1>
              </div>
            </div>

            <p className="max-w-2xl text-sm leading-6 text-[#6B7280] sm:text-base">
              {description ?? "Selección premium sincronizada con el inventario."}
            </p>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-medium text-[#111827]">
                Autos seleccionados
              </span>
              <span className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-medium text-[#111827]">
                Atención personalizada
              </span>
              <span className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-medium text-[#111827]">
                Stock actualizado
              </span>
              <span className="rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-3 py-1 text-xs font-medium text-[#6B7280]">
                {vehicleCount} vehículo{vehicleCount === 1 ? "" : "s"} disponible{vehicleCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <div className="w-full max-w-sm rounded-md border border-[#E5E7EB] bg-white p-4">
            <div className="space-y-3">
              {whatsappHref ? (
                <Link
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#8A1538] px-5 text-sm font-medium text-white transition hover:bg-[#6F102D]"
                >
                  Consultar por WhatsApp
                </Link>
              ) : null}
              {instagramUrl ? (
                <Link
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[#E5E7EB] bg-white px-5 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
                >
                  Instagram
                </Link>
              ) : null}
            </div>
            <p className="mt-3 text-xs leading-5 text-[#6B7280]">
              Consultá disponibilidad, precios y opciones de forma directa con el equipo.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
