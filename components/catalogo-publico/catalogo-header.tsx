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
    <header className="rounded-[2rem] border border-[#E5E7EB] bg-white px-6 py-7 shadow-sm sm:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo-funes.svg"
              alt="Funes Exclusivos"
              className="h-12 w-12 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-2 object-contain"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Funes Exclusivos</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#111827]">
                {title ?? "Catálogo online"}
              </h1>
            </div>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-[#6B7280]">
            {description ?? "Selección premium sincronizada con el inventario."}
          </p>
          <p className="text-sm font-medium text-[#111827]">
            {vehicleCount} vehículo{vehicleCount === 1 ? "" : "s"} disponible{vehicleCount === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {whatsappHref ? (
            <Link
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#18181B] px-5 text-sm font-medium text-white transition hover:bg-[#27272A]"
            >
              WhatsApp
            </Link>
          ) : null}
          {instagramUrl ? (
            <Link
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#E5E7EB] bg-white px-5 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
            >
              Instagram
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
