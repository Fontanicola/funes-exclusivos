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
    <section className="mx-auto max-w-2xl rounded-3xl border border-[#E5E7EB] bg-white px-6 py-14 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB]">
        <img src="/logo-funes.svg" alt="Funes Exclusivos" className="h-8 w-8 object-contain" />
      </div>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#111827]">{title}</h1>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#6B7280]">{description}</p>

      {whatsappHref ? (
        <div className="mt-6">
          <Link
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#18181B] px-5 text-sm font-medium text-white transition hover:bg-[#27272A]"
          >
            Consultar por WhatsApp
          </Link>
        </div>
      ) : null}
    </section>
  );
}
