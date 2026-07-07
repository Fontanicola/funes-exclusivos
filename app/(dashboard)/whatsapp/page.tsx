import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { isDemoMode } from "@/lib/demo-mode";
import { mockConversaciones, mockWhatsappInstancias } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ConversacionesTable } from "@/components/whatsapp/conversaciones-table";
import { WhatsappConnectionAlert } from "@/components/whatsapp/whatsapp-connection-alert";
import { WhatsappInstancesGrid } from "@/components/whatsapp/whatsapp-instances-grid";

export const metadata: Metadata = {
  title: "WhatsApp | Funes Exclusivos",
};

export const dynamic = "force-dynamic";

type Instance = {
  id: string;
  empleado_id: string | null;
  provider: string | null;
  instance_name: string | null;
  estado: string | null;
  telefono_conectado: string | null;
  nombre_perfil: string | null;
  qr_code: string | null;
  qr_expires_at: string | null;
  last_connection_at: string | null;
  last_disconnection_at: string | null;
  last_sync_at: string | null;
  last_error: string | null;
  activo: boolean | null;
  created_at: string | null;
  empleado: {
    id: string;
    nombre: string | null;
    email: string | null;
    rol: string | null;
  } | null;
};

type Conversation = {
  id: string;
  whatsapp_instancia_id: string | null;
  lead_id: string | null;
  vendedor_id: string | null;
  vehiculo_interes_id: string | null;
  canal: string | null;
  estado: string | null;
  contacto_nombre: string | null;
  contacto_telefono: string | null;
  contacto_numero_normalizado: string | null;
  contacto_email: string | null;
  ultimo_mensaje_at: string | null;
  last_message_preview: string | null;
  mensajes_count: number | null;
  unread_count: number | null;
  resumen_ia: string | null;
  interes_compra: string | null;
  intencion_detectada: string | null;
  proxima_accion_sugerida: string | null;
  requiere_atencion: boolean | null;
  created_at: string | null;
  instancia: {
    id: string;
    instance_name: string | null;
    estado: string | null;
    telefono_conectado: string | null;
  } | null;
  lead: {
    id: string;
    nombre: string | null;
    telefono: string | null;
    email: string | null;
    estado: string | null;
    origen: string | null;
  } | null;
  vendedor: {
    id: string;
    nombre: string | null;
    email: string | null;
    rol: string | null;
  } | null;
  vehiculo: {
    id: string;
    marca: string | null;
    modelo: string | null;
    version: string | null;
    anio: number | null;
    dominio: string | null;
  } | null;
};

type RawInstance = Omit<Instance, "empleado"> & {
  empleado: Instance["empleado"] | Instance["empleado"][] | null;
};

type RawConversation = Omit<Conversation, "instancia" | "lead" | "vendedor" | "vehiculo"> & {
  instancia: Conversation["instancia"] | Conversation["instancia"][] | null;
  lead: Conversation["lead"] | Conversation["lead"][] | null;
  vendedor: Conversation["vendedor"] | Conversation["vendedor"][] | null;
  vehiculo: Conversation["vehiculo"] | Conversation["vehiculo"][] | null;
};

function normalizeSingleRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function formatCurrencyLabel(value: number | null, currency: string | null) {
  if (value == null) return "—";
  const isoCurrency = (currency ?? "").toLowerCase() === "usd" ? "USD" : "ARS";
  const symbol = isoCurrency === "USD" ? "US$" : "$";
  const formatted = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: isoCurrency,
    maximumFractionDigits: 0,
  }).format(value);

  return formatted.replace("US$", symbol).replace("$", symbol);
}

function KpiCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-[#6B7280]">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-[#111827]">{value}</p>
      {detail ? <p className="mt-2 text-xs text-[#6B7280]">{detail}</p> : null}
    </article>
  );
}

function getConnectedCount(instances: Instance[]) {
  return instances.filter((instance) => instance.estado === "conectado").length;
}

function getOpenConversationCount(conversations: Conversation[]) {
  return conversations.filter((conversation) => ["abierta", "en_seguimiento"].includes(conversation.estado ?? "")).length;
}

