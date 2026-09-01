# Documentación de implementación

## Qué se construyó

- La ruta pública `/catalogo` evolucionó a una web institucional fija de Funes Exclusivos, con navegación propia, hero comercial, propuesta de valor, servicios, bloque de confianza, CTA de contacto y el inventario sincronizado como sección central.

- Setup inicial de autenticación con Supabase.
- Middleware para proteger rutas privadas y redirigir sesiones válidas.
- Login privado con Server Action y sin registro público.
- Login con diagnóstico mejorado de Supabase Auth, mostrando errores reales de credenciales, confirmación de email, perfil operativo y configuración.
- Logout desde el shell privado.
- Layout privado con validación de `auth.users` + `public.empleados`.
- Sidebar fijo con navegación principal y menú de usuario.
- Dashboard ejecutivo/P&L con KPIs consolidados, secciones de inventario, comercial, operaciones y alertas accionables.
- Pantalla inicial de Inventario con listado de vehículos y filtros client-side.
- Alta de vehículos con formulario y carga de fotos a Supabase Storage.
- Edición de vehículos existentes con conservación selectiva de fotos y actualización de Storage metadata.
- Pantalla inicial de Ventas con listado, KPIs y filtros client-side.
- Formulario de nueva venta con soporte de permuta y ejecución vía RPC `registrar_venta`.
- Modo demo temporal activado por `NEXT_PUBLIC_DEMO_MODE=true` para navegar dashboard, inventario y ventas con datos mock.
- Corrección del modo demo para que middleware y layout resuelvan el flujo sin validar sesión ni config de Supabase antes de tiempo.
- Módulo de Caja con carga rápida de movimientos, KPIs mensuales y listado filtrable.
- Módulo de Comisiones con KPIs generales, comparativa por vendedor y listado filtrable.
- Módulo de CRM con pipeline comercial, listado de leads y ficha básica con historial e interacción manual.
- Módulo de Gestoría con listado, KPIs de vencimientos y alta de trámites con carga de documentos a Storage privado.
- Módulo de Catálogo con configuración global, publicación por vehículo y edición inline por fila.
- Módulo de WhatsApp con instancias Evolution por vendedor, bandeja de conversaciones, ficha con seguimiento comercial e integración real con webhooks.
- Módulo de Empleados con listado, KPIs por rol, edición inline de perfil operativo y control de estado activo.
- Módulo de Configuración con datos de empresa, monedas, comisiones y alertas operativas.
- Home redirigida al dashboard.
- Base de proyecto Next.js 14 con Tailwind y soporte para Supabase.

## Paths creados o modificados

- `package.json`
- `.env.example`
- `.gitignore`
- `next.config.js`
- `postcss.config.js`
- `tailwind.config.ts`
- `tsconfig.json`
- `next-env.d.ts`
- `app/layout.tsx`
- `app/globals.css`
- `app/page.tsx`
- `app/login/page.tsx`
- `app/login/actions.ts`
- `app/login/login-form.tsx`
- `app/(dashboard)/layout.tsx`
- `app/(dashboard)/actions.ts`
- `app/(dashboard)/dashboard/page.tsx`
- `components/dashboard/kpi-card.tsx`
- `components/dashboard/pnl-summary.tsx`
- `components/dashboard/inventory-summary.tsx`
- `components/dashboard/commercial-summary.tsx`
- `components/dashboard/operations-summary.tsx`
- `components/dashboard/dashboard-alerts.tsx`
- `lib/dashboard-metrics.ts`
- `app/(dashboard)/inventario/page.tsx`
- `app/(dashboard)/inventario/actions.ts`
- `app/(dashboard)/inventario/nuevo/page.tsx`
- `app/(dashboard)/inventario/[id]/editar/page.tsx`
- `app/(dashboard)/caja/page.tsx`
- `app/(dashboard)/caja/actions.ts`
- `app/(dashboard)/ventas/page.tsx`
- `app/(dashboard)/ventas/actions.ts`
- `app/(dashboard)/ventas/nueva/page.tsx`
- `app/(dashboard)/comisiones/page.tsx`
- `app/(dashboard)/crm/page.tsx`
- `app/(dashboard)/crm/nuevo/page.tsx`
- `app/(dashboard)/crm/[id]/page.tsx`
- `app/(dashboard)/crm/actions.ts`
- `app/(dashboard)/gestoria/page.tsx`
- `app/(dashboard)/gestoria/nuevo/page.tsx`
- `app/(dashboard)/gestoria/actions.ts`
- `app/(dashboard)/catalogo/page.tsx`
- `app/(dashboard)/catalogo/actions.ts`
- `app/(dashboard)/empleados/page.tsx`
- `app/(dashboard)/empleados/actions.ts`
- `app/(dashboard)/whatsapp/page.tsx`
- `app/(dashboard)/whatsapp/conexiones/page.tsx`
- `app/(dashboard)/whatsapp/[id]/page.tsx`
- `app/(dashboard)/whatsapp/actions.ts`
- `app/(dashboard)/configuracion/page.tsx`
- `app/(dashboard)/configuracion/actions.ts`
- `app/api/evolution/webhook/route.ts`
- `components/dashboard/sidebar.tsx`
- `components/dashboard/user-menu.tsx`
- `components/inventario/inventario-table.tsx`
- `components/inventario/vehiculo-status-badge.tsx`
- `components/inventario/vehiculo-form.tsx`
- `components/caja/caja-movimiento-form.tsx`
- `components/caja/caja-movimientos-table.tsx`
- `components/caja/caja-tipo-badge.tsx`
- `components/comisiones/comisiones-table.tsx`
- `components/comisiones/comisiones-comparativa.tsx`
- `components/comisiones/comision-status-badge.tsx`
- `components/crm/crm-pipeline.tsx`
- `components/crm/leads-table.tsx`
- `components/crm/lead-form.tsx`
- `components/crm/lead-status-badge.tsx`
- `components/crm/lead-origin-badge.tsx`
- `components/crm/lead-interaction-form.tsx`
- `components/crm/lead-interactions-timeline.tsx`
- `components/gestoria/gestoria-table.tsx`
- `components/gestoria/gestoria-form.tsx`
- `components/gestoria/gestoria-status-badge.tsx`
- `components/gestoria/gestoria-type-badge.tsx`
- `components/catalogo/catalogo-settings-form.tsx`
- `components/catalogo/catalogo-vehiculos-table.tsx`
- `components/catalogo/catalogo-status-badge.tsx`
- `components/catalogo-publico/catalogo-public-site.tsx`
- `components/empleados/empleados-table.tsx`
- `components/empleados/empleado-edit-form.tsx`
- `components/empleados/empleado-role-badge.tsx`
- `components/empleados/empleado-status-badge.tsx`
- `components/whatsapp/whatsapp-instances-grid.tsx`
- `components/whatsapp/whatsapp-instance-card.tsx`
- `components/whatsapp/whatsapp-connection-alert.tsx`
- `components/whatsapp/conversaciones-table.tsx`
- `components/whatsapp/conversacion-detail.tsx`
- `components/whatsapp/conversacion-messages.tsx`
- `components/whatsapp/whatsapp-instance-status-badge.tsx`
- `components/whatsapp/conversacion-status-badge.tsx`
- `components/whatsapp/conversacion-interest-badge.tsx`
- `components/whatsapp/whatsapp-instance-create-form.tsx`
- `components/configuracion/configuracion-general-form.tsx`
- `components/configuracion/configuracion-summary.tsx`
- `components/ventas/ventas-table.tsx`
- `components/ventas/venta-status-badge.tsx`
- `components/ventas/payment-method-badge.tsx`
- `components/ventas/venta-form.tsx`
- `components/ventas/permuta-fields.tsx`
- `lib/supabase/client.ts`
- `lib/supabase/admin.ts`
- `lib/supabase/env.ts`
- `lib/supabase/server.ts`
- `lib/supabase/middleware.ts`
- `lib/evolution/types.ts`
- `lib/evolution/client.ts`
- `lib/evolution/payload-normalizer.ts`
- `lib/demo-mode.ts`
- `lib/mock-data.ts`
- `lib/supabase/env.ts`
- `lib/supabase/server.ts`
- `lib/supabase/middleware.ts`
- `middleware.ts`

## Tablas de Supabase involucradas

- `auth.users`
- `public.empleados`
- `public.vehiculos`
- `public.ventas`
- `public.registrar_venta(...)`
- `public.caja_movimientos`
- `public.proveedores`
- `public.activos`
- `public.comisiones`
- `public.generar_comision_por_venta(...)`
- `public.leads`
- `public.lead_interacciones`
- `public.crm_pipeline_estados`
- `public.gestoria_tramites`
- `public.gestoria` bucket privado de Storage
- `public.catalogo_config`
- `public.vehiculos` (campos de catálogo)
- `public.whatsapp_instancias`
- `public.conversaciones`
- `public.conversacion_mensajes`
- `public.leads` (lectura para vínculo comercial)
- `public.empleados` (lectura para vendedores/admins)
- `public.whatsapp_instancias` (creación, actualización de QR, estado y conexión)
- `public.conversaciones` (alta y seguimiento sincronizado por webhook)
- `public.conversacion_mensajes` (persistencia de mensajes sincronizados)
- `public.empleados` (gestión operativa de perfiles, roles y estado activo)
- `public.configuracion_general` (singleton de datos de empresa y parámetros operativos)

## Decisiones técnicas relevantes

- La nueva portada pública se implementó en código, sin agregar tablas ni dependencias: los bloques institucionales son estables y los datos variables continúan viniendo de `catalogo_config`, `vehiculos` y `empleados`.
- Se dejaron espacios visuales explícitos para futuras fotos del showroom, equipo o experiencia de entrega. La portada panorámica existente sigue siendo prioritaria cuando está configurada.
- La estructura toma patrones habituales de sitios profesionales de concesionarias: navegación corta, inventario visible, contacto persistente, servicios y llamadas a la acción, sin copiar una web externa ni inventar prestaciones no confirmadas.

- La sesión se valida en middleware y nuevamente en el layout privado para reforzar la protección.
- Se usa `public.empleados` como gate de acceso: si no existe registro o `activo = false`, el usuario vuelve a `/login?error=inactive`.
- No se implementó registro público ni CRUD de empleados.
- El login usa `supabase.auth.signInWithPassword` desde Server Action.
- El login ahora diferencia errores de autenticación, perfil operativo ausente/inactivo y problemas de configuración, logueando el detalle técnico en consola del servidor.
- La capa de Supabase quedó estabilizada con helpers de entorno reutilizables y errores claros de configuración en server, browser y middleware, sin validar env vars al importar.
- El logout usa `supabase.auth.signOut` desde Server Action.
- Se mantuvo un diseño light-only, sobrio y con paleta neutra.
- El shell privado quedó con sidebar fijo de `240px` y contenido principal con padding compacto.
- Cuando faltan las variables de Supabase, el middleware redirige al login con un mensaje de configuración en lugar de romper el servidor local.
- El inventario se implementó como listado server-rendered con filtros en cliente, sin mocks ni acciones de alta/edición/eliminación.
- El alta de vehículos sube imágenes al bucket público `vehiculos`, guarda URLs públicas en `vehiculos.fotos` y completa `created_by` / `updated_by` con el `user.id`.
- La edición reutiliza el mismo formulario, conserva fotos por URL y solo sube imágenes nuevas al bucket `vehiculos`.
- La pantalla de ventas mantiene los importes sin conversión de moneda y muestra desgloses por moneda cuando hay mezcla entre registros registrados.
- La nueva venta no hace inserts manuales: delega la persistencia y el cambio de estado del inventario en la RPC `registrar_venta`, y solo arma el payload desde Next.
- En modo demo no se consulta Supabase para dashboard, inventario ni ventas; las acciones devuelven un error amable y los datos mock viven centralizados en `lib/mock-data.ts`.
- El dashboard calcula métricas sin convertir monedas, separando ARS y USD en KPI, P&L y resultado operativo.
- El margen estimado de ventas se calcula solo cuando existe costo de adquisición relacionable del vehículo.
- El dashboard consolidado usa queries simples y separadas a `vehiculos`, `ventas`, `caja_movimientos`, `comisiones`, `leads`, `gestoria_tramites`, `whatsapp_instancias` y `conversaciones`, y después calcula métricas en `lib/dashboard-metrics.ts`.
- Las páginas sensibles quedaron en `force-dynamic` para evitar prerender con Supabase ausente y permitir que el demo se resuelva por request.
- Caja quedó pensada para carga operativa rápida: formulario compacto, sin redirección después de guardar y con KPI mensuales separados por moneda.
- El listado de Caja permite filtrar por tipo, moneda y texto libre sobre detalles, proveedor o activo sin introducir conversión de monedas.
- Comisiones visualiza únicamente registros existentes: no llama la RPC generadora ni implementa aprobación/pago, y la comparativa ordena vendedores por comisión nominal con desgloses por moneda cuando hay mezcla.
- CRM visualiza estados activos del pipeline, muestra leads en formato kanban y agrega una ficha con timeline e interacción manual, sin drag and drop ni automatizaciones.
- Gestoría lista trámites con foco en vencimientos, permite alta con documentos al bucket privado `gestoria` y guarda paths internos en `documentos` para resolver acceso firmado más adelante.
- El modo demo de Gestoría reutiliza mocks centralizados en `lib/mock-data.ts`, incluyendo responsables, vehículos y ventas relacionados para poblar el formulario sin tocar Supabase.
- Catálogo se administra desde el panel con una configuración global y edición inline por vehículo; el guardado requiere rol `admin` y usa la fila `catalogo_config` con `id = true`.
- La publicación de catálogo no modifica el inventario principal: solo actualiza campos específicos de `vehiculos` y se revalida `/catalogo`.
- WhatsApp quedó integrado con Evolution API real para crear instancias, refrescar QR, consultar estado, desconectar y recibir webhooks.
- Las conversaciones de WhatsApp se visualizan como bandeja operativa con filtros y una ficha detallada que permite marcar como atendida y ajustar el seguimiento comercial.
- El modo demo de WhatsApp reutiliza mocks centralizados en `lib/mock-data.ts`, incluyendo instancias, conversaciones y mensajes sincronizados.
- La integración real de Evolution usa `EVOLUTION_API_BASE_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_WEBHOOK_SECRET`, `NEXT_PUBLIC_APP_URL` y `SUPABASE_SERVICE_ROLE_KEY`.
- La instancia de WhatsApp se crea automáticamente con nombre interno `funes_emp_XXXXXXXX` por vendedor.
- El webhook usa service role solo en el handler de Supabase y responde `200` con `ignored` cuando no puede resolver evento o instancia.
- Los mensajes entrantes se guardan con `upsert` por `external_message_id` para evitar duplicados.
- La UI de conexiones diferencia admin y vendedor, y permite ver/gestionar la instancia propia sin romper el flujo de administración global.
- El módulo de Empleados quedó restringido a administración operativa: no crea usuarios de Auth, solo edita perfil, rol, comisión y estado activo sobre `public.empleados`.
- Se agregó protección para evitar que un usuario admin se desactive o se quite su propio rol desde la misma pantalla.
- La pantalla de Configuración usa una fila singleton `id = true`, valida que la moneda principal y secundaria no coincidan y restringe el guardado a usuarios admin activos.
- La validación final de la estabilización pasó con `pnpm build` y `pnpm exec tsc --noEmit`.
- `pnpm lint` quedó sin automatizar porque el script abre el asistente interactivo de ESLint al no existir una configuración previa del repo.

## Integración automática de Nueva Venta con Caja y Comisiones

## Cards internas de Catálogo

- Se reemplazó la tabla extensa de vehículos de `dashboard/catalogo` por una grilla responsive de cards compactas.
- Cada card conserva la edición de título y descripción pública, publicación, destacado, orden, guardado y acceso al detalle público.
- Se incorporó la foto principal como elemento visual, con placeholder cuando no existe, y se mantuvieron filtros y paginación.
- No se modificó el schema ni las acciones de Supabase; el cambio es exclusivamente de presentación en `components/catalogo/catalogo-vehiculos-table.tsx`.

## Corrección de carga de portada

- Se corrigió el error `413` al guardar la portada del catálogo: Next.js rechazaba imágenes válidas antes de ejecutar la acción por el límite predeterminado de tamaño de Server Actions.
- Se configuró un límite de `10 MB` en `next.config.js`, manteniendo la validación de negocio de la acción en `8 MB` para el archivo final.
- También se hizo tolerante el mensaje de error del formulario para evitar una excepción del cliente cuando la petición es rechazada.

## Contacto flotante del catálogo público

- Se agregó un botón flotante de contacto en la vidriera pública para elegir un vendedor activo y abrir una conversación de WhatsApp con mensaje prellenado.
- El catálogo consulta únicamente nombre, teléfono y avatar de vendedores activos; si no hay contactos disponibles, no muestra el botón.
- Se simplificó la barra de búsqueda pública eliminando el título, la descripción y la caja exterior que ocupaban espacio sin aportar interacción.

- Se integró el flujo de nueva venta para que, luego de `registrar_venta`, Next complete automáticamente los pasos operativos posteriores.
- La acción de ventas ahora registra pagos iniciales con `ventas_pagos`, genera movimientos de `caja_movimientos` para pagos monetarios, asegura la entrega pendiente en `ventas_entregas` y llama `generar_comision_por_venta` con porcentaje tomado del vendedor o de `configuracion_general`.
- El pago `usado` queda solo en `ventas_pagos` y no genera caja, porque representa una unidad recibida y no un ingreso líquido.
- Los movimientos de caja generados desde ventas se guardan con `origen = venta`, `venta_id` y `venta_pago_id` para mantener trazabilidad completa.
- Los movimientos manuales de Caja ahora se guardan con `origen = manual` por defecto, y la tabla permite filtrar por origen.
- Si la entrega pendiente ya existía, el alta la ignora y continúa sin interrumpir la venta.
- Si la comisión automática falla, la venta no se revierte: el error queda logueado en consola del servidor y el flujo principal sigue.

### Paths modificados

- `app/(dashboard)/ventas/actions.ts`
- `components/ventas/venta-form.tsx`
- `app/(dashboard)/caja/actions.ts`
- `app/(dashboard)/caja/page.tsx`
- `components/caja/caja-movimientos-table.tsx`
- `lib/mock-data.ts`
- `DOCUMENTACION.md`

### Tablas de Supabase involucradas

- `public.ventas`
- `public.ventas_pagos`
- `public.ventas_entregas`
- `public.caja_movimientos`
- `public.comisiones`
- `public.empleados`
- `public.configuracion_general`
- `public.vehiculos`

### Decisiones técnicas

- Se mantuvo `registrar_venta` como fuente de verdad para la creación de la venta.
- Los movimientos de caja se generan solo para pagos monetarios: `seña`, `efectivo`, `transferencia` y `crédito`.
- El flujo no implementa rollback manual: si un paso intermedio falla, se informa el error y no se agregan pasos posteriores.
- La comisión automática usa primero el porcentaje del empleado, luego el default global y finalmente `1.00` como fallback.
- La UI de Caja quedó preparada para mostrar el origen de cada movimiento y distinguir claramente los que provienen de una venta.

## Integración automática de Nueva Compra con Caja

- Se integró el flujo de compra para que, al registrar una unidad, el sistema pueda generar automáticamente un egreso en Caja por el monto efectivamente pagado.
- El formulario de compra ahora incluye una sección de `Impacto en caja` con activación explícita, monto sugerido, medio, cuenta y concepto.
- La acción de compra mantiene el flujo de alta de vehículo, compra y gasto, y agrega un movimiento de Caja opcional con `origen = compra` y `compra_id` para trazabilidad.
- El egreso de Caja usa la moneda y la fecha de la compra, y lleva detalle de vehículo, proveedor y número de operación.
- La tabla de Caja ahora reconoce el origen `compra`, muestra una etiqueta sobria `Compra` y permite ver el vínculo con la compra asociada cuando existe.
- Se actualizó la data mock para contemplar egresos de compra, incluyendo un caso con deuda pendiente y pago parcial en Caja.
- El dashboard no requirió una nueva fórmula de egresos: sigue tomando `caja_movimientos` como fuente real de caja, por lo que los egresos de compra ya impactan en egresos del mes, saldo y P&L sin duplicar `vehiculo_gastos`.

### Paths modificados

- `app/(dashboard)/compras/actions.ts`
- `components/compras/compra-form.tsx`
- `app/(dashboard)/caja/page.tsx`
- `components/caja/caja-movimientos-table.tsx`
- `lib/mock-data.ts`
- `DOCUMENTACION.md`

### Tablas de Supabase involucradas

- `public.compras_vehiculos`
- `public.vehiculos`
- `public.vehiculo_gastos`
- `public.caja_movimientos`
- `public.proveedores`

### Decisiones técnicas

- No se implementó rollback manual complejo si falla el egreso de caja; se devuelve un error claro y se evita continuar con pasos posteriores.
- El movimiento de caja se crea solo si el usuario activa el switch `generar_movimiento_caja`.
- El monto sugerido se calcula desde `precio_compra - deuda_pendiente` cuando hay deuda, pero el usuario puede editarlo libremente.
- La compra queda trazada tanto en `compras_vehiculos` como en `caja_movimientos`, lo que facilita auditoría y conciliación operativa.
- No se duplicó el gasto en dashboard: el egreso real se toma desde Caja, mientras que `vehiculo_gastos` mantiene el costo operativo del vehículo.

## Rediseño visual del Dashboard ejecutivo

- Se redujo la fila superior a 5 KPIs clave y se agregaron variantes visuales para destacar stock, ventas, ingresos, leads y salud de WhatsApp.
- Se reforzó la jerarquía con bloques más editoriales para P&L, inventario, comercial, operaciones y alertas, evitando la grilla de cards homogéneas.
- Se sumaron visualizaciones simples sin dependencias externas: barras, embudos, donut con `conic-gradient` y estados con mayor contraste visual.
- Paths modificados:
  - `app/(dashboard)/dashboard/page.tsx`
  - `components/dashboard/kpi-card.tsx`
  - `components/dashboard/pnl-summary.tsx`
  - `components/dashboard/inventory-summary.tsx`
  - `components/dashboard/commercial-summary.tsx`
  - `components/dashboard/operations-summary.tsx`
  - `components/dashboard/dashboard-alerts.tsx`
  - `lib/dashboard-metrics.ts`
- Tablas de Supabase involucradas en el dashboard:
  - `public.vehiculos`
  - `public.ventas`
  - `public.caja_movimientos`
  - `public.comisiones`
  - `public.leads`
  - `public.gestoria_tramites`
  - `public.whatsapp_instancias`
  - `public.conversaciones`
- Decisiones técnicas relevantes:
  - Se mantuvo la lógica de negocio de métricas y solo se cambió la presentación.
  - No se agregaron dependencias nuevas ni se introdujeron gráficos externos.
  - Los componentes quedaron preparados para manejar datasets vacíos sin romper layout ni KPIs.

## Adaptación a la operativa real de Funes

### Qué se adaptó según los Excels operativos

- Se amplió Inventario para reflejar compra, costeo, preparación, ubicación y publicación externa.
- Se amplió Ventas para mostrar rentabilidad operativa, pagos de la operación y estado de entrega.
- Se amplió Caja para operar con `medio`, `concepto`, `cuenta` y `periodo`, además del esquema clásico de ingresos/egresos.
- Se ajustó el Dashboard para mirar stock valorizado, preparación, entregas pendientes y caja por medio, en lugar de solo métricas genéricas.
- Se actualizaron los mocks para poblar la app con datos más cercanos a la operación real de concesionaria.

### Paths modificados

- `app/(dashboard)/inventario/page.tsx`
- `app/(dashboard)/inventario/nuevo/page.tsx`
- `app/(dashboard)/inventario/[id]/editar/page.tsx`
- `components/inventario/inventario-table.tsx`
- `components/inventario/vehiculo-form.tsx`
- `app/(dashboard)/ventas/page.tsx`
- `app/(dashboard)/ventas/nueva/page.tsx`
- `components/ventas/ventas-table.tsx`
- `components/ventas/venta-form.tsx`
- `components/ventas/permuta-fields.tsx`
- `app/(dashboard)/ventas/actions.ts`
- `app/(dashboard)/caja/page.tsx`
- `app/(dashboard)/caja/actions.ts`
- `components/caja/caja-movimiento-form.tsx`
- `components/caja/caja-movimientos-table.tsx`
- `app/(dashboard)/dashboard/page.tsx`
- `lib/dashboard-metrics.ts`
- `lib/mock-data.ts`
- `DOCUMENTACION.md`

### Tablas de Supabase involucradas

- `public.vehiculos`
- `public.proveedores`
- `public.ventas`
- `public.ventas_pagos`
- `public.ventas_entregas`
- `public.caja_movimientos`
- `public.comisiones`
- `public.leads`
- `public.gestoria_tramites`
- `public.whatsapp_instancias`
- `public.conversaciones`
- `public.empleados`

### Decisiones técnicas tomadas

- Se mantuvo la lógica de negocio existente y se ampliaron queries, formularios y tablas para reflejar campos reales de la operatoria.
- No se creó SQL ni se alteró la estructura de la base; los cambios asumen que los nuevos campos/tablas ya existen.
- Se priorizó compatibilidad con datos vacíos y con relaciones parciales para evitar crashes en producción.
- Las cargas de venta y caja quedaron pensadas para operar con datos reales y también seguir funcionando en modo demo.
- Se conservaron importes sin conversión de moneda.
- Se reutilizó la RPC `registrar_venta` para persistir la venta y luego completar pagos/entrega desde Next.

### Gaps que quedan pendientes

- No se implementó aún el importador Excel.
- No se implementó la liquidación mensual de comisiones.
- No se implementó el presupuesto de gestoría.
- No se creó aún la ruta `/ventas/pendientes-entrega`.
- No se automatizó todavía la derivación de caja/comisiones a partir de eventos operativos.
- No se implementó una vista pública del catálogo ni automatizaciones adicionales de publicación.

## Pantalla de pendientes de entrega

### Qué se construyó

- Se agregó `/ventas/pendientes-entrega` como tablero operativo de seguimiento de entregas.
- Se incluyó un acceso secundario desde `/ventas` para navegar al seguimiento de entregas.
- Se creó una tabla compacta con filtros por estado, usado recibido y saldo pendiente.
- Se agregó una edición inline simple para actualizar el estado de entrega y el control documental del usado.
- Se conectaron pagos y entregas desde `ventas_pagos` y `ventas_entregas`, manteniendo la relación 1:1 con `ventas`.
- Se completaron mocks para demo con entregas y pagos realistas, incluyendo usado recibido, observaciones y saldos.

### Paths modificados

- `app/(dashboard)/ventas/page.tsx`
- `app/(dashboard)/ventas/pendientes-entrega/page.tsx`
- `app/(dashboard)/ventas/pendientes-entrega/actions.ts`
- `components/ventas/pendientes-entrega-table.tsx`
- `components/ventas/entrega-status-badge.tsx`
- `components/ventas/entrega-edit-form.tsx`
- `components/ventas/ventas-table.tsx`
- `app/(dashboard)/ventas/actions.ts`
- `lib/mock-data.ts`

### Tablas de Supabase involucradas

- `public.ventas`
- `public.ventas_entregas`
- `public.ventas_pagos`
- `public.vehiculos`
- `public.empleados`

### Decisiones técnicas relevantes

