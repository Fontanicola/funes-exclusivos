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

  const classes: Record<string, string> = {
    whatsapp: "border-emerald-200 bg-emerald-50 text-emerald-800",
    instagram: "border-pink-200 bg-pink-50 text-pink-800",
    facebook: "border-blue-200 bg-blue-50 text-blue-800",
    web: "border-sky-200 bg-sky-50 text-sky-800",
    referido: "border-amber-200 bg-amber-50 text-amber-800",
    presencial: "border-slate-200 bg-slate-50 text-slate-700",
    otro: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${classes[normalized] ?? classes.otro}`}>
      {labels[normalized] ?? "Otro"}
    </span>
  );
}
