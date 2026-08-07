# AGENTS.md

Este archivo guia a Codex y a cualquier agente que trabaje en Funes Exclusivos.

## Proyecto

Funes Exclusivos es una plataforma operativa para una concesionaria premium. Administra inventario, compras, ventas, caja, comisiones, CRM, WhatsApp, gestoria, catalogo publico, empleados, configuracion y recordatorios.

La prioridad del producto es operativa: que Lucas, Agustina y el equipo puedan cargar, revisar y decidir rapido sin ruido visual ni datos tecnicos expuestos.

## Stack

- Next.js App Router.
- React Server Components donde sea posible.
- Tailwind CSS.
- Supabase como backend.
- Evolution API para WhatsApp.
- OpenAI por fetch directo para resumen IA.

## Comandos utiles

- Instalar dependencias: `pnpm install`
- Desarrollo: `pnpm dev`
- Build: `npm run build`
- Busqueda rapida: `rg "texto"`

Usar `rg` y `rg --files` para explorar el repo.

## Reglas de implementacion

- No crear SQL salvo que el usuario lo pida explicitamente.
- No agregar dependencias salvo pedido explicito.
- No tocar `.env.local` salvo pedido explicito.
- No exponer secrets, API keys ni service role.
- No romper modo demo.
- No tocar RLS desde el frontend.
- No usar service role en Server Actions de usuario salvo justificacion explicita.
- El webhook de Evolution es infraestructura server-side y debe seguir validando secret.

## UX/UI

Leer `DESIGN.md` antes de cambios visuales grandes.

Principios:

- UI blanca, compacta y operativa.
- Bordó `#8A1538` como color principal.
- Radio estandar `rounded-md`.
- Bordes `border-slate-200` o `#E5E7EB`.
- Sin sombras pesadas.
- Una accion primaria por pantalla.
- Tablas densas y escaneables.
- Buscador, filtros y botones principales en una misma toolbar.
- Sin headers internos repetidos cuando el header de plataforma ya indica la seccion.
- Filtros con wrap y ancho minimo.
- Empty states humanos.
- Nada de textos tecnicos visibles.

Evitar:

- Cards gigantes.
- Botones negros como primarios.
- Gradientes decorativos en el panel interno.
- IDs, UUIDs, `instance_name`, payloads o labels de base de datos en UI.
- Textos en ingles.

## Permisos visuales

La seguridad real depende de RLS, pero la UI debe respetar estos criterios:

- `admin`: ve y gestiona todo.
- `vendedor`: foco en ventas, CRM, WhatsApp, inventario comercial, sus comisiones y recordatorios.
- `gestor`: foco en gestoria, documentacion, preparacion, inventario operativo, caja si esta permitido y recordatorios.

No mostrar a vendedores:

- Costos de adquisicion.
- Costos de reposicion.
- Margenes internos.
- Proveedores de compra si son dato sensible.
- Acciones administrativas.
- Configuracion global.

Helpers principales:

- `lib/auth/permissions.ts`
- `canViewCosts`
- `canViewMargins`
- `canManageCaja`
- `canManageCommissions`
- `canManageEmployees`
- `canManageSettings`

## Supabase

Usar el server client existente:

- `lib/supabase/server.ts`
- `lib/supabase/client.ts`
- `lib/supabase/admin.ts` solo para webhook/storage/admin justificado.

Mantener queries:

- Simples.
- Acotadas.
- Tolerantes a arrays vacios.
- Sin `select("*")` si se conocen columnas necesarias.
- Con fallback visual si una relacion opcional falla.

## WhatsApp

No implementar envio de mensajes salvo pedido explicito.

No mostrar en UI:

- `instance_name`
- `external_chat_id`
- `external_message_id`
- raw payload
- secrets

QR:

- Puede venir como data URL, base64 de imagen o texto raw.
- Si es texto raw, se renderiza con `qrcode`.

Webhook:

- Ruta: `app/api/evolution/webhook/route.ts`
- Debe validar `EVOLUTION_WEBHOOK_SECRET`.
- Debe insertar mensajes reales en `conversacion_mensajes`.

## Documentacion

Actualizar `DOCUMENTACION.md` al terminar tareas relevantes.

Incluir:

- Que se construyo o corrigio.
- Paths modificados.
- Tablas involucradas.
- Decisiones tecnicas.
- Pendientes si quedan.

## Validacion

Antes de cerrar cambios de codigo:

- Ejecutar `npm run build`.
- Corregir errores TypeScript/build.
- Informar si no se pudo correr.

Para UX:

- Revisar responsive mentalmente.
- Buscar copy tecnico con `rg`.
- Confirmar que no haya overflow obvio en filtros/tablas.

## Estilo de trabajo

- Hacer cambios chicos y verificables.
- Respetar patrones existentes.
- No reescribir modulos completos si alcanza con una capa compartida.
- No revertir cambios ajenos.
- Mantener el producto estable por encima de la ambicion visual.
