# Migración Funes Exclusivos

## Archivos procesados
- `ALTA BAJA MUNICIPAL.csv`
- `Caja 2025-2026.csv`
- `Comisiones vendedores.csv`
- `Cta cte gestoria .csv`
- `Equipo Funes Exclusivos.csv`
- `Funes Exclusivos Base(BASE).csv`
- `LP.csv`
- `Pendiente de entrega.csv`
- `Peritaje.pdf`
- `Preparacion autos julio.csv`
- `Renta 01-2020.csv`
- `Renta 01-2021.csv`
- `Renta 01-2022.csv`
- `Renta 01-2023.csv`
- `Renta 01-2024.csv`
- `Renta 01-2025.csv`
- `Renta 01-2026.csv`
- `Renta 02-2020.csv`
- `Renta 02-2021.csv`
- `Renta 02-2022.csv`
- `Renta 02-2023.csv`
- `Renta 02-2024.csv`
- `Renta 02-2025.csv`
- `Renta 02-2026.csv`
- `Renta 03-2020.csv`
- `Renta 03-2021.csv`
- `Renta 03-2022.csv`
- `Renta 03-2023.csv`
- `Renta 03-2024.csv`
- `Renta 03-2025.csv`
- `Renta 03-2026.csv`
- `Renta 04-2021.csv`
- `Renta 04-2022.csv`
- `Renta 04-2023.csv`
- `Renta 04-2024.csv`
- `Renta 04-2025.csv`
- `Renta 04-2026.csv`
- `Renta 05-2020.csv`
- `Renta 05-2021.csv`
- `Renta 05-2022.csv`
- `Renta 05-2023.csv`
- `Renta 05-2024.csv`
- `Renta 05-2025.csv`
- `Renta 05-2026.csv`
- `Renta 06-2020.csv`
- `Renta 06-2021.csv`
- `Renta 06-2022.csv`
- `Renta 06-2023.csv`
- `Renta 06-2024.csv`
- `Renta 06-2025.csv`
- `Renta 06-2026.csv`
- `Renta 07-2020.csv`
- `Renta 07-2021.csv`
- `Renta 07-2022.csv`
- `Renta 07-2023.csv`
- `Renta 07-2024.csv`
- `Renta 07-2025.csv`
- `Renta 08-2020.csv`
- `Renta 08-2021.csv`
- `Renta 08-2022.csv`
- `Renta 08-2023.csv`
- `Renta 08-2024.csv`
- `Renta 08-2025.csv`
- `Renta 09-2020.csv`
- `Renta 09-2021.csv`
- `Renta 09-2022.csv`
- `Renta 09-2023.csv`
- `Renta 09-2024.csv`
- `Renta 09-2025.csv`
- `Renta 10-2020.csv`
- `Renta 10-2021.csv`
- `Renta 10-2022.csv`
- `Renta 10-2023.csv`
- `Renta 10-2024.csv`
- `Renta 10-2025.csv`
- `Renta 11-2020.csv`
- `Renta 11-2021.csv`
- `Renta 11-2022.csv`
- `Renta 11-2023.csv`
- `Renta 11-2024.csv`
- `Renta 11-2025.csv`
- `Renta 12-2020.csv`
- `Renta 12-2021.csv`
- `Renta 12-2022.csv`
- `Renta 12-2023.csv`
- `Renta 12-2024.csv`
- `Renta 12-2025.csv`
- `rearchivosfunesexclusivos.zip`

## Conteos generados
- `proveedores`: 590
- `vehiculos`: 1762
- `compras_vehiculos`: 1740
- `vehiculo_gastos`: 2146
- `ventas`: 2130
- `ventas_pagos`: 2979
- `ventas_entregas`: 698
- `caja_movimientos`: 7825
- `gestoria_tramites`: 600
- `comisiones`: 84
- `comision_liquidaciones`: 18
- `recordatorios`: 225

## Decisiones de migración
- El reset borra datos operativos, pero no borra `empleados`, `configuracion_general` ni `catalogo_config` para no bloquear acceso ni configuración base.
- Los perfiles de empleados no se recrean desde CSV porque `empleados.id` está vinculado a Supabase Auth.
- Cuando una planilla trae vendedor histórico sin usuario Auth actual, se preserva el nombre original en `observaciones`.
- Los valores no mapeados campo a campo se preservan como JSON en `observaciones` o `seguimiento_comentarios`.
- `LP.csv` se toma como fuente de stock/lista actual y pisa campos comerciales sobre la base histórica por dominio.
- Los archivos `Renta MM-YYYY.csv` se toman como fuente de ventas/rentabilidad histórica.
- `Caja 2025-2026.csv` se importa como movimientos manuales de caja con tipo calculado por signo del importe.
- `Peritaje.pdf` es escaneado sin texto extraíble; queda pendiente de carga documental/OCR manual.

## Orden recomendado
1. Revisar este reporte y los SQL generados.
2. Ejecutar `00_reset_operational_data.sql` en Supabase SQL Editor.
3. Ejecutar `01_import_funes_data.sql`.
4. Ejecutar `02_validation_queries.sql` y comparar conteos.

## Pendientes manuales
- Revisar filas históricas sin dominio para confirmar si deben unificarse con vehículos existentes.
- Vincular vendedores históricos con usuarios Auth cuando corresponda.
- Cargar documentos reales del ZIP/PDF a Storage si se decide preservar archivos adjuntos.
- Revisar moneda USD en movimientos donde la planilla usa `$` pero el medio indica dólares.
