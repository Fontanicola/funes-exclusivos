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

-- Verificación: cada consulta debería devolver 0.
select count(*) as caja_movimientos_vigentes from public.caja_movimientos;
select count(*) as ventas_pagos_vigentes from public.ventas_pagos;
select count(*) as ventas_entregas_vigentes from public.ventas_entregas;
select count(*) as ventas_vigentes from public.ventas;
select count(*) as compras_vehiculos_vigentes from public.compras_vehiculos;
select count(*) as vehiculo_gastos_vigentes from public.vehiculo_gastos;
select count(*) as vehiculo_documentos_vigentes from public.vehiculo_documentos;
select count(*) as proveedores_vigentes from public.proveedores;
select count(*) as recordatorios_vigentes from public.recordatorios;
select count(*) as gestoria_tramites_vigentes from public.gestoria_tramites;
select count(*) as gestoria_presupuestos_vigentes from public.gestoria_presupuestos;
select count(*) as comisiones_vigentes from public.comisiones;
select count(*) as comision_liquidaciones_vigentes from public.comision_liquidaciones;
select count(*) as peritajes_vigentes from public.peritajes;
select count(*) as vehiculos_sin_interes
from public.vehiculos as v
where not exists (select 1 from public.leads as l where l.vehiculo_interes_id = v.id)
  and not exists (select 1 from public.conversaciones as c where c.vehiculo_interes_id = v.id);

-- Verificación de datos que se conservan.
select count(*) as leads_conservados from public.leads;
select count(*) as conversaciones_conservadas from public.conversaciones;
select count(*) as mensajes_conservados from public.conversacion_mensajes;
select count(*) as whatsapp_instancias_conservadas from public.whatsapp_instancias;
select count(*) as vehiculos_conservados from public.vehiculos;
select count(*) as empleados_conservados from public.empleados;