- La pantalla de pendientes de entrega se resolvió como servidor + tabla client-side, manteniendo alta densidad visual y sin introducir nuevas dependencias.
- La edición se implementó como fila expandible inline para no interrumpir el flujo operativo.
- Los pagos se agrupan en memoria por `venta_id` para evitar joins más complejos en el cliente.
- Las validaciones de permisos se concentran en la Server Action, permitiendo edición solo a `admin` y `gestor`.
- En demo mode, la pantalla se alimenta de mocks derivados de ventas existentes para preservar consistencia entre listado, pagos y entrega.
- Se mantuvo el criterio de no convertir monedas y de mostrar importes y saldos tal como vienen del dominio operativo.

## Módulo de compras de vehículos

### Qué se construyó

- Se agregó el módulo operativo `/compras` con listado, KPIs y alta de compra.
- Se incorporó el acceso a Compras en el sidebar entre Inventario y Ventas.
- Se creó un formulario de compra que carga proveedor, datos del vehículo, pricing y estado de preparación.
- La Server Action crea el vehículo en Inventario, registra la compra en `compras_vehiculos` y genera un gasto inicial en `vehiculo_gastos`.
- Se agregaron mocks de compras coherentes con vehículos y proveedores existentes para mantener el modo demo poblado.

### Paths modificados

- `components/dashboard/sidebar.tsx`
- `app/(dashboard)/compras/page.tsx`
- `app/(dashboard)/compras/nueva/page.tsx`
- `app/(dashboard)/compras/actions.ts`
- `components/compras/compra-kpis.tsx`
- `components/compras/compras-table.tsx`
- `components/compras/compra-form.tsx`
- `lib/mock-data.ts`

### Tablas de Supabase involucradas

- `public.compras_vehiculos`
- `public.vehiculos`
- `public.proveedores`
- `public.vehiculo_gastos`

### Decisiones técnicas relevantes

- Se mantuvo el flujo sin RPC transaccional porque no está disponible en el código actual; la acción encadena inserts con limpieza best-effort ante error.
- La compra crea el vehículo directamente en `vehiculos` con `estado = en_stock`, `costo_adquisicion` y `fecha_compra` alineados al Excel operativo.
- El stock inicial y la preparación quedan cargados desde la misma pantalla para evitar pasos manuales posteriores.
- El listado de compras prioriza densidad operativa y filtros rápidos, con deuda destacada pero sin colores saturados.
- En demo mode se usan compras mock derivadas de vehículos y proveedores ya existentes para mantener coherencia de datos.

## Pantalla de renta por operación

### Qué se construyó

- Se agregó `/ventas/renta` como tablero financiero-operativo para leer margen, rotación y resultado por operación.
- Se creó un helper puro en `lib/renta-metrics.ts` para consolidar ventas, gastos, pagos y entregas sin convertir monedas.
- Se diseñó una vista con KPIs más visuales y una tabla detallada con filtros por vendedor, método de pago, entrega y resultado.
- Se ajustó `/ventas` para incluir un acceso directo a la pantalla de renta.
- Se reforzó la tabla principal de ventas con una referencia sutil a renta cuando la operación ya tiene datos calculados.
- Se ampliaron los mocks para que demo mode muestre operaciones con rentabilidad positiva, negativa, mixta e incompleta.

### Paths modificados

- `app/(dashboard)/ventas/renta/page.tsx`
- `components/ventas/renta-kpis.tsx`
- `components/ventas/renta-table.tsx`
- `components/ventas/renta-margin-badge.tsx`
- `lib/renta-metrics.ts`
- `app/(dashboard)/ventas/page.tsx`
- `components/ventas/ventas-table.tsx`
- `lib/mock-data.ts`

### Tablas de Supabase involucradas

- `public.ventas`
- `public.vehiculos`
- `public.vehiculo_gastos`
- `public.ventas_pagos`
- `public.ventas_entregas`
- `public.empleados`

### Decisiones técnicas relevantes

- La renta se calculó con helpers puros para mantener la lógica reusable y facilitar futuras pantallas o exportaciones.
- No se hizo conversión de moneda: cuando una operación mezcla monedas se marca como no comparable o mixta.
- Los pagos se agrupan por tipo y por moneda en memoria para conservar trazabilidad sin agregar joins innecesarios.
- La rotación usa el valor informado por la operación y, si no existe, cae al cálculo entre fecha de compra y fecha de venta.
- Demo mode reutiliza mocks existentes y se amplió con gastos de vehículo para poblar la lectura financiera.

## Presupuestos de gestoría

### Qué se construyó

- Se agregó `/gestoria/presupuestos` como listado operativo de presupuestos de gestoría.
- Se incorporó un acceso secundario desde `/gestoria` para navegar al nuevo módulo.
- Se creó el alta de presupuesto con vínculos a trámite, venta y vehículo, más una grilla fija de 10 ítems editables antes de guardar.
- Se implementó el detalle de presupuesto con resumen, ítems, borrado individual, cambio de estado y alta de nuevos ítems.
- Se agregaron badges específicos para estado de presupuesto y tipo de ítem.
- Se ampliaron los mocks para demo con presupuestos e ítems realistas, incluyendo borrador, aprobado, rechazado y facturado.

### Paths modificados

- `app/(dashboard)/gestoria/page.tsx`
- `app/(dashboard)/gestoria/presupuestos/page.tsx`
- `app/(dashboard)/gestoria/presupuestos/nuevo/page.tsx`
- `app/(dashboard)/gestoria/presupuestos/[id]/page.tsx`
- `app/(dashboard)/gestoria/presupuestos/actions.ts`
- `components/gestoria/presupuestos-table.tsx`
- `components/gestoria/presupuesto-form.tsx`
- `components/gestoria/presupuesto-detail.tsx`
- `components/gestoria/presupuesto-item-form.tsx`
- `components/gestoria/presupuesto-status-badge.tsx`
- `components/gestoria/presupuesto-item-type-badge.tsx`
- `lib/mock-data.ts`

### Tablas de Supabase involucradas

- `public.gestoria_presupuestos`
- `public.gestoria_presupuesto_items`
- `public.gestoria_tramites`
- `public.ventas`
- `public.vehiculos`
- `public.empleados`

### Decisiones técnicas relevantes

- La creación del presupuesto se resolvió en una sola Server Action con inserción de cabecera + ítems, y redirección al detalle si la inserción fue exitosa.
- El formulario usa 10 ítems fijos en lugar de un constructor dinámico para mantener una UX parecida al Excel operativo y reducir fricción.
- Los ítems se gestionan de forma independiente en el detalle para permitir ajustes posteriores sin reabrir el alta.
- El flujo de permisos quedó restringido a `admin` y `gestor`, y en demo mode todas las actions devuelven un error amable sin tocar Supabase.
- Se evitó la conversión de moneda en los totales y se dejó la suma agrupada por moneda cuando aplica.

## Integración automática de liquidaciones de comisión con Caja

### Qué se integró

- Se incorporó el flujo de liquidaciones de comisión con una pantalla de listado y una ficha de detalle.
- Al marcar una liquidación como `pagada`, la Server Action ahora genera automáticamente un egreso en Caja por el neto a cobrar.
- El movimiento de Caja queda trazado con `origen = comision` y `comision_liquidacion_id` para que el listado y los KPIs lo reconozcan sin ambigüedad.
- El detalle de liquidación pide como mínimo el medio de Caja antes de confirmar el pago y evita la acción cuando la liquidación ya está pagada o anulada.
- Caja y el dashboard quedaron preparados para mostrar y consolidar los movimientos de comisión sin romper los egresos de ventas, compras ni ajustes.
- Se amplió `lib/mock-data.ts` con liquidaciones, ajustes y un movimiento de Caja asociado para que demo mode refleje el flujo completo.

### Paths modificados

- `app/(dashboard)/comisiones/liquidaciones/actions.ts`
- `app/(dashboard)/comisiones/liquidaciones/page.tsx`
- `app/(dashboard)/comisiones/liquidaciones/[id]/page.tsx`
- `components/comisiones/liquidacion-detail.tsx`
- `app/(dashboard)/caja/page.tsx`
- `components/caja/caja-movimientos-table.tsx`
- `app/(dashboard)/dashboard/page.tsx`
- `lib/dashboard-metrics.ts`
- `lib/mock-data.ts`

### Tablas de Supabase involucradas

- `public.comision_liquidaciones`
- `public.comision_liquidacion_items`
- `public.comision_ajustes`
- `public.caja_movimientos`
- `public.empleados`

### Decisiones técnicas tomadas

- Se mantuvo la lógica de negocio sin rollback manual complejo: si el movimiento de Caja falla después de marcar la liquidación como pagada, se informa el error y no se intenta revertir la transacción desde Next.
- El pago automático se arma con un medio de Caja explícito y un concepto configurable, mientras que el resto de la trazabilidad se completa con vendedor y período.
- El dashboard no necesitó una fórmula nueva para este caso: al consolidar todos los egresos de Caja, los pagos de liquidaciones ya entran naturalmente en el saldo y en el P&L.
- En Caja se agregó una lectura específica del origen `comision` para que el movimiento se explique como “Pago de liquidación” y no se mezcle con otros egresos operativos.
- El modo demo quedó poblado con una liquidación pagada, una cerrada y una anulada para validar los estados más importantes sin depender de Supabase real.

## Integración CRM → Ventas

### Qué se integró

- La ficha de lead ahora muestra su relación con ventas, el estado comercial y una acción para convertirlo en operación cuando todavía no tiene venta asociada.
- Se creó el formulario de conversión de lead a venta con cliente prellenado, vendedor activo, vehículo de stock, pagos iniciales y bloque de permuta cuando corresponde.
- La Server Action de CRM reutiliza la RPC `public.registrar_venta(...)` y, después de crear la venta, enlaza `lead_id` y `vendedor_id`, marca el lead como `ganado` y dispara las integraciones automáticas de pagos, Caja, entrega pendiente y comisión.
- Se extrajo la lógica común de postventa a `lib/ventas-integrations.ts` para evitar duplicación entre la venta manual y la conversión desde CRM.
- La tabla de ventas ahora muestra una referencia discreta al lead cuando la operación proviene de CRM.
- Los mocks quedaron alineados para demostrar un lead ganado con venta asociada, una oportunidad aún sin convertir y un lead perdido.

### Paths modificados

- `app/(dashboard)/crm/[id]/page.tsx`
- `app/(dashboard)/crm/actions.ts`
- `components/crm/lead-detail.tsx`
- `components/crm/lead-convert-sale-form.tsx`
- `components/crm/lead-status-badge.tsx`
- `app/(dashboard)/ventas/page.tsx`
- `components/ventas/ventas-table.tsx`
- `app/(dashboard)/ventas/actions.ts`
- `lib/ventas-integrations.ts`
- `lib/mock-data.ts`

### Tablas de Supabase involucradas

- `public.leads`
- `public.ventas`
- `public.vehiculos`
- `public.ventas_pagos`
- `public.ventas_entregas`
- `public.caja_movimientos`
- `public.comisiones`
- `public.empleados`

### Decisiones técnicas tomadas

- Se reutilizó la misma lógica de pagos, Caja, entrega y comisión para el alta manual de ventas y para la conversión desde CRM, manteniendo una sola ruta de integración postventa.
- La conversión prioriza validaciones de permisos, estado del lead, existencia del vehículo en stock y vendedor activo antes de llamar la RPC, para evitar crear operaciones inconsistentes.
- La venta puede quedar creada aunque falle un paso posterior no reversible, pero se devuelve un error claro cuando falla el vínculo al lead, el registro de pagos, Caja o la entrega pendiente.
- El lead se marca como `ganado` con fecha de ganancia en el momento de la conversión, mientras que la venta queda asociada al `lead_id` para que CRM y Ventas se enlacen sin ambigüedad.
- En demo mode se agregaron los casos mínimos para mostrar la transición realista entre prospecto, venta cerrada y lead perdido sin tocar Supabase.

## Integración WhatsApp real con Evolution API

### Qué se integró

- Se habilitó la creación real de instancias de WhatsApp por vendedor contra Evolution API, con QR inicial, webhook configurado y persistencia en Supabase.
- Se agregó el webhook `/api/evolution/webhook` para procesar eventos `QRCODE_UPDATED`, `CONNECTION_UPDATE` y `MESSAGES_UPSERT`, sincronizando instancias, conversaciones, leads y mensajes.
- La bandeja de WhatsApp ahora filtra por usuario: admin ve todo y vendedor ve sus propias instancias y conversaciones.
- Se incorporaron acciones reales para crear, refrescar QR, sincronizar estado, desconectar y eliminar instancias, más marcar conversaciones como leídas.
- La ficha de conversación quedó preparada para seguimiento operativo, y el demo mode mantiene mocks compatibles con la nueva integración.

### Paths modificados

- `.env.example`
- `lib/evolution/types.ts`
- `lib/evolution/client.ts`
- `lib/evolution/payload-normalizer.ts`
- `lib/supabase/admin.ts`
- `app/api/evolution/webhook/route.ts`
- `app/(dashboard)/whatsapp/actions.ts`
- `app/(dashboard)/whatsapp/conexiones/page.tsx`
- `app/(dashboard)/whatsapp/page.tsx`
- `app/(dashboard)/whatsapp/[id]/page.tsx`
- `components/whatsapp/whatsapp-instances-grid.tsx`
- `components/whatsapp/whatsapp-instance-card.tsx`
- `components/whatsapp/whatsapp-connection-alert.tsx`
- `components/whatsapp/conversaciones-table.tsx`
- `components/whatsapp/conversacion-detail.tsx`
- `components/whatsapp/conversacion-messages.tsx`
- `lib/mock-data.ts`

### Tablas de Supabase involucradas

- `public.whatsapp_instancias`
- `public.conversaciones`
- `public.conversacion_mensajes`
- `public.leads`
- `public.empleados`

### Variables de entorno necesarias

- `EVOLUTION_API_BASE_URL`
- `EVOLUTION_API_KEY`
- `EVOLUTION_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Eventos Evolution usados

- `QRCODE_UPDATED`
- `CONNECTION_UPDATE`
- `MESSAGES_UPSERT`

### Decisiones técnicas tomadas

- Se usó `SUPABASE_SERVICE_ROLE_KEY` solamente en webhook/server actions de infraestructura, nunca en cliente.
- El webhook valida `EVOLUTION_WEBHOOK_SECRET` por query param antes de procesar cualquier payload.
- Los payloads de Evolution se normalizan de forma tolerante a variantes de versión para no depender de una única forma de respuesta.
- Los mensajes duplicados se bloquean por `external_message_id` antes de incrementar contadores o reinsertar filas.
- Los mensajes de grupo se ignoran para no contaminar la bandeja operativa comercial.
- La creación de instancias se apoya en la webhook URL pública del proyecto y en la configuración de Evolution sin exponer la API key al cliente.
- Los vendedores pueden crear y gestionar su propia instancia; los administradores ven todo y conservan la capacidad de eliminación.

### Gaps pendientes

- Envío de mensajes salientes desde la bandeja de WhatsApp.
- Resumen IA y clasificación automática avanzada de conversaciones.
- Sincronización histórica masiva de conversaciones previas.
- Adjuntos multimedia completos, audio y transcripción.
- Automatizaciones más finas sobre leads, ventas y seguimiento desde WhatsApp.

## Corrección QR Evolution: imagen escaneable

### Qué se corrigió

- Se amplió la normalización de respuestas de QR de Evolution para soportar `base64`, `qrcode`, `qr`, `code` y `pairingCode` tanto en raíz como dentro de `data`.
- Se dejó de tratar todo QR textual como estado final: si la respuesta trae imagen/base64, se renderiza como `<img>`; si trae código de vinculación, se muestra como código copiable.
- Se guardan por separado `qr_base64` y `qr_code` en Supabase para tolerar distintos formatos devueltos por Evolution.
- El webhook de `QRCODE_UPDATED` ahora persiste también `qr_base64` y `qr_expires_at` cuando vienen en la carga útil.

### Paths modificados

- `lib/evolution/client.ts`
- `lib/evolution/payload-normalizer.ts`
- `app/(dashboard)/whatsapp/actions.ts`
- `app/api/evolution/webhook/route.ts`
- `components/whatsapp/whatsapp-instance-card.tsx`
- `DOCUMENTACION.md`

### Tablas de Supabase involucradas

- `public.whatsapp_instancias`

### Decisiones técnicas tomadas

- Se agregó `extractQrFromEvolutionResponse(response)` para normalizar respuestas de Evolution sin asumir un único shape.
- Se prioriza `qr_base64` para imágenes y `qr_code` para pairing codes o textos de vinculación.
- La UI ahora muestra diagnóstico visual mínimo: `Formato: imagen` o `Formato: código`.
- El estado de `QR no disponible` solo aparece cuando no se puede derivar ni una imagen ni un código de la respuesta.

### Variables de entorno involucradas

- `EVOLUTION_API_BASE_URL`
- `EVOLUTION_API_KEY`
- `EVOLUTION_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`

## Corrección QR raw text de WhatsApp

### Qué se corrigió

- Se dejó de tratar el QR raw text de Evolution como si fuera una imagen base64.
- La UI ahora convierte el texto raw del QR en una imagen escaneable usando `qrcode` en el cliente.
- La normalización distingue explícitamente entre:
  - `qr_base64` para data URLs o base64 de imagen real
  - `qr_code` para texto raw, `pairingCode` o payload de vinculación de WhatsApp
- Se evita mostrar el contenido raw completo en pantalla.

### Paths modificados

- `package.json`
- `components/whatsapp/whatsapp-instance-card.tsx`
- `app/(dashboard)/whatsapp/actions.ts`
- `app/api/evolution/webhook/route.ts`
- `lib/evolution/client.ts`
- `lib/evolution/payload-normalizer.ts`
- `DOCUMENTACION.md`

### Dependencias agregadas

- `qrcode`
- `@types/qrcode`

### Tablas de Supabase involucradas

- `public.whatsapp_instancias`

### Decisiones técnicas tomadas

- Se usa `QRCode.toDataURL(...)` únicamente en el cliente para generar el PNG del código raw.
- La persistencia en Supabase mantiene el QR raw en `qr_code` y reserva `qr_base64` solo para imágenes reales.
- La tarjeta muestra una imagen QR escaneable, y si la generación falla, un mensaje claro para refrescar el QR.

## Corrección Evolution API: secret y hidratación WhatsApp

### Qué se corrigió

- Se endureció la validación del webhook de Evolution para aceptar el secret limpio y también variantes con sufijos de evento como `SECRET/qrcode-updated`.
- Se limpiaron caracteres invisibles problemáticos en env vars y headers para evitar errores de ByteString al construir requests hacia Evolution.
- Se corrigieron fuentes de hydration mismatch en WhatsApp relacionadas con fechas dinámicas y render del QR.
- Se incorporó soporte para almacenar y renderizar `qr_base64` además de `qr_code`, para tolerar respuestas diferentes de Evolution.

### Paths modificados

- `app/api/evolution/webhook/route.ts`
- `lib/evolution/client.ts`
- `lib/evolution/payload-normalizer.ts`
- `app/(dashboard)/whatsapp/actions.ts`
- `components/whatsapp/whatsapp-instance-card.tsx`
- `components/whatsapp/whatsapp-instances-grid.tsx`
- `components/whatsapp/conversaciones-table.tsx`
- `components/whatsapp/conversacion-messages.tsx`
- `app/(dashboard)/whatsapp/page.tsx`
- `app/(dashboard)/whatsapp/conexiones/page.tsx`

### Tablas de Supabase involucradas

- `public.whatsapp_instancias`
- `public.conversaciones`
- `public.conversacion_mensajes`
- `public.leads`
- `public.empleados`

### Variables de entorno involucradas

- `EVOLUTION_API_BASE_URL`
- `EVOLUTION_API_KEY`
- `EVOLUTION_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Decisiones técnicas tomadas

- El secret del webhook se sanitiza en ambos extremos, recortando sufijos de evento y eliminando caracteres invisibles antes de comparar.
- Los logs de seguridad muestran el secret enmascarado, nunca en texto completo.
- Las fechas visibles en la UI de WhatsApp se formatean con zona horaria explícita de Argentina para que server y client no diverjan.
- El QR de WhatsApp se normaliza para aceptar base64 crudo, data URLs y URLs remotas sin romper la UI.
- La configuración del webhook se manda desde el servidor con la secret ya codificada y sin concatenar eventos al query param.

## Resumen IA y detección de interés de compra en WhatsApp

### Qué se construyó

- Se agregó un wrapper server-side mínimo para OpenAI usando `fetch` contra la API oficial de chat completions.
- Se incorporó un flujo manual para generar resúmenes IA de conversaciones de WhatsApp desde la ficha de conversación.
- La IA devuelve resumen, interés de compra, score, intención, próximo paso y flag de atención.
- La vista de conversación ahora muestra una tarjeta ejecutiva de IA con estado, resumen y acción para regenerar.
- El listado de conversaciones expone interés IA, score y filtros para interés alto, requiere atención y sin resumen IA.
- Se completaron mocks de conversaciones para mostrar estados de IA procesado, pendiente y error.

### Paths modificados

- `.env.example`
- `lib/ai/openai.ts`
- `lib/ai/conversation-summary.ts`
- `app/(dashboard)/whatsapp/actions.ts`
- `app/(dashboard)/whatsapp/page.tsx`
- `app/(dashboard)/whatsapp/[id]/page.tsx`
- `components/whatsapp/conversacion-detail.tsx`
- `components/whatsapp/conversaciones-table.tsx`
- `components/whatsapp/conversacion-interest-badge.tsx`
- `components/whatsapp/ai-summary-card.tsx`
- `lib/mock-data.ts`
- `DOCUMENTACION.md`

### Tablas de Supabase involucradas

- `public.conversaciones`
- `public.conversacion_mensajes`
- `public.leads`
- `public.empleados`

### Variables de entorno necesarias

- `OPENAI_API_KEY`
- `OPENAI_MODEL`

### Decisiones técnicas tomadas

- La generación IA es manual para evitar consumo innecesario y poder revisar el resultado antes de persistirlo.
- Si OpenAI no está configurado o falla la llamada, el sistema devuelve un error visible y marca la conversación con estado IA de error.
- Si OpenAI responde pero el JSON viene mal formado, se usa un fallback seguro para no bloquear la operación comercial.
- El lead sólo se refuerza cuando el interés detectado es alto, elevando su nivel de interés sin pisar notas ni otros datos sensibles.
- El listado de WhatsApp sigue siendo compatible con los campos legacy `resumen_ia` e `interes_compra`, pero prioriza los campos `ia_*` para la propuesta comercial.

## Catálogo online público sincronizado con inventario

### Qué se construyó

- Se creó la ruta pública `/catalogo` sin layout privado ni autenticación.
- El catálogo público lee `catalogo_config` para activar/desactivar el sitio y controlar la presentación.
- Se implementó listado público de vehículos publicados y en stock con orden por destacados, orden catálogo y fecha de alta.
- Se construyó la ruta pública de detalle `/catalogo/[id]` con galería simple, ficha técnica, precios visibles según configuración y CTA a WhatsApp.
- Se agregaron componentes públicos especializados para header, filtros, grilla, card, detalle y empty state.
- Se mantuvo la configuración interna del catálogo en `/dashboard/catalogo` para evitar conflicto de rutas con el sitio público.

### Paths modificados

- `app/catalogo/page.tsx`
- `app/catalogo/[id]/page.tsx`
- `components/catalogo-publico/catalogo-header.tsx`
- `components/catalogo-publico/catalogo-filters.tsx`
- `components/catalogo-publico/catalogo-vehicle-card.tsx`
- `components/catalogo-publico/catalogo-vehicle-grid.tsx`
- `components/catalogo-publico/catalogo-vehicle-detail.tsx`
- `components/catalogo-publico/catalogo-empty-state.tsx`
- `app/(dashboard)/dashboard/catalogo/page.tsx`
- `components/catalogo/catalogo-settings-form.tsx`
- `components/catalogo/catalogo-vehiculos-table.tsx`
- `components/dashboard/sidebar.tsx`
- `lib/mock-data.ts`
- `DOCUMENTACION.md`

### Tablas de Supabase involucradas

- `public.catalogo_config`
- `public.vehiculos`

### Decisiones técnicas tomadas

- La ruta pública se separó completamente del panel privado para evitar que el catálogo dependa del layout autenticado.
- Se resolvió el conflicto de rutas moviendo la vista interna de configuración a `/dashboard/catalogo` y dejando `/catalogo` como sitio público.
- El catálogo público sólo expone campos aptos para clientes finales y no incluye costos, gastos, proveedores ni datos internos operativos.
- Se agregó soporte para mostrar precios, km y dominio según la configuración global del catálogo.
- Cuando el catálogo está desactivado, se muestra una pantalla pública prolija en lugar de error o redirección.
- El CTA de WhatsApp normaliza el teléfono antes de construir el link `wa.me`.

## Dashboard ejecutivo y P&L financiero

### Qué se construyó

- Se rediseñó el dashboard para que tenga más jerarquía visual, menos monotonía y una lectura ejecutiva más clara.
- Se agregaron componentes de visualización simples sin dependencias externas: barra horizontal, donut CSS, bloque de gráficos mensuales y tarjeta contenedora para charts.
- Se incorporó un bloque de P&L mensual y acumulado con series de 12 meses, separadas por moneda.
- Se amplió el inventario con distribución visual, preparación, unidades sin precio y publicaciones sin foto.
- Se reforzó el panel comercial con embudo, señales de compra y estado de conversaciones.
- Se agregó un panel de actividad por vendedor para ver leads, ventas, chats, alertas y comisiones.
- Se reestructuraron las alertas para darles más presencia y clasificación por severidad.
- Se extendieron las métricas para tolerar arrays vacíos, nulls y consultas parciales en modo real.

### Paths modificados

- `app/(dashboard)/dashboard/page.tsx`
- `lib/dashboard-metrics.ts`
- `components/dashboard/kpi-card.tsx`
- `components/dashboard/pnl-summary.tsx`
- `components/dashboard/inventory-summary.tsx`
- `components/dashboard/commercial-summary.tsx`
- `components/dashboard/operations-summary.tsx`
- `components/dashboard/dashboard-alerts.tsx`
- `components/dashboard/dashboard-chart-card.tsx`
- `components/dashboard/simple-bar-chart.tsx`
- `components/dashboard/simple-donut-chart.tsx`
- `components/dashboard/monthly-pnl-chart.tsx`
- `components/dashboard/vendor-activity-summary.tsx`
- `lib/mock-data.ts`
- `DOCUMENTACION.md`

### Tablas de Supabase involucradas

- `public.vehiculos`
- `public.ventas`
- `public.ventas_pagos`
- `public.ventas_entregas`
- `public.vehiculo_gastos`
- `public.compras_vehiculos`
- `public.caja_movimientos`
- `public.comisiones`
- `public.comision_liquidaciones`
- `public.leads`
- `public.empleados`
- `public.gestoria_tramites`
- `public.gestoria_presupuestos`
- `public.whatsapp_instancias`
- `public.conversaciones`

### Decisiones técnicas tomadas

- El dashboard usa datos reales o mocks con la misma forma para evitar ramas visuales distintas entre demo y producción.
- Las queries son tolerantes: si una tabla falla o devuelve vacío, el panel sigue renderizando con fallbacks seguros.
- No se instalaron librerías de gráficos; todo se resolvió con CSS, `conic-gradient` y barras flexibles.
- Los importes se muestran separados por moneda para no mezclar ARS y USD.
- El P&L usa ingresos por ventas y caja, menos compras, comisiones y gastos operativos, manteniendo el criterio de “sin conversión”.
- La actividad por vendedor se calcula a partir de leads, ventas, conversaciones y comisiones para reflejar trabajo comercial real.

