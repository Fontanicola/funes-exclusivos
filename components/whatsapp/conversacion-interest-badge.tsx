type ConversacionInterest =
  | "alto"
  | "medio"
  | "bajo"
  | "sin_interes"
  | "no_detectado"
  | string
  | null
  | undefined;

export function ConversacionInterestBadge({ interest }: { interest: ConversacionInterest }) {
  const normalized = (interest ?? "").toLowerCase();

  const labels: Record<string, string> = {
    alto: "Alto",
    medio: "Medio",
    bajo: "Bajo",
    sin_interes: "Sin interés",
    no_detectado: "No detectado",
  };

  const styles: Record<string, string> = {
    alto: "border-[#E5E7EB] bg-[#F0FDF4] text-[#166534]",
    medio: "border-[#E5E7EB] bg-[#F9FAFB] text-[#111827]",
    bajo: "border-[#E5E7EB] bg-[#FAFAFA] text-[#6B7280]",
    sin_interes: "border-[#E5E7EB] bg-[#FAFAFA] text-[#6B7280]",
    no_detectado: "border-[#E5E7EB] bg-[#F3F4F6] text-[#111827]",
  };

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        styles[normalized] ?? styles.no_detectado,
      ].join(" ")}
    >
      {labels[normalized] ?? "No detectado"}
    </span>
  );
}
