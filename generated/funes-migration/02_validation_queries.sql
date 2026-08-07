-- Validaciones post-migracion Funes Exclusivos
SELECT 'proveedores' tabla, count(*) cantidad FROM public.proveedores
UNION ALL SELECT 'vehiculos', count(*) FROM public.vehiculos
UNION ALL SELECT 'compras_vehiculos', count(*) FROM public.compras_vehiculos
UNION ALL SELECT 'vehiculo_gastos', count(*) FROM public.vehiculo_gastos
UNION ALL SELECT 'ventas', count(*) FROM public.ventas
UNION ALL SELECT 'ventas_pagos', count(*) FROM public.ventas_pagos
UNION ALL SELECT 'ventas_entregas', count(*) FROM public.ventas_entregas
UNION ALL SELECT 'caja_movimientos', count(*) FROM public.caja_movimientos
UNION ALL SELECT 'gestoria_tramites', count(*) FROM public.gestoria_tramites
UNION ALL SELECT 'comisiones', count(*) FROM public.comisiones
UNION ALL SELECT 'comision_liquidaciones', count(*) FROM public.comision_liquidaciones
UNION ALL SELECT 'recordatorios', count(*) FROM public.recordatorios;

SELECT estado, count(*) FROM public.vehiculos GROUP BY estado ORDER BY count(*) DESC;
SELECT moneda, tipo, count(*), sum(monto) FROM public.caja_movimientos GROUP BY moneda, tipo ORDER BY moneda, tipo;
SELECT date_trunc('month', fecha_venta)::date mes, count(*), sum(precio_venta) FROM public.ventas GROUP BY 1 ORDER BY 1;
SELECT etapa, estado, count(*) FROM public.gestoria_tramites GROUP BY etapa, estado ORDER BY etapa, estado;
