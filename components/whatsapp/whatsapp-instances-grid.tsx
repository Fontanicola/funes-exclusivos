import { WhatsappInstanceCard } from "./whatsapp-instance-card";

type Instance = Parameters<typeof WhatsappInstanceCard>[0]["instance"];

export function WhatsappInstancesGrid({
  instancias,
  canManageAll = false,
}: {
  instancias: Instance[];
  canManageAll?: boolean;
}) {
  if (!instancias.length) {
    return (
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-6 text-sm text-[#6B7280]">
          No hay instancias de WhatsApp para mostrar.
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {instancias.map((instance) => (
        <WhatsappInstanceCard key={instance.id} instance={instance} canManageAll={canManageAll} />
      ))}
    </section>
  );
}