## Alertas y recordatorios automáticos

### Qué se construyó

- Se creó el módulo `/recordatorios` para administrar seguimientos operativos, vencimientos y tareas manuales.
- Se implementaron acciones server-side para crear, completar, posponer y cancelar recordatorios.
- Se agregaron badges de estado, prioridad y tipo para visualizar el tipo de alerta de forma compacta.
- Se incorporó el nuevo acceso `Recordatorios` en la sidebar cerca de CRM y Gestoría.
- El dashboard ahora consume recordatorios persistidos y genera alertas computadas a partir de CRM, WhatsApp, Gestoría, entregas, comisiones e inventario.
- Se agregaron mocks demo para que el dashboard y la nueva pantalla se vean poblados sin Supabase real.

### Paths modificados

- `app/(dashboard)/recordatorios/page.tsx`
- `app/(dashboard)/recordatorios/actions.ts`
- `components/recordatorios/recordatorios-table.tsx`
- `components/recordatorios/recordatorio-form.tsx`
- `components/recordatorios/recordatorio-status-badge.tsx`
- `components/recordatorios/recordatorio-priority-badge.tsx`
- `components/recordatorios/recordatorio-type-badge.tsx`
- `components/dashboard/sidebar.tsx`
- `app/(dashboard)/dashboard/page.tsx`
- `components/dashboard/dashboard-alerts.tsx`
- `lib/dashboard-metrics.ts`
- `lib/mock-data.ts`
- `DOCUMENTACION.md`

### Tablas de Supabase involucradas

- `public.recordatorios`
- `public.leads`
- `public.conversaciones`
- `public.ventas`
- `public.ventas_entregas`
- `public.gestoria_tramites`
- `public.vehiculos`
- `public.comision_liquidaciones`
- `public.empleados`

### Decisiones técnicas tomadas

- Los recordatorios se resolvieron como una pantalla server-rendered con filtros client-side y acciones de estado simples, sin cron jobs ni notificaciones externas.
- La creación de recordatorios asigna por defecto al usuario actual, y la UI limita los asignados cuando el usuario no es admin.
- El dashboard no persiste alertas computadas: las calcula en tiempo real a partir de datos operativos y de recordatorios.
- Las alertas del dashboard ahora muestran la fuente de origen para distinguir rápido si vienen de recordatorios, CRM, WhatsApp, Gestoría, comisiones o inventario.
- Se priorizan las alertas críticas y vencidas antes que las advertencias y los recordatorios próximos.
- Todo el flujo quedó compatible con modo demo usando mocks centralizados en `lib/mock-data.ts`.

## Gestión de documentos por vehículo

### Qué se construyó

- Se creó la ficha detallada de vehículo en `/inventario/[id]` con resumen operativo, pricing, estado de preparación y accesos rápidos.
- Se implementó la gestión de `vehiculo_documentos` con alta, cambio de estado, eliminación y apertura segura mediante signed URLs.
- Se agregó soporte para adjuntar archivos privados al bucket `vehiculo-documentos` y abrirlos de forma temporal sin exponer URLs públicas.
- El inventario ahora ofrece acciones directas de `Ver` y `Editar` desde la tabla principal.
- El dashboard incorporó alertas documentales: vencidos, próximos a vencer y vehículos con documentación clave faltante.
- Se cargaron mocks demo para que la nueva ficha y las alertas se vean pobladas sin depender de Supabase real.

### Paths modificados

- `app/(dashboard)/inventario/[id]/page.tsx`
- `app/(dashboard)/inventario/[id]/documentos/actions.ts`
- `components/inventario/vehiculo-detail.tsx`
- `components/inventario/vehiculo-documentos-table.tsx`
- `components/inventario/vehiculo-documento-form.tsx`
- `components/inventario/vehiculo-documento-status-badge.tsx`
- `components/inventario/vehiculo-documento-type-badge.tsx`
- `components/inventario/inventario-table.tsx`
- `components/dashboard/dashboard-alerts.tsx`
- `lib/dashboard-metrics.ts`
- `lib/mock-data.ts`
- `DOCUMENTACION.md`

### Tablas y bucket involucrados

- `public.vehiculo_documentos`
- `public.vehiculos`
- `public.gestoria_tramites`
- `public.ventas`
- `public.compras_vehiculos`
- `public.empleados`
- Bucket privado de Storage `vehiculo-documentos`

### Decisiones técnicas tomadas

- Los archivos de vehículos se guardan en Storage privado y siempre se abren con signed URLs de corta duración.
- La UI de documentos quedó restringida por rol: admin y gestor pueden crear/editar, admin puede eliminar.
- La lógica de acciones valida sesión y perfil operativo antes de tocar documentos, pero no depende de rutas públicas ni de catálogo.
- El dashboard no persiste alertas documentales; las calcula a partir del inventario y del estado de cada documento.
- La pantalla de detalle del vehículo combina ficha interna + documentos para reemplazar la navegación dispersa entre inventario, gestoría y ventas.
- La build del proyecto se validó con `pnpm build` después de aplicar estos cambios.

## Endurecimiento de permisos por rol

### Qué se corrigió

- Se centralizaron helpers de permisos en `lib/auth/permissions.ts` para decidir acceso a rutas, navegación y acciones por rol.
- El layout privado ahora valida sesión, estado activo del empleado y ruta permitida antes de renderizar el dashboard.
- El middleware refuerza el acceso a rutas protegidas y redirige a `/dashboard` o `/login` según corresponda.
- El sidebar y el menú de usuario se adaptaron para mostrar labels y navegación según el rol efectivo.
- Se blindaron Server Actions de inventario, ventas, caja, CRM, gestoría y WhatsApp con validación explícita de rol activo antes de escribir.
- Se limitaron acciones visibles en inventario y ventas para que vendedores y gestores vean solo lo que pueden usar.

### Paths modificados

- `lib/auth/permissions.ts`
- `app/(dashboard)/layout.tsx`
- `middleware.ts`
- `components/dashboard/sidebar.tsx`
- `components/dashboard/user-menu.tsx`
- `app/(dashboard)/inventario/page.tsx`
- `components/inventario/inventario-table.tsx`
- `components/inventario/vehiculo-detail.tsx`
- `app/(dashboard)/inventario/actions.ts`
- `app/(dashboard)/ventas/page.tsx`
- `app/(dashboard)/ventas/actions.ts`
- `app/(dashboard)/caja/actions.ts`
- `app/(dashboard)/crm/actions.ts`
- `app/(dashboard)/gestoria/actions.ts`
- `app/(dashboard)/catalogo/actions.ts`
- `app/(dashboard)/whatsapp/actions.ts`
- `app/(dashboard)/empleados/actions.ts`
- `app/(dashboard)/configuracion/actions.ts`
- `app/(dashboard)/recordatorios/actions.ts`
- `app/(dashboard)/inventario/[id]/documentos/actions.ts`

### Tablas de Supabase involucradas

- `public.empleados`
- `public.vehiculos`
- `public.ventas`
- `public.caja_movimientos`
- `public.leads`
- `public.gestoria_tramites`
- `public.comisiones`
- `public.whatsapp_instancias`
- `public.recordatorios`
- `public.vehiculo_documentos`

### Decisiones técnicas relevantes

- La autorización se valida en tres capas: middleware, layout privado y Server Actions, para no depender solo de ocultar botones.
- Admin conserva acceso total; vendedor queda limitado a ventas, CRM, WhatsApp propio, recordatorios y lectura operativa; gestor queda enfocado en inventario, caja, gestoria y cargas operativas.
- Las rutas privadas se bloquean por path efectivo y no solo por menú visible.
- Los componentes visuales ahora ocultan acciones prohibidas, pero la seguridad real sigue estando en el backend.
- La lógica se mantuvo compatible con modo demo y sin cambiar el esquema de base de datos.

## QA Producción

### Qué se revisó

- Se validó el build de producción con `npm run build`.
- Se chequeó el arranque en runtime con `next start` sobre un build limpio.
- Se recorrieron rutas clave de autenticación, inventario, compras, ventas, caja, comisiones, CRM, gestoría, catálogo, WhatsApp, empleados, configuración y recordatorios.
- Se verificó explícitamente que el catálogo público no quedara atrapado por el middleware de rutas privadas.

### Paths modificados

- `middleware.ts`
- `DOCUMENTACION.md`

### Tablas de Supabase involucradas

- No se tocó el esquema ni se agregaron tablas nuevas en esta QA.
- Se reutilizaron las tablas ya presentes en el sistema para validar navegación y permisos.

### Errores encontrados y corregidos

- El catálogo público `/catalogo` estaba siendo tratado como ruta protegida y redirigía a `/login`. Se corrigió removiéndolo del matcher de middleware privado y dejando solo `/dashboard/catalogo` como ruta administrativa.
- Se validó que `/login` responda 200 y que las rutas privadas redirijan correctamente a `/login` cuando no hay sesión.

### Errores pendientes

- No quedaron errores bloqueantes detectados en la build de producción.
- Las rutas privadas sin sesión redirigen correctamente; las rutas públicas críticas funcionan sin requerir login.

### Decisiones técnicas

- La QA se validó sobre un build limpio para evitar artefactos `.next` obsoletos.
- Se mantuvo la separación entre catálogo público (`/catalogo`) y catálogo administrativo (`/dashboard/catalogo`).
- No se agregaron dependencias ni se hicieron cambios de esquema para esta etapa de estabilización.

## Optimización de performance

### Qué se optimizó

- Se acotaron queries en las rutas principales para evitar traer históricos completos cuando no son necesarios.
- Se limitaron los resultados iniciales en listados grandes y se agregó un aviso de “Mostrando los primeros 200 resultados” en tablas con filtros client-side.
- Se redujo trabajo innecesario en el dashboard quitando consultas que no se usaban y limitando el tamaño de cada bloque de datos.
- Se mejoró la percepción de carga agregando `loading.tsx` con skeletons livianos en las rutas más usadas.
- Se paralelizaron fetches donde había dependencias evitables y se simplificaron algunas consultas Supabase con columnas más acotadas.

### Paths modificados

- `app/(dashboard)/dashboard/page.tsx`
- `app/(dashboard)/dashboard/catalogo/page.tsx`
- `app/(dashboard)/dashboard/loading.tsx`
- `app/(dashboard)/inventario/page.tsx`
- `app/(dashboard)/inventario/loading.tsx`
- `app/(dashboard)/compras/page.tsx`
- `app/(dashboard)/compras/loading.tsx`
- `app/(dashboard)/ventas/page.tsx`
- `app/(dashboard)/ventas/loading.tsx`
- `app/(dashboard)/ventas/renta/page.tsx`
- `app/(dashboard)/ventas/renta/loading.tsx`
- `app/(dashboard)/ventas/pendientes-entrega/page.tsx`
- `app/(dashboard)/ventas/pendientes-entrega/loading.tsx`
- `app/(dashboard)/caja/page.tsx`
- `app/(dashboard)/caja/loading.tsx`
- `app/(dashboard)/crm/page.tsx`
- `app/(dashboard)/crm/loading.tsx`
- `app/(dashboard)/whatsapp/page.tsx`
- `app/(dashboard)/whatsapp/conexiones/page.tsx`
- `app/(dashboard)/whatsapp/loading.tsx`
- `app/(dashboard)/gestoria/page.tsx`
- `app/(dashboard)/gestoria/loading.tsx`
- `app/(dashboard)/comisiones/page.tsx`
- `app/(dashboard)/comisiones/loading.tsx`
- `app/(dashboard)/recordatorios/page.tsx`
- `app/(dashboard)/recordatorios/loading.tsx`
- `app/catalogo/page.tsx`
- `app/catalogo/loading.tsx`
- `app/catalogo/[id]/loading.tsx`
- `components/shared/page-loading-skeleton.tsx`
- `components/inventario/inventario-table.tsx`
- `components/compras/compras-table.tsx`
- `components/ventas/ventas-table.tsx`
- `components/ventas/renta-table.tsx`
- `components/ventas/pendientes-entrega-table.tsx`
- `components/caja/caja-movimientos-table.tsx`
- `components/crm/leads-table.tsx`
- `components/whatsapp/conversaciones-table.tsx`
- `components/gestoria/gestoria-table.tsx`
- `components/gestoria/presupuestos-table.tsx`
- `components/inventario/vehiculo-documentos-table.tsx`
- `components/recordatorios/recordatorios-table.tsx`

### Tablas de Supabase involucradas

- `public.vehiculos`
- `public.compras_vehiculos`
- `public.ventas`
- `public.ventas_pagos`
- `public.ventas_entregas`
- `public.vehiculo_gastos`
- `public.caja_movimientos`
- `public.leads`
- `public.gestoria_tramites`
- `public.gestoria_presupuestos`
- `public.comisiones`
- `public.comision_liquidaciones`
- `public.whatsapp_instancias`
- `public.conversaciones`
- `public.recordatorios`
- `public.vehiculo_documentos`

### Decisiones técnicas tomadas

- Se priorizó bajar el volumen de datos antes que introducir caching agresivo para no alterar la lógica de negocio.
- Los listados client-side siguen siendo filtrables, pero ahora renderizan como máximo 200 filas visibles por pantalla.
- Los loading states se implementaron con un componente compartido para evitar duplicación y mantener consistencia visual.
- Se mantuvo el modo demo sin tocar la capa de datos reales.
- No se agregaron dependencias ni se hicieron cambios de schema.

### Pendientes de performance

- Si en producción siguen apareciendo rutas lentas con volúmenes grandes, el siguiente paso debería ser paginación real o virtualización en las tablas más densas.
- También convendría evaluar invalidación selectiva por módulo cuando haya más actividad concurrente, para reducir revalidaciones innecesarias.

## UX/UI Polish

### Qué se mejoró

- Se unificó la navegación lateral con agrupación visual por área funcional y estados activos más claros.
- Se mejoró el menú de usuario con un panel más limpio, badge de rol y una jerarquía visual más premium.
- Se refinó la tarjeta de KPI para que tenga mejor presencia, contraste y una acentuación más consistente por estado.
- Se sumó una capa global de estilo en `app/globals.css` para suavizar scrollbars, selección de texto, antialiasing y foco visible.
- Se estandarizó la cabecera de varias pantallas clave con el componente compartido `PageHeader`.
- Se ajustaron los encabezados de `Dashboard`, `Inventario`, `Ventas` y `WhatsApp` para que el CTA principal se vea más consistente.

### Paths modificados

- `components/dashboard/sidebar.tsx`
- `components/dashboard/user-menu.tsx`
- `components/dashboard/kpi-card.tsx`
- `components/shared/page-header.tsx`
- `components/shared/empty-state-card.tsx`
- `app/globals.css`
- `app/(dashboard)/dashboard/page.tsx`
- `app/(dashboard)/inventario/page.tsx`
- `app/(dashboard)/ventas/page.tsx`
- `app/(dashboard)/whatsapp/page.tsx`

### Decisiones visuales tomadas

- Se mantuvo light mode únicamente, con blancos limpios y bordes suaves.
- Se evitó introducir animaciones pesadas o nuevos paquetes de UI.
- Se priorizó consistencia de shell, navegación y encabezados antes que un rediseño total de cada módulo.
- Se conservaron las acciones y permisos existentes sin tocar la lógica de negocio.

### Pendientes

- Todavía quedan pantallas secundarias con headers manuales que podrían migrarse gradualmente al componente compartido.
- Si el equipo quiere unificar aún más la experiencia, el siguiente paso natural es aplicar el mismo patrón de `PageHeader` y `EmptyStateCard` al resto de rutas del dashboard.

## Corrección WhatsApp

### Qué se corrigió

- Se corrigió la persistencia real de mensajes del webhook de Evolution.
- Antes se actualizaba `conversaciones.mensajes_count` y `last_message_preview`, pero no se estaba garantizando la inserción de filas reales en `conversacion_mensajes`.
- Se reemplazó el flujo dependiente de `upsert` por un insert controlado con verificación explícita de duplicados.
- Se alineó la vista de detalle de WhatsApp con las columnas reales de `conversacion_mensajes`.

### Paths modificados

- `app/api/evolution/webhook/route.ts`
- `lib/evolution/payload-normalizer.ts`
- `lib/whatsapp/conversations.ts`
- `app/(dashboard)/whatsapp/[id]/page.tsx`
- `components/whatsapp/conversacion-messages.tsx`
- `app/(dashboard)/whatsapp/actions.ts`

### Tablas de Supabase involucradas

- `public.whatsapp_instancias`
- `public.conversaciones`
- `public.conversacion_mensajes`
- `public.leads`

### Resultado esperado del test WhatsApp

- Al recibir un nuevo mensaje entrante real de Evolution:
  - se crea o reutiliza la conversación,
  - se inserta una fila nueva en `conversacion_mensajes`,
  - se incrementa `mensajes_count`,
  - se actualiza `last_message_preview`,
  - y el detalle `/whatsapp/[id]` muestra el mensaje en orden cronológico.

### Errores pendientes

- Si Evolution manda mensajes sin `external_message_id`, se usa un identificador fallback estable para mantener idempotencia.
- Si Supabase devuelve error de inserción por RLS o schema, el webhook ahora lo loguea y responde 500 para que se detecte rápido en Vercel.

## Corrección UX/UI auditoría externa

### Qué se corrigió

- Se renombró la vista de `/ventas/renta` a `Rentabilidad` en títulos, textos visibles y CTA relacionados, manteniendo la ruta existente.
- Se corrigió el layout de filtros en `Rentabilidad` y `Recordatorios` para que el encabezado ocupe el ancho completo y los controles hagan wrap sin desbordes.
- Se eliminó texto técnico visible en WhatsApp: `instance_name` dejó de mostrarse al usuario final en la lista, el detalle y las tarjetas de instancia.
- Se reemplazó el copy técnico de WhatsApp en español, incluyendo el estado de no leídos.
- Se corrigió el superpuesto del botón de IA en el detalle de conversación con ajustes de `flex-wrap` y `shrink-0`.
- Se arregló el formatter de moneda del CRM para evitar duplicación de prefijos como `USUS$`.
- Se reemplazó el copy técnico de Empleados por una descripción de negocio.
- Se quitó el texto duplicado de Configuración y se dejó la automatización de catálogo marcada como `Próximamente`.
- Se agregó el acceso visible a `Liquidaciones` en el módulo de Comisiones.
- Se ajustó el label de la acción de ventas a `Rentabilidad` para alinear la nomenclatura visible.

### Paths modificados

- `app/(dashboard)/ventas/renta/page.tsx`
- `components/ventas/renta-table.tsx`
- `components/ventas/ventas-table.tsx`
- `components/recordatorios/recordatorios-table.tsx`
- `components/whatsapp/conversacion-detail.tsx`
- `components/whatsapp/conversaciones-table.tsx`
- `components/whatsapp/whatsapp-instance-card.tsx`
- `components/whatsapp/ai-summary-card.tsx`
- `app/(dashboard)/whatsapp/[id]/page.tsx`
- `app/(dashboard)/crm/page.tsx`
- `app/(dashboard)/empleados/page.tsx`
- `app/(dashboard)/configuracion/page.tsx`
- `components/configuracion/configuracion-general-form.tsx`
- `app/(dashboard)/comisiones/page.tsx`
- `app/(dashboard)/ventas/page.tsx`

### Tablas de Supabase involucradas

- `public.conversaciones`
- `public.conversacion_mensajes`
- `public.comisiones`
- `public.empleados`
- `public.configuracion_general`
- `public.recordatorios`
- `public.ventas`

### Decisiones técnicas tomadas

- Se mantuvo la lógica de negocio intacta y se limitaron los cambios a copy, labels y wrappers de layout.
- Se evitó rediseñar la experiencia completa de WhatsApp y se corrigieron solo los puntos que rompían percepción de calidad.
- Se priorizó un patrón de encabezado con flex-wrap para evitar que los filtros se compriman en pantallas medias.
- Se mantuvieron los permisos y las rutas existentes sin modificar navegación estructural.

### Validación

- `npm run build` ejecutado al cierre de la corrección de UX/UI.
- No quedaron errores de build al momento de generar esta documentación.

## Simplificación del Dashboard ejecutivo

### Qué se simplificó

- Se reordenó `/dashboard` para que la lectura inicial sea más clara:
  1. header ejecutivo,
  2. bloque de alertas prioritarias,
  3. 4 KPIs principales,
  4. bloque principal de resultado del mes,
  5. operación comercial,
  6. inventario y operaciones,
  7. actividad de vendedores en un nivel más secundario.
- Se eliminó el bloque financiero duplicado que quedaba al final de la página.
- Se redujo la cantidad de alertas visibles a un máximo de 4 para evitar ruido.
- Se quitó el KPI de alertas del bloque superior para dejar exactamente 4 métricas ejecutivas.
- Se recortó el copy redundante y se bajó la dominancia visual de los bloques menos críticos.

### Paths modificados

- `app/(dashboard)/dashboard/page.tsx`
- `lib/dashboard-metrics.ts`
- `components/dashboard/pnl-summary.tsx`
- `components/dashboard/inventory-summary.tsx`
- `components/dashboard/commercial-summary.tsx`
- `components/dashboard/operations-summary.tsx`
- `components/dashboard/dashboard-alerts.tsx`
- `components/dashboard/vendor-activity-summary.tsx`
- `components/dashboard/monthly-pnl-chart.tsx`

### Tablas de Supabase involucradas

- `public.vehiculos`
- `public.ventas`
- `public.ventas_entregas`
- `public.vehiculo_gastos`
- `public.vehiculo_documentos`
- `public.compras_vehiculos`
- `public.caja_movimientos`
- `public.comisiones`
- `public.comision_liquidaciones`
- `public.leads`
- `public.empleados`
- `public.gestoria_tramites`
- `public.gestoria_presupuestos`
- `public.whatsapp_instancias`
- `public.conversaciones`
- `public.recordatorios`

### Decisiones técnicas relevantes

- Se mantuvo la misma lógica de datos y solo se recortó presentación/jerarquía.
- Se conservaron las consultas ya existentes para no introducir riesgo en producción.
- El bloque principal financiero quedó como una sola sección clara, con gráfico compacto embebido.
- Las alertas visibles se limitaron a las prioritarias para mejorar escaneo visual.

### Validación

- `npm run build` ejecutado luego del ajuste de jerarquía del dashboard.
- Build finalizado correctamente sin errores.

## Gráfico histórico de vendedores en Comisiones

### Qué se construyó
- Se agregó una comparativa lineal de los últimos 12 meses por vendedor.
- La visualización permite alternar entre monto vendido, unidades vendidas y comisión generada.
- Para importes se puede seleccionar ARS o USD sin convertir monedas.
- Al pasar el mouse por un mes se muestra el detalle de cada vendedor activo en ese período.

### Paths creados o modificados
- `components/comisiones/comisiones-vendedores-chart.tsx`
- `app/(dashboard)/comisiones/page.tsx`
- `DOCUMENTACION.md`

### Tablas de Supabase involucradas
- `comisiones`
- `ventas`
- `empleados`

### Decisiones técnicas
- El gráfico usa SVG y CSS propios, sin agregar dependencias de visualización.
- Las unidades se deduplican por venta y vendedor para evitar contar dos veces una operación.
- Las métricas monetarias se agrupan por moneda y se muestran separadas.

### Validación
- `npm run build` ejecutado correctamente.

## Compactación de cards de Gestoría

### Qué se mejoró
- Presupuesto y costo final ahora se muestran uno debajo del otro para aprovechar mejor el ancho de cada card.
- Se retiraron de la edición inline los controles redundantes de etapa, estado, gestor, tipo de gestión y fechas operativas.
- Se mantuvieron los hitos documentales y el costo final como acciones principales de la card.

### Paths modificados
- `components/gestoria/gestoria-kanban.tsx`
- `DOCUMENTACION.md`

### Decisiones técnicas
- Los valores retirados de la interfaz se envían como campos ocultos con su valor actual para conservar el comportamiento del Server Action y evitar sobrescrituras accidentales.

### Validación
- `npm run build` ejecutado correctamente.

## Paginación progresiva de columnas de Gestoría

### Qué se mejoró
- Las columnas del tablero de Gestoría muestran 20 operaciones inicialmente.
- Se reemplazó la navegación numerada por un botón `Ver más` al pie de cada columna.
- Cada click agrega 20 operaciones sin mover al usuario ni aumentar el alto de la sección con controles de paginación.

### Paths modificados
- `components/gestoria/gestoria-kanban.tsx`
- `DOCUMENTACION.md`

### Decisiones técnicas
- La paginación se mantiene local por columna y respeta los filtros activos.
- El scroll continúa limitado al contenido interno de cada columna.

### Validación
- `npm run build` ejecutado correctamente.

## Clasificación masiva de leads con IA

### Qué se construyó

- Se agregó la acción manual `Analizar nuevos con IA` en el pipeline de CRM.
- La acción procesa únicamente leads en estado `nuevo`, en lotes de hasta 25 registros.
- El análisis considera la actividad de WhatsApp, si el vendedor respondió, el vehículo de interés y señales comerciales como precio, financiación, permuta, reserva o visita.
- Los leads se pueden mover a `Contactado`, `Interesado`, `Negociación` o `Reservado`; si no hay evidencia suficiente permanecen en `Nuevo`.

### Paths modificados

- `app/(dashboard)/crm/actions.ts`
- `app/(dashboard)/crm/page.tsx`
- `components/crm/crm-views.tsx`
- `components/crm/analyze-new-leads-button.tsx`
- `lib/ai/lead-pipeline-classifier.ts`

### Tablas involucradas

- `public.leads`
- `public.conversaciones`
- `public.conversacion_mensajes`
- `public.vehiculos`
- `public.empleados`

### Decisiones técnicas

- La ejecución es manual para evitar consumo automático de OpenAI y permitir que el equipo decida cuándo ordenar el pipeline.
- Se usa una llamada por lote, no una llamada por lead.
- La actualización modifica solamente `estado` y `updated_by`; no pisa asignaciones, notas, presupuesto ni vehículo de interés.
- Los resultados inválidos de la IA no se aplican. Si OpenAI no está configurado o falla, la acción devuelve un error visible y no actualiza el lote.

### Validación

- `npm run build` ejecutado correctamente.

## Ajuste de scroll en CRM

- La vista de columnas ahora distribuye las etapas dentro del ancho disponible, sin scroll horizontal del bloque general.
- Cada columna mantiene su propio scroll vertical para recorrer los leads sin mover toda la sección.
- La vista de tabla limita el scroll al listado y mantiene la toolbar y el encabezado de columnas visibles.

## Oportunidades potenciales en Comisiones

### Qué se construyó

- La comparativa comercial de `/comisiones` ahora permite expandir cada vendedor con una flecha.
- La expansión muestra leads activos con vehículo de interés asignado, origen, estado, vehículo, valor estimado de venta y comisión potencial.
- Se separó visualmente lo efectivamente vendido y comisionado de las oportunidades todavía abiertas.

### Paths modificados

- `app/(dashboard)/comisiones/page.tsx`
- `components/comisiones/comisiones-comparativa.tsx`

### Tablas involucradas

- `public.comisiones`
- `public.leads`
- `public.vehiculos`
- `public.empleados`

### Decisiones técnicas

