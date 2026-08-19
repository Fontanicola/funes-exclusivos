import type { Metadata } from "next";
import { isDemoMode } from "@/lib/demo-mode";
import { mockConversacionMensajes, mockConversaciones, mockWhatsappInstancias } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAllSupabaseRows } from "@/lib/supabase/paginated";
import { WhatsappConnectionAlert } from "@/components/whatsapp/whatsapp-connection-alert";
import { WhatsappInbox } from "@/components/whatsapp/whatsapp-inbox";

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
  qr_base64: string | null;
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
  body: string | null;
  message_type?: string | null;
  direccion?: string | null;
  tipo?: string | null;
  direction?: string | null;
  from_me?: boolean | null;
  sent_at: string | null;
  created_at: string | null;
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

export default async function WhatsappPage() {
  let instancias: Instance[] = mockWhatsappInstancias as Instance[];
  let conversaciones: Conversation[] = mockConversaciones as Conversation[];
  let mensajesPorConversacion: Record<string, Message[]> = {};
  let canManageAll = true;

  if (!isDemoMode) {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const currentEmployeeQuery = user
      ? supabase
          .from("empleados")
          .select("id,nombre,email,rol,activo")
          .eq("id", user.id)
          .maybeSingle<{ id: string; nombre: string | null; email: string | null; rol: string | null; activo: boolean | null }>()
      : Promise.resolve({ data: null });

    const [currentEmployeeResult, instancesResult, conversationsResult] = await Promise.all([
      currentEmployeeQuery,
      fetchAllSupabaseRows((from, to) =>
        supabase
          .from("whatsapp_instancias")
          .select(
            "id,empleado_id,provider,instance_name,estado,telefono_conectado,nombre_perfil,qr_code,qr_base64,qr_expires_at,last_connection_at,last_disconnection_at,last_sync_at,last_error,activo,created_at,empleado:empleados!whatsapp_instancias_empleado_id_fkey(id,nombre,email,rol)"
          )
          .eq("activo", true)
          .order("created_at", { ascending: true })
          .range(from, to)
      ),
      fetchAllSupabaseRows((from, to) =>
        supabase
          .from("conversaciones")
          .select(
            "id,whatsapp_instancia_id,lead_id,vendedor_id,vehiculo_interes_id,canal,estado,contacto_nombre,contacto_telefono,contacto_numero_normalizado,contacto_email,ultimo_mensaje_at,last_message_preview,mensajes_count,unread_count,resumen_ia,interes_compra,ia_estado,ia_resumen,ia_interes_compra,ia_score,ia_intencion,ia_proximo_paso,ia_procesado_at,ia_modelo,ia_error,intencion_detectada,proxima_accion_sugerida,requiere_atencion,created_at,instancia:whatsapp_instancias!conversaciones_whatsapp_instancia_id_fkey(id,instance_name,estado,telefono_conectado),lead:leads!conversaciones_lead_id_fkey(id,nombre,telefono,email,estado,origen),vendedor:empleados!conversaciones_vendedor_id_fkey(id,nombre,email,rol),vehiculo:vehiculos!conversaciones_vehiculo_interes_id_fkey(id,marca,modelo,version,anio,dominio)"
          )
          .order("ultimo_mensaje_at", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false })
          .range(from, to)
      ),
    ]);

    const currentEmployee = currentEmployeeResult.data;
    canManageAll = currentEmployee?.rol === "admin" && currentEmployee?.activo === true;

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

    if (!canManageAll && currentEmployee) {
      instancias = instancias.filter((instance) => instance.empleado_id === currentEmployee.id);
      conversaciones = conversaciones.filter((conversation) => conversation.vendedor_id === currentEmployee.id);
    }

    const conversationIds = conversaciones.map((conversation) => conversation.id);
    if (conversationIds.length) {
      const messagesResult = await fetchAllSupabaseRows((from, to) =>
        supabase
          .from("conversacion_mensajes")
          .select("id,conversacion_id,body,message_type,direccion,sent_at,created_at")
          .in("conversacion_id", conversationIds)
          .order("sent_at", { ascending: true, nullsFirst: false })
          .order("created_at", { ascending: true })
          .range(from, to)
      );

      for (const message of (messagesResult.data ?? []) as Message[]) {
        if (!message.conversacion_id) continue;
        mensajesPorConversacion[message.conversacion_id] = [
          ...(mensajesPorConversacion[message.conversacion_id] ?? []),
          message,
        ];
      }
    }
  } else {
    for (const message of mockConversacionMensajes) {
      if (!message.conversacion_id) continue;
      mensajesPorConversacion[message.conversacion_id] = [
        ...(mensajesPorConversacion[message.conversacion_id] ?? []),
        message as Message,
      ];
    }
  }

  const problematicInstances = instancias.filter((instance) =>
    ["desconectado", "error", "qr_pendiente"].includes((instance.estado ?? "").toLowerCase())
  );

  return (
    <section className="space-y-6">
      {isDemoMode ? (
        <div className="rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
          Modo demo: la bandeja usa datos simulados y no consultará el servicio real.
        </div>
      ) : null}

      <WhatsappConnectionAlert instancias={problematicInstances} />

      <WhatsappInbox
        conversaciones={conversaciones}
        mensajes={mensajesPorConversacion}
      />
    </section>
  );
}