function getAttentionCount(conversations: Conversation[]) {
  return conversations.filter((conversation) => conversation.requiere_atencion).length;
}

function getHighInterestCount(conversations: Conversation[]) {
  return conversations.filter((conversation) => (conversation.interes_compra ?? "").toLowerCase() === "alto").length;
}

export default async function WhatsappPage() {
  let instancias: Instance[] = mockWhatsappInstancias as Instance[];
  let conversaciones: Conversation[] = mockConversaciones as Conversation[];

  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();

    const [instancesResult, conversationsResult] = await Promise.all([
      supabase
        .from("whatsapp_instancias")
        .select(
          "id,empleado_id,provider,instance_name,estado,telefono_conectado,nombre_perfil,qr_code,qr_expires_at,last_connection_at,last_disconnection_at,last_sync_at,last_error,activo,created_at,empleado:empleados!whatsapp_instancias_empleado_id_fkey(id,nombre,email,rol)"
        )
        .eq("activo", true)
        .order("created_at", { ascending: true }),
      supabase
        .from("conversaciones")
        .select(
          "id,whatsapp_instancia_id,lead_id,vendedor_id,vehiculo_interes_id,canal,estado,contacto_nombre,contacto_telefono,contacto_numero_normalizado,contacto_email,ultimo_mensaje_at,last_message_preview,mensajes_count,unread_count,resumen_ia,interes_compra,intencion_detectada,proxima_accion_sugerida,requiere_atencion,created_at,instancia:whatsapp_instancias!conversaciones_whatsapp_instancia_id_fkey(id,instance_name,estado,telefono_conectado),lead:leads!conversaciones_lead_id_fkey(id,nombre,telefono,email,estado,origen),vendedor:empleados!conversaciones_vendedor_id_fkey(id,nombre,email,rol),vehiculo:vehiculos!conversaciones_vehiculo_interes_id_fkey(id,marca,modelo,version,anio,dominio)"
        )
        .order("ultimo_mensaje_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false }),
    ]);

    instancias = ((instancesResult.data ?? []) as unknown as RawInstance[]).map((instance) => ({
      ...instance,
      empleado: normalizeSingleRelation(instance.empleado),
    }));

    conversaciones = ((conversationsResult.data ?? []) as unknown as RawConversation[]).map((conversation) => ({
      ...conversation,
      instancia: normalizeSingleRelation(conversation.instancia),
      lead: normalizeSingleRelation(conversation.lead),
      vendedor: normalizeSingleRelation(conversation.vendedor),
      vehiculo: normalizeSingleRelation(conversation.vehiculo),
    }));
  }

  const problematicInstances = instancias.filter((instance) =>
    ["desconectado", "error", "qr_pendiente"].includes((instance.estado ?? "").toLowerCase())
  );

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">
              WhatsApp
            </h1>
            <p className="text-sm leading-6 text-[#6B7280]">
              Instancias conectadas, conversaciones y seguimiento comercial
            </p>
          </div>

          <Link
            href="/whatsapp/conexiones"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#18181B] px-4 text-sm font-medium text-white transition hover:bg-[#27272A]"
          >
            <Plus className="h-4 w-4" />
            Conexiones
          </Link>
        </div>
        {isDemoMode ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
            Modo demo: la bandeja de WhatsApp es mock y no se consultará Evolution API.
          </div>
        ) : null}
      </header>

      <WhatsappConnectionAlert instancias={problematicInstances} />

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Instancias conectadas" value={getConnectedCount(instancias)} />
        <KpiCard label="Conversaciones abiertas" value={getOpenConversationCount(conversaciones)} />
        <KpiCard label="Requieren atención" value={getAttentionCount(conversaciones)} />
        <KpiCard label="Interés alto" value={getHighInterestCount(conversaciones)} />
      </div>

      <WhatsappInstancesGrid instancias={instancias} />
      <ConversacionesTable conversaciones={conversaciones} />
    </section>
  );
}