- Se consideran oportunidades activas en estados `nuevo`, `contactado`, `interesado`, `negociacion` y `reservado` que tengan vehículo de interés.
- La comisión potencial se estima con el precio de venta del vehículo y el porcentaje por defecto del vendedor; si falta alguno de esos datos se muestra `A confirmar`.
- Las oportunidades no modifican comisiones ni ventas reales y no se mezclan con los KPIs históricos.

## Polish visual de Recordatorios

Se compactó la pantalla de Recordatorios para alinearla con el lenguaje visual de la plataforma. Los KPIs ahora tienen menor altura y una intensidad más equilibrada, mientras que la alerta de alta prioridad usa un tono ámbar en lugar de ocupar toda la atención con un bloque bordó.

El alta de recordatorios pasó a integrarse en la misma toolbar que la búsqueda y los filtros. El formulario se simplificó dentro del modal, eliminando el borde y el título duplicados que generaban una tarjeta dentro de otra. Se mantuvieron la paginación, los filtros y las acciones operativas existentes.

### Paths modificados

- `app/(dashboard)/recordatorios/page.tsx`
- `components/recordatorios/recordatorios-table.tsx`
- `components/recordatorios/recordatorio-form.tsx`
- `components/dashboard/kpi-card.tsx`

### Validación

- `npm run build` ejecutado correctamente.

## Polish visual de Gestoría

Se reorganizó el tablero principal de Gestoría para evitar la sensación de tarjetas anidadas. Las etapas Presupuesto, Escribanía, Gestoría y Terminado ahora se presentan como columnas independientes, con altura estable y scroll interno para recorrer sus operaciones sin desplazar toda la pantalla.

La búsqueda se mantiene visible y los filtros de gestor, tipo de gestión y presupuesto pendiente quedaron agrupados en el botón de filtros. La paginación por etapa se ajustó a 20 trámites. Los hitos de CAT, documentación, escribanía y transferencias dejaron de usar desplegables: ahora se alternan directamente entre pendiente y completado desde un círculo clickeable. Se retiró la edición de notas del tablero; las notas existentes se conservan si se actualiza una operación desde esta vista.

### Paths modificados

- `components/gestoria/gestoria-kanban.tsx`
- `app/(dashboard)/gestoria/actions.ts`

### Tablas involucradas

- `public.gestoria_tramites`
- `public.gestoria_presupuestos`
- `public.empleados`

### Validación

- `npm run build` ejecutado correctamente.

## Comparativa comercial de Comisiones

Se mejoró la comparativa comercial para que la lectura por vendedor sea más clara y útil para dirección. Cada vendedor ahora muestra en paralelo el volumen vendido y la comisión generada, con barras independientes, importes por moneda y una tasa efectiva cuando los valores están expresados en la misma moneda.

También se redujo el texto repetido, se eliminaron etiquetas en mayúsculas innecesarias y se reorganizó cada vendedor en una tarjeta más aireada, con jerarquía clara entre nombre, unidades, ventas y comisión. No se modificaron las consultas ni las reglas de cálculo existentes.

### Paths modificados

- `components/comisiones/comisiones-comparativa.tsx`

### Tablas involucradas

- `public.comisiones`
- `public.ventas`
- `public.empleados`

### Validación

- `npm run build` ejecutado correctamente.

## Tarjeta de vehículo de interés en CRM

### Qué se mejoró

- En la vista de tabla del CRM, el vehículo de interés ahora se muestra como una tarjeta compacta e interactiva.
- La tarjeta incluye miniatura cuando el vehículo tiene fotos, marca/modelo, versión, año y dominio.
- Al seleccionarla, se abre un modal con la foto, precio comercial, color, kilómetros, dominio y lead asociado.
- Si la unidad no tiene foto, se muestra un placeholder sobrio sin romper la tabla.

### Paths modificados

- `app/(dashboard)/crm/page.tsx`
- `components/crm/leads-table.tsx`

### Tablas de Supabase involucradas

- `public.leads`
- `public.vehiculos`

### Decisiones técnicas

- Se reutilizó `DataEntryModal`, que ya soporta cierre con clic fuera y tecla Escape.
- Se agregaron a la relación del vehículo únicamente los datos necesarios para la tarjeta y el detalle visual.
- No se modificó la lógica de leads, filtros, paginación ni navegación al detalle del lead.

### Validación

- `npm run build` ejecutado y finalizado correctamente sin errores.

## Filtro global por período

### Qué se construyó

- Se agregó un selector de período reutilizable en el header de la plataforma privada.
- Permite ver todo el período, el mes actual, el mes anterior o definir un rango personalizado desde/hasta.
- El período seleccionado se guarda en la URL mediante `from` y `to`, por lo que se puede recargar o compartir la vista filtrada.
- El filtro se aplica a los datos operativos de Dashboard, Inventario, Compras, Ventas, Rentabilidad, Caja, CRM, Gestoría, Presupuestos, Recordatorios, Comisiones, Liquidaciones, WhatsApp, Catálogo interno, Entregas y Empleados.

### Paths creados/modificados

- `lib/date-range.ts`
- `components/dashboard/period-filter.tsx`
- `components/dashboard/breadcrumb-header.tsx`
- `app/(dashboard)/dashboard/page.tsx`
- `app/(dashboard)/inventario/page.tsx`
- `app/(dashboard)/compras/page.tsx`
- `app/(dashboard)/ventas/page.tsx`
- `app/(dashboard)/ventas/renta/page.tsx`
- `app/(dashboard)/ventas/pendientes-entrega/page.tsx`
- `app/(dashboard)/caja/page.tsx`
- `app/(dashboard)/crm/page.tsx`
- `app/(dashboard)/gestoria/page.tsx`
- `app/(dashboard)/gestoria/presupuestos/page.tsx`
- `app/(dashboard)/recordatorios/page.tsx`
- `app/(dashboard)/comisiones/page.tsx`
- `app/(dashboard)/comisiones/liquidaciones/page.tsx`
- `app/(dashboard)/whatsapp/page.tsx`
- `app/(dashboard)/whatsapp/conexiones/page.tsx`
- `app/(dashboard)/dashboard/catalogo/page.tsx`
- `app/(dashboard)/empleados/page.tsx`

### Decisiones técnicas

- Se usó un único control visual en el header para evitar repetir filtros de fecha en cada módulo.
- Cada sección usa su fecha operativa principal: venta, compra, movimiento, vencimiento, último mensaje, fecha de ingreso o período de liquidación.
- No se modificó el schema ni se agregaron consultas o dependencias nuevas; el rango se aplica sobre los datos ya cargados por cada página y funciona igual en modo demo.
- Las páginas sin información temporal operativa, como configuración, mantienen el selector global sin alterar su contenido.

### Validación

- `npm run build` ejecutado y finalizado correctamente sin errores.

## Ajuste visual del hilo de WhatsApp

Se eliminó el contenedor interno adicional del hilo de mensajes dentro del inbox. Los mensajes ahora ocupan directamente el panel principal, conservando las burbujas de entrada y salida y el scroll interno del chat, sin modificar la persistencia ni la lógica de conversaciones.

### Paths modificados

- `components/whatsapp/messages-list.tsx`
- `components/whatsapp/whatsapp-inbox.tsx`

### Tablas involucradas

- `public.conversaciones`
- `public.conversacion_mensajes`

### Decisión técnica

El componente de mensajes mantiene su borde cuando se usa en una vista independiente, pero se vuelve transparente y sin caja adicional cuando se renderiza dentro del inbox mediante `fillHeight`.

## Paginación de contactos de WhatsApp

La lista de conversaciones del inbox ahora muestra hasta 20 contactos por tanda. Cuando hay más resultados disponibles aparece `Ver más` al pie del panel izquierdo para cargar los siguientes 20 sin cambiar de pantalla ni afectar el hilo seleccionado. La paginación se reinicia al buscar o filtrar por vendedor.

### Paths modificados

- `components/whatsapp/whatsapp-inbox.tsx`

### Decisión técnica

Se implementó paginación progresiva en el cliente para conservar el filtrado y la selección instantánea sobre los datos ya cargados por la pantalla, manteniendo el scroll independiente de contactos y mensajes.

## Ajuste de Empleados y headers internos

Se compactó la pantalla de Empleados eliminando el encabezado interno repetido y el bloque descriptivo que duplicaban la identificación de la sección ya presente en el header de plataforma. El botón `Nuevo usuario` ahora vive junto al buscador y al control de filtros de la tabla, reduciendo el espacio vertical y manteniendo la carga de usuarios en un modal. Los filtros de rol y estado continúan agrupados detrás de `Más filtros`.

### Paths modificados

- `app/(dashboard)/empleados/page.tsx`
- `components/empleados/empleados-table.tsx`

### Tablas involucradas

- `public.empleados`

### Decisión técnica

La lógica de creación, edición, eliminación, permisos y paginación no se modificó; solo se trasladó la apertura del modal al toolbar de la tabla para mejorar la jerarquía visual.

## Scroll interno de la bandeja WhatsApp

### Qué se corrigió

- La bandeja ahora ocupa la altura disponible de la pantalla sin permitir scroll general de la sección.
- La lista de contactos tiene scroll vertical independiente.
- El hilo de mensajes tiene scroll vertical independiente.
- Se eliminaron alturas máximas rígidas que provocaban doble scrollbar y desplazamiento de toda la página.

### Paths modificados

- `app/(dashboard)/whatsapp/page.tsx`
- `components/whatsapp/whatsapp-inbox.tsx`
- `components/whatsapp/messages-list.tsx`

### Validación

- `npx tsc --noEmit` ejecutado correctamente.
- `npm run build` ejecutado correctamente.

## Mejoras de lectura en WhatsApp

### Qué se ajustó

- El indicador de mensajes pendientes ahora se calcula con el último mensaje real de la conversación: solo aparece cuando el último mensaje es entrante.
- Se eliminó la dependencia visual del contador `unread_count`, que podía quedar desactualizado.
- El punto de conversación pendiente se movió junto al horario, en el extremo derecho de cada contacto.
- Las burbujas ya no muestran el tipo técnico `Texto`; muestran el nombre del contacto en mensajes entrantes y el vendedor en mensajes salientes.
- El vehículo de interés ahora se muestra como `Interés: ...` en verde suave.
- Se agregó el vendedor asignado debajo de cada conversación.
- La etiqueta de interés del contacto se alineó junto al nombre para ahorrar espacio vertical.

### Paths modificados

- `components/whatsapp/whatsapp-inbox.tsx`
- `components/whatsapp/messages-list.tsx`
- `app/(dashboard)/whatsapp/[id]/page.tsx`

### Validación

- `npx tsc --noEmit` ejecutado correctamente.
- `npm run build` ejecutado correctamente.

## Ajuste de bandeja WhatsApp

### Qué se mejoró

- Se eliminaron las cuatro tarjetas superiores de métricas para dar prioridad al inbox.
- Se quitó el texto introductorio redundante del panel de conversaciones.
- El filtro lateral ahora permite filtrar por vendedor en lugar de estado.
- Se eliminó la acción visible `Marcar como atendida` y el estado de conversación del encabezado.
- Los mensajes sin responder se identifican con un punto discreto, sin mostrar cantidades ni textos de atención.
- `Ver ficha` ahora abre un modal dentro de WhatsApp con contacto, vehículo, resumen IA y seguimiento.
- Se eliminó el encabezado interno repetido de `Mensajes` para compactar el hilo y alinearlo con el contacto.

### Paths modificados

- `app/(dashboard)/whatsapp/page.tsx`
- `components/whatsapp/whatsapp-inbox.tsx`
- `components/whatsapp/conversation-header-actions.tsx`
- `components/whatsapp/messages-list.tsx`

### Decisiones técnicas

- Se mantuvieron las consultas, permisos y acciones existentes.
- El modal reutiliza `ConversacionDetail` y `DataEntryModal`, evitando duplicar la información IA y de seguimiento.
- El historial completo continúa cargándose en la bandeja; solo se ajustó su presentación.

### Validación

- `npx tsc --noEmit` ejecutado correctamente.
- `npm run build` ejecutado correctamente.

## Carga incremental de comisiones Robinson

Se preparó una carga incremental a partir de `comisiones robinson.csv`: 88 comisiones por un total de ARS 18.136.120, distribuidas en 19 períodos mensuales entre enero de 2025 y julio de 2026. La migración también crea las liquidaciones mensuales cerradas asociadas, sin duplicar registros existentes.

### Archivo generado

- `generated/funes-migration/comisiones-robinson-2026-08-18.sql`

### Tablas involucradas

- `public.comisiones`
- `public.comision_liquidaciones`
- `public.ventas`
- `public.vehiculos`
- `public.empleados`

### Decisiones técnicas

- El vendedor se resuelve por nombre, buscando un empleado activo cuyo nombre contenga `Robinson`.
- Las ventas y vehículos existentes se vinculan por dominio normalizado.
- Solo se crean vehículos o ventas históricas de soporte cuando no existe una coincidencia utilizable.
- Los identificadores son determinísticos y los inserts usan `ON CONFLICT DO NOTHING`, por lo que el script puede repetirse sin duplicar esta carga.
- La ejecución sobre Supabase queda deliberadamente separada: el archivo debe correrse desde el SQL Editor o una conexión directa a la base.

## Vinculación automática de vehículo de interés desde WhatsApp

Se mejoró el flujo de WhatsApp para detectar cuándo un lead menciona un vehículo y vincularlo con `leads.vehiculo_interes_id` y `conversaciones.vehiculo_interes_id`. Los mensajes entrantes ahora intentan resolver menciones explícitas contra unidades en stock o consignación, incluyendo dominio, modelo, marca y combinaciones de ambos.

### Paths modificados

- `lib/whatsapp/vehicle-interest.ts`
- `lib/ai/conversation-summary.ts`
- `app/api/evolution/webhook/route.ts`
- `app/(dashboard)/whatsapp/actions.ts`

### Decisiones técnicas

- El webhook usa una coincidencia determinística y conservadora para no asignar vehículos por palabras genéricas.
- El resumen IA recibe una lista acotada del inventario disponible y devuelve el `vehiculo_id` exacto cuando identifica una unidad.
- Una selección manual existente no se pisa automáticamente.
- Cuando el lead no tiene vehículo de interés, la vinculación se propaga también desde la conversación.
- La generación del resumen IA continúa siendo manual desde la UI; no se agregaron llamadas automáticas a OpenAI por cada mensaje.

### Tablas involucradas

- `public.vehiculos`
- `public.leads`
- `public.conversaciones`
- `public.conversacion_mensajes`

### Validación

- `npm run build` ejecutado correctamente.

## Bandeja de WhatsApp tipo inbox

Se reemplazó el listado tabular principal de WhatsApp por una bandeja operativa de dos paneles: contactos y conversaciones a la izquierda, y el hilo completo de mensajes de la conversación seleccionada a la derecha. Se conservaron la búsqueda, el filtro de estado, la atención pendiente, los estados e intereses, el acceso a Conexiones y las acciones existentes de atención y resumen IA.

### Paths modificados o creados

- `app/(dashboard)/whatsapp/page.tsx`
- `components/whatsapp/whatsapp-inbox.tsx`
- `components/whatsapp/messages-list.tsx`

### Decisiones técnicas

- La página carga los mensajes asociados a las conversaciones visibles y los agrupa por conversación para evitar que el detalle dependa de navegar a otra ruta.
- El panel del chat muestra el historial sin paginar dentro de un contenedor con scroll, mientras que la ruta de detalle mantiene su paginación existente.
- Se mantienen los permisos aplicados por el servidor para que cada vendedor vea solamente sus conversaciones.
- La grilla de instancias queda disponible desde `Conexiones`, evitando que ocupe espacio en la bandeja diaria.

### Validación

- `npx tsc --noEmit` ejecutado correctamente.
- `npm run build` no pudo finalizar por un error del filesystem al limpiar una carpeta generada dentro de `.next` (`Unknown system error -70`), sin errores TypeScript reportados.

## Saldos operativos en Caja

Se incorporó una vista de saldos acumulados en Caja, separada del resumen mensual. El cálculo toma ingresos y egresos históricos cargados, mantiene ARS y USD separados y muestra cuentas operativas identificables como `Efectivo`, `Banco Santander` y `Cta. cte. Gestoría`.

### Paths modificados

- `app/(dashboard)/caja/page.tsx`
- `components/caja/caja-summary.tsx`

### Decisiones técnicas

- Los saldos se calculan como ingresos menos egresos, sin conversión de moneda.
- La cuenta se determina priorizando `cuenta` y complementando con `medio`.
- Medios no reconocidos se agrupan como `Otros medios` para no ocultar movimientos.
- El resumen mensual existente se mantiene separado para distinguir actividad del período y saldo acumulado.

### Validación

- `npm run build` ejecutado correctamente.

## Corrección de edición de inventario

Se corrigió el error genérico que impedía guardar cambios en vehículos desde edición. La causa principal era que, para roles que no visualizan costos internos, el formulario omitía esos campos pero la acción intentaba validarlos y podía sobrescribirlos con valores vacíos. Ahora se preservan los datos internos existentes y se mantienen los campos comerciales editables.

También se normalizó el estado de preparación al valor válido del esquema (`sin_preparar`), se corrigió la lectura de decimales en inputs numéricos y se agregaron logs server-side seguros junto con mensajes específicos para errores de campos obligatorios o valores inválidos.

### Paths modificados

- `app/(dashboard)/inventario/actions.ts`
- `components/inventario/vehiculo-form.tsx`

### Validación

- `npm run build` ejecutado correctamente.

## Cargas de datos en modales

### Qué se implementó

- Se incorporó un patrón reutilizable de modal para mantener las pantallas operativas más limpias y mostrar los formularios solo cuando el usuario decide cargar o editar datos.
- Las altas principales ahora se abren desde un botón: vehículos, compras, ventas, leads, trámites, presupuestos, caja, recordatorios, documentos, conexiones de WhatsApp, usuarios, configuración y catálogo.
- También se modalizaron cargas secundarias de conversión de lead, ítems de presupuesto, pago de liquidaciones, seguimiento de conversaciones y edición de vehículos.
- Los formularios y Server Actions existentes se conservaron sin cambios de negocio, schema ni permisos.
- Las acciones rápidas de tablas, como completar, cambiar estados o eliminar un ítem, se mantuvieron contextuales para no agregar pasos innecesarios a la operación diaria.

### Paths creados/modificados

- `components/common/data-entry-modal.tsx`
- `app/(dashboard)/inventario/nuevo/page.tsx`
- `app/(dashboard)/inventario/[id]/editar/page.tsx`
- `app/(dashboard)/inventario/[id]/page.tsx`
- `app/(dashboard)/compras/nueva/page.tsx`
- `app/(dashboard)/ventas/nueva/page.tsx`
- `app/(dashboard)/crm/nuevo/page.tsx`
- `app/(dashboard)/crm/[id]/page.tsx`
- `app/(dashboard)/gestoria/nuevo/page.tsx`
- `app/(dashboard)/gestoria/presupuestos/nuevo/page.tsx`
- `app/(dashboard)/caja/page.tsx`
- `app/(dashboard)/recordatorios/page.tsx`
- `app/(dashboard)/whatsapp/conexiones/page.tsx`
- `app/(dashboard)/empleados/page.tsx`
- `app/(dashboard)/configuracion/page.tsx`
- `app/(dashboard)/dashboard/catalogo/page.tsx`
- `components/crm/lead-detail.tsx`
- `components/gestoria/presupuesto-detail.tsx`
- `components/comisiones/liquidacion-detail.tsx`
- `components/whatsapp/conversacion-detail.tsx`

### Decisiones técnicas

- El modal es un componente cliente liviano, sin dependencias nuevas, con cierre por botón, tecla Escape y click fuera del contenido.
- Se bloquea el scroll del documento mientras el modal está abierto y se limita la altura interna para que los formularios largos sigan siendo utilizables.
- La apertura se resuelve en las páginas o detalles que ya conocen el contexto, evitando duplicar formularios o crear rutas nuevas.

### Validación

- `npm run build` ejecutado correctamente.

## Filtros y desplegables

### Qué se mejoró

- Se unificó la flecha de los campos desplegables con un margen interno consistente para que no quede pegada al borde derecho.
- Los filtros secundarios de las tablas ahora se agrupan en un único control `Más filtros` con ícono, manteniendo visible el buscador y las acciones principales.
- Se aplicó el patrón a Compras, Ventas, Rentabilidad, Caja, CRM, WhatsApp, Gestoría, Presupuestos, Recordatorios, Comisiones, Empleados, entregas pendientes, documentos de vehículos y catálogo público.

### Paths modificados

- `app/globals.css`
- `components/compras/compras-table.tsx`
- `components/ventas/ventas-table.tsx`
- `components/ventas/renta-table.tsx`
- `components/ventas/pendientes-entrega-table.tsx`
- `components/caja/caja-movimientos-table.tsx`
- `components/crm/leads-table.tsx`
- `components/whatsapp/conversaciones-table.tsx`
- `components/gestoria/gestoria-table.tsx`
- `components/gestoria/presupuestos-table.tsx`
- `components/recordatorios/recordatorios-table.tsx`
- `components/comisiones/comisiones-table.tsx`
- `components/empleados/empleados-table.tsx`
- `components/inventario/vehiculo-documentos-table.tsx`
- `components/catalogo-publico/catalogo-filters.tsx`

### Validación

- `npm run build` ejecutado correctamente después de los cambios.

## Tooltip en gráficos mensuales

- El gráfico de P&L mensual ahora muestra un tooltip al pasar el mouse sobre cada mes.
- El detalle incluye ingresos, egresos, resultado y cantidad de ventas de ese período, respetando la moneda de la serie.
- También se puede abrir con foco de teclado para mantener una interacción accesible.
- No se agregaron dependencias; se resolvió con CSS y el componente existente.

## Filtro compacto de vendedores en WhatsApp

El filtro de vendedores del inbox se movió junto al buscador como un botón `Filtros` con ícono. El selector queda oculto hasta desplegarlo, optimizando el espacio disponible sin cambiar el comportamiento de búsqueda ni asignación.

Además, el mismo desplegable permite filtrar por vehículo de interés. Las opciones se construyen únicamente a partir de los vehículos asociados a las conversaciones, por lo que seleccionar un modelo como `Toyota Yaris` muestra todos los chats interesados en esa unidad; el filtro puede combinarse con vendedor.

### Paths modificados

- `components/whatsapp/whatsapp-inbox.tsx`

## Paginación global de listados

### Qué se implementó

- Se estableció una paginación uniforme de **10 registros por página** para los listados operativos del sistema.
- La paginación se aplica después de los filtros, por lo que cada búsqueda o combinación de filtros muestra sus propios resultados paginados.
- Se agregó un control común con rango visible, página actual, total de páginas y navegación anterior/siguiente.
- También se paginaron las columnas de las vistas tipo tablero de CRM y Gestoría, sin ocultar registros adicionales.

### Paths agregados/modificados

- `components/common/pagination-controls.tsx`
- `components/comisiones/liquidaciones-table.tsx`
- Tablas de Inventario, Compras, Ventas, Rentabilidad, Caja, Comisiones, CRM, Gestoría, WhatsApp, Recordatorios, Empleados, Catálogo y Documentos.
- `app/(dashboard)/comisiones/liquidaciones/page.tsx`
- `app/(dashboard)/crm/page.tsx`
- `app/(dashboard)/comisiones/page.tsx`
- `app/(dashboard)/whatsapp/page.tsx`
- `app/(dashboard)/whatsapp/conexiones/page.tsx`
- `app/(dashboard)/dashboard/catalogo/page.tsx`
- `app/catalogo/page.tsx`

### Decisiones técnicas

- Las consultas históricas que tenían límites fijos de 100, 150 o 200 registros ahora recuperan todas las páginas mediante `fetchAllSupabaseRows`, manteniendo la información completa antes de paginar visualmente.
- Los límites de 100 que permanecen en Inventario y Caja corresponden únicamente a opciones de selección de proveedores/activos, no a listados visibles; se mantienen para evitar selects operativos desproporcionados.
- No se paginaron gráficos, KPIs, alertas ni listas estáticas de opciones porque no son listados históricos ni generan render masivo.
- Se mantuvo el modo demo y no se modificó el schema ni la lógica de negocio.

### Validación

- `npm run build` ejecutado correctamente después de los cambios.

## Alta de usuarios desde Empleados

### Qué se construyó

- Se agregó el formulario `Nuevo usuario` dentro de `/empleados`.
- Permite cargar email, contraseña inicial, nombre, teléfono, rol, cargo, fecha de ingreso, comisión default y notas internas.
- La alta crea el usuario en Supabase Auth y su perfil operativo en `empleados`.
- Se agregó validación de permisos: solo usuarios admin activos pueden crear empleados.
- Se mantienen validaciones para evitar emails duplicados, roles inválidos y contraseñas menores a 8 caracteres.
- Si falla la creación del perfil, se elimina el usuario Auth recién creado para evitar accesos sin perfil operativo.

### Paths modificados

- `app/(dashboard)/empleados/actions.ts`
- `app/(dashboard)/empleados/page.tsx`
- `components/empleados/empleado-create-form.tsx`

### Tablas y servicios involucrados

- `auth.users` mediante Supabase Auth Admin API.
- `public.empleados`.

### Decisiones técnicas

- Se utiliza `createSupabaseAdminClient` únicamente en esta Server Action administrativa, después de validar sesión, usuario activo y rol admin.
- El usuario se crea con email confirmado para que pueda ingresar inmediatamente con las credenciales entregadas por el administrador.
- El modo demo conserva su comportamiento y muestra un mensaje sin crear datos reales.

### Validación

- `npm run build` ejecutado correctamente después de la implementación.

## Eliminación de usuarios desde Empleados

### Qué se construyó

- Se agregó la acción `Eliminar` en la tabla de `/empleados`.
- La acción pide confirmación antes de ejecutarse.
- Solo está disponible para administradores activos.
- El usuario administrador logueado no puede eliminarse a sí mismo.
- Se elimina el perfil operativo de `empleados` y el acceso correspondiente de Supabase Auth.
- Si existen referencias operativas que impiden borrar el perfil, la acción se detiene antes de quitar el acceso.
- Si falla la eliminación del acceso Auth, se intenta restaurar el perfil operativo para evitar un estado parcial.

### Paths modificados

- `app/(dashboard)/empleados/actions.ts`
- `components/empleados/empleados-table.tsx`
- `components/empleados/empleado-delete-button.tsx`

### Validación

- `npm run build` ejecutado correctamente después de la implementación.

### Ajuste posterior: perfil creado por trigger

- Se corrigió el alta para usar `upsert` sobre `empleados` con conflicto por `id`.
- Esto permite completar correctamente el perfil cuando Supabase crea automáticamente una fila de `empleados` al registrar el usuario Auth mediante un trigger.
- Si la operación falla, el error detallado queda únicamente en logs server-side y se elimina el usuario Auth recién creado para evitar registros incompletos.
- `npm run build` volvió a ejecutarse correctamente.

## Auditoría de datos y completitud del Dashboard

### Qué se revisó y corrigió

