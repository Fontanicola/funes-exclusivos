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
