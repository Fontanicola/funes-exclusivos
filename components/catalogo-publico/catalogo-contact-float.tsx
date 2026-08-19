"use client";

import { MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Contact = {
  id: string;
  nombre: string;
  telefono: string;
  avatar_url?: string | null;
};

function normalizeWhatsapp(value: string) {
  return value.replace(/[+\s()-]/g, "");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function CatalogoContactFloat({ contacts }: { contacts: Contact[] }) {
  const [open, setOpen] = useState(false);
  const availableContacts = contacts.filter((contact) => normalizeWhatsapp(contact.telefono));

  if (!availableContacts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 sm:bottom-7 sm:right-7">
      {open ? (
        <div className="absolute bottom-16 right-0 w-[min(19rem,calc(100vw-2rem))] overflow-hidden rounded-md border border-[#E5E7EB] bg-white shadow-[0_18px_50px_rgba(17,24,39,0.16)]">
          <div className="flex items-start justify-between gap-3 border-b border-[#E5E7EB] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[#111827]">¿Con quién querés hablar?</p>
              <p className="mt-1 text-xs text-[#6B7280]">Elegí un vendedor y escribile por WhatsApp.</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar contactos"
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#6B7280] transition hover:bg-[#F9FAFB] hover:text-[#111827]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-1 p-2">
            {availableContacts.map((contact) => {
              const phone = normalizeWhatsapp(contact.telefono);
              const href = `https://wa.me/${phone}?text=${encodeURIComponent(
                "Hola, vi el catálogo de Funes Exclusivos y quiero consultar por un vehículo."
              )}`;

              return (
                <Link
                  key={contact.id}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 transition hover:bg-[#F9FAFB]"
                >
                  {contact.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={contact.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3E1E7] text-xs font-semibold text-[#8A1538]">
                      {getInitials(contact.nombre)}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-[#111827]">{contact.nombre}</span>
                    <span className="block text-xs text-[#6B7280]">WhatsApp</span>
                  </span>
                  <MessageCircle className="h-4 w-4 shrink-0 text-[#8A1538]" />
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#8A1538] text-white shadow-[0_10px_28px_rgba(138,21,56,0.28)] transition hover:bg-[#6F102D]"
        aria-label={open ? "Cerrar contactos" : "Contactar a un vendedor"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
