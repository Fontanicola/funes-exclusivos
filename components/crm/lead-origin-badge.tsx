type LeadOrigin = "whatsapp" | "instagram" | "facebook" | "web" | "referido" | "presencial" | "otro" | string | null | undefined;

export function LeadOriginBadge({ origin }: { origin: LeadOrigin }) {
  const normalized = (origin ?? "").toLowerCase();

  const labels: Record<string, string> = {
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    facebook: "Facebook",
    web: "Web",
    referido: "Referido",
    presencial: "Presencial",
    otro: "Otro",
  };

  return (
    <span className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-2.5 py-1 text-xs font-medium text-[#111827]">
      {labels[normalized] ?? "Otro"}
    </span>
  );
}
