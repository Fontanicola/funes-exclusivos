"use client";

import { useState } from "react";
import { WhatsappInstanceCard } from "./whatsapp-instance-card";
import { PaginationControls } from "@/components/common/pagination-controls";

type Instance = Parameters<typeof WhatsappInstanceCard>[0]["instance"];
const PAGE_SIZE = 10;

export function WhatsappInstancesGrid({
  instancias,
  canManageAll = false,
}: {
  instancias: Instance[];
  canManageAll?: boolean;
}) {
  const [page, setPage] = useState(1);

  if (!instancias.length) {
    return (
      <section className="rounded-md border border-[#E5E7EB] bg-white p-4">
        <div className="rounded-md border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-6 text-sm text-[#6B7280]">
          No hay instancias de WhatsApp para mostrar.
        </div>
      </section>
    );
  }

  const totalPages = Math.max(1, Math.ceil(instancias.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleInstances = instancias.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <section className="space-y-3">
      <div className="grid gap-4 lg:grid-cols-2">
        {visibleInstances.map((instance) => (
          <WhatsappInstanceCard key={instance.id} instance={instance} canManageAll={canManageAll} />
        ))}
      </div>
      <PaginationControls
        page={currentPage}
        totalItems={instancias.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </section>
  );
}