- Se auditaron las consultas de `/dashboard`, `/ventas`, `/ventas/renta`, `/inventario`, `/compras`, `/caja`, `/gestoria`, `/recordatorios` y `/ventas/pendientes-entrega`.
- Se detectó que varias consultas quedaban limitadas a los primeros 100, 150 o 200 registros, por lo que la interfaz no representaba el total real de Supabase.
- Se agregó paginación server-side reutilizable en `lib/supabase/paginated.ts`, recorriendo páginas de 1.000 registros hasta completar cada fuente.
- El Dashboard ahora considera el total disponible de ventas, vehículos, compras, movimientos de caja, gastos, entregas, trámites, presupuestos y recordatorios, manteniendo las relaciones opcionales normalizadas.
- `/ventas` y `/ventas/renta` ahora cargan el histórico completo disponible, incluyendo pagos, gastos y entregas sin cortar en 150 registros.
- Se mantuvo la regla operativa: las ventas `registrada` participan de totales y resultados; las ventas `anulada` permanecen visibles como histórico, pero no se contabilizan como ventas efectivas ni como ingresos.

### Verificación sobre Supabase

- En la auditoría se encontraron 2.130 ventas: 1.449 registradas y 681 anuladas.
- También se verificaron 7.825 movimientos de caja, 1.762 vehículos, 1.740 compras, 698 entregas, 600 trámites y 225 recordatorios.
- Las tablas `leads` y `conversaciones` actualmente no tienen registros reales; por eso sus métricas del Dashboard muestran cero hasta que se carguen datos.

### Paths modificados

- `lib/supabase/paginated.ts`
- `app/(dashboard)/dashboard/page.tsx`
- `app/(dashboard)/ventas/page.tsx`
- `app/(dashboard)/ventas/renta/page.tsx`
- `app/(dashboard)/ventas/pendientes-entrega/page.tsx`
- `app/(dashboard)/inventario/page.tsx`
- `app/(dashboard)/compras/page.tsx`
- `app/(dashboard)/caja/page.tsx`
- `app/(dashboard)/gestoria/page.tsx`
- `app/(dashboard)/recordatorios/page.tsx`

### Tablas de Supabase involucradas

- `public.ventas`
- `public.ventas_pagos`
- `public.ventas_entregas`
- `public.vehiculos`
- `public.compras_vehiculos`
- `public.vehiculo_gastos`
- `public.caja_movimientos`
- `public.comisiones`
- `public.comision_liquidaciones`
- `public.gestoria_tramites`
- `public.gestoria_presupuestos`
- `public.recordatorios`
- `public.leads`
- `public.conversaciones`

### Decisiones técnicas

- Se evitó usar `select("*")` y se conservaron las columnas acotadas que cada pantalla necesita.
- La paginación se ejecuta en Server Components y no expone datos adicionales al navegador.
- El resultado operativo mensual e histórico se calcula sobre ingresos y egresos reales de `caja_movimientos`; no se vuelve a sumar el precio total de la venta ni a restar compras/comisiones ya reflejadas en caja.
- No se modificó el schema, RLS, RPCs ni reglas de negocio.
- `npm run build` finalizó correctamente sin errores TypeScript ni de compilación.

## Rediseño detalle WhatsApp tipo inbox

### Qué se rediseñó

- Se reorganizó `/whatsapp/[id]` en un layout tipo inbox con:
  - header superior compacto,
  - hilo de mensajes como columna principal,
  - panel lateral derecho para contacto, IA y seguimiento.
- Se eliminó la repetición visual de contacto, estado e interés en múltiples cards.
- Se ocultaron datos técnicos en la UI, incluyendo `instance_name`.
- Se simplificó el panel lateral para evitar duplicación entre lectura y edición del seguimiento.
- Se mejoró la experiencia vacía del hilo de mensajes para que no parezca una pantalla rota.

### Paths modificados

- `app/(dashboard)/whatsapp/[id]/page.tsx`
- `components/whatsapp/conversacion-detail.tsx`
- `components/whatsapp/messages-list.tsx`
- `components/whatsapp/ai-summary-card.tsx`
- `components/whatsapp/conversation-follow-up-form.tsx`
- `components/whatsapp/conversation-header-actions.tsx`
- `components/whatsapp/conversaciones-table.tsx`
- `components/whatsapp/conversacion-status-badge.tsx`
- `components/whatsapp/conversacion-interest-badge.tsx`

### Problemas UX resueltos

- Se corrigió la superposición visual entre acciones y badges en el encabezado del detalle.
- Se redujo la redundancia de IA y seguimiento comercial.
- El hilo de mensajes ganó protagonismo visual y ocupa ahora la zona principal.
- Se evitó mostrar teléfonos duplicados en la tabla de conversaciones cuando ya se muestran en contacto.
- Se reemplazó la lectura técnica por textos claros en español, incluyendo `No leído` y `Requiere atención`.

### Tablas de Supabase involucradas

- `public.conversaciones`
- `public.conversacion_mensajes`
- `public.leads`
- `public.empleados`
- `public.vehiculos`

### Decisiones técnicas relevantes

- Se mantuvo la lógica de acciones existente para no introducir riesgo funcional.
- Se separó el contenido del panel lateral en componentes pequeños para reducir ruido visual.
- Se dejaron los datos técnicos fuera de la UI y solo en el flujo server-side.
- Se priorizó una maquetación responsive con mensaje central, panel lateral fijo y acciones compactas.

### Validación

- `npm run build` ejecutado al cierre del rediseño.
- Build finalizado correctamente sin errores.

## Simplificación de Ventas

### Qué se ajustó

- Se eliminaron las tres tarjetas secundarias de `Pendientes de entrega`, `Entregadas` y `Observadas` de la pantalla principal de Ventas.
- Se mantuvo el acceso operativo a `Pendientes de entrega` desde la toolbar y no se modificó la tabla de ventas ni la gestión de entregas.
- También se retiraron los cálculos exclusivos de esas tarjetas para reducir trabajo durante el render de la página.

### Paths modificados

- `app/(dashboard)/ventas/page.tsx`

### Tablas de Supabase involucradas

- `public.ventas`
- `public.ventas_pagos`
- `public.ventas_entregas`

### Validación

- `npm run build` ejecutado correctamente sin errores TypeScript ni de generación de rutas.

## WhatsApp: posición inicial del hilo

### Qué se corrigió

- Al seleccionar una conversación en el inbox de WhatsApp, el hilo ahora se posiciona automáticamente en el último mensaje disponible.
- El scroll interno continúa habilitado para revisar mensajes anteriores, sin modificar la paginación del detalle independiente.

### Paths modificados

- `components/whatsapp/messages-list.tsx`

### Decisión técnica

- Se utilizó un `ref` sobre el contenedor del hilo y `requestAnimationFrame` después de cambiar la conversación, evitando cálculos de layout durante el render.

### Validación

- `npm run build` ejecutado luego del ajuste.

## Catálogo: preset de stock y editor visual

### Qué se construyó

- El panel interno de Catálogo ahora abre por defecto las unidades `en_stock`, igual que Inventario, sin impedir consultar el resto desde el filtro.
- Se consolidaron los filtros dentro del botón de ícono: stock, publicación, preparación, rango de año, rango de precio y destacados.
- Se agregó `Editar vidriera`, un modal con preview de portada, orden de unidades destacadas y la configuración pública existente.
- Se agregó carga de portada panorámica en JPG, PNG o WEBP de hasta 8 MB.
- El catálogo público usa la portada cargada y, si todavía no existe, toma como fallback la foto de la primera unidad destacada.
- La portada y el bloque de destacadas se mantienen alineados con el inventario publicado y en stock.

### Paths creados/modificados

- `app/(dashboard)/dashboard/catalogo/page.tsx`
- `app/(dashboard)/catalogo/actions.ts`
- `app/catalogo/page.tsx`
- `components/catalogo/catalogo-hero-upload-form.tsx`
- `components/catalogo/catalogo-visual-editor.tsx`
- `components/catalogo/catalogo-vehiculos-table.tsx`
- `components/catalogo-publico/catalogo-header.tsx`
- `lib/catalogo/hero.ts`

### Tablas y Storage involucrados

- `public.catalogo_config`
- `public.vehiculos`
- Bucket `vehiculos`, path `catalogo/hero.jpg`

### Decisiones técnicas

- No se agregaron columnas ni SQL: la portada se guarda en un path determinístico del bucket existente y se detecta mediante Storage.
- El carousel de destacadas reutiliza `catalogo_destacado` y `catalogo_orden` de `vehiculos`, evitando duplicar información.
- El preset inicial es visual/client-side para conservar la posibilidad de revisar todo el inventario sin ampliar queries ni cambiar reglas de publicación.

### Validación

- `npm run build` ejecutado correctamente sin errores TypeScript ni de generación de rutas.

### Pendiente

- Si se necesita una portada independiente por ambiente o múltiples banners editables, conviene agregar una entidad de configuración de bloques en Supabase en una siguiente etapa.

## Badges sin saltos de línea

### Qué se corrigió

- Se evitó que las etiquetas de estado, prioridad, tipo, método de pago e interés se partan en dos líneas dentro de tablas y cards.
- El cambio mejora especialmente estados como `En stock`, `Sin preparar`, `Requiere atención` y otros textos compuestos.

### Paths modificados

- Componentes de badges en `components/caja`, `components/catalogo`, `components/comisiones`, `components/crm`, `components/empleados`, `components/gestoria`, `components/inventario`, `components/recordatorios`, `components/ventas` y `components/whatsapp`.

### Decisión técnica

- Se agregó `whitespace-nowrap` a la base visual de los badges. No se modificaron valores, lógica de negocio, permisos ni tablas de Supabase.

### Validación

- Se verificó que todos los badges semánticos mantengan sus etiquetas en una sola línea.
- `npm run build` ejecutado luego del ajuste.

## Filtros compactos en toolbar

Se ajustó el patrón compartido de filtros para que el buscador y el acceso a filtros convivan en la misma línea. El botón ahora muestra únicamente el ícono de filtros, con tooltip y etiqueta accesible, y abre un popover pequeño flotante en lugar de expandir los controles hacia abajo dentro del contenido. En WhatsApp se mantuvieron los filtros por vendedor y vehículo de interés dentro de ese popover.

### Paths modificados

- `components/common/advanced-filters.tsx`
- `components/whatsapp/whatsapp-inbox.tsx`

### Decisión técnica

El cambio se realizó sobre el componente compartido `AdvancedFilters`, por lo que el comportamiento compacto se aplica también a Inventario, Ventas, Compras, Caja, CRM, Gestoría, Comisiones, Empleados, Recordatorios y Rentabilidad sin alterar la lógica de filtrado.

### Validación

- `npm run build` finalizado correctamente.

## Pipeline CRM con carga incremental y drag and drop

El pipeline ahora carga 10 leads por etapa y muestra `Ver más` al final de cada columna para incorporar los siguientes sin paginación tradicional. También se habilitó mover leads entre etapas mediante drag and drop nativo; el cambio se refleja de inmediato y se persiste mediante una Server Action validada por sesión, empleado activo y permisos comerciales.

### Paths modificados

- `app/(dashboard)/crm/actions.ts`
- `components/crm/crm-pipeline.tsx`

### Decisiones técnicas

- No se agregaron dependencias externas: se usa Drag and Drop nativo del navegador.
- El scroll vertical continúa dentro de cada columna y la carga incremental mantiene el límite inicial de 10.
- Si la persistencia falla, la tarjeta vuelve a la etapa anterior y se muestra un mensaje operativo.
- En modo demo el movimiento es local a la sesión y no modifica datos reales.

### Tablas involucradas

- `public.leads`

### Validación

- `npm run build` finalizado correctamente.

## Inventario con preset y filtros avanzados

El listado de Inventario ahora inicia mostrando únicamente vehículos `en_stock`, reduciendo ruido al entrar al módulo. Se retiró la columna de publicación de la tabla y se ampliaron los filtros dentro del popover compartido: estado, estado de preparación, año desde/hasta y precio comercial desde/hasta. La búsqueda por vehículo y la paginación se mantienen.

### Paths modificados

- `components/inventario/inventario-table.tsx`

### Decisiones técnicas

- El preset inicial es visual y client-side; no cambia consultas ni datos persistidos.
- El filtro de precio usa primero `precio_contado` y luego `precio_venta`.
- `Restablecer filtros` vuelve al preset operativo de vehículos en stock.

### Validación

- `npm run build` finalizado correctamente.

## Menús contextuales de acciones

Se creó un patrón compartido de acciones con botón de tres puntos para reducir ruido visual en tablas. Las acciones de cada fila se mantienen disponibles dentro del menú contextual, que se cierra al hacer click afuera o presionar `Escape`; las acciones destructivas conservan su tratamiento visual diferenciado.

### Paths modificados

- `components/common/action-menu.tsx`
- `components/inventario/inventario-table.tsx`
- `components/empleados/empleados-table.tsx`
- `components/recordatorios/recordatorios-table.tsx`
- `components/caja/caja-movimientos-table.tsx`
- `components/ventas/pendientes-entrega-table.tsx`

### Decisión técnica

Se centralizó únicamente la presentación y apertura/cierre del menú. No se cambiaron las acciones, permisos, formularios ni reglas de negocio existentes.

### Validación

- `npm run build` finalizado correctamente.

## Cierre de modales y filtros

Los popovers de filtros ahora se cierran al hacer click fuera de su contenido o al presionar `Escape`, igual que las ventanas de carga. Los clicks dentro de los controles siguen funcionando sin cerrar el panel accidentalmente.

### Paths modificados

- `components/common/advanced-filters.tsx`

### Validación

- `npm run build` finalizado correctamente.

## Vistas de Pipeline CRM

Se reorganizó el CRM para que el usuario pueda elegir entre vista de columnas y vista de tabla, sin mostrar ambas al mismo tiempo. Las columnas del pipeline ya no están contenidas dentro de una card grande: se presentan como etapas independientes, con scroll horizontal para recorrerlas y scroll vertical interno para revisar los leads de cada etapa sin alargar toda la página.

### Paths modificados

- `app/(dashboard)/crm/page.tsx`
- `components/crm/crm-pipeline.tsx`
- `components/crm/crm-views.tsx`

### Decisiones técnicas

- Se mantuvo la paginación existente de 10 leads por etapa.
- El selector de vista es local al cliente y no cambia rutas ni consultas.
- La vista tabla conserva sus filtros y acción de alta; la vista columnas conserva el acceso a `Nuevo lead` en la toolbar superior.

### Validación

- `npm run build` finalizado correctamente.

## Sistema de colores semánticos para etiquetas

Se unificó el tratamiento visual de las etiquetas de estado para que comuniquen rápidamente la situación operativa: verde suave para estados positivos o activos, ámbar para estados pendientes o intermedios, rojo suave para estados negativos o anulados, azul para estados informativos/en curso y slate para estados neutros. También se incorporaron colores sutiles para roles, orígenes comerciales, interés de compra, conexión de WhatsApp y publicación de catálogo. Las etiquetas puramente descriptivas, como tipos de documento y medios de pago, se mantienen neutras para preservar la jerarquía visual.

### Paths modificados

- `components/catalogo/catalogo-status-badge.tsx`
- `components/comisiones/comision-status-badge.tsx`
- `components/crm/lead-origin-badge.tsx`
- `components/crm/lead-status-badge.tsx`
- `components/empleados/empleado-role-badge.tsx`
- `components/empleados/empleado-status-badge.tsx`
- `components/gestoria/gestoria-status-badge.tsx`
- `components/gestoria/presupuesto-status-badge.tsx`
- `components/inventario/vehiculo-status-badge.tsx`
- `components/ventas/entrega-status-badge.tsx`
- `components/ventas/venta-status-badge.tsx`
- `components/whatsapp/conversacion-interest-badge.tsx`
- `components/whatsapp/conversacion-status-badge.tsx`
- `components/whatsapp/whatsapp-instance-status-badge.tsx`

### Tablas involucradas

No se modificaron consultas, columnas ni reglas de negocio. Los componentes representan visualmente estados provenientes de `empleados`, `leads`, `vehiculos`, `ventas`, `ventas_entregas`, `gestoria_tramites`, `gestoria_presupuestos`, `comisiones`, `conversaciones`, `whatsapp_instancias` y `catalogo_config`.

### Decisión técnica

El cambio se limitó a clases visuales dentro de badges existentes, sin alterar valores, filtros, permisos ni persistencia. Esto permite mejorar la lectura operativa sin riesgo para los datos ni para el modo demo.

## Perfil y conexión WhatsApp desde Empleados

La edición de cada empleado ahora permite cargar una foto de perfil y administrar su conexión individual de WhatsApp desde la misma pantalla. Si ya existe una instancia, se muestran su estado, teléfono, QR y acciones de sincronización; si no existe, se puede iniciar la conexión para ese empleado sin volver a `Conexiones WhatsApp`.

### Paths modificados

- `app/(dashboard)/empleados/actions.ts`
- `app/(dashboard)/empleados/page.tsx`
- `app/(dashboard)/whatsapp/actions.ts`
- `app/(dashboard)/whatsapp/conexiones/page.tsx`
- `components/empleados/empleado-edit-form.tsx`
- `components/empleados/empleados-table.tsx`
- `components/empleados/empleado-whatsapp-section.tsx`
- `components/whatsapp/whatsapp-instance-card.tsx`

### Tablas y Storage involucrados

- `public.empleados`
- `public.whatsapp_instancias`
- Bucket público `empleados-avatares`

### Decisiones técnicas

- Se reutilizó `empleados.avatar_url`, que ya existía, sin modificar schema.
- La foto se valida en servidor y se guarda en Storage con un path por empleado; el bucket se crea automáticamente si todavía no existe.
- La conexión usa las Server Actions existentes de Evolution y conserva los permisos de admin.

### SQL necesario

No hace falta ejecutar SQL. Si el proyecto tiene políticas de Storage que impiden crear o subir desde el entorno actual, habrá que habilitar el bucket `empleados-avatares` desde Supabase; la aplicación ya intenta crearlo automáticamente con el cliente admin server-side.

## Migración incremental de CSV actualizados

### Qué se revisó

- Se compararon los CSV actualizados recibidos por WhatsApp contra la carpeta histórica usada en la migración base.
- Se generó un incremental con altas nuevas, evitando repetir registros ya cargados.
- Se descartaron filas operativas de gestoría que no correspondían a vehículos reales, por ejemplo valores usados como dominio (`EFECTIVO`, `ENTREGO`).

### SQL generado

- `generated/funes-migration/incremental-2026-08-05/01_incremental_altas.sql`
- `generated/funes-migration/incremental-2026-08-05/02_validacion_incremental.sql`
- `generated/funes-migration/incremental-2026-08-05/00_reporte_incremental.md`

### Altas detectadas

- `proveedores`: 1
- `vehiculos`: 4
- `compras_vehiculos`: 34
- `vehiculo_gastos`: 69
- `ventas`: 20
- `ventas_pagos`: 33
- `ventas_entregas`: 13
- `gestoria_tramites`: 31
- `comisiones`: 7
- `comision_liquidaciones`: 1
- `recordatorios`: 10

### Paths creados/modificados

- `scripts/funes-migration/generate_incremental_updated_excels.py`
- `generated/funes-migration/incremental-2026-08-05/01_incremental_altas.sql`
- `generated/funes-migration/incremental-2026-08-05/02_validacion_incremental.sql`
- `generated/funes-migration/incremental-2026-08-05/00_reporte_incremental.md`
- `generated/funes-migration/incremental-2026-08-05/sources/`
- `DOCUMENTACION.md`

### Tablas de Supabase involucradas

- `public.proveedores`
- `public.vehiculos`
- `public.compras_vehiculos`
- `public.vehiculo_gastos`
- `public.ventas`
- `public.ventas_pagos`
- `public.ventas_entregas`
- `public.gestoria_tramites`
- `public.comisiones`
- `public.comision_liquidaciones`
- `public.recordatorios`

### Decisiones técnicas relevantes

- El SQL incremental usa `ON CONFLICT (id) DO NOTHING` para que una reejecución accidental no duplique registros por id.
- La comparación se hizo por claves de negocio, no por número de fila, para evitar falsos positivos cuando los CSV cambian de orden.
- No se generaron deletes ni updates masivos. Los cambios sobre registros ya existentes quedan para una segunda pasada controlada si Funes confirma que quiere pisar valores históricos.
- Se copiaron los CSV fuente usados en `generated/funes-migration/incremental-2026-08-05/sources/` para dejar trazabilidad.

### Validación

- Se validó que el SQL no use columnas que ya habían fallado en Supabase (`importe` en caja, `concepto`/`observaciones` en gastos).
- Se validó que no se emitan enums inválidos conocidos como `listo` u `otros_gastos`.
- Se validó que las filas incrementales no tengan nulos en campos obligatorios críticos.
- Se corrigió el mapeo de pagos con `tipo = credito`: el tipo se conserva como crédito, pero `medio` se guarda como `otro` para respetar el enum `caja_medio`.

## Login visual con imagen institucional

### Qué se mejoró

- Se rediseñó `/login` con layout de dos columnas en desktop:
  - imagen institucional a la izquierda,
  - formulario de acceso a la derecha.
- En mobile se prioriza el formulario y se oculta la imagen para mantener velocidad y foco.
- Se mantuvo el color principal bordó corporativo y una estética blanca, compacta y premium.
- Se eliminó el box/borde que contenía el formulario para que el login se vea más integrado y menos encerrado.
- Se agregó la imagen como fondo global suavemente difuminado, con una capa blanca translúcida sobre el lado del formulario.
- Se simplificó el copy visible a: `Accedé a la plataforma con tu usuario de Funes Exclusivos`.
- Se agregó una microfirma `Powered by Blyndtek` con enlace a `https://blyndtek.com`.

### Paths modificados

- `app/login/page.tsx`
- `public/login-hero-porsche.png`
- `public/blyndtek-logo-text.svg`
- `DOCUMENTACION.md`

### Decisiones visuales tomadas

- La imagen se sirve desde `public/login-hero-porsche.png` para evitar depender de una ruta temporal del sistema.
- Se agregó un overlay oscuro sutil sobre la imagen para mejorar legibilidad del copy institucional.
- Se mantuvo el formulario sin datos técnicos visibles y con una sola acción primaria.
- El lado derecho usa `bg-white/78` y `backdrop-blur-md` para dejar ver parte de los colores de fondo sin perder legibilidad.
- Se quitó el título interno `Ingresar al panel` y el rótulo `Acceso privado` para reducir ruido visual.
- El crédito de Blyndtek queda como firma secundaria con baja opacidad para no competir con la marca Funes ni con el formulario.

### Validación

- `npm run build` ejecutado correctamente después del cambio.

## Migración operativa Funes desde CSV

### Qué se construyó

- Se creó un generador local de SQL para migrar la información operativa histórica de Funes desde los CSV adjuntos.
- Se separó la migración en tres archivos:
  - reset operativo destructivo,
  - import de datos reales,
  - queries de validación post-migración.
- Se generó un reporte de migración con conteos, decisiones tomadas, archivos procesados y pendientes manuales.

### Paths creados/modificados

- `scripts/funes-migration/generate_funes_sql.py`
- `generated/funes-migration/00_reset_operational_data.sql`
- `generated/funes-migration/01_import_funes_data.sql`
- `generated/funes-migration/02_validation_queries.sql`
- `generated/funes-migration/chunks/001_import_chunk.sql` a `generated/funes-migration/chunks/017_import_chunk.sql`
- `generated/funes-migration/migration_report.md`
- `DOCUMENTACION.md`

### Tablas de Supabase involucradas

- `public.proveedores`
- `public.vehiculos`
- `public.compras_vehiculos`
- `public.vehiculo_gastos`
- `public.ventas`
- `public.ventas_pagos`
- `public.ventas_entregas`
- `public.caja_movimientos`
- `public.gestoria_tramites`
- `public.comisiones`
- `public.comision_liquidaciones`
- `public.recordatorios`

### Decisiones técnicas relevantes

- El reset no borra `empleados`, `configuracion_general` ni `catalogo_config` para evitar dejar usuarios sin acceso o perder configuración base.
- Los IDs se generan de forma determinística por fuente/dominio/fila para que los vínculos entre vehículos, ventas, pagos, entregas, compras y gestoría sean consistentes.
- `LP.csv` se usa como fuente de stock/lista actual y pisa datos comerciales de la base histórica cuando coincide el dominio.
- Los archivos `Renta MM-YYYY.csv` se usan como fuente de ventas y rentabilidad histórica.
- `Caja 2025-2026.csv` se migra como movimientos manuales de caja, calculando `ingreso`/`egreso` según el signo del importe.
- Los datos que no tienen columna equivalente directa se preservan como JSON en `observaciones` o `seguimiento_comentarios`.
- Los vendedores históricos que no se pueden vincular con un usuario real de Supabase Auth quedan preservados en `observaciones`, sin crear perfiles falsos.
- Para respetar el `NOT NULL` de `ventas.vendedor_id`, `comisiones.vendedor_id` y `comision_liquidaciones.vendedor_id`, el SQL resuelve vendedores por nombre contra `empleados` y usa como fallback el primer empleado activo, priorizando admin/vendedor. El nombre histórico original queda preservado en `observaciones`.
- Para respetar el índice único `ventas_vehiculo_registrada_unique_idx`, cuando los Excel históricos traen más de una venta registrada para el mismo vehículo se conserva la primera como `registrada` y las siguientes se importan como `anulada`, agregando una nota de migración en `observaciones`.
- `Peritaje.pdf` fue detectado como PDF escaneado sin texto extraíble; queda pendiente para OCR o carga documental manual.
- Se normalizan defaults obligatorios detectados contra el schema real: `vehiculos.fotos` como `text[]`, flags de catálogo/publicación en `false`, `estado_preparacion = sin_preparar` y `fecha_ingreso` con fallback a la fecha de migración cuando el Excel no trae fecha de compra.
- Se saneó la carga de importes: los valores base que el schema exige no negativos (`costos`, `precios`, `pagos`, `gastos`) se importan solo si son `>= 0`; los negativos derivados de fórmulas o ajustes históricos quedan preservados en el JSON crudo de `observaciones`.
- Las celdas con `%` explícito se descartan para campos monetarios para evitar que porcentajes de rentabilidad entren como costos, precios o pagos.
- Para compatibilidad con el enum real `vehiculo_estado_preparacion`, la migración importa todos los vehículos con `estado_preparacion = sin_preparar`; los estados históricos de preparación quedan preservados en comentarios/metadata.
- `vehiculos.marca` y `vehiculos.modelo` se completan con `Sin marca` / `Sin modelo` cuando la fuente trae campos vacíos o valores inválidos como `0`, respetando el `NOT NULL` del schema y preservando la fila original en metadata.
- `compras_vehiculos.fecha` y `vehiculo_gastos.fecha` usan fallback `fecha_compra || fecha_venta || fecha_ingreso || fecha_migración` para respetar los `NOT NULL` del schema cuando los Excel históricos no traen fecha de compra.
- `vehiculo_gastos` se importa con columnas compatibles con el schema real (`tipo`, `monto`, `moneda`, `fecha`, `detalle`); el concepto descriptivo se conserva en `tipo/detalle` en lugar de usar columnas inexistentes.
- El tipo histórico `otros_gastos` se normaliza a `preparacion` por compatibilidad con el enum `vehiculo_gasto_tipo`, manteniendo la etiqueta original en `detalle`.
- `caja_movimientos` se alinea al schema real usando `monto` como importe operativo; no se inserta ni consulta la columna auxiliar `importe`, porque no existe en la tabla real.
- `caja_movimientos.periodo` se normaliza a fecha de inicio de mes (`YYYY-MM-01`), por ejemplo `ene-25` pasa a `2025-01-01`; el valor textual original queda preservado en el JSON de `observaciones`.
- `caja_movimientos.detalle_1` se completa siempre para respetar el `NOT NULL`: referencia del Excel, proveedor/tercero, concepto o `Movimiento importado` como fallback.
- `gestoria_tramites.fecha_finalizacion` solo se importa cuando el trámite queda `completado`; si la fila histórica sigue `en_proceso`, cualquier fecha de cierre dudosa queda preservada en `seguimiento_comentarios.raw` para respetar el check `gestoria_fecha_finalizacion_estado_check`.
- `gestoria_tramites.fecha_inicio` se completa siempre para respetar el `NOT NULL`: se usa la fecha operativa disponible y, si el Excel no trae una fecha interpretable, la fecha de migración como fallback.
- Las comisiones históricas sin una venta vinculable por dominio generan una venta mínima de soporte para respetar el `NOT NULL`/FK de `comisiones.venta_id`; la comisión original queda preservada y la venta incluye una nota de migración en `observaciones`.
- `comision_liquidaciones.periodo` se importa como fecha de inicio de mes (`YYYY-MM-01`) para compatibilidad con el schema real.
- `recordatorios.fecha_vencimiento` se completa siempre para respetar el `NOT NULL`; si la fuente no trae fecha de entrega/trámite, se usa la fecha de migración como vencimiento operativo.

