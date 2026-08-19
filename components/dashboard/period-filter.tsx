"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Check, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getDateRangeLabel, parseDateRange } from "@/lib/date-range";

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthRange(offset: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  return { from: toDateInputValue(start), to: toDateInputValue(end) };
}

export function PeriodFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const range = parseDateRange({
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(range.from ?? "");
  const [to, setTo] = useState(range.to ?? "");

  useEffect(() => {
    setFrom(range.from ?? "");
    setTo(range.to ?? "");
  }, [range.from, range.to]);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) setOpen(false);
    };
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    window.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      window.removeEventListener("keydown", closeEscape);
    };
  }, [open]);

  const apply = (nextFrom: string, nextTo: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextFrom) params.set("from", nextFrom); else params.delete("from");
    if (nextTo) params.set("to", nextTo); else params.delete("to");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex h-8 items-center gap-2 rounded-md border px-2.5 text-xs font-medium transition ${
          range.from || range.to
            ? "border-[#D8A1B2] bg-[#FDF2F5] text-[#8A1538]"
            : "border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]"
        }`}
        aria-label="Filtrar por período"
        title="Filtrar por período"
      >
        <CalendarDays className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{getDateRangeLabel(range)}</span>
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(92vw,300px)] rounded-md border border-[#E5E7EB] bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.14)]">
          <p className="text-xs font-semibold text-[#111827]">Período</p>
          <div className="mt-2 grid gap-1">
            <button type="button" onClick={() => apply("", "")} className="flex items-center justify-between rounded px-2 py-2 text-left text-xs text-[#374151] hover:bg-[#F9FAFB]">
              Todo el período {!range.from && !range.to ? <Check className="h-3.5 w-3.5 text-[#8A1538]" /> : null}
            </button>
            <button type="button" onClick={() => { const next = monthRange(0); setFrom(next.from); setTo(next.to); apply(next.from, next.to); }} className="rounded px-2 py-2 text-left text-xs text-[#374151] hover:bg-[#F9FAFB]">Mes actual</button>
            <button type="button" onClick={() => { const next = monthRange(-1); setFrom(next.from); setTo(next.to); apply(next.from, next.to); }} className="rounded px-2 py-2 text-left text-xs text-[#374151] hover:bg-[#F9FAFB]">Mes anterior</button>
          </div>
          <div className="mt-3 border-t border-[#E5E7EB] pt-3">
            <p className="text-[11px] font-medium text-[#6B7280]">Rango personalizado</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label className="space-y-1 text-[10px] text-[#6B7280]">Desde<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="h-8 w-full rounded-md border border-[#E5E7EB] px-2 text-xs text-[#111827] outline-none focus:border-[#8A1538]" /></label>
              <label className="space-y-1 text-[10px] text-[#6B7280]">Hasta<input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="h-8 w-full rounded-md border border-[#E5E7EB] px-2 text-xs text-[#111827] outline-none focus:border-[#8A1538]" /></label>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" onClick={() => { setFrom(""); setTo(""); apply("", ""); }} className="inline-flex h-8 items-center gap-1 rounded-md border border-[#E5E7EB] px-2.5 text-xs font-medium text-[#6B7280] hover:bg-[#F9FAFB]"><X className="h-3.5 w-3.5" />Limpiar</button>
              <button type="button" onClick={() => apply(from, to)} className="inline-flex h-8 items-center rounded-md bg-[#8A1538] px-3 text-xs font-medium text-white hover:bg-[#6F102D]">Aplicar</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
