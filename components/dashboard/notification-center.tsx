"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Reminder = { id: string; titulo: string | null; descripcion: string | null; prioridad: string | null; estado: string | null; fecha_vencimiento: string | null; vehiculo_id: string | null; venta_id: string | null };
const hiddenKey = "funes-hidden-alerts";

function relativeDate(value: string | null) { if (!value) return "Sin fecha"; const date = new Date(`${value}T12:00:00`); const days = Math.round((date.getTime() - new Date(new Date().toDateString()).getTime()) / 86400000); if (days === 0) return "Hoy"; if (days === 1) return "Mañana"; if (days === -1) return "Ayer"; return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit" }).format(date); }

export function NotificationCenter() {
  const [items, setItems] = useState<Reminder[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => { try { setHidden(JSON.parse(window.localStorage.getItem(hiddenKey) ?? "[]")); } catch { setHidden([]); } }, []);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.from("recordatorios").select("id,titulo,descripcion,prioridad,estado,fecha_vencimiento,vehiculo_id,venta_id").in("estado", ["pendiente", "pospuesto"]).order("fecha_vencimiento", { ascending: true }).limit(30);
        if (active) setItems((data ?? []) as Reminder[]);
      } catch {
        if (active) setItems([]);
      }
    }
    void load(); const timer = window.setInterval(load, 30000); return () => { active = false; window.clearInterval(timer); };
  }, []);

  const visible = items.filter((item) => !hidden.includes(item.id));
  const unread = visible.length;
  const hide = (id: string) => { const next = [...hidden, id].slice(-100); setHidden(next); window.localStorage.setItem(hiddenKey, JSON.stringify(next)); };
  const hrefFor = (item: Reminder) => item.vehiculo_id ? `/inventario/${item.vehiculo_id}` : item.venta_id ? `/ventas/${item.venta_id}/editar` : "/recordatorios";

  return <div className="relative">
    <button type="button" onClick={() => setOpen((value) => !value)} aria-label={`Alertas${unread ? `, ${unread} pendientes` : ""}`} aria-expanded={open} className="relative inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-[#FDF2F5] hover:text-[#8A1538]"><Bell className="h-4 w-4" />{unread ? <span className="absolute right-0 top-0 flex min-h-4 min-w-4 items-center justify-center rounded-full border border-white bg-[#8A1538] px-1 text-[9px] font-semibold text-white">{unread > 9 ? "9+" : unread}</span> : null}</button>
    {open ? <section className="absolute right-0 top-10 z-50 flex max-h-[min(70vh,520px)] w-[min(380px,calc(100vw-1rem))] flex-col overflow-hidden rounded-md border border-[#E5E7EB] bg-white shadow-xl"><header className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3"><div><h2 className="text-sm font-semibold text-[#111827]">Alertas y notificaciones</h2><p className="mt-0.5 text-xs text-[#6B7280]">{unread} pendientes</p></div>{unread ? <button type="button" onClick={() => visible.forEach((item) => hide(item.id))} className="text-xs font-medium text-[#8A1538] hover:underline">Limpiar</button> : null}</header>{visible.length ? <ul className="min-h-0 flex-1 overflow-y-auto">{visible.map((item) => <li key={item.id} className="border-b border-[#F1F5F9] px-4 py-3 last:border-0"><div className="flex gap-3"><span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${item.prioridad === "critica" || item.prioridad === "alta" ? "bg-[#8A1538]" : "bg-amber-400"}`} /><div className="min-w-0 flex-1"><Link href={hrefFor(item)} onClick={() => { hide(item.id); setOpen(false); }} className="text-sm font-semibold text-[#111827] hover:text-[#8A1538]">{item.titulo ?? "Recordatorio pendiente"}</Link><p className="mt-1 line-clamp-2 text-xs leading-5 text-[#6B7280]">{item.descripcion ?? "Revisá esta tarea pendiente."}</p><span className="mt-2 inline-flex text-[11px] font-medium text-[#8A1538]">{relativeDate(item.fecha_vencimiento)}</span></div><button type="button" onClick={() => hide(item.id)} aria-label="Ocultar alerta" className="h-6 w-6 shrink-0 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-3.5 w-3.5" /></button></div></li>)}</ul> : <div className="px-4 py-10 text-center"><Check className="mx-auto h-5 w-5 text-emerald-600" /><p className="mt-2 text-sm text-[#6B7280]">No tenés alertas pendientes.</p></div>}<footer className="border-t border-[#E5E7EB] px-4 py-2.5 text-right"><Link href="/recordatorios" onClick={() => setOpen(false)} className="text-xs font-medium text-[#8A1538] hover:underline">Ver todos los recordatorios</Link></footer></section> : null}
  </div>;
}
