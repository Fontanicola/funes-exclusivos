-- Funes Exclusivos - reset operativo previo a migracion
-- Revisar antes de ejecutar. No borra empleados ni configuracion_general.
BEGIN;
DELETE FROM public.conversacion_mensajes;
DELETE FROM public.conversaciones;
DELETE FROM public.whatsapp_instancias;
DELETE FROM public.recordatorios;
DELETE FROM public.vehiculo_documentos;
DELETE FROM public.gestoria_presupuesto_items;
DELETE FROM public.gestoria_presupuestos;
DELETE FROM public.gestoria_tramites;
DELETE FROM public.comision_liquidacion_items;
DELETE FROM public.comision_ajustes;
DELETE FROM public.comision_liquidaciones;
DELETE FROM public.comisiones;
DELETE FROM public.caja_movimientos;
DELETE FROM public.ventas_pagos;
DELETE FROM public.ventas_entregas;
DELETE FROM public.ventas;
DELETE FROM public.compras_vehiculos;
DELETE FROM public.vehiculo_gastos;
DELETE FROM public.leads;
DELETE FROM public.vehiculos;
DELETE FROM public.proveedores;
COMMIT;

-- Opcional y peligroso: NO ejecutar salvo decision explicita.
-- DELETE FROM public.empleados; -- puede dejar usuarios sin perfil operativo/login
