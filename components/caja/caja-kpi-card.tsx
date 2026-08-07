type Tone = "default" | "positive" | "negative" | "neutral";

const toneClasses: Record<Tone, string> = {
  default: "border-[#E5E7EB] bg-white text-[#111827]",
  positive: "border-[#D1FAE5] bg-[#F0FDF4] text-[#166534]",
  negative: "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]",
  neutral: "border-[#E5E7EB] bg-[#FAFAFA] text-[#111827]",
};

export function CajaKpiCard({
  title,
  value,
  description,
  tone = "default",
}: {
  title: string;
  value: string;
  description?: string;
  tone?: Tone;
}) {
  return (
    <article className={`rounded-md border p-4 ${toneClasses[tone]}`}>
      <p className="text-sm font-medium text-[#6B7280]">{title}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-inherit">{value}</p>
      {description ? <p className="mt-2 text-xs text-[#6B7280]">{description}</p> : null}
    </article>
  );
}
