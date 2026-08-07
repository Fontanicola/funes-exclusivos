#!/usr/bin/env python3
"""
Genera SQL incremental comparando los CSV historicos ya migrados contra
los CSV actualizados recibidos por WhatsApp.

No ejecuta nada contra Supabase. Produce SQL con altas nuevas solamente,
usando claves de negocio para evitar duplicar datos ya importados.
"""

from __future__ import annotations

import importlib.util
import json
import re
import shutil
import sys
import tempfile
from pathlib import Path
from typing import Any, Callable


ROOT = Path(__file__).resolve().parents[2]
BASE_SOURCE_DIR = Path("/Users/felipefontana/Documents/Documentos funes")
OUT_DIR = ROOT / "generated/funes-migration/incremental-2026-08-05"
GENERATOR_PATH = ROOT / "scripts/funes-migration/generate_funes_sql.py"

UPDATED_FILES = {
    "Funes Exclusivos Base(BASE).csv": Path(
        "/Users/felipefontana/Library/Containers/net.whatsapp.WhatsApp/Data/tmp/documents/1270612F-E8AF-4578-B44A-FAF9171D0493/Base.csv"
    ),
    "LP.csv": Path(
        "/Users/felipefontana/Library/Containers/net.whatsapp.WhatsApp/Data/tmp/documents/307C72FC-E744-402D-8E0A-3944071A1551/LP Funes Exclusivos 2026-08-03.csv"
    ),
    "Pendiente de entrega.csv": Path(
        "/Users/felipefontana/Library/Containers/net.whatsapp.WhatsApp/Data/tmp/documents/BA58164A-8773-4456-AEDB-8AD4A929220B/Pendiente de entrega.csv"
    ),
    "Cta cte gestoria .csv": Path(
        "/Users/felipefontana/Library/Containers/net.whatsapp.WhatsApp/Data/tmp/documents/9A1964A6-4B0A-42B7-8E7E-31F922893201/Cta Cte Gestora.csv"
    ),
    "Comisiones vendedores.csv": Path(
        "/Users/felipefontana/Library/Containers/net.whatsapp.WhatsApp/Data/tmp/documents/66FE661D-FE84-41B0-88DA-FB72B61DB57D/Comisiones vendedores.csv"
    ),
    "ALTA BAJA MUNICIPAL.csv": Path(
        "/Users/felipefontana/Library/Containers/net.whatsapp.WhatsApp/Data/tmp/documents/F72537AF-330F-47D3-9286-9DBC776E198F/ALTA BAJA MUNICIPAL.csv"
    ),
    "Renta 07-2026.csv": Path(
        "/Users/felipefontana/Library/Containers/net.whatsapp.WhatsApp/Data/tmp/documents/CE7FD45E-18B9-4A35-BAD8-A9F36E1D4166/Renta 7-26.csv"
    ),
}


