# Documentación de implementación

## Qué se construyó

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
