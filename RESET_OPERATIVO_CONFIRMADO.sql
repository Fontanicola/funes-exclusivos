-- Funes Exclusivos - reinicio de módulos operativos
-- Conserva: auth.users, empleados, CRM, WhatsApp, vehículos y configuración.
-- Ejecutar completo en el SQL Editor de Supabase.

begin;

-- Las ventas se eliminan más abajo. Se conserva el lead y su historial,
-- pero se quita el vínculo a la venta que dejará de existir.
update public.leads
set venta_id = null
where venta_id is not null;

-- Caja y dependencias de ventas/compras.
delete from public.caja_movimientos;
delete from public.ventas_pagos;
delete from public.ventas_entregas;

-- Gestoría.
delete from public.gestoria_presupuesto_items;
delete from public.gestoria_presupuestos;
delete from public.gestoria_tramites;

-- Comisiones.
delete from public.comision_liquidacion_items;
delete from public.comision_ajustes;
delete from public.comision_liquidaciones;
delete from public.comisiones;

-- Recordatorios operativos.
delete from public.recordatorios;

-- Documentación y gastos vinculados a vehículos.
delete from public.vehiculo_documentos;
delete from public.vehiculo_gastos;

-- Compras y ventas.
delete from public.compras_vehiculos;
delete from public.ventas;
delete from public.proveedores;

-- Peritajes y sus dependencias.
delete from public.peritaje_items;
delete from public.peritaje_paneles;
delete from public.peritaje_reparaciones;
delete from public.peritajes;

-- Stock: conservar únicamente vehículos con interés vigente en CRM o WhatsApp.
-- Los demás vehículos se eliminan junto con el stock operativo.
delete from public.vehiculos as v
where not exists (
  select 1
  from public.leads as l
  where l.vehiculo_interes_id = v.id
)
and not exists (
  select 1
  from public.conversaciones as c
  where c.vehiculo_interes_id = v.id
);

commit;

-- Verificación: estas tablas deberían devolver 0.
select 'caja_movimientos' as tabla, count(*) as registros from public.caja_movimientos
union all select 'ventas_pagos', count(*) from public.ventas_pagos
union all select 'ventas_entregas', count(*) from public.ventas_entregas
union all select 'ventas', count(*) from public.ventas
union all select 'compras_vehiculos', count(*) from public.compras_vehiculos
union all select 'vehiculo_gastos', count(*) from public.vehiculo_gastos
union all select 'vehiculo_documentos', count(*) from public.vehiculo_documentos
union all select 'proveedores', count(*) from public.proveedores
union all select 'recordatorios', count(*) from public.recordatorios
union all select 'gestoria_tramites', count(*) from public.gestoria_tramites
union all select 'gestoria_presupuestos', count(*) from public.gestoria_presupuestos
union all select 'comisiones', count(*) from public.comisiones
union all select 'comision_liquidaciones', count(*) from public.comision_liquidaciones
union all select 'peritajes', count(*) from public.peritajes
union all select 'vehiculos_sin_interes', count(*)
  from public.vehiculos as v
  where not exists (select 1 from public.leads as l where l.vehiculo_interes_id = v.id)
    and not exists (select 1 from public.conversaciones as c where c.vehiculo_interes_id = v.id);

-- Verificación de datos que se conservan.
select 'leads' as tabla, count(*) as registros from public.leads
union all select 'conversaciones', count(*) from public.conversaciones
union all select 'conversacion_mensajes', count(*) from public.conversacion_mensajes
union all select 'whatsapp_instancias', count(*) from public.whatsapp_instancias
union all select 'vehiculos', count(*) from public.vehiculos
union all select 'empleados', count(*) from public.empleados;