### Conteos generados

- `proveedores`: 590
- `vehiculos`: 1761
- `compras_vehiculos`: 1740
- `vehiculo_gastos`: 2146
- `ventas`: 2129
- `ventas_pagos`: 2979
- `ventas_entregas`: 698
- `caja_movimientos`: 7825
- `gestoria_tramites`: 600
- `comisiones`: 84
- `comision_liquidaciones`: 18
- `recordatorios`: 225

### Pendientes antes de ejecutar en producción

- Revisar manualmente los SQL generados antes de ejecutarlos porque el primer archivo borra datos operativos.
- Confirmar que los nombres de columnas del esquema real coincidan con los usados por la app.
- Ejecutar primero `00_reset_operational_data.sql`, luego `01_import_funes_data.sql` y finalmente `02_validation_queries.sql`.
- Si Supabase SQL Editor rechaza `01_import_funes_data.sql` por tamaño, ejecutar los chunks de `generated/funes-migration/chunks/` en orden numérico.
- Revisar filas sin dominio y vendedores históricos para limpieza posterior.

## UX layout: bloques principales apilados

### Qué se corrigió

- Se corrigieron pantallas donde los bloques principales estaban uno al lado del otro y quedaban incómodos para operar.
- Los módulos principales ahora se apilan uno debajo del otro y ocupan todo el ancho disponible.
- Se mantuvieron grillas internas solo donde aportan densidad útil, como KPIs, campos de formulario, filas compactas o visualizaciones.

### Paths modificados

- `app/(dashboard)/recordatorios/page.tsx`
- `app/(dashboard)/caja/page.tsx`
- `app/(dashboard)/whatsapp/conexiones/page.tsx`
- `app/(dashboard)/configuracion/page.tsx`
- `app/(dashboard)/inventario/[id]/page.tsx`
- `app/(dashboard)/crm/[id]/page.tsx`
- `app/(dashboard)/dashboard/page.tsx`
- `components/dashboard/pnl-summary.tsx`
- `components/dashboard/inventory-summary.tsx`
- `components/ventas/renta-kpis.tsx`
- `components/inventario/vehiculo-detail.tsx`
- `components/gestoria/presupuesto-detail.tsx`
- `components/gestoria/presupuesto-form.tsx`

### Problemas UX resueltos

- Recordatorios: el formulario y la tabla dejaron de competir lado a lado; ahora el listado ocupa todo el módulo.
- Caja: la carga rápida y los movimientos quedan en lectura vertical, evitando una tabla comprimida.
- WhatsApp conexiones: creación de instancia y grilla de conexiones quedan ordenadas en flujo vertical.
- Configuración: formulario y resumen ya no se comprimen en columnas laterales.
- Inventario detalle: documentos y formulario documental quedan en bloques completos.
- CRM detalle y presupuestos de gestoría: se redujo la sensación de paneles apretados.
- Dashboard y Rentabilidad: los bloques grandes de análisis ya no quedan partidos en columnas equivalentes.

### Tablas de Supabase involucradas

- No se modificaron queries ni schema.
- El cambio fue exclusivamente de presentación.

### Decisiones técnicas relevantes

- No se tocaron layouts intencionalmente laterales como el inbox de WhatsApp y el detalle público del catálogo, porque ahí la distribución en dos zonas cumple una función clara.
- No se modificaron grillas internas de campos/KPIs para no perder densidad operativa.

## UX Dashboard ejecutivo final

### Qué se mejoró

- Se hizo una pasada específica sobre `/dashboard` para reforzar jerarquía ejecutiva y reducir ruido visual.
- El primer bloque ahora comunica mejor `Atención requerida`, con copy más directo y CTA sobrio.
- El bloque `Resultado del mes` quedó más enfocado:
  - resultado operativo mensual como lectura principal,
  - acumulado anual como dato secundario,
  - ingresos de caja, egresos y ventas devengadas como métricas de contexto,
  - gráfico mensual como apoyo, no como bloque dominante.
- Se compactó `Inventario` para evitar visualizaciones redundantes y priorizar señales accionables: stock, publicación, preparación, unidades sin foto/precio.
- Se renombró el bloque operativo a `Operaciones` para evitar solaparse con el bloque de inventario.

### Paths modificados

- `app/(dashboard)/dashboard/page.tsx`
- `components/dashboard/dashboard-alerts.tsx`
- `components/dashboard/pnl-summary.tsx`
- `components/dashboard/inventory-summary.tsx`
- `components/dashboard/operations-summary.tsx`

### Problemas UX resueltos

- Menos repetición de métricas financieras dentro del dashboard.
- Menos cards con el mismo peso visual.
- Mejor lectura del primer pantallazo: alertas, KPIs, resultado del mes.
- Inventario más compacto y orientado a acción.
- Copy menos genérico y más útil para operación diaria.

### Tablas de Supabase involucradas

- No se modificaron queries ni reglas de negocio.
- El cambio fue exclusivamente de presentación sobre métricas ya calculadas.

### Validación

- `npm run build` ejecutado después de la pasada.
- Build finalizado correctamente. Queda solo el warning conocido de Supabase en Edge Runtime.

## Rediseño operativo de Gestoría

### Qué se construyó

- Se reemplazó la vista principal de `/gestoria` por un tablero operativo tipo kanban.
- Las operaciones ahora se organizan por etapa:
  - `Presupuesto`
  - `Escribanía`
  - `Gestoría`
  - `Terminado`
- Cada card de operación muestra:
  - vehículo/venta,
  - cliente,
  - gestor asignado,
  - tipo de gestión: interna, cliente o mixta,
  - fecha de envío,
  - fecha de firma,
  - vencimiento,
  - presupuesto asociado,
  - costo final de transferencia,
  - estado del trámite.
- Se agregaron acciones rápidas por card para actualizar:
  - etapa,
  - estado general,
  - gestor asignado,
  - tipo de gestión,
  - fechas operativas,
  - costo final,
  - presupuesto confirmado,
  - CAT,
  - documentación física,
  - escribanía/retiro,
  - transferencia registral,
  - retiro de documentación por cliente,
  - transferencia municipal,
  - comentarios de seguimiento.
- El formulario de nuevo trámite ahora permite cargar desde el inicio:
  - etapa operativa,
  - tipo de gestión,
  - fecha de envío,
  - fecha de firma,
  - costo final de transferencia,
  - moneda,
  - presupuesto confirmado.

### Paths modificados/creados

- `app/(dashboard)/gestoria/page.tsx`
- `app/(dashboard)/gestoria/actions.ts`
- `components/gestoria/gestoria-kanban.tsx`
- `components/gestoria/gestoria-form.tsx`
- `lib/mock-data.ts`

### Tablas de Supabase involucradas

- `public.gestoria_tramites`
- `public.gestoria_presupuestos`
- `public.empleados`
- `public.ventas`
- `public.vehiculos`

### Decisiones técnicas relevantes

- El tablero usa los campos nuevos agregados a `gestoria_tramites` para representar el flujo real observado en la reunión.
- `responsable_id` se reutiliza como gestor asignado para no crear una segunda relación innecesaria.
- Los presupuestos se consultan por separado desde `gestoria_presupuestos` y se vinculan por `tramite_id`.
- Se mantuvo `/gestoria/presupuestos` como módulo específico para presupuesto detallado, mientras que `/gestoria` funciona como bandeja operativa.
- Las actualizaciones rápidas usan Server Actions con validación de sesión y permisos `admin/gestor`.
- No se modificó RLS ni se agregaron dependencias.

### Validación

- `npm run build` ejecutado después del rediseño.
- Build finalizado correctamente sin errores.

## Auditoría general UX y funcionamiento

### Qué se revisó

- Se ejecutó una validación completa de producción con `npm run build`.
- Se revisaron residuos visibles de UX detectados en auditorías anteriores:
  - headers internos repetidos dentro de tablas,
  - filtros desbordados o separados de acciones principales,
  - textos técnicos visibles,
  - referencias antiguas al color naranja,
  - labels en inglés o internos.
- Se revisaron especialmente las rutas operativas principales:
  - `/dashboard`
  - `/inventario`
  - `/compras`
  - `/ventas`
  - `/ventas/renta`
  - `/ventas/pendientes-entrega`
  - `/caja`
  - `/crm`
  - `/whatsapp`
  - `/gestoria`
  - `/gestoria/presupuestos`
  - `/comisiones`
  - `/empleados`
  - `/recordatorios`
  - `/dashboard/catalogo`

### Qué se corrigió

- Se eliminaron headers internos repetidos en listados principales para que el usuario no vea dos títulos de sección al mismo tiempo.
- Se consolidaron acciones, buscadores y filtros en una misma barra de trabajo en:
  - Compras
  - Ventas
  - CRM
  - Caja
  - Comisiones
  - WhatsApp
  - Gestoría
  - Presupuestos de gestoría
  - Catálogo interno
  - Empleados
  - Recordatorios
  - Pendientes de entrega
  - Rentabilidad
- Se movieron acciones principales o secundarias al toolbar del listado:
  - `Nueva compra`
  - `Nueva venta`
  - `Pendientes de entrega`
  - `Rentabilidad`
  - `Nuevo lead`
  - `Liquidaciones`
  - `Conexiones`
  - `Presupuestos`
  - `Nuevo trámite`
- Se sumaron contadores discretos de resultados en toolbars para orientar sin agregar nuevas cards.
- Se quitó el header interno del Dashboard para que la pantalla arranque directamente con `Atención requerida`.
- Se dejó `Volver a Ventas` en Rentabilidad como link secundario, no como header grande.
- Se corrigió un JSX desbalanceado en `RecordatoriosTable` detectado por build.
- Se corrigió una variable mal nombrada en el contador del catálogo interno.

### Paths modificados en esta pasada

- `app/(dashboard)/dashboard/page.tsx`
- `app/(dashboard)/compras/page.tsx`
- `app/(dashboard)/ventas/page.tsx`
- `app/(dashboard)/ventas/renta/page.tsx`
- `app/(dashboard)/caja/page.tsx`
- `app/(dashboard)/crm/page.tsx`
- `app/(dashboard)/comisiones/page.tsx`
- `app/(dashboard)/gestoria/page.tsx`
- `app/(dashboard)/whatsapp/page.tsx`
- `app/(dashboard)/recordatorios/page.tsx`
- `components/compras/compras-table.tsx`
- `components/ventas/ventas-table.tsx`
- `components/ventas/renta-table.tsx`
- `components/ventas/pendientes-entrega-table.tsx`
- `components/caja/caja-movimientos-table.tsx`
- `components/crm/leads-table.tsx`
- `components/comisiones/comisiones-table.tsx`
- `components/gestoria/gestoria-table.tsx`
- `components/gestoria/presupuestos-table.tsx`
- `components/whatsapp/conversaciones-table.tsx`
- `components/catalogo/catalogo-vehiculos-table.tsx`
- `components/empleados/empleados-table.tsx`
- `components/recordatorios/recordatorios-table.tsx`
- `DOCUMENTACION.md`

### Tablas de Supabase involucradas

- No se modificó schema ni SQL.
- Las pantallas revisadas siguen consultando las tablas operativas ya existentes:
  - `vehiculos`
  - `compras_vehiculos`
  - `ventas`
  - `ventas_entregas`
  - `ventas_pagos`
  - `caja_movimientos`
  - `comisiones`
  - `leads`
  - `conversaciones`
  - `whatsapp_instancias`
  - `gestoria_tramites`
  - `gestoria_presupuestos`
  - `empleados`
  - `recordatorios`

### Decisiones técnicas relevantes

- No se agregaron dependencias.
- No se cambió lógica de negocio ni Server Actions.
- No se tocó RLS, Auth, middleware ni webhook Evolution.
- Se mantuvo el criterio UX definido para Funes:
  - el header superior de plataforma indica la sección actual;
  - dentro de cada listado, buscador, filtros y acciones viven en la misma barra;
  - los headers repetidos dentro de cards/listados se eliminan salvo que identifiquen una sección funcional real.

### Validación

- `npm run build` ejecutado después de los ajustes.
- Build finalizado correctamente sin errores.
- Queda una advertencia no bloqueante de Supabase en Edge Runtime dentro de middleware, ya existente y sin impacto en esta pasada.

## Polish UX profesional integral

### Qué se mejoró

- Se implementó un patrón de filtros avanzados reutilizable para que las pantallas con muchas opciones no carguen visualmente toda la toolbar.
- Se aplicó `Más filtros` en:
  - WhatsApp
  - Recordatorios
  - Rentabilidad
- Se compactaron títulos internos grandes en pantallas de creación, detalle y administración para que el panel se sienta más operativo.
- Se redujo decoración del dashboard interno eliminando overlays visuales en KPIs.
- Se hizo más tipo inbox el detalle de conversación WhatsApp:
  - header más bajo,
  - mensajes con mayor protagonismo,
  - fondo de hilo más claro,
  - burbuja saliente con bordó suave,
  - card de IA más compacta.
- Se agregó un componente `FormSection` para estandarizar progresivamente formularios largos sin cambiar lógica ni schema.
- Se eliminó un gradiente decorativo de la ficha interna de vehículo, manteniendo un placeholder neutro.

### Paths creados

- `components/common/advanced-filters.tsx`
- `components/common/form-section.tsx`

### Paths modificados

- `app/(dashboard)/whatsapp/[id]/page.tsx`
- `app/(dashboard)/whatsapp/conexiones/page.tsx`
- `app/(dashboard)/gestoria/presupuestos/nuevo/page.tsx`
- `app/(dashboard)/gestoria/presupuestos/page.tsx`
- `app/(dashboard)/gestoria/presupuestos/[id]/page.tsx`
- `app/(dashboard)/dashboard/catalogo/page.tsx`
- `app/(dashboard)/configuracion/page.tsx`
- `app/(dashboard)/comisiones/liquidaciones/page.tsx`
- `app/(dashboard)/comisiones/liquidaciones/[id]/page.tsx`
- `app/(dashboard)/compras/nueva/page.tsx`
- `app/(dashboard)/crm/nuevo/page.tsx`
- `app/(dashboard)/crm/[id]/page.tsx`
- `app/(dashboard)/gestoria/nuevo/page.tsx`
- `app/(dashboard)/ventas/nueva/page.tsx`
- `app/(dashboard)/inventario/nuevo/page.tsx`
- `app/(dashboard)/inventario/[id]/page.tsx`
- `app/(dashboard)/inventario/[id]/editar/page.tsx`
- `app/(dashboard)/ventas/pendientes-entrega/page.tsx`
- `app/(dashboard)/empleados/page.tsx`
- `components/whatsapp/conversaciones-table.tsx`
- `components/whatsapp/messages-list.tsx`
- `components/whatsapp/ai-summary-card.tsx`
- `components/recordatorios/recordatorios-table.tsx`
- `components/ventas/renta-table.tsx`
- `components/dashboard/kpi-card.tsx`
- `components/inventario/vehiculo-detail.tsx`
- `DOCUMENTACION.md`

### Problemas UX resueltos

- Toolbars muy cargadas en pantallas con muchos filtros.
- Títulos internos demasiado grandes en páginas operativas.
- Detalle WhatsApp todavía demasiado parecido a ficha administrativa.
- Dashboard con decoración visual innecesaria para un panel operativo.
- Placeholder interno de vehículo demasiado decorativo para uso administrativo.

### Tablas de Supabase involucradas

- No se modificó schema ni SQL.
- Las mejoras son de presentación sobre pantallas que usan:
  - `conversaciones`
  - `conversacion_mensajes`
  - `recordatorios`
  - `ventas`
  - `ventas_entregas`
  - `vehiculos`
  - `gestoria_presupuestos`
  - `comision_liquidaciones`
  - `empleados`

### Decisiones técnicas relevantes

- No se agregaron dependencias.
- No se tocaron Server Actions ni reglas de negocio.
- No se modificó el webhook Evolution.
- Se preservó el catálogo público con una estética más comercial; la reducción decorativa se aplicó al panel interno.
- `FormSection` queda disponible para migrar formularios largos progresivamente sin hacer una reescritura riesgosa.

### Validación

- `npm run build` ejecutado al finalizar.
- Build finalizado correctamente sin errores.
- Permanece la advertencia no bloqueante de Supabase en middleware/Edge Runtime.

## Aplicación completa del sistema visual HA

### Qué se aplicó

- Se incorporó un `DESIGN.md` propio para Funes Exclusivos basado en el manual visual de referencia, adaptado al producto real de concesionaria.
- Se creó `AGENTS.md` para que futuras pasadas de desarrollo respeten el sistema visual, el tono de producto y las restricciones operativas.
- Se normalizó la base visual hacia una UI B2B premium, compacta y operativa:
  - fondo blanco como superficie principal;
  - acento bordó corporativo para acciones, foco, links y estados activos;
  - bordes sutiles;
  - radios medios (`rounded-md`);
  - sombras eliminadas o reducidas al mínimo;
  - tablas compactas con encabezados en mayúsculas;
  - formularios con foco bordó y lenguaje de negocio.
- Se agregó un encabezado contextual global con breadcrumb dentro del layout privado para mantener orientación permanente sin recargar cada pantalla.
- Se ajustó el sidebar:
  - navegación más compacta;
  - item activo con acento bordó;
  - fondo blanco;
  - avatar circular;
  - sin acción de logout visible cuando el sidebar está colapsado.
- Se reforzó la limpieza de datos visibles:
  - en listados operativos se prioriza mostrar nombres de personas en vez de emails;
  - se eliminaron errores visibles que mencionaban infraestructura;
  - se mantuvieron nombres técnicos solo donde son columnas, logs o valores internos no visibles.
- Se extendió el middleware para cubrir también `/compras` y `/recordatorios`, manteniendo encabezado contextual y protección consistente.
- Se corrigieron detalles finos de copy y consistencia, incluyendo el texto de seguimiento de CRM y mensajes de WhatsApp.

### Paths creados

- `DESIGN.md`
- `AGENTS.md`
- `components/dashboard/breadcrumb-header.tsx`

### Paths modificados principales

- `app/globals.css`
- `tailwind.config.ts`
- `middleware.ts`
- `lib/supabase/middleware.ts`
- `lib/supabase/server.ts`
- `lib/supabase/client.ts`
- `app/(dashboard)/layout.tsx`
- `app/(dashboard)/dashboard/page.tsx`
- `components/dashboard/sidebar.tsx`
- `components/dashboard/user-menu.tsx`
- `components/dashboard/kpi-card.tsx`
- `components/shared/page-header.tsx`
- `components/shared/empty-state-card.tsx`
- `components/common/filter-bar.tsx`
- `components/common/table-shell.tsx`
- `components/whatsapp/whatsapp-instance-card.tsx`
- `components/whatsapp/whatsapp-connection-alert.tsx`
- `components/whatsapp/messages-list.tsx`
- `components/whatsapp/conversaciones-table.tsx`
- `components/crm/crm-pipeline.tsx`
- `components/crm/leads-table.tsx`
- `components/crm/lead-interactions-timeline.tsx`
- `components/ventas/pendientes-entrega-table.tsx`
- `components/comisiones/comisiones-comparativa.tsx`
- `components/recordatorios/recordatorio-form.tsx`
- `components/recordatorios/recordatorios-table.tsx`
- `app/(dashboard)/whatsapp/actions.ts`
- `app/login/actions.ts`

### Problemas UX resueltos

- Se eliminó la apariencia de dashboard genérico con fondos grises, radios grandes y sombras decorativas.
- Las acciones principales dejaron de depender del negro como color primario y pasaron al acento bordó definido por marca.
- Los links visibles ahora tienen tratamiento consistente de link: bordó y subrayado.
- Los estados de foco en inputs/selects pasaron de gris neutro a bordó suave.
- Se redujo exposición visual de emails como fallback en listados donde el usuario espera ver personas, no cuentas.
- Se corrigieron rutas protegidas que no participaban del middleware y podían perder contexto visual.
- Se eliminó copy técnico visible de errores de WhatsApp y configuración.
- Se corrigió la query de Caja en el dashboard para usar la columna real `monto` y evitar avisos runtime por una columna histórica `importe`.

### Tablas de Supabase involucradas

- No se modificó schema ni se crearon tablas.
- Las pantallas afectadas siguen usando las tablas ya existentes del sistema:
  - `empleados`
  - `vehiculos`
  - `ventas`
  - `caja_movimientos`
  - `comisiones`
  - `leads`
  - `conversaciones`
  - `whatsapp_instancias`
  - `recordatorios`

### Decisiones técnicas relevantes

- Se priorizó una capa visual global y de bajo riesgo antes que reescribir cada módulo.
- El breadcrumb se resuelve desde middleware mediante `x-pathname` para no acoplar cada página a lógica de navegación.
- No se tocaron reglas de negocio, RLS, SQL ni integraciones externas.
- Los términos técnicos siguen existiendo en nombres de columnas, tipos y logs server-side, pero no se presentan como copy de producto.

### Validación

- `npm run build` ejecutado luego de esta última pasada visual.
- Build finalizado correctamente sin errores.

## Ajuste de toolbar operativa por sección

### Qué se ajustó

- Se estableció como regla de producto que el header de plataforma es el único encabezado contextual de cada ruta.
- Se eliminaron headers internos repetidos en Inventario para evitar duplicar `Operación / Inventario`.
- Se movió la acción principal `Nuevo vehículo` a la misma fila que el buscador y el filtro `Solo stock`.
- Se agregó contador operativo compacto en la barra de Inventario: unidades filtradas sobre total.
- Se actualizó `DESIGN.md` y `AGENTS.md` para que futuras secciones sigan el mismo patrón:
  - acción principal,
  - buscador,
  - filtros,
  - acciones secundarias,
  - todo en una misma toolbar con wrap.

### Paths modificados

- `app/(dashboard)/inventario/page.tsx`
- `components/inventario/inventario-table.tsx`
- `DESIGN.md`
- `AGENTS.md`
- `DOCUMENTACION.md`

### Decisión visual

- Los títulos internos de listados/tablas se consideran ruido visual cuando la plataforma ya muestra la sección actual.
- En desktop, los controles deben convivir en una sola fila.
- En mobile, pueden apilarse, pero siguen perteneciendo a una única toolbar operativa.

## QA UX final

### Qué se revisó

- Se hizo una pasada final sobre las rutas y pantallas principales del sistema:
  - `/dashboard`
  - `/ventas/renta`
  - `/recordatorios`
  - `/whatsapp`
  - `/whatsapp/[id]`
  - `/inventario`
  - `/inventario/nuevo`
  - `/inventario/[id]`
  - `/inventario/[id]/editar`
  - `/caja`
  - `/comisiones`
  - `/comisiones/liquidaciones`
  - `/crm`
  - `/gestoria`
  - `/gestoria/presupuestos`
  - `/catalogo`
  - `/empleados`
  - `/configuracion`
  - `/login`
- También se repasaron tablas, filtros, headers, empty states y copy visible repetido en modo demo.

### Qué se corrigió

- Se reforzó la jerarquía visual del dashboard para que `Atención requerida` y los KPIs principales sigan siendo lo primero visible.
- Se normalizó el lenguaje visible de `Renta` a `Rentabilidad` en la UI pública del módulo de ventas.
- Se ajustaron textos y banners de demo para que suenen más comerciales y menos técnicos.
- Se corrigió copy visible de login para no exponer frases innecesariamente técnicas en el acceso.
- Se dejó el catálogo, WhatsApp, caja, recordatorios y gestoría con copy más limpio y sin ruido visual adicional.

### Paths modificados

- `app/login/page.tsx`
- `app/(dashboard)/caja/page.tsx`
- `app/(dashboard)/comisiones/page.tsx`
- `app/(dashboard)/comisiones/liquidaciones/page.tsx`
- `app/(dashboard)/compras/nueva/page.tsx`
- `app/(dashboard)/crm/nuevo/page.tsx`
- `app/(dashboard)/crm/page.tsx`
- `app/(dashboard)/dashboard/catalogo/page.tsx`
- `app/(dashboard)/gestoria/nuevo/page.tsx`
- `app/(dashboard)/gestoria/page.tsx`
- `app/(dashboard)/gestoria/presupuestos/nuevo/page.tsx`
- `app/(dashboard)/gestoria/presupuestos/page.tsx`
- `app/(dashboard)/inventario/nuevo/page.tsx`
- `app/(dashboard)/inventario/page.tsx`
- `app/(dashboard)/recordatorios/page.tsx`
- `app/(dashboard)/ventas/nueva/page.tsx`
- `app/(dashboard)/ventas/page.tsx`
- `app/(dashboard)/ventas/renta/page.tsx`
- `app/(dashboard)/whatsapp/page.tsx`

### Problemas UX cerrados

- Se eliminaron mensajes visibles de demo que todavía sonaban a infraestructura.
- Se corrigieron textos de acceso para que la experiencia inicial se sienta más de producto y menos de entorno técnico.
- Se terminó de cerrar la diferencia entre la nomenclatura interna del módulo y el label visible al usuario final.

### Pendientes UX

- Quedan términos técnicos en código y logs server-side por necesidad operativa, pero no se muestran como copy principal en la UI.
- Si en futuras pasadas se quiere llevar el tono todavía más “premium”, se puede unificar el copy de demo en un banner compartido sin cambiar lógica.

### Tablas de Supabase involucradas

- No se cambiaron tablas en esta pasada final de QA UX.
- El ajuste fue únicamente de presentación y copy sobre las tablas ya utilizadas por las pantallas revisadas.

### Validación

- `npm run build` ejecutado al cierre de la pasada final.
- Build completado correctamente sin errores TypeScript ni de runtime estático.

## Sistema visual basado en referencia HA

### Qué se modificó

- Se incorporó un manual propio de diseño para Funes Exclusivos basado en la referencia de HA Control de Obra, adaptado a la operación de concesionaria.
- Se agregó una guía operativa para agentes con reglas de UX, permisos, Supabase, WhatsApp y validación.
- Se normalizó la base visual del sistema hacia una UI más compacta:
  - fondo general blanco,
  - radios `rounded-md`,
  - bordes sutiles,
  - foco visible bordó,
  - botones primarios bordó,
  - sidebar activo bordó,
  - empty states y headers compartidos más sobrios.
- Se redujo la sensación de cards infladas reemplazando radios grandes por radios operativos en `app` y `components`.

