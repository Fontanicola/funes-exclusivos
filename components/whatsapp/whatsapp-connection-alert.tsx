import Link from "next/link";

type Instance = {
  id: string;
  estado: string | null;
  empleado: {
    nombre: string | null;
    email: string | null;
  } | null;
};

function getEmployeeName(instance: Instance) {
  return instance.empleado?.nombre ?? instance.empleado?.email ?? "el vendedor";
}

export function WhatsappConnectionAlert({ instancias }: { instancias: Instance[] }) {
  const problematic = instancias.filter((instance) =>
    ["desconectado", "error", "qr_pendiente"].includes((instance.estado ?? "").toLowerCase())
  );

  if (!problematic.length) return null;

  const message =
    problematic.length === 1
      ? `WhatsApp de ${getEmployeeName(problematic[0])} requiere reconexión.`
      : `${problematic.length} conexiones de WhatsApp requieren atención.`;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3 text-sm text-[#111827] md:flex-row md:items-center md:justify-between">
      <p className="leading-6 text-[#6B7280]">{message}</p>
      <Link
        href="/whatsapp/conexiones"
        className="inline-flex h-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
      >
        Gestionar conexiones
      </Link>
    </div>
  );
}
