import Link from "next/link";

function normalizeWhatsapp(value: string | null | undefined) {
  return (value ?? "").replace(/[+\s()-]/g, "");
}

export function CatalogoEmptyState({
  title,
  description,
  whatsappContacto,
}: {
  title: string;
  description: string;
  whatsappContacto?: string | null;
}) {
  const phone = normalizeWhatsapp(whatsappContacto);
  const whatsappHref = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(
        "Hola, vi el catálogo de Funes Exclusivos y quiero consultar por un vehículo."
      )}`
    : null;

  return (
    <section className="mx-auto max-w-2xl rounded-md border border-[#E5E7EB] bg-white px-6 py-14 text-center sm:px-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-md border border-[#E5E7EB] bg-[linear-gradient(180deg,#FFFFFF_0%,#F9FAFB_100%)]">
        <img src="/logo-funes.svg" alt="Funes Exclusivos" className="h-9 w-9 object-contain" />
      </div>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-[#111827]">{title}</h1>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#6B7280]">{description}</p>

      <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-[#6B7280]">
        <span className="rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-3 py-1">Autos seleccionados</span>
        <span className="rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-3 py-1">Atención personalizada</span>
      </div>

      {whatsappHref ? (
        <div className="mt-6">
          <Link
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#8A1538] px-5 text-sm font-medium text-white transition hover:bg-[#6F102D]"
          >
            Consultar por WhatsApp
          </Link>
        </div>
      ) : null}
    </section>
  );
}