### Paths creados

- `DESIGN.md`
- `AGENTS.md`

### Paths modificados

- `app/globals.css`
- `tailwind.config.ts`
- `app/(dashboard)/layout.tsx`
- `components/shared/page-header.tsx`
- `components/shared/empty-state-card.tsx`
- `components/common/filter-bar.tsx`
- `components/common/table-shell.tsx`
- `components/dashboard/sidebar.tsx`
- `components/dashboard/kpi-card.tsx`
- `app/**`
- `components/**`

### Decisiones visuales tomadas

- Se eligió `#8A1538` como color principal operativo para acciones, foco y estados activos.
- Se mantuvo el panel interno en fondo blanco para reforzar una sensación enterprise y reducir ruido visual.
- Se usó `rounded-md` como radio base para acercar la interfaz a un producto operativo B2B.
- Se preservaron los colores de estado existentes para no perder lectura rápida de alertas, errores, pendientes y positivos.

### Tablas de Supabase involucradas

- No hubo cambios de schema ni SQL.
- La pasada fue de UX, documentación y estilos compartidos sobre pantallas existentes.

### Pendientes

- Queda como mejora futura migrar gradualmente todas las tablas a menus de tres puntitos para acciones por fila.
- Algunas pantallas conservan estructuras propias por estabilidad; el nuevo `DESIGN.md` queda como referencia para futuras iteraciones visuales.

## Permisos visuales por rol

### Qué se ajustó

- Se endureció la UI por rol para ocultar datos sensibles e internos sin tocar RLS ni el schema.
- Se ocultaron costos, márgenes y secciones internas a perfiles no administrativos donde correspondía.
- Se limitaron acciones manuales de caja, comisiones y configuración a los roles permitidos.
- Se simplificó el dashboard para que administración vea la lectura financiera completa y el resto vea una versión más comercial/operativa.

### Paths modificados

- `lib/auth/permissions.ts`
- `app/(dashboard)/dashboard/page.tsx`
- `components/dashboard/pnl-summary.tsx`
- `components/dashboard/inventory-summary.tsx`
- `app/(dashboard)/inventario/page.tsx`
- `app/(dashboard)/inventario/[id]/page.tsx`
- `app/(dashboard)/inventario/[id]/editar/page.tsx`
- `components/inventario/inventario-table.tsx`
- `components/inventario/vehiculo-form.tsx`
- `components/inventario/vehiculo-detail.tsx`
- `app/(dashboard)/ventas/page.tsx`
- `components/ventas/ventas-table.tsx`
- `app/(dashboard)/ventas/renta/page.tsx`
- `components/ventas/renta-kpis.tsx`
- `components/ventas/renta-table.tsx`
- `app/(dashboard)/caja/page.tsx`
- `components/caja/caja-movimiento-form.tsx`
- `app/(dashboard)/comisiones/page.tsx`

### Datos sensibles ocultados por rol

- Costo de adquisición, costo de reposición y referencias internas de compra en inventario.
- Sección `Compra y costos internos` en formulario y detalle de vehículo para perfiles sin permisos.
- Márgenes, resultado operativo e indicadores financieros de `Rentabilidad` para roles no administrativos.
- Valor estimado del stock en el dashboard para perfiles sin acceso a costos.
- Actividad de vendedores y lectura financiera del dashboard para perfiles no administrativos.
- Formulario manual de caja para vendedores.
- Acción de liquidaciones en comisiones para roles no administrativos.

### Tablas de Supabase involucradas

- `public.empleados`
- `public.vehiculos`
- `public.ventas`
- `public.ventas_pagos`
- `public.ventas_entregas`
- `public.caja_movimientos`
- `public.comisiones`
- `public.comision_liquidaciones`

### Decisiones técnicas relevantes

- Los permisos visuales se resolvieron con helpers simples en `lib/auth/permissions.ts` para evitar complejidad innecesaria.
- Se mantuvo la lógica de negocio y la seguridad real en RLS; la UI solo oculta lo que no corresponde mostrar.
- Las páginas principales ahora reciben el rol del empleado para decidir qué columnas, métricas y acciones exponer.
- Se preservó el modo demo y la experiencia de lectura para administración sin afectar rutas públicas ni el flujo operativo.

## Polish global de tablas, filtros, headers y empty states

### Qué se pulió

- Se unificó el patrón visual de headers, filtros y empty states en las pantallas más cargadas.
- Se incorporaron componentes comunes livianos para reutilizar patrones:
  - `components/common/page-header.tsx`
  - `components/common/empty-state.tsx`
  - `components/common/filter-bar.tsx`
  - `components/common/table-shell.tsx`
- Se mejoró el comportamiento responsive de filtros para evitar truncamientos como `Todos los vendedore` o `Todas las moned`.
- Se reemplazaron empty states genéricos por mensajes de estado inicial y sin resultados más claros.
- Se homogeneizó la jerarquía visual de los headers principales con `PageHeader`.

### Paths modificados

- `components/common/page-header.tsx`
- `components/common/empty-state.tsx`
- `components/common/filter-bar.tsx`
- `components/common/table-shell.tsx`
- `app/(dashboard)/caja/page.tsx`
- `app/(dashboard)/compras/page.tsx`
- `app/(dashboard)/crm/page.tsx`
- `app/(dashboard)/comisiones/page.tsx`
- `app/(dashboard)/gestoria/page.tsx`
- `app/(dashboard)/recordatorios/page.tsx`
- `app/(dashboard)/ventas/renta/page.tsx`
- `components/compras/compras-table.tsx`
- `components/comisiones/comisiones-table.tsx`
- `components/crm/leads-table.tsx`
- `components/gestoria/gestoria-table.tsx`
- `components/recordatorios/recordatorios-table.tsx`
- `components/ventas/renta-table.tsx`
- `components/whatsapp/conversaciones-table.tsx`

### Problemas UX resueltos

- Se corrigió el desborde visual de filtros en múltiples tablas.
- Se unificó el copy de empty states para distinguir entre base vacía y sin resultados por filtros.
- Se reforzó la consistencia de los encabezados con título, descripción y acción principal.
- Se redujo la sensación de CRUD genérico en listados de compras, comisiones, CRM, gestoría, recordatorios, WhatsApp y rentabilidad.

### Tablas de Supabase involucradas

- `public.caja_movimientos`
- `public.compras_vehiculos`
- `public.comisiones`
- `public.conversaciones`
- `public.conversacion_mensajes`
- `public.gestoria_tramites`
- `public.leads`
- `public.recordatorios`
- `public.ventas`
- `public.vehiculos`

### Decisiones técnicas relevantes

- No se cambió lógica de negocio ni queries.
- Los patrones comunes se resolvieron con componentes livianos y ajustes de layout en lugar de un refactor grande.
- Se mantuvo light mode y la paleta sobria ya definida para no romper la identidad visual.

### Validación

- `npm run build` ejecutado después del polish global.
- Build finalizado correctamente sin errores.

## Catálogo público premium

### Qué se mejoró

- Se rediseñó la ruta pública `/catalogo` como una vidriera comercial premium, con un hero más fuerte de marca, CTA de WhatsApp destacado y microcopy de confianza.
- Se simplificaron y ordenaron los filtros para que no compitan con el hero, usando una barra secundaria más discreta y responsive.
- Se mejoraron las cards públicas de vehículo para que la foto tenga protagonismo, con metadata más clara y CTA más visibles.
- Se reforzó el detalle público de cada unidad con una jerarquía más comercial y una acción de WhatsApp más evidente.
- Se mejoró el empty state público para que parezca una página de catálogo y no una pantalla administrativa vacía.
- Se generaron fotos demo vectoriales locales para que el catálogo mock se vea poblado sin depender de assets externos.

### Paths modificados

- `app/catalogo/page.tsx`
- `app/catalogo/[id]/page.tsx`
- `components/catalogo-publico/catalogo-header.tsx`
- `components/catalogo-publico/catalogo-filters.tsx`
- `components/catalogo-publico/catalogo-vehicle-card.tsx`
- `components/catalogo-publico/catalogo-vehicle-grid.tsx`
- `components/catalogo-publico/catalogo-vehicle-detail.tsx`
- `components/catalogo-publico/catalogo-empty-state.tsx`
- `app/(dashboard)/dashboard/catalogo/page.tsx`
- `components/catalogo/catalogo-settings-form.tsx`
- `lib/mock-data.ts`

### Problemas UX resueltos

- La portada del catálogo dejó de verse genérica y pasó a sentirse como una vidriera premium de concesionaria.
- Se reforzó el CTA principal de WhatsApp arriba del todo.
- Se evitó que los filtros compitan visualmente con el hero.
- Las cards ahora dan más protagonismo a la imagen y muestran menos ruido comercial.
- El detalle público quedó más claro y limpio, sin exponer información interna.

### Tablas de Supabase involucradas

- `public.catalogo_config`
- `public.vehiculos`

### Decisiones técnicas relevantes

- No se tocaron reglas de publicación ni acciones de backend.
- Para el demo se generaron imágenes vectoriales locales embebidas en `lib/mock-data.ts`, evitando dependencias externas o assets nuevos.
- Se mantuvieron las rutas públicas y el SEO existente, ajustando solo la presentación y el copy.

### Validación

- `npm run build` ejecutado luego del rediseño.
- Build finalizado correctamente sin errores.

## UX/UI vehículo: datos comerciales e internos

### Qué se mejoró

- Se reorganizó el formulario de alta y edición de vehículo en secciones más claras:
  - `Datos básicos`
  - `Precio comercial`
  - `Compra y costos internos`
  - `Preparación`
  - `Catálogo y publicaciones`
  - `Fotos y observaciones`
- Se separó visualmente la información comercial de la información interna para que la carga sea más rápida y menos confusa.
- Se movieron fotos y observaciones al final del formulario, con copy más breve y orientado al uso real.
- Se reforzó la ficha interna del vehículo para que los datos de proveedor/operación no compitan con el resumen comercial.

### Paths modificados

- `components/inventario/vehiculo-form.tsx`
- `components/inventario/vehiculo-detail.tsx`

### Problemas UX resueltos

- Se redujo la mezcla entre pricing comercial y costos internos.
- Se hizo más clara la jerarquía entre información operativa, catálogo y fotos.
- Se marcó la sección interna con un tratamiento visual sutil para no confundirla con datos públicos.
- Se aclararon labels como `Observaciones internas` y `Descripción pública` para evitar ambigüedad.

### Tablas de Supabase involucradas

- `public.vehiculos`
- `public.proveedores`

### Decisiones técnicas relevantes

- No se modificaron nombres de columnas, Server Actions ni validaciones.
- La reorganización se resolvió solo con estructura visual y orden de render, usando `order-*` y cards agrupadas.
- No se ocultaron campos por rol en esta etapa para evitar introducir dependencias nuevas de permisos en el formulario.

### Validación

- `npm run build` ejecutado luego del ajuste visual.
- Build finalizado correctamente sin errores.

## UX/UI Caja: carga rápida y tabla simplificada

### Qué se mejoró

- Se reorganizó `/caja` para que la pantalla arranque con un resumen del mes más claro, seguido de la carga rápida y luego el listado.
- Se simplificó el formulario de carga para que los campos principales queden arriba y los detalles opcionales abajo, con lenguaje de negocio.
- Se redujo la tabla de movimientos a menos columnas visibles por defecto, priorizando fecha, tipo, medio, concepto, referencia, cuenta y monto.
- Se agregó detalle expandible por fila para no perder trazabilidad sin saturar la vista principal.
- Se eliminó el copy técnico visible como `Detalle 1`, `Detalle 2` y `Detalle 3`, reemplazándolo por labels más claros para el usuario.

### Paths modificados

- `app/(dashboard)/caja/page.tsx`
- `app/(dashboard)/caja/actions.ts`
- `components/caja/caja-movimiento-form.tsx`
- `components/caja/caja-movimientos-table.tsx`
- `components/caja/caja-kpi-card.tsx`
- `components/caja/caja-summary.tsx`
- `components/caja/caja-tipo-badge.tsx`

### Problemas UX resueltos

- Se redujo el overflow horizontal innecesario en el listado.
- Se hizo más legible el bloque de carga rápida con jerarquía visual de datos principales y opcionales.
- Se reemplazaron labels internos por lenguaje de negocio:
  - `Detalle 1` → `Referencia`
  - `Detalle 2` → `Comprobante / nota`
  - `Detalle 3` → `Proveedor / tercero`
- Se mejoró la lectura del resumen mensual evitando paredes de métricas sin contexto.

### Tablas de Supabase involucradas

- `public.caja_movimientos`
- `public.proveedores`
- `public.activos`
- `public.comision_liquidaciones`
- `public.compras_vehiculos`
- `public.ventas`

### Decisiones técnicas relevantes

- No se tocó la lógica de negocio ni la creación automática de movimientos desde ventas, compras o comisiones.
- La mejora se resolvió con presentación, jerarquía visual y un detalle expandible por fila para mantener densidad sin perder información.
- Se mantuvo la validación de Server Actions y solo se ajustó el copy de error para que el usuario vea `Referencia` en vez de un label técnico.

### Validación

- `npm run build` ejecutado luego del ajuste visual.
- Build finalizado correctamente sin errores.

## Rediseño inbox WhatsApp

### Qué se rediseñó

- Se reorganizó `/whatsapp/[id]` para funcionar como un inbox B2B:
  - header superior compacto,
  - columna principal para el hilo de mensajes,
  - panel lateral derecho para contacto, IA y seguimiento.
- Se redujo la redundancia visual entre contacto, estado, IA y seguimiento.
- Se ocultaron identificadores técnicos de instancia y payload de la UI.
- Se simplificó la tabla de conversaciones para que la columna IA sea más clara y no duplique teléfono en el lead.

### Paths modificados

- `app/(dashboard)/whatsapp/[id]/page.tsx`
- `components/whatsapp/conversacion-detail.tsx`
- `components/whatsapp/messages-list.tsx`
- `components/whatsapp/ai-summary-card.tsx`
- `components/whatsapp/conversation-follow-up-form.tsx`
- `components/whatsapp/conversation-header-actions.tsx`
- `components/whatsapp/conversaciones-table.tsx`

### Problemas UX resueltos

- El hilo de mensajes pasó a ser el protagonista visual de la pantalla.
- Se evitaron cards apiladas con la misma información repetida.
- El encabezado superior ahora concentra las acciones principales sin superponer badges.
- La tabla de conversaciones dejó de mostrar teléfono duplicado entre contacto y lead.
- Se eliminaron textos técnicos visibles como `Unread` o nombres de instancia en el detalle.

### Tablas de Supabase involucradas

- `public.conversaciones`
- `public.conversacion_mensajes`
- `public.leads`
- `public.empleados`
- `public.vehiculos`

### Decisiones técnicas relevantes

- Se reutilizaron las acciones existentes para no tocar el flujo comercial.
- La edición de seguimiento se mantuvo en un solo formulario con campos ocultos para conservar los datos IA sin duplicar UI.
- El botón de resumen IA se movió al encabezado para darle más protagonismo y evitar un panel recargado.

### Validación

- `npm run build` ejecutado al cierre del rediseño.
- Build finalizado correctamente sin errores.
## Menú de perfil simplificado

### Qué se mejoró
- El menú de usuario ahora muestra únicamente la foto/placeholder de perfil y el nombre.
- Se eliminaron del menú visible el email, el rol, la etiqueta administrativa y el texto de estado de sesión.
- Se mantuvo la acción `Cerrar sesión`, además del cierre al hacer click afuera o presionar Escape.

### Paths modificados
- `components/dashboard/user-menu.tsx`
- `DOCUMENTACION.md`

### Tablas de Supabase involucradas
- Ninguna.

### Decisiones técnicas
- Se conservaron los datos de empleado necesarios para permisos y logout, pero no se presentan como información secundaria en la interfaz.
### Corrección de vehículo de interés en CRM

Se corrigió la celda de vehículo de interés en la vista de tabla del CRM. El disparador del detalle ya no queda vacío: ahora muestra una tarjeta compacta con miniatura, nombre y datos resumidos; cuando la unidad no tiene foto, se muestra un ícono de cámara como indicador visual. El modal con la ficha comercial del vehículo se mantiene disponible al hacer clic.

Paths modificados: `components/common/data-entry-modal.tsx`, `components/crm/leads-table.tsx`.

### Corrección de carga de portada del catálogo

Se corrigió la carga de la portada panorámica para evitar errores `413` por imágenes pesadas: la imagen se redimensiona y comprime en el navegador antes de enviarse, con un límite seguro para el entorno de producción. También se hizo tolerante el estado del formulario para que un fallo de red no provoque una excepción de cliente ni deje la pantalla en blanco.

Paths modificados: `components/catalogo/catalogo-hero-upload-form.tsx`, `app/(dashboard)/catalogo/actions.ts`.

### Limpieza de headers internos

Se eliminó el header interno redundante de la pantalla administrativa de Catálogo. Las acciones `Editar vidriera` y `Abrir catálogo público` ahora comparten la misma toolbar que la búsqueda y los filtros, reduciendo espacio sin perder accesibilidad. Se revisaron las páginas del dashboard y no se modificaron headers de detalle o formularios, donde el título contextual sigue siendo necesario para orientar la tarea.

Paths modificados: `app/(dashboard)/dashboard/catalogo/page.tsx`, `components/catalogo/catalogo-vehiculos-table.tsx`.

### Análisis por lote de leads nuevos

La acción de análisis con IA se movió al encabezado de la columna `Nuevo` del pipeline para mantener el foco operativo y reducir ruido en la toolbar general. El botón ahora se muestra como `Analizar` y abre un selector compacto para elegir cuántos leads procesar. El límite seleccionado se aplica en la consulta de leads nuevos, con un máximo seguro de 200 registros y sin cambiar los permisos ni la lógica de clasificación existente.

Paths modificados: `app/(dashboard)/crm/actions.ts`, `app/(dashboard)/crm/page.tsx`, `components/crm/analyze-new-leads-button.tsx`, `components/crm/crm-pipeline.tsx`, `components/crm/crm-views.tsx`.

Tablas y servicios involucrados: `leads`, `conversaciones`, `conversacion_mensajes`, `vehiculos`, `empleados` y OpenAI para la clasificación manual solicitada.

Validación: `npm run build` finalizado correctamente.

### Resúmenes de sección colapsables

Se incorporó un patrón común para ocultar por defecto las cards y resúmenes superiores de las secciones operativas. Cada pantalla muestra el botón compacto `Ver resumen` y permite desplegar el contenido con una transición breve; la preferencia se guarda por sección en `localStorage` para conservar la elección del usuario en el mismo navegador. Se aplicó en Inventario, Ventas, Rentabilidad, Caja, CRM, Gestoría, Presupuestos, Catálogo, Empleados y Recordatorios. El Dashboard mantiene sus KPIs visibles por decisión de jerarquía ejecutiva, y las alertas críticas no se colapsaron.

Path creado: `components/common/collapsible-summary.tsx`.

Paths modificados: `app/(dashboard)/inventario/page.tsx`, `app/(dashboard)/ventas/page.tsx`, `app/(dashboard)/ventas/renta/page.tsx`, `app/(dashboard)/caja/page.tsx`, `app/(dashboard)/crm/page.tsx`, `app/(dashboard)/gestoria/page.tsx`, `app/(dashboard)/gestoria/presupuestos/page.tsx`, `app/(dashboard)/dashboard/catalogo/page.tsx`, `app/(dashboard)/empleados/page.tsx`, `app/(dashboard)/recordatorios/page.tsx`.

No se modificaron tablas ni lógica de negocio. Validación: `npm run build` finalizado correctamente.

### Compactación del gráfico de comisiones

Se ajustó el gráfico de rendimiento por vendedor para reducir su presencia visual: menor altura, padding y tipografías, controles más compactos, líneas y puntos más finos y tooltip reducido. Se mantuvieron la comparación mensual, el cambio de métrica, la selección de moneda y la información al pasar el cursor.

Path modificado: `components/comisiones/comisiones-vendedores-chart.tsx`.

No se modificaron tablas ni lógica de negocio. Validación: `npm run build`.

### Ajuste final de altura y popover del pipeline

Las columnas del pipeline ahora ocupan el área visible disponible hasta el final de la sección, manteniendo el scroll vertical de cada columna. El selector de análisis de leads se posiciona respecto del viewport y ya no queda oculto por los contenedores con scroll horizontal.

Paths modificados: `components/crm/crm-pipeline.tsx`, `components/crm/analyze-new-leads-button.tsx`.

### Corrección del modal de análisis del pipeline

Se corrigió el popover de `Analizar` para que no quede recortado por el contenedor de la columna `Nuevo`. Ahora se ancla desde el lado izquierdo de la columna, respeta el ancho disponible del viewport y queda por encima del contenido sin afectar el scroll interno.

Paths modificados: `components/crm/analyze-new-leads-button.tsx`, `components/crm/crm-pipeline.tsx`.

### Corrección de escala del gráfico de comisiones

Se fijó la altura renderizada del SVG para evitar que el gráfico creciera con el ancho de la pantalla. También se redujeron las etiquetas de ejes y meses para mantener una escala más liviana y legible.

Path modificado: `components/comisiones/comisiones-vendedores-chart.tsx`.

### Pipeline CRM con columnas amplias

Se ajustó la vista de columnas del pipeline para usar un ancho mínimo cómodo por etapa y scroll horizontal en el carril completo. Cada columna conserva su scroll vertical interno y la paginación `Ver más`, evitando comprimir las tarjetas cuando se muestran todas las etapas.

Path modificado: `components/crm/crm-pipeline.tsx`.

No se modificaron tablas ni lógica de negocio. Validación: `npm run build`.

### Ajuste visual de hitos de gestoría

Se mejoró la lectura de los hitos operativos dentro de las tarjetas de gestoría: más separación vertical, íconos y estados ligeramente más legibles, y mayor espacio entre la información económica y el checklist. Se mantuvo el scroll interno de cada columna para conservar la densidad general de la vista.

Path modificado: `components/gestoria/gestoria-kanban.tsx`.

No se modificaron tablas ni lógica de negocio. Validación: `npm run build`.

### Navegación contextual por áreas

Se reorganizó la navegación interna para que el sidebar concentre únicamente Dashboard y las áreas principales: Operación, Comercial y Administración. Las subsecciones de cada área ahora aparecen en una subbarra contextual debajo del header de plataforma, con íconos, estado activo, permisos por rol y scroll horizontal responsive. Se conservaron las rutas existentes y el control de acceso actual.

Path creado: `components/dashboard/section-subheader.tsx`.

Paths modificados: `components/dashboard/sidebar.tsx`, `app/(dashboard)/layout.tsx`.

No se modificaron tablas ni lógica de negocio. Validación: `npm run build`.

### Ajuste de scroll del CRM

Se eliminó el overflow vertical accidental del carril general del pipeline. El desplazamiento horizontal queda limitado al carril de etapas y el vertical permanece dentro de cada columna, evitando que la sección genere un scroll interno adicional.

Paths modificados: `components/crm/crm-pipeline.tsx`, `app/(dashboard)/layout.tsx`.

No se modificaron tablas ni lógica de negocio. Validación: `npm run build`.

### Acciones y métricas en el subheader contextual

Se consolidó el patrón de navegación contextual para que las acciones principales de cada sección no ocupen una fila adicional dentro del contenido. Compras, Ventas, Inventario, Caja, CRM, Gestoría, Presupuestos, Catálogo, Comisiones, Empleados y Recordatorios ahora montan sus acciones en el subheader del área correspondiente. El control de resumen también vive allí y se presenta como `Métricas`, con las cards colapsadas por defecto y persistencia de la preferencia por sección en el navegador.

Path creado: `components/dashboard/section-subheader-actions.tsx`.

Paths modificados: `components/dashboard/section-subheader.tsx`, `components/common/collapsible-summary.tsx`, `app/(dashboard)/compras/page.tsx`, `app/(dashboard)/ventas/page.tsx`, `app/(dashboard)/inventario/page.tsx`, `app/(dashboard)/caja/page.tsx`, `app/(dashboard)/crm/page.tsx`, `app/(dashboard)/gestoria/page.tsx`, `app/(dashboard)/gestoria/presupuestos/page.tsx`, `app/(dashboard)/dashboard/catalogo/page.tsx`, `app/(dashboard)/comisiones/page.tsx`, `app/(dashboard)/empleados/page.tsx`, `app/(dashboard)/recordatorios/page.tsx`, `components/empleados/empleados-table.tsx`.

Decisión técnica: se usa un portal React hacia un contenedor único del subheader para mantener acciones y métricas alineadas sin duplicar toolbars ni alterar las tablas. No se modificaron tablas Supabase ni reglas de negocio. Validación: `npm run build` finalizado correctamente.

### Gráfico de comisiones a ancho completo

Se ajustó el gráfico comparativo de vendedores para que la tarjeta siga ocupando el ancho de la sección, pero el área de trazado mantenga una proporción visual equilibrada. Se amplió el lienzo interno, se eliminó el estiramiento forzado del SVG y se limitó el ancho máximo del gráfico para conservar líneas, puntos y etiquetas legibles en pantallas grandes. Se mantuvo la escala de datos, el hover mensual y el comportamiento responsive.

Path modificado: `components/comisiones/comisiones-vendedores-chart.tsx`.

No se modificaron tablas ni lógica de negocio. Validación: `npm run build`.

### QA de producción y auditoría integral

Se realizó una pasada de estabilización sobre las rutas públicas y privadas principales, incluyendo login, dashboard, inventario, compras, ventas, caja, comisiones, CRM, WhatsApp, gestoría, catálogo, empleados, configuración y recordatorios. También se verificaron rutas de alta, edición, detalle y submódulos de ventas, liquidaciones, presupuestos y conexiones de WhatsApp en modo demo. Las rutas respondieron correctamente durante la prueba y el build de producción compiló sin errores TypeScript.

Durante la auditoría se corrigieron coincidencias de permisos por prefijo para evitar que una ruta parecida a otra herede acceso incorrectamente, se paralelizó la carga por lotes del paginador común para reducir esperas con datasets grandes, se limitaron las columnas consultadas en pagos y entregas de Ventas a las utilizadas por la tabla y se redujo el límite de imagen de portada del catálogo para evitar rechazos `413` de Server Actions en producción. La pantalla de catálogo mantiene el procesamiento client-side de imágenes para comprimirlas antes de enviarlas.

La navegación se considera coherente con la operación actual: Dashboard como acceso global; Operación para Inventario, Compras, Ventas y Caja; Comercial para CRM, WhatsApp, Catálogo y Recordatorios; y Administración para Comisiones, Gestoría, Empleados y Configuración. Las rutas existentes se conservaron, incluyendo `/ventas/renta` y las rutas públicas `/catalogo`.

Tablas Supabase involucradas en las consultas auditadas: `vehiculos`, `compras_vehiculos`, `ventas`, `ventas_pagos`, `ventas_entregas`, `caja_movimientos`, `comisiones`, `comision_liquidaciones`, `leads`, `conversaciones`, `conversacion_mensajes`, `whatsapp_instancias`, `gestoria_tramites`, `gestoria_presupuestos`, `recordatorios` y `empleados`.

Pendientes de validación antes de una certificación operativa definitiva: ejecutar con una cuenta real un alta/edición por cada rol, confirmar políticas RLS y relaciones de foreign keys en el proyecto Supabase de producción, verificar subida de portada con archivos reales dentro del límite de 3 MB y probar el webhook de Evolution con un mensaje entrante. El build no presentó errores; los warnings de caché observados pertenecen al servidor de desarrollo y no bloquean el bundle de producción.

