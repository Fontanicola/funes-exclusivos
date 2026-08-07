-- Conteos rapidos luego de ejecutar el incremental
SELECT 'vehiculos' AS tabla, count(*) FROM public.vehiculos
UNION ALL SELECT 'compras_vehiculos', count(*) FROM public.compras_vehiculos
UNION ALL SELECT 'vehiculo_gastos', count(*) FROM public.vehiculo_gastos
UNION ALL SELECT 'ventas', count(*) FROM public.ventas
UNION ALL SELECT 'ventas_pagos', count(*) FROM public.ventas_pagos
UNION ALL SELECT 'ventas_entregas', count(*) FROM public.ventas_entregas
UNION ALL SELECT 'gestoria_tramites', count(*) FROM public.gestoria_tramites
UNION ALL SELECT 'comisiones', count(*) FROM public.comisiones
UNION ALL SELECT 'comision_liquidaciones', count(*) FROM public.comision_liquidaciones
UNION ALL SELECT 'recordatorios', count(*) FROM public.recordatorios;