def load_generator():
    spec = importlib.util.spec_from_file_location("funes_migration_generator", GENERATOR_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"No se pudo cargar {GENERATOR_PATH}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


gen = load_generator()


def vehicle_domain(data: Any, vehicle_id: str | None) -> str | None:
    if not vehicle_id:
        return None
    vehicle = data.vehiculos.get(vehicle_id)
    return vehicle.get("dominio") if vehicle else None


def is_plausible_vehicle_domain(value: str | None) -> bool:
    if not value:
        return False
    text = value.strip().upper()
    # Patentes argentinas historicas y Mercosur. Tambien se permite codigo temporal M123456.
    if re.match(r"^[A-Z]{3}\d{3}$", text):
        return True
    if re.match(r"^[A-Z]{2}\d{3}[A-Z]{2}$", text):
        return True
    if re.match(r"^M\d{6}$", text):
        return True
    return False


def sale_signature(data: Any, venta: dict[str, Any] | None) -> tuple[Any, ...] | None:
    if not venta:
        return None
    return (
        vehicle_domain(data, venta.get("vehiculo_id")),
        venta.get("fecha_venta"),
        venta.get("precio_venta"),
        venta.get("estado"),
    )


def get_sale_by_id(data: Any, venta_id: str | None) -> dict[str, Any] | None:
    if not venta_id:
        return None
    return data.ventas.get(venta_id)


def comparable(value: Any) -> Any:
    if isinstance(value, gen.SqlExpr):
        return value.value
    if isinstance(value, dict):
        return tuple(sorted((k, comparable(v)) for k, v in value.items()))
    if isinstance(value, list):
        return tuple(comparable(v) for v in value)
    return value


def keyset(rows: dict[str, dict[str, Any]], key_fn: Callable[[dict[str, Any]], tuple[Any, ...] | None]) -> set[tuple[Any, ...]]:
    keys: set[tuple[Any, ...]] = set()
    for row in rows.values():
        key = key_fn(row)
        if key:
            keys.add(key)
    return keys


def filter_new(
    old_rows: dict[str, dict[str, Any]],
    new_rows: dict[str, dict[str, Any]],
    key_fn: Callable[[dict[str, Any]], tuple[Any, ...] | None],
) -> dict[str, dict[str, Any]]:
    old_keys = keyset(old_rows, key_fn)
    result: dict[str, dict[str, Any]] = {}
    for row_id, row in new_rows.items():
        key = key_fn(row)
        if key and key not in old_keys:
            result[row_id] = row
    return result


def ensure_vehicle_defaults(data: Any) -> None:
    for vehicle in data.vehiculos.values():
        vehicle.setdefault("fotos", [])
        if not vehicle.get("marca") or str(vehicle.get("marca")).strip() == "0":
            vehicle["marca"] = "Sin marca"
        if not vehicle.get("modelo") or str(vehicle.get("modelo")).strip() == "0":
            vehicle["modelo"] = "Sin modelo"
        vehicle.setdefault("km", 0)
        vehicle.setdefault("estado", "en_stock")
        vehicle.setdefault("estado_preparacion", "sin_preparar")
        if vehicle.get("estado_preparacion") != "sin_preparar":
            vehicle["estado_preparacion"] = "sin_preparar"
        vehicle.setdefault("precio_moneda", "ARS")
        vehicle.setdefault("costo_moneda", "ARS")
        vehicle.setdefault("catalogo_publicado", False)
        vehicle.setdefault("catalogo_destacado", False)
        vehicle.setdefault("publicado_mercadolibre", False)
        vehicle.setdefault("publicado_rodados_google", False)
        if not vehicle.get("fecha_ingreso"):
            vehicle["fecha_ingreso"] = vehicle.get("fecha_compra") or gen.MIGRATION_DATE
        for field in [
            "costo_adquisicion",
            "precio_venta",
            "precio_infoauto_compra",
            "precio_infoauto_actual",
            "precio_infoauto_anterior",
            "precio_permuta",
            "precio_contado",
            "costo_reposicion",
        ]:
            vehicle[field] = gen.non_negative(vehicle.get(field))


def finalize_data(data: Any) -> Any:
    ensure_vehicle_defaults(data)
    for compra in data.compras.values():
        if not compra.get("fecha"):
            vehicle = data.vehiculos.get(compra.get("vehiculo_id"), {})
            compra["fecha"] = vehicle.get("fecha_compra") or vehicle.get("fecha_ingreso") or gen.MIGRATION_DATE
        compra["precio_compra"] = gen.non_negative_or_zero(compra.get("precio_compra"))
        compra["precio_boleto"] = gen.non_negative(compra.get("precio_boleto"))
        compra["deuda_pendiente"] = gen.non_negative(compra.get("deuda_pendiente"))
    for gasto in data.gastos.values():
        gasto["importe"] = abs(gasto.get("importe") or 0)
        gasto["monto"] = abs(gasto.get("monto") or gasto.get("importe") or 0)
        if not gasto.get("fecha"):
            vehicle = data.vehiculos.get(gasto.get("vehiculo_id"), {})
            gasto["fecha"] = vehicle.get("fecha_compra") or vehicle.get("fecha_ingreso") or gen.MIGRATION_DATE
    registered_vehicle_sales: set[str] = set()
    for venta in data.ventas.values():
        venta["precio_venta"] = gen.non_negative_or_zero(venta.get("precio_venta"))
        for field in [
            "monto_permuta",
            "precio_infoauto",
            "info_historica_compra",
            "costo_reposicion",
            "costo_historico",
            "saldo_preventa",
            "saldo_efectivo",
            "importe_gestoria",
            "importe_escribania",
        ]:
            venta[field] = gen.non_negative(venta.get(field))
        vehiculo_id = gen.clean_text(venta.get("vehiculo_id"))
        if venta.get("estado") == "registrada" and vehiculo_id:
            if vehiculo_id in registered_vehicle_sales:
                venta["estado"] = "anulada"
                venta["observaciones"] = gen.merge_json_note(
                    venta.get("observaciones"),
                    "migration_note",
                    "Venta histórica duplicada para el mismo vehículo; se importa como anulada para respetar ventas_vehiculo_registrada_unique_idx.",
                )
            else:
                registered_vehicle_sales.add(vehiculo_id)
    for pago in data.pagos.values():
        pago["importe"] = abs(pago.get("importe") or 0)
    for caja in data.caja.values():
        if not caja.get("detalle_1"):
            caja["detalle_1"] = caja.get("proveedor") or caja.get("concepto") or "Movimiento importado"
    return data


def build(source_dir: Path) -> Any:
    original_source = gen.SOURCE_DIR
    try:
        gen.SOURCE_DIR = source_dir
        return finalize_data(gen.build_data())
    finally:
        gen.SOURCE_DIR = original_source


def with_conflict(sql: str, conflict: str = "ON CONFLICT (id) DO NOTHING") -> str:
    if not sql.strip() or sql.lstrip().startswith("-- Sin filas"):
        return sql
    parts = [part.strip() for part in sql.strip().split(";\n\n") if part.strip()]
    return "\n\n".join(part.rstrip(";") + f"\n{conflict};" for part in parts) + "\n"


def insert(table: str, rows: list[dict[str, Any]], columns: list[str], conflict: str = "ON CONFLICT (id) DO NOTHING") -> str:
    return with_conflict(gen.insert_statement(table, rows, columns), conflict)


def ids_from(rows: dict[str, dict[str, Any]], *fields: str) -> set[str]:
    ids: set[str] = set()
    for row in rows.values():
        for field in fields:
            value = row.get(field)
            if isinstance(value, str):
                ids.add(value)
    return ids


def collect_prerequisites(old_data: Any, new_data: Any, selected: dict[str, dict[str, dict[str, Any]]]) -> tuple[dict[str, dict[str, Any]], dict[str, dict[str, Any]]]:
    vehicle_ids: set[str] = set()
    provider_ids: set[str] = set()

    vehicle_ids |= ids_from(selected["compras"], "vehiculo_id")
    vehicle_ids |= ids_from(selected["gastos"], "vehiculo_id")
    vehicle_ids |= ids_from(selected["ventas"], "vehiculo_id", "vehiculo_recibido_id")
    vehicle_ids |= ids_from(selected["gestoria"], "vehiculo_id")
    provider_ids |= ids_from(selected["compras"], "proveedor_id")
    provider_ids |= ids_from(selected["gastos"], "proveedor_id")

    for venta in selected["ventas"].values():
        if venta.get("vehiculo_id"):
            vehicle_ids.add(venta["vehiculo_id"])
    for pago in selected["pagos"].values():
        sale = get_sale_by_id(new_data, pago.get("venta_id"))
        if sale and sale.get("vehiculo_id"):
            vehicle_ids.add(sale["vehiculo_id"])
    for entrega in selected["entregas"].values():
        sale = get_sale_by_id(new_data, entrega.get("venta_id"))
        if sale and sale.get("vehiculo_id"):
            vehicle_ids.add(sale["vehiculo_id"])
    for comision in selected["comisiones"].values():
        sale = get_sale_by_id(new_data, comision.get("venta_id"))
        if sale and sale.get("vehiculo_id"):
            vehicle_ids.add(sale["vehiculo_id"])

    for vehicle_id in vehicle_ids:
        vehicle = new_data.vehiculos.get(vehicle_id)
        if vehicle and vehicle.get("proveedor_id"):
            provider_ids.add(vehicle["proveedor_id"])

    vehicles = {
        vid: new_data.vehiculos[vid]
        for vid in vehicle_ids
        if vid in new_data.vehiculos and vid not in old_data.vehiculos
    }
    providers = {
        pid: new_data.proveedores[pid]
        for pid in provider_ids
        if pid in new_data.proveedores and pid not in old_data.proveedores
    }
    return providers, vehicles


def make_incremental(old_data: Any, new_data: Any) -> dict[str, dict[str, dict[str, Any]]]:
    selected = {
        "compras": filter_new(
            old_data.compras,
            new_data.compras,
            lambda row: (
                vehicle_domain(new_data, row.get("vehiculo_id")),
                row.get("fecha"),
                row.get("precio_compra"),
            ),
        ),
        "gastos": filter_new(
            old_data.gastos,
            new_data.gastos,
            lambda row: (
                vehicle_domain(new_data, row.get("vehiculo_id")),
                row.get("tipo"),
                row.get("fecha"),
                row.get("monto"),
                row.get("detalle"),
            ),
        ),
        "ventas": filter_new(old_data.ventas, new_data.ventas, lambda row: sale_signature(new_data, row)),
        "pagos": filter_new(
            old_data.pagos,
            new_data.pagos,
            lambda row: (
                sale_signature(new_data, get_sale_by_id(new_data, row.get("venta_id"))),
                row.get("tipo"),
                row.get("fecha"),
                row.get("importe"),
            ),
        ),
        "entregas": filter_new(
            old_data.entregas,
            new_data.entregas,
            lambda row: (
                sale_signature(new_data, get_sale_by_id(new_data, row.get("venta_id"))),
                row.get("estado"),
                row.get("fecha_entrega"),
            ),
        ),
        "gestoria": filter_new(
            old_data.gestoria,
            new_data.gestoria,
            lambda row: (
                vehicle_domain(new_data, row.get("vehiculo_id")),
                row.get("tipo"),
                row.get("titulo"),
                row.get("fecha_inicio"),
            ),
        ),
        "comisiones": filter_new(
            old_data.comisiones,
            new_data.comisiones,
            lambda row: (
                sale_signature(new_data, get_sale_by_id(new_data, row.get("venta_id"))),
                row.get("monto_comision"),
                row.get("fecha_generada"),
            ),
        ),
        "liquidaciones": filter_new(
            old_data.liquidaciones,
            new_data.liquidaciones,
            lambda row: (
                row.get("periodo"),
                row.get("neto_a_cobrar"),
                comparable(row.get("vendedor_id")),
            ),
        ),
        "recordatorios": filter_new(
            old_data.recordatorios,
            new_data.recordatorios,
            lambda row: (
                row.get("tipo"),
                row.get("titulo"),
                row.get("fecha_vencimiento"),
                row.get("venta_id"),
                row.get("entrega_id"),
                row.get("tramite_id"),
            ),
        ),
    }
    selected["gestoria"] = {
        row_id: row
        for row_id, row in selected["gestoria"].items()
        if is_plausible_vehicle_domain(vehicle_domain(new_data, row.get("vehiculo_id")))
    }

    old_sale_by_signature: dict[tuple[Any, ...], str] = {}
    for old_sale_id, old_sale in old_data.ventas.items():
        sig = sale_signature(old_data, old_sale)
        if sig and sig not in old_sale_by_signature:
            old_sale_by_signature[sig] = old_sale_id

    def normalize_sale_fk(row: dict[str, Any]) -> bool:
        venta_id = row.get("venta_id")
        if not venta_id or venta_id in selected["ventas"] or venta_id in old_data.ventas:
            return True
        sig = sale_signature(new_data, get_sale_by_id(new_data, venta_id))
        existing_sale_id = old_sale_by_signature.get(sig) if sig else None
        if existing_sale_id:
            row["venta_id"] = existing_sale_id
            return True
        return False

    selected["pagos"] = {row_id: row for row_id, row in selected["pagos"].items() if normalize_sale_fk(row)}
    selected["entregas"] = {row_id: row for row_id, row in selected["entregas"].items() if normalize_sale_fk(row)}
    selected["comisiones"] = {row_id: row for row_id, row in selected["comisiones"].items() if normalize_sale_fk(row)}

    allowed_tramite_ids = set(selected["gestoria"].keys())
    selected["recordatorios"] = {
        row_id: row
        for row_id, row in selected["recordatorios"].items()
        if not row.get("tramite_id") or row.get("tramite_id") in allowed_tramite_ids
    }
    selected["proveedores"], selected["vehiculos"] = collect_prerequisites(old_data, new_data, selected)
    return selected


def report_line(item: dict[str, Any], new_data: Any) -> str:
    source = ""
    raw = item.get("observaciones") or item.get("seguimiento_comentarios")
    if isinstance(raw, str):
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, dict):
                source = f" ({parsed.get('source') or parsed.get('raw_source') or ''} fila {parsed.get('row') or ''})".replace(" fila )", ")")
        except json.JSONDecodeError:
            pass
    domain = vehicle_domain(new_data, item.get("vehiculo_id"))
    label = domain or item.get("titulo") or item.get("cliente_nombre") or item.get("detalle") or item.get("id")
    return f"- {label}{source}"