### Corrección de guardado de portada del catálogo

Se corrigió el error que impedía guardar la portada panorámica. El bucket `vehiculos` es público para lectura, pero sus políticas de Storage rechazaban el upload realizado con la clave anónima (`403`). La Server Action ahora valida primero la sesión y el rol administrador con el cliente normal, y usa el cliente admin exclusivamente para subir `catalogo/hero.jpg`. La verificación de existencia de la portada en server también usa ese cliente cuando está configurado, con fallback para entornos locales.

Paths modificados: `app/(dashboard)/catalogo/actions.ts`, `lib/catalogo/hero.ts`.

Tabla/bucket involucrado: `public.catalogo_config`, Storage bucket `vehiculos`.

No se modificó el schema ni se requiere SQL. Validación: `npm run build` finalizado correctamente. El entorno de producción debe tener configurada `SUPABASE_SERVICE_ROLE_KEY` para que el administrador pueda guardar imágenes.

Se reforzó el flujo para producción: la imagen se comprime por debajo de 2 MB para evitar rechazos `413` del multipart o de Storage, la acción captura errores del cliente admin sin romper la pantalla y utiliza el cliente autenticado como fallback cuando la instalación no tiene disponible la clave de servicio. Los errores de Storage quedan registrados solo en servidor y se muestra un mensaje operativo al administrador.

### Shell fijo de la plataforma

Se corrigió el scroll general del panel privado. El sidebar, el breadcrumb/header de plataforma y la subbarra contextual ahora ocupan una estructura fija de viewport (`100dvh`) y no se desplazan junto con el contenido. El scroll vertical queda confinado al área central de cada sección, mientras que los scrolls internos existentes de WhatsApp, CRM, tablas y columnas se mantienen.

Paths modificados: `app/(dashboard)/layout.tsx`, `components/dashboard/breadcrumb-header.tsx`, `components/dashboard/sidebar.tsx`.

No se modificaron tablas Supabase ni reglas de negocio. Validación: `npm run build` finalizado correctamente.

### Gráficos en métricas por sección

Se incorporó un patrón visual compacto para mostrar gráficos dentro del desplegable `Métricas` de las secciones que ya cuentan con resúmenes operativos. Inventario muestra la distribución por estado; Compras, la situación de las unidades; Ventas, los estados de operación; Rentabilidad, el resultado por operación; CRM, las etapas del pipeline; Gestoría y Presupuestos, sus etapas y estados; Comisiones, la comisión por vendedor; Empleados, la composición del equipo por rol; Catálogo, el estado de publicación; y Recordatorios, la prioridad de los pendientes. Caja conserva sus visualizaciones existentes de saldos y medios.

Se creó el componente reutilizable `components/common/summary-chart.tsx`, que utiliza las barras CSS existentes y mantiene una lectura compacta, sin librerías nuevas. Los gráficos se calculan sobre los datos que cada página ya consulta o recibe en modo demo; no se agregaron queries, tablas ni cambios de schema.

Paths modificados: `app/(dashboard)/inventario/page.tsx`, `app/(dashboard)/compras/page.tsx`, `app/(dashboard)/ventas/page.tsx`, `app/(dashboard)/ventas/renta/page.tsx`, `app/(dashboard)/crm/page.tsx`, `app/(dashboard)/gestoria/page.tsx`, `app/(dashboard)/gestoria/presupuestos/page.tsx`, `app/(dashboard)/comisiones/page.tsx`, `app/(dashboard)/empleados/page.tsx`, `app/(dashboard)/dashboard/catalogo/page.tsx`, `app/(dashboard)/recordatorios/page.tsx` y `components/common/summary-chart.tsx`.

Tablas involucradas indirectamente: `vehiculos`, `compras_vehiculos`, `ventas`, `leads`, `gestoria_tramites`, `gestoria_presupuestos`, `comisiones`, `empleados`, `catalogo_config`, `recordatorios` y `caja_movimientos`. Validación: `npm run build`.

### Estructura e interfaz inicial de peritajes

Se preparó una estructura completa para peritajes de vehículos, con plantillas administrables, secciones e ítems configurables, estados por componente, paneles visuales del vehículo, observaciones, reparaciones con costos y valores de referencia. La interfaz incluye un mapa 2D interactivo del vehículo con estados `Pendiente`, `Revisar`, `Reparar`, `Listo` y `No aplica`, además del acceso desde Inventario, listado general de peritajes y administración de plantillas.

Path SQL creado: `PERITAJES.sql`. Debe ejecutarse manualmente en el proyecto Supabase de producción; no fue ejecutado desde el repositorio. La migración es idempotente, no crea enums nuevos, agrega índices y políticas RLS para empleados activos, y carga una plantilla base inspirada en el formulario de peritaje recibido.

Paths creados: `app/(dashboard)/peritajes/page.tsx`, `app/(dashboard)/peritajes/actions.ts`, `app/(dashboard)/peritajes/plantillas/page.tsx`, `app/(dashboard)/inventario/[id]/peritaje/page.tsx`, `components/peritajes/peritaje-create-form.tsx`, `components/peritajes/peritaje-panel-diagram.tsx`, `components/peritajes/peritaje-status-badge.tsx`, `components/peritajes/peritaje-template-manager.tsx`, `components/peritajes/peritaje-workspace.tsx`, `lib/peritajes/types.ts` y `lib/peritajes/demo.ts`.

Paths modificados: `components/dashboard/sidebar.tsx`, `components/dashboard/section-subheader.tsx`, `components/inventario/vehiculo-detail.tsx` y `lib/auth/permissions.ts` para navegación, acceso y permisos. Admin y gestor pueden cargar/editar peritajes; solo admin administra plantillas. La interfaz mantiene modo demo sin persistencia real y no agrega dependencias.

Tablas Supabase involucradas: `peritaje_plantillas`, `peritaje_plantilla_secciones`, `peritaje_plantilla_items`, `peritajes`, `peritaje_items`, `peritaje_paneles`, `peritaje_reparaciones` y `vehiculos`.

Decisión técnica: se implementó primero una representación 2D interactiva, sin librerías externas ni SQL ejecutado automáticamente. La estructura deja separado el catálogo de paneles y el checklist para poder sumar una vista 3D en una etapa posterior sin migrar nuevamente los datos. La plantilla solicita códigos únicos por ítem para evitar conflictos al agregar varios ítems dentro de una misma sección.

Pendiente operativo: ejecutar `PERITAJES.sql` manualmente en Supabase, verificar las políticas RLS y probar una creación/edición real con un usuario admin y uno gestor. Validación local: `npm run build` finalizado correctamente.

### Ajuste de métricas de Compras

Las cuatro métricas superiores de Compras ahora se muestran en una grilla de dos columnas, formando dos filas de dos cards en tablet y desktop. En mobile se mantienen apiladas en una sola columna. No se modificó la lógica, las consultas ni el schema de Supabase.

Path modificado: `components/compras/compra-kpis.tsx`. Validación: `npm run build`.

### Ajuste de ancho del gráfico de Comisiones

El gráfico de rendimiento por vendedor dejó de limitarse a un ancho máximo interno y ahora ocupa todo el ancho disponible del módulo. Se mantienen sus métricas, tooltip y comportamiento responsive sin cambios de datos.

Path modificado: `components/comisiones/comisiones-vendedores-chart.tsx`. Validación: `npm run build`.

### Evolución visual del catálogo público

Se transformó `/catalogo` de una pantalla de catálogo administrativo a una experiencia pública con estructura de sitio comercial: barra de marca, navegación, hero editorial, llamados a la acción, servicios, bloque institucional, contacto y footer. También se renovaron la grilla de stock, las tarjetas de vehículos y el detalle individual para priorizar fotografía, precio, ficha comercial y contacto por WhatsApp sin exponer datos internos.

Paths modificados: `app/catalogo/page.tsx`, `components/catalogo-publico/catalogo-public-site.tsx`, `components/catalogo-publico/catalogo-vehicle-card.tsx` y `components/catalogo-publico/catalogo-vehicle-detail.tsx`.

Tablas y recursos involucrados: `catalogo_config`, `vehiculos`, empleados activos para contactos comerciales y Storage del catálogo para la portada. No se modificaron tablas, reglas de publicación ni la sincronización con inventario.

Decisiones técnicas: se mantuvieron las reglas existentes de catálogo activo, vehículo en stock y publicación habilitada. Cuando todavía no hay una imagen institucional o de showroom cargada, la interfaz utiliza un espacio editorial intencional para que pueda completarse desde la configuración, en lugar de mostrar un bloque roto. Los CTAs existentes de WhatsApp, filtros, paginación y detalle continúan funcionando.

Pendiente no bloqueante: reemplazar los espacios editoriales por fotografías definitivas de Funes cuando estén disponibles. Validación: `npm run build` finalizado correctamente.

### Mejora de la experiencia de peritajes

Se reorganizó el detalle de peritaje para que funcione como una herramienta de inspección operativa. Se eliminó la duplicación visual de Cliente y Teléfono, se ordenó la identificación de la unidad en una cabecera compacta, se agregó un resumen de estados de paneles y se separaron con mayor claridad checklist, reparaciones, observaciones y valores de referencia.

El mapa 2D de carrocería ahora tiene más espacio, usa colores consistentes para `Pendiente`, `Revisar`, `Reparar` y `Listo`, y convive con un listado desplazable de paneles dentro del mismo bloque. Cada panel continúa abriendo su edición de estado y nota en un modal, con cierre por botón, clic exterior o tecla Escape. No se modificaron acciones, nombres de tablas ni el modelo de datos.

Paths modificados: `components/peritajes/peritaje-workspace.tsx` y `components/peritajes/peritaje-panel-diagram.tsx`.

Tablas Supabase involucradas indirectamente: `peritajes`, `peritaje_items`, `peritaje_paneles`, `peritaje_reparaciones`, `peritaje_plantillas`, `peritaje_plantilla_secciones`, `peritaje_plantilla_items` y `vehiculos`. Validación: `npm run build` finalizado correctamente.

Pendiente operativo: ejecutar `PERITAJES.sql` en Supabase si todavía no fue aplicado y validar el flujo con datos reales de una unidad.

### Optimización responsive transversal

Se realizó una pasada transversal de adaptación para desktop, tablet y móvil. El shell privado ahora usa padding adaptable, mantiene el viewport controlado y evita overflow horizontal accidental. También se ajustaron el encabezado de plataforma, la navegación secundaria y el sidebar colapsado para aprovechar mejor el ancho disponible sin perder accesibilidad.

Los modales de carga y edición ahora respetan el alto real del viewport (`dvh`), tienen márgenes más seguros en pantallas chicas y permiten desplazarse dentro del contenido sin empujar la página completa. Los menús contextuales limitan su ancho para no salirse de la pantalla. Se reforzó además el comportamiento del pipeline de CRM, el kanban de gestoría y el mapa/modal de peritajes en tablet y móvil.

WhatsApp ahora apila contactos y conversación en pantallas angostas, conservando scroll interno para ambos paneles. Las tablas mantienen su scroll horizontal contenido cuando la densidad de columnas lo exige, mientras que toolbars, filtros y grillas reducen gaps y se adaptan progresivamente. Se agregó una regla global para evitar imágenes que desborden sus contenedores.

Paths modificados: `app/(dashboard)/layout.tsx`, `app/globals.css`, `components/dashboard/sidebar.tsx`, `components/dashboard/breadcrumb-header.tsx`, `components/dashboard/section-subheader.tsx`, `components/common/action-menu.tsx`, `components/common/data-entry-modal.tsx`, `components/crm/crm-pipeline.tsx`, `components/gestoria/gestoria-kanban.tsx`, `components/peritajes/peritaje-panel-diagram.tsx` y `components/whatsapp/whatsapp-inbox.tsx`.

No se modificaron tablas, acciones de negocio, permisos, rutas públicas ni dependencias. Validación técnica: `git diff --check` y `npm run build`. Pendiente recomendado: validar manualmente los breakpoints principales en Chrome responsive y Safari móvil con datos reales, especialmente tablas muy densas y formularios largos.

### Identidad visual real en catálogo público

Se actualizó la jerarquía de `/catalogo` para que funcione como una vidriera comercial de Funes Exclusivos y no como una pantalla administrativa. La fachada real ahora sostiene el hero por defecto, el showroom acompaña el bloque institucional y el espacio interior refuerza la propuesta de atención personalizada. La portada cargada desde la configuración mantiene prioridad cuando existe.

Paths modificados: `components/catalogo-publico/catalogo-public-site.tsx`, `public/catalogo/funes-fachada.jpg`, `public/catalogo/funes-showroom.png` y `public/catalogo/funes-espacio.png`.

Se conservaron las reglas de publicación, filtros, paginación, contacto por WhatsApp y detalle de vehículo. No se expusieron datos internos ni se modificó el schema. Tablas y recursos involucrados: `catalogo_config`, `vehiculos`, `empleados` y Storage del catálogo.

Decisión técnica: se usaron assets locales para asegurar disponibilidad en producción y evitar dependencias externas. La estructura visual prioriza impacto de marca, stock publicado, servicios, experiencia en showroom y contacto. Validación: `npm run build`.

### Expansión de la web pública de Funes

La vidriera pública ahora tiene navegación entre páginas dedicadas para `Nosotros`, `Servicios` y `Contacto`, además del catálogo de vehículos existente. Se incorporó una galería editorial con fotografías reales del showroom, stock, taller, eventos y autos clásicos para reforzar la identidad de Funes Exclusivos.

Paths creados: `app/nosotros/page.tsx`, `app/servicios/page.tsx`, `app/contacto/page.tsx`, `components/catalogo-publico/catalogo-public-nav.tsx`, `components/catalogo-publico/catalogo-gallery.tsx` y `lib/catalogo/public-data.ts`.

Path modificado: `components/catalogo-publico/catalogo-public-site.tsx`.

Assets agregados: `public/catalogo/galeria/` con 14 fotografías provistas para la web pública.

Decisiones técnicas: se reutilizan el modo demo, la configuración pública de `catalogo_config`, los vendedores activos y los enlaces de WhatsApp/Instagram existentes. No se agregaron dependencias, no se modificaron tablas ni permisos, y no se exponen datos internos.

Validación: `npm run build` finalizado correctamente.

### Ajuste del scroll de WhatsApp

La bandeja principal de WhatsApp ahora ocupa únicamente el alto disponible dentro del dashboard, sin generar scroll en la sección completa. El desplazamiento queda contenido en la lista de conversaciones/contactos y en el historial de mensajes, manteniendo fijos los encabezados y acciones de cada panel.

Paths modificados: `app/(dashboard)/whatsapp/page.tsx` y `components/whatsapp/whatsapp-inbox.tsx`.

No se modificaron datos, acciones, permisos ni dependencias. Pendiente de validación visual manual en desktop y mobile. Validación técnica: `npm run build`.

### Historial de vehículos de interés en WhatsApp

La detección de vehículos mencionados en WhatsApp ahora actualiza el vehículo de interés vigente tanto en la conversación como en el lead cuando aparece una unidad diferente. Cada alta o cambio queda registrado en el historial existente de `lead_interacciones`, mostrando el vehículo anterior, el nuevo vehículo, el origen de la detección y la fecha.

El mismo comportamiento se aplica cuando el resumen IA identifica un vehículo distinto al asociado previamente. El historial se presenta en la ficha del lead con la etiqueta humana `Cambio de interés`.

Paths modificados: `lib/whatsapp/vehicle-interest.ts`, `app/api/evolution/webhook/route.ts`, `app/(dashboard)/whatsapp/actions.ts` y `components/crm/lead-interactions-timeline.tsx`.

Tablas involucradas: `leads`, `conversaciones`, `vehiculos` y `lead_interacciones`. No se creó SQL ni se agregó una tabla nueva; se reutilizó el historial CRM existente. Validación: `npm run build` finalizado correctamente.

### Reinicio operativo de datos — 2026-08-21

Se realizó un reinicio de los módulos operativos para comenzar una nueva carga manual. Se conservaron las cuentas y perfiles de acceso (`auth.users` y `public.empleados`), el CRM (`leads`, `lead_interacciones` y `crm_pipeline_estados`), WhatsApp (`whatsapp_instancias`, `conversaciones` y `conversacion_mensajes`), vehículos, configuración general y catálogo público.

Se eliminaron los registros de `caja_movimientos`, `ventas_pagos`, `ventas_entregas`, `ventas`, `compras_vehiculos`, `vehiculo_gastos`, `vehiculo_documentos`, `proveedores`, `recordatorios`, `gestoria_presupuesto_items`, `gestoria_presupuestos`, `gestoria_tramites`, `comision_liquidacion_items`, `comision_ajustes`, `comision_liquidaciones`, `comisiones`, `peritaje_items`, `peritaje_paneles`, `peritaje_reparaciones` y `peritajes`.

Antes de eliminar ventas se limpiaron únicamente los vínculos `leads.venta_id`, conservando los leads y sus datos CRM. La verificación posterior confirmó que las tablas operativas quedaron vacías y que CRM, WhatsApp, vehículos, empleados y configuración conservaron sus registros.

### Jerarquía operativa del detalle de peritaje

Se ajustó la pantalla de detalle para que la inspección se lea en el orden correcto: identificación y estado general de la unidad, checklist de revisión, carrocería por panel, reparaciones y valores de referencia. Las secciones del checklist ahora pueden plegarse para reducir ruido y la primera sección queda abierta como punto de inicio.

El área de carrocería ganó ancho en desktop, con un mapa 2D más legible y un listado de paneles con scroll interno. El resumen de estados quedó integrado en la cabecera de inspección y las tarjetas de conteo ahora tienen menor peso visual. Se conservaron la edición por panel, notas, estados, guardado, modo demo y permisos existentes.

Paths modificados: `components/peritajes/peritaje-workspace.tsx` y `components/peritajes/peritaje-panel-diagram.tsx`.

Tablas Supabase involucradas: `peritajes`, `peritaje_items`, `peritaje_paneles`, `peritaje_reparaciones`, `peritaje_plantillas`, `peritaje_plantilla_secciones`, `peritaje_plantilla_items` y `vehiculos`. No se modificó el schema ni se agregó SQL. Validación: `npm run build` finalizado correctamente.

### Rediseño del dashboard ejecutivo

El dashboard se simplificó para funcionar como una pantalla de decisión rápida para los dueños: prioriza alertas y pendientes, concentra cuatro indicadores principales y deja visibles únicamente resultado, actividad comercial e inventario. Se retiraron la introducción ornamental y los bloques operativos redundantes del primer nivel; gestoría, entregas, comisiones y proveedores siguen disponibles desde sus módulos específicos.

El resumen financiero mantiene una tendencia de líneas SVG para ingresos, egresos y resultado de los últimos doce meses, con separación por moneda, etiquetas mensuales y tooltips nativos, pero con menos texto y menos tarjetas secundarias. No se agregó una dependencia gráfica nueva y se conservaron el modo demo, los filtros por período y los permisos financieros existentes.

Paths modificados: `app/(dashboard)/dashboard/page.tsx`, `components/dashboard/pnl-summary.tsx` y `components/dashboard/monthly-pnl-chart.tsx`.

No se modificaron tablas, acciones, permisos ni dependencias. Validación técnica: `git diff --check` y `npm run build` finalizados correctamente.

### Vistas de vehículos en Inventario

La sección de Inventario ahora abre por defecto en una grilla compacta de hasta cinco cards por fila en desktop. Cada card resume nombre, precio, kilómetros y estado; el resto de la ficha se despliega con `Ver más`. Las acciones `Ver` y `Editar` quedan disponibles en el menú de tres puntos, que ya no se recorta por el contenedor visual. También se mantiene el selector para alternar a Lista cuando se necesita revisar muchas columnas o comparar datos en formato denso. Los filtros, permisos, paginación y acciones existentes se comparten entre ambas vistas.

Path modificado: `components/inventario/inventario-table.tsx`.

No se modificaron tablas ni dependencias. Validación: `npm run build` y `git diff --check`.

### Eliminación segura de vehículos

Inventario ahora ofrece la acción `Eliminar` dentro del menú de tres puntos, tanto en cards como en Lista. La acción pide confirmación, está restringida a administradores y bloquea el borrado cuando existen leads, conversaciones o ventas vinculadas, evitando perder historial comercial o romper relaciones operativas.

Paths creados: `components/inventario/vehiculo-delete-button.tsx`.

Paths modificados: `app/(dashboard)/inventario/actions.ts` y `components/inventario/inventario-table.tsx`.

No se modificó el schema. Validación pendiente: probar eliminación con un vehículo sin relaciones y verificar el mensaje de bloqueo con un vehículo vinculado.

### Ajustes solicitados por el cliente — proveedores, caja, fotos y compras

Se agregó un alta rápida de proveedores desde Caja y Nueva compra, reutilizando las columnas existentes de `proveedores` y actualizando los selectores al crear uno nuevo.

El flujo de venta con permuta ahora queda documentado y visible en la pantalla: el vehículo recibido se carga en Inventario como `En stock` y el usado no genera un movimiento monetario en Caja. Se conserva la lógica existente que solo lleva a Caja los pagos monetarios.

En la edición de vehículos se puede elegir manualmente la foto principal entre las fotos actuales y las nuevas que se están subiendo. La selección se guarda ordenando la foto principal al comienzo del array `fotos`, sin agregar columnas nuevas.

La eliminación de vehículos desvincula leads y conversaciones antes de borrar, preservando CRM y WhatsApp; continúa bloqueando únicamente vehículos con ventas vinculadas. En Compras se incorporaron las columnas `Gastos` y `Costo total`, calculado como precio de compra más gastos adicionales del vehículo, excluyendo el registro técnico de tipo `compra` que duplica el precio base.

Paths creados: `app/(dashboard)/proveedores/actions.ts` y `components/proveedores/proveedor-quick-create.tsx`.

Paths modificados: `app/(dashboard)/caja/page.tsx`, `app/(dashboard)/compras/nueva/page.tsx`, `app/(dashboard)/compras/page.tsx`, `app/(dashboard)/inventario/actions.ts`, `components/compras/compras-table.tsx` y `components/inventario/vehiculo-form.tsx`.

Tablas involucradas: `proveedores`, `vehiculos`, `leads`, `conversaciones`, `ventas`, `vehiculo_gastos` y `caja_movimientos`. Validación técnica: `npm run build` y `git diff --check` finalizados correctamente.

### Ajustes operativos de Compras, Inventario y Ventas — 2026-08-24

Las nuevas compras muestran y generan automáticamente el número de operación con formato `OP-AAAA-###`. Inventario muestra por defecto el precio de permuta y los días en stock. La ficha de cada vehículo incorpora una sección de gastos para registrar preparación, gestoría, reparaciones u otros costos asociados a la unidad.

Ventas reemplazó el selector largo de vehículos por un buscador filtrable por patente, marca y modelo. También permite seleccionar vendedor, persiste saldos de preventa y efectivo, y devuelve mensajes más claros cuando el registro falla. La consulta de vendedores usa empleados activos con rol vendedor.

Paths creados: `components/inventario/vehiculo-gasto-form.tsx`.

Paths modificados: `app/(dashboard)/compras/actions.ts`, `app/(dashboard)/compras/nueva/page.tsx`, `components/compras/compra-form.tsx`, `app/(dashboard)/inventario/[id]/page.tsx`, `app/(dashboard)/inventario/actions.ts`, `components/inventario/inventario-table.tsx`, `app/(dashboard)/ventas/nueva/page.tsx`, `components/ventas/venta-form.tsx` y `app/(dashboard)/ventas/actions.ts`.

Tablas involucradas: `compras_vehiculos`, `vehiculos`, `vehiculo_gastos`, `empleados` y `ventas`. Validación técnica: TypeScript y `git diff --check` finalizados correctamente; el build de Next no reportó errores antes de finalizar el proceso.

### Alta de vehículos en consignación

El alta manual desde Inventario acepta consignaciones sin costo de adquisición ni moneda de costo. Si esos datos no se cargan, se utiliza ARS como referencia interna sin bloquear el guardado; la moneda comercial continúa siendo obligatoria para los precios publicados.

### Ajustes operativos adicionales — 2026-08-26

Las cards de Inventario muestran versión junto al modelo y año junto a kilómetros. La edición de vehículos incorpora un acceso directo al peritaje; el estado detallado de preparación se gestiona allí para respetar el valor permitido por el esquema actual. Compras se ordena de más nuevas a más antiguas y permite mostrar u ocultar Precio boleto y Diferencia B. Ventas reemplaza la columna Método por una columna resumida de Financiación.

En Nueva venta, Infoauto, costo de reposición y costo histórico se completan automáticamente desde la unidad seleccionada y siguen siendo editables.

### Edición de Compras y Ventas — 2026-08-27

Compras y Ventas ahora tienen rutas y formularios de edición propios, accesibles desde la columna Acciones de cada tabla. La edición de una compra sincroniza fecha, operación, proveedor, moneda, valores y deuda con el vehículo y el gasto inicial asociado. La edición de una venta permite corregir cliente, vendedor, fecha, precio, moneda, forma de pago, saldos y observaciones sin alterar el vehículo vendido.

Paths creados: `app/(dashboard)/compras/[id]/editar/page.tsx`, `app/(dashboard)/ventas/[id]/editar/page.tsx`, `components/compras/compra-edit-form.tsx` y `components/ventas/venta-edit-form.tsx`.

Paths modificados: `app/(dashboard)/compras/actions.ts`, `app/(dashboard)/ventas/actions.ts`, `components/compras/compras-table.tsx` y `components/ventas/ventas-table.tsx`.
### Ajustes operativos de reunión con cliente — septiembre 2026

Se incorporó un centro compacto de alertas en el header, alimentado por recordatorios pendientes, con badge, panel, prioridades, enlaces al contexto y ocultado local al estilo Arc Global. También se hizo visible el acceso al peritaje dentro de la ficha de cada vehículo, se agregaron gastos de vehículo con opción de impacto automático en Caja y las ventas ahora muestran cobrado, saldo pendiente, barra de avance y fecha de entrega cuando existe.

En Compras se retiraron de la interfaz los campos/columnas Precio boleto y Diferencia B. El inicio de peritaje presenta los datos asociados como Responsable y contacto, conservando compatibilidad con las columnas actuales de la base.

Paths modificados: `components/dashboard/notification-center.tsx`, `components/dashboard/breadcrumb-header.tsx`, `components/dashboard/section-subheader.tsx`, `components/inventario/vehiculo-detail.tsx`, `components/inventario/vehiculo-gasto-form.tsx`, `app/(dashboard)/inventario/actions.ts`, `components/peritajes/peritaje-create-form.tsx`, `components/ventas/ventas-table.tsx`, `components/compras/compras-table.tsx`, `components/compras/compra-form.tsx` y `components/compras/compra-edit-form.tsx`.

El centro de alertas también permite crear un recordatorio directamente desde la campanita mediante el formulario compacto `CreateAlertForm`, con tipo, prioridad, fecha, título y descripción. Reutiliza `createRecordatorioAction` para mantener permisos, validaciones y persistencia alineados con la sección Recordatorios.

Tablas involucradas: `recordatorios`, `vehiculo_gastos` y `caja_movimientos`. Validación: `npx tsc --noEmit` finalizado correctamente; el build de Next quedó sin salida durante varios minutos y fue detenido para evitar dejar un proceso colgado.
