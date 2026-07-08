import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isDemoMode } from "@/lib/demo-mode";
import { mockConversacionMensajes, mockConversaciones } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ConversacionDetail } from "@/components/whatsapp/conversacion-detail";
import { ConversacionMessages } from "@/components/whatsapp/conversacion-messages";
import { ConversacionInterestBadge } from "@/components/whatsapp/conversacion-interest-badge";
import { ConversacionStatusBadge } from "@/components/whatsapp/conversacion-status-badge";

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
  ia_estado: string | null;
  ia_resumen: string | null;
  ia_interes_compra: string | null;
  ia_score: number | null;
  ia_intencion: string | null;
  ia_proximo_paso: string | null;
  ia_procesado_at: string | null;
  ia_modelo: string | null;
  ia_error: string | null;
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

type Message = {
  id: string;
  conversacion_id: string | null;
  whatsapp_instancia_id?: string | null;
  external_message_id?: string | null;
  direccion?: string | null;
  from_number?: string | null;
  to_number?: string | null;
  body: string | null;
  message_type?: string | null;
  tipo?: string | null;
  direction?: string | null;
  from_me?: boolean | null;
  sent_at: string | null;
  raw_payload?: unknown | null;
  created_at: string | null;
  created_by: {
    id: string;
    nombre: string | null;
    email: string | null;
    rol: string | null;
  } | null;
};

type RawConversation = Omit<Conversation, "instancia" | "lead" | "vendedor" | "vehiculo"> & {
  instancia: Conversation["instancia"] | Conversation["instancia"][] | null;
  lead: Conversation["lead"] | Conversation["lead"][] | null;
  vendedor: Conversation["vendedor"] | Conversation["vendedor"][] | null;
  vehiculo: Conversation["vehiculo"] | Conversation["vehiculo"][] | null;
};

type RawMessage = Omit<Message, "created_by"> & {
  created_by: Message["created_by"] | Message["created_by"][] | null;
};

function normalizeSingleRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  return {
    title: "Conversación WhatsApp | Funes Exclusivos",
  };
}

export default async function WhatsappConversationPage({
  params,
}: {
  params: { id: string };
}) {
  let conversation: Conversation | null = null;
  let messages: Message[] = [];

  if (isDemoMode) {
    conversation = (mockConversaciones.find((item) => item.id === params.id) ?? null) as Conversation | null;
    messages = (mockConversacionMensajes.filter((item) => item.conversacion_id === params.id) ?? []) as Message[];
  } else {
    const supabase = createSupabaseServerClient();

    const [conversationResult, messagesResult] = await Promise.all([
      supabase
        .from("conversaciones")
        .select(
          "id,whatsapp_instancia_id,lead_id,vendedor_id,vehiculo_interes_id,canal,estado,contacto_nombre,contacto_telefono,contacto_numero_normalizado,contacto_email,ultimo_mensaje_at,last_message_preview,mensajes_count,unread_count,resumen_ia,interes_compra,ia_estado,ia_resumen,ia_interes_compra,ia_score,ia_intencion,ia_proximo_paso,ia_procesado_at,ia_modelo,ia_error,intencion_detectada,proxima_accion_sugerida,requiere_atencion,created_at,instancia:whatsapp_instancias!conversaciones_whatsapp_instancia_id_fkey(id,instance_name,estado,telefono_conectado),lead:leads!conversaciones_lead_id_fkey(id,nombre,telefono,email,estado,origen),vendedor:empleados!conversaciones_vendedor_id_fkey(id,nombre,email,rol),vehiculo:vehiculos!conversaciones_vehiculo_interes_id_fkey(id,marca,modelo,version,anio,dominio)"
        )
        .eq("id", params.id)
        .maybeSingle(),
      supabase
        .from("conversacion_mensajes")
        .select("id,conversacion_id,whatsapp_instancia_id,external_message_id,direccion,from_number,to_number,body,message_type,sent_at,raw_payload,created_at,created_by:empleados!conversacion_mensajes_created_by_fkey(id,nombre,email,rol)")
        .eq("conversacion_id", params.id)
        .order("sent_at", { ascending: true }),
    ]);

    const rawConversation = conversationResult.data as RawConversation | null;
    conversation = rawConversation
      ? {
          ...rawConversation,
          instancia: normalizeSingleRelation(rawConversation.instancia),
          lead: normalizeSingleRelation(rawConversation.lead),
          vendedor: normalizeSingleRelation(rawConversation.vendedor),
          vehiculo: normalizeSingleRelation(rawConversation.vehiculo),
        }
      : null;

    messages = ((messagesResult.data ?? []) as unknown as RawMessage[]).map((message) => ({
      ...message,
      created_by: normalizeSingleRelation(message.created_by),
    })) as Message[];
  }

  if (!conversation) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/whatsapp"
          className="text-sm font-medium text-[#111827] underline-offset-4 hover:underline"
        >
          Volver a WhatsApp
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <ConversacionStatusBadge status={conversation.estado} />
          <ConversacionInterestBadge interest={conversation.interes_compra} />
        </div>
      </div>

      <header className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-[#111827]">
            {conversation.contacto_nombre ?? conversation.contacto_telefono ?? "Sin contacto"}
          </h1>
          <p className="text-sm leading-6 text-[#6B7280]">
            {conversation.last_message_preview ?? "Conversación sincronizada desde WhatsApp"}
          </p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <ConversacionDetail conversation={conversation} />
        <ConversacionMessages messages={messages} />
      </div>
    </section>
  );
}