def write_outputs(selected: dict[str, dict[str, dict[str, Any]]], new_data: Any) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    source_copy_dir = OUT_DIR / "sources"
    source_copy_dir.mkdir(exist_ok=True)
    for target_name, source in UPDATED_FILES.items():
        if source.exists():
            shutil.copy2(source, source_copy_dir / target_name)

    vehicle_cols = [
        "id",
        "marca",
        "modelo",
        "version",
        "anio",
        "color",
        "km",
        "dominio",
        "motor",
        "ubicacion",
        "nro_operacion",
        "proveedor_id",
        "fecha_compra",
        "costo_adquisicion",
        "costo_moneda",
        "precio_venta",
        "precio_moneda",
        "precio_infoauto_compra",
        "precio_infoauto_actual",
        "precio_infoauto_anterior",
        "precio_permuta",
        "precio_contado",
        "costo_reposicion",
        "estado",
        "estado_preparacion",
        "chapero",
        "preparacion_comentarios",
        "publicado_mercadolibre",
        "publicado_rodados_google",
        "catalogo_publicado",
        "catalogo_destacado",
        "fotos",
        "fecha_ingreso",
        "descripcion",
        "observaciones",
    ]
    venta_cols = [
        "id",
        "vehiculo_id",
        "vehiculo_recibido_id",
        "vendedor_id",
        "fecha_venta",
        "cliente_nombre",
        "cliente_telefono",
        "cliente_email",
        "cliente_documento",
        "precio_venta",
        "moneda",
        "metodo_pago",
        "estado",
        "monto_permuta",
        "precio_infoauto",
        "info_historica_compra",
        "costo_reposicion",
        "costo_historico",
        "margen_reposicion",
        "margen_historico",
        "rotacion_dias",
        "saldo_preventa",
        "saldo_efectivo",
        "importe_gestoria",
        "importe_escribania",
        "resultado_operativo",
        "observaciones",
    ]
    gestoria_cols = [
        "id",
        "tipo",
        "estado",
        "titulo",
        "descripcion",
        "vehiculo_id",
        "venta_id",
        "responsable_id",
        "cliente_nombre",
        "cliente_telefono",
        "cliente_email",
        "cliente_documento",
        "fecha_inicio",
        "fecha_vencimiento",
        "fecha_finalizacion",
        "etapa",
        "gestion_tipo",
        "fecha_envio",
        "fecha_firma",
        "costo_final_transferencia",
        "costo_final_moneda",
        "presupuesto_confirmado",
        "cat_estado",
        "documentacion_fisica_estado",
        "escribania_estado",
        "transferencia_registral_estado",
        "transferencia_municipal_estado",
        "seguimiento_comentarios",
        "observaciones",
    ]

    sql = [
        "-- Funes Exclusivos - incremental CSV actualizados 2026-08-05",
        "-- Ejecutar despues de la migracion base que ya fue cargada.",
        "-- Incluye solo altas no detectadas en la migracion anterior. No borra datos.",
        "BEGIN;",
        insert("proveedores", list(selected["proveedores"].values()), ["id", "nombre", "categoria", "telefono", "activo"]),
        insert("vehiculos", list(selected["vehiculos"].values()), vehicle_cols),
        insert("compras_vehiculos", list(selected["compras"].values()), ["id", "vehiculo_id", "proveedor_id", "fecha", "nro_operacion", "precio_compra", "precio_boleto", "moneda", "diferencia_b", "deuda_pendiente", "observaciones"]),
        insert("vehiculo_gastos", list(selected["gastos"].values()), ["id", "vehiculo_id", "proveedor_id", "tipo", "monto", "moneda", "fecha", "detalle"]),
        insert("ventas", list(selected["ventas"].values()), venta_cols),
        insert("ventas_pagos", list(selected["pagos"].values()), ["id", "venta_id", "tipo", "fecha", "importe", "moneda", "medio", "detalle"]),
        insert("ventas_entregas", list(selected["entregas"].values()), ["id", "venta_id", "estado", "fecha_entrega", "status_informe_vu", "usado_credito", "usado_informe_dominio", "usado_multas", "usado_patentes", "usado_observaciones", "observaciones"]),
        insert("gestoria_tramites", list(selected["gestoria"].values()), gestoria_cols),
        insert("comisiones", list(selected["comisiones"].values()), ["id", "venta_id", "vendedor_id", "base_comision", "porcentaje", "monto_comision", "moneda", "estado", "fecha_generada", "fecha_pago", "observaciones"]),
        insert("comision_liquidaciones", list(selected["liquidaciones"].values()), ["id", "vendedor_id", "periodo", "estado", "moneda", "neto_a_cobrar", "fecha_pago", "fecha_cierre", "observaciones"]),
        insert("recordatorios", list(selected["recordatorios"].values()), ["id", "tipo", "estado", "prioridad", "titulo", "descripcion", "fecha_vencimiento", "fecha_completado", "fecha_pospuesto", "asignado_a", "lead_id", "conversacion_id", "venta_id", "entrega_id", "tramite_id", "vehiculo_id", "comision_liquidacion_id", "origen_automatico"]),
        "COMMIT;",
    ]
    (OUT_DIR / "01_incremental_altas.sql").write_text("\n\n".join(sql), encoding="utf-8")

    counts = {name: len(rows) for name, rows in selected.items()}
    report = [
        "# Incremental CSV actualizados - 2026-08-05",
        "",
        "Comparacion generada contra la carpeta historica `Documentos funes` usada en la migracion base.",
        "",
        "## Altas detectadas",
        "",
    ]
    for name in [
        "proveedores",
        "vehiculos",
        "compras",
        "gastos",
        "ventas",
        "pagos",
        "entregas",
        "gestoria",
        "comisiones",
        "liquidaciones",
        "recordatorios",
    ]:
        report.append(f"- {name}: {counts.get(name, 0)}")
    report.extend(["", "## Muestras", ""])
    for name in ["vehiculos", "ventas", "compras", "entregas", "gestoria", "comisiones", "recordatorios"]:
        rows = list(selected[name].values())[:12]
        report.append(f"### {name}")
        if not rows:
            report.append("- Sin altas nuevas detectadas.")
        else:
            report.extend(report_line(row, new_data) for row in rows)
        report.append("")
    report.extend(
        [
            "## Archivos generados",
            "",
        "- `01_incremental_altas.sql`: inserts incrementales con `ON CONFLICT (id) DO NOTHING`.",
        "- `sources/`: copia de los CSV actualizados usados para generar este incremental.",
            "",
            "## Nota",
            "",
            "Los vehiculos/proveedores incluidos son solamente prerrequisitos que no existian en la migracion anterior.",
            "El SQL no ejecuta deletes ni updates masivos. Si Funes cambio valores de registros ya importados, se recomienda revisar esos cambios en una segunda pasada controlada.",
        ]
    )
    (OUT_DIR / "00_reporte_incremental.md").write_text("\n".join(report) + "\n", encoding="utf-8")

    validation = [
        "-- Conteos rapidos luego de ejecutar el incremental",
        "SELECT 'vehiculos' AS tabla, count(*) FROM public.vehiculos",
        "UNION ALL SELECT 'compras_vehiculos', count(*) FROM public.compras_vehiculos",
        "UNION ALL SELECT 'vehiculo_gastos', count(*) FROM public.vehiculo_gastos",
        "UNION ALL SELECT 'ventas', count(*) FROM public.ventas",
        "UNION ALL SELECT 'ventas_pagos', count(*) FROM public.ventas_pagos",
        "UNION ALL SELECT 'ventas_entregas', count(*) FROM public.ventas_entregas",
        "UNION ALL SELECT 'gestoria_tramites', count(*) FROM public.gestoria_tramites",
        "UNION ALL SELECT 'comisiones', count(*) FROM public.comisiones",
        "UNION ALL SELECT 'comision_liquidaciones', count(*) FROM public.comision_liquidaciones",
        "UNION ALL SELECT 'recordatorios', count(*) FROM public.recordatorios;",
    ]
    (OUT_DIR / "02_validacion_incremental.sql").write_text("\n".join(validation) + "\n", encoding="utf-8")


def main() -> None:
    missing = [str(path) for path in UPDATED_FILES.values() if not path.exists()]
    if missing:
        raise FileNotFoundError("Faltan CSV actualizados:\n" + "\n".join(missing))

    old_data = build(BASE_SOURCE_DIR)
    with tempfile.TemporaryDirectory(prefix="funes-updated-csv-") as tmp_name:
        tmp_dir = Path(tmp_name)
        shutil.copytree(BASE_SOURCE_DIR, tmp_dir, dirs_exist_ok=True)
        for target_name, source in UPDATED_FILES.items():
            shutil.copy2(source, tmp_dir / target_name)
        new_data = build(tmp_dir)

    selected = make_incremental(old_data, new_data)
    write_outputs(selected, new_data)
    print(json.dumps({name: len(rows) for name, rows in selected.items()}, ensure_ascii=False, indent=2))
    print(f"Generado en: {OUT_DIR}")


if __name__ == "__main__":
    main()
