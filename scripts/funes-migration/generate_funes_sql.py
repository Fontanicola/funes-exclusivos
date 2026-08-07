#!/usr/bin/env python3
"""
Genera SQL de migracion desde los archivos operativos de Funes.

No ejecuta nada contra Supabase. Produce:
- generated/funes-migration/00_reset_operational_data.sql
- generated/funes-migration/01_import_funes_data.sql
- generated/funes-migration/02_validation_queries.sql
- generated/funes-migration/migration_report.md
"""

from __future__ import annotations

import csv
import json
import re
import uuid
from collections import defaultdict
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path
from typing import Any


SOURCE_DIR = Path("/Users/felipefontana/Documents/Documentos funes")
OUT_DIR = Path("generated/funes-migration")
NS = uuid.UUID("f1f2f3f4-1111-4222-8333-000000000001")
MIGRATION_DATE = "2026-08-03"


@dataclass(frozen=True)
class SqlExpr:
    value: str


def deterministic_uuid(kind: str, key: str) -> str:
    return str(uuid.uuid5(NS, f"{kind}:{key}"))


def read_csv(path: Path) -> list[list[str]]:
    raw = path.read_bytes()
    text = None
    for encoding in ("utf-8-sig", "utf-8", "cp1252", "latin1"):
        try:
            text = raw.decode(encoding)
            break
        except UnicodeDecodeError:
            continue
    if text is None:
        text = raw.decode("latin1", errors="replace")
    return [[cell.strip() for cell in row] for row in csv.reader(text.splitlines(), delimiter=";")]


def clean_text(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).replace("\ufeff", "").replace("\u00a0", " ").strip()
    text = text.strip('"').strip()
    if not text or text in {"-", "—", "$ -", "$ -   ", '"""""'}:
        return None
    return text


def normalize_domain(value: Any) -> str | None:
    text = clean_text(value)
    if not text:
        return None
    text = text.upper().replace(".", "").replace(" ", "")
    text = re.sub(r"[^A-Z0-9]", "", text)
    if not text or text in {"0", "OK", "VU", "SIN DOMINIO"}:
        return None
    return text


def parse_number(value: Any) -> float | None:
    text = clean_text(value)
    if not text:
        return None
    if "#DIV" in text or "#VALOR" in text:
        return None
    negative = text.startswith("-") or text.startswith("-$")
    text = (
        text.replace("$", "")
        .replace("US$", "")
        .replace("U$S", "")
        .replace("%", "")
        .replace("\u00a0", " ")
        .replace(" ", "")
    )
    text = text.replace("-", "")
    if not text:
        return None
    if "," in text:
        text = text.replace(".", "").replace(",", ".")
    else:
        text = text.replace(".", "")
    try:
        number = float(text)
    except ValueError:
        return None
    return -number if negative else number


def parse_money(value: Any) -> float | None:
    text = clean_text(value)
    if text and "%" in text:
        return None
    return parse_number(value)


def non_negative(value: float | int | None) -> float | int | None:
    if value is None:
        return None
    return value if value >= 0 else None


def non_negative_or_zero(value: float | int | None) -> float | int:
    normalized = non_negative(value)
    return normalized if normalized is not None else 0


def parse_int(value: Any) -> int | None:
    text = clean_text(value)
    if not text:
        return None
    text = text.upper().replace("KM", "").replace(".", "").replace(",", "").strip()
    if text == "0":
        return 0
    match = re.search(r"\d+", text)
    if not match:
        return None
    try:
        return int(match.group(0))
    except ValueError:
        return None


MONTHS = {
    "ene": 1,
    "feb": 2,
    "mar": 3,
    "abr": 4,
    "may": 5,
    "jun": 6,
    "jul": 7,
    "ago": 8,
    "sep": 9,
    "oct": 10,
    "nov": 11,
    "dic": 12,
}


def parse_period_date(value: Any) -> str | None:
    text = clean_text(value)
    if not text:
        return None
    normalized = text.lower().replace(".", "").replace("_", "-").strip()

    year_month = re.match(r"^(\d{4})[-/](\d{1,2})$", normalized)
    if year_month:
        year = int(year_month.group(1))
        month = int(year_month.group(2))
        if 1 <= month <= 12:
            return f"{year:04d}-{month:02d}-01"

    month_year = re.match(r"^([a-z]{3})[-/ ](\d{2,4})$", normalized)
    if month_year:
        month = MONTHS.get(month_year.group(1)[:3])
        year = int(month_year.group(2))
        if year < 100:
            year += 2000
        if month:
            return f"{year:04d}-{month:02d}-01"

    parsed = parse_date(text)
    if parsed:
        return parsed[:8] + "01"
    return None


def parse_date(value: Any, default_year: int | None = None) -> str | None:
    text = clean_text(value)
    if not text:
        return None
    text = text.lower().replace(".", "").strip()

    for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(text, fmt).date().isoformat()
        except ValueError:
            pass

    for fmt in ("%d/%m/%y", "%d-%m-%y"):
        try:
            parsed = datetime.strptime(text, fmt).date()
            return parsed.isoformat()
        except ValueError:
            pass

    match = re.match(r"^(\d{1,2})[-/ ]([a-z]{3})(?:[-/ ](\d{2,4}))?$", text)
    if match:
        day = int(match.group(1))
        month = MONTHS.get(match.group(2)[:3])
        year_raw = match.group(3)
        year = default_year
        if year_raw:
            year = int(year_raw)
            if year < 100:
                year += 2000
        if month and year:
            try:
                return date(year, month, day).isoformat()
            except ValueError:
                return None
    return None


def sql_literal(value: Any) -> str:
    if isinstance(value, SqlExpr):
        return value.value
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "TRUE" if value else "FALSE"
    if isinstance(value, (int, float)):
        if isinstance(value, float) and value.is_integer():
            return str(int(value))
        return str(value)
    text = str(value)
    return "'" + text.replace("'", "''") + "'"


def sql_json(value: Any) -> str:
    return sql_literal(json.dumps(value, ensure_ascii=False, sort_keys=True))


def merge_json_note(raw: Any, key: str, value: Any) -> str:
    payload: dict[str, Any]
    if isinstance(raw, str) and raw:
        try:
            parsed = json.loads(raw)
            payload = parsed if isinstance(parsed, dict) else {"original": parsed}
        except json.JSONDecodeError:
            payload = {"original": raw}
    else:
        payload = {}
    payload[key] = value
    return json.dumps(payload, ensure_ascii=False)


def vendedor_sql_expr(name: str | None = None) -> SqlExpr:
    cleaned = clean_text(name)
    fallback = (
        "SELECT id FROM public.empleados "
        "WHERE activo IS DISTINCT FROM FALSE "
        "ORDER BY CASE WHEN rol = 'admin' THEN 0 WHEN rol = 'vendedor' THEN 1 ELSE 2 END, nombre NULLS LAST "
        "LIMIT 1"
    )
    if not cleaned:
        return SqlExpr(f"({fallback})")
    pattern = "%" + cleaned.lower().replace("'", "''") + "%"
    return SqlExpr(
        "("
        "COALESCE("
        f"(SELECT id FROM public.empleados WHERE activo IS DISTINCT FROM FALSE AND lower(nombre) LIKE '{pattern}' ORDER BY nombre NULLS LAST LIMIT 1), "
        f"({fallback})"
        ")"
        ")"
    )


def sql_text_array(value: Any) -> str:
    if value is None:
        return "ARRAY[]::text[]"
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
            value = parsed
        except json.JSONDecodeError:
            value = [value] if value else []
    if not isinstance(value, list):
        value = []
    items = [item for item in value if isinstance(item, str) and item.strip()]
    if not items:
        return "ARRAY[]::text[]"
    return "ARRAY[" + ", ".join(sql_literal(item) for item in items) + "]::text[]"


def first(*values: Any) -> Any:
    for value in values:
        cleaned = clean_text(value)
        if cleaned is not None:
            return cleaned
    return None


def normalize_provider_name(value: Any) -> str | None:
    text = clean_text(value)
    if not text:
        return None
    text = re.sub(r"\s+", " ", text.strip())
    if text.upper() in {"CLIENTE", "INTERNO", "SALDO INICIAL", "FUNESEXCLUSIVOS", "FUNES EXCLUSIVOS"}:
        return text.title()
    return text


def provider_id(name: str | None) -> str | None:
    if not name:
        return None
    return deterministic_uuid("proveedor", name.lower())


def vehicle_label(v: dict[str, Any]) -> str:
    return " ".join(str(x) for x in [v.get("marca"), v.get("modelo"), v.get("version"), v.get("anio"), v.get("dominio")] if x)


def map_vehicle_state(posicion: Any, estado: Any, fecha_venta: Any = None) -> str:
    combined = " ".join(x.lower() for x in [clean_text(posicion), clean_text(estado), clean_text(fecha_venta)] if x)
    if "consign" in combined:
        return "en_consignacion"
    if "vendido" in combined or "entregado" in combined or parse_date(fecha_venta):
        return "vendido"
    return "en_stock"


def map_preparation_state(value: Any) -> str | None:
    return "sin_preparar" if clean_text(value) else None


def map_vehicle_expense_type(value: str) -> str:
    if value == "otros_gastos":
        return "preparacion"
    return value


def map_medio(value: Any) -> str:
    text = (clean_text(value) or "otro").lower()
    if "santander" in text:
        return "banco_santander"
    if "cheque" in text:
        return "cheques_terceros"
    if "dolar" in text or "u$s" in text:
        return "dolares"
    if "car france" in text:
        return "car_france"
    if "renault" in text:
        return "renault_credit"
    if "kyoto" in text:
        return "kyoto"
    if "metz" in text:
        return "metz"
    if "avec" in text:
        return "avec"
    if text == "mg":
        return "mg"
    if "hab sol" in text:
        return "cta_hab_sol"
    if "efectivo" in text:
        return "efectivo"
    return "otro"


def map_pago_medio(tipo: str) -> str:
    if tipo == "efectivo":
        return "efectivo"
    if tipo == "usado":
        return "otro"
    if tipo == "credito":
        return "otro"
    if tipo == "transferencia":
        return "banco_santander"
    if tipo == "senia":
        return "efectivo"
    return "otro"


@dataclass
class MigrationData:
    proveedores: dict[str, dict[str, Any]]
    vehiculos: dict[str, dict[str, Any]]
    compras: dict[str, dict[str, Any]]
    gastos: dict[str, dict[str, Any]]
    ventas: dict[str, dict[str, Any]]
    pagos: dict[str, dict[str, Any]]
    entregas: dict[str, dict[str, Any]]
    caja: dict[str, dict[str, Any]]
    gestoria: dict[str, dict[str, Any]]
    comisiones: dict[str, dict[str, Any]]
    liquidaciones: dict[str, dict[str, Any]]
    recordatorios: dict[str, dict[str, Any]]
    report: dict[str, Any]


def new_data() -> MigrationData:
    return MigrationData(
        proveedores={},
        vehiculos={},
        compras={},
        gastos={},
        ventas={},
        pagos={},
        entregas={},
        caja={},
        gestoria={},
        comisiones={},
        liquidaciones={},
        recordatorios={},
        report=defaultdict(int),
    )


def add_provider(data: MigrationData, name: str | None, categoria: str = "operativo") -> str | None:
    name = normalize_provider_name(name)
    if not name:
        return None
    pid = provider_id(name)
    if pid and pid not in data.proveedores:
        data.proveedores[pid] = {
            "id": pid,
            "nombre": name,
            "categoria": categoria,
            "telefono": None,
            "activo": True,
        }
    return pid


def upsert_vehicle(data: MigrationData, key: str, payload: dict[str, Any]) -> str:
    vid = deterministic_uuid("vehiculo", key)
    existing = data.vehiculos.get(vid, {"id": vid, "fotos": []})
    for field, value in payload.items():
        if value is not None or field not in existing:
            existing[field] = value
    existing.setdefault("precio_moneda", "ARS")
    existing.setdefault("costo_moneda", "ARS")
    existing.setdefault("estado", "en_stock")
    existing.setdefault("fotos", [])
    data.vehiculos[vid] = existing
    return vid


def vehicle_key_from_domain_or_source(domain: str | None, source_key: str) -> str:
    return f"dominio:{domain}" if domain else f"sin-dominio:{source_key}"


def parse_base(data: MigrationData) -> None:
    rows = read_csv(SOURCE_DIR / "Funes Exclusivos Base(BASE).csv")
    for index, row in enumerate(rows[6:], start=6):
        if not row or not (clean_text(row[0]) or "").isdigit():
            continue
        domain = normalize_domain(row[1] if len(row) > 1 else None)
        source_key = f"base:{index}:{domain or clean_text(row[3]) or index}"
        proveedor_nombre = clean_text(row[9] if len(row) > 9 else None)
        proveedor = add_provider(data, proveedor_nombre, "proveedor")
        compra_raw = parse_money(row[16] if len(row) > 16 else None)
        compra = non_negative(compra_raw)
        fecha_compra = parse_date(row[14] if len(row) > 14 else None)
        fecha_venta = parse_date(row[15] if len(row) > 15 else None)
        fecha_operacion = fecha_compra or fecha_venta or MIGRATION_DATE
        key = vehicle_key_from_domain_or_source(domain, source_key)
        vid = upsert_vehicle(
            data,
            key,
            {
                "marca": first(row[2] if len(row) > 2 else None, "Sin marca"),
                "modelo": first(row[3] if len(row) > 3 else None, "Sin modelo"),
                "version": clean_text(row[4] if len(row) > 4 else None),
                "motor": clean_text(row[5] if len(row) > 5 else None),
                "anio": parse_int(row[6] if len(row) > 6 else None),
                "color": clean_text(row[7] if len(row) > 7 else None),
                "km": parse_int(row[8] if len(row) > 8 else None) or 0,
                "dominio": domain,
                "proveedor_id": proveedor,
                "nro_operacion": clean_text(row[10] if len(row) > 10 else None),
                "precio_infoauto_compra": non_negative(parse_money(row[11] if len(row) > 11 else None)),
                "ubicacion": clean_text(row[12] if len(row) > 12 else None),
                "estado": map_vehicle_state(row[12] if len(row) > 12 else None, row[13] if len(row) > 13 else None, row[15] if len(row) > 15 else None),
                "fecha_compra": fecha_compra,
                "fecha_ingreso": fecha_compra or MIGRATION_DATE,
                "costo_adquisicion": compra,
                "costo_moneda": "ARS",
                "precio_moneda": "ARS",
                "observaciones": json.dumps({"source": "Funes Exclusivos Base(BASE).csv", "row": index, "raw": row[:24]}, ensure_ascii=False),
            },
        )
        if compra is not None or fecha_compra:
            cid = deterministic_uuid("compra", f"{vid}:{fecha_compra or index}:{compra or 0}")
            data.compras[cid] = {
                "id": cid,
                "vehiculo_id": vid,
                "proveedor_id": proveedor,
                "fecha": fecha_operacion,
                "nro_operacion": clean_text(row[10] if len(row) > 10 else None),
                "precio_compra": non_negative_or_zero(compra),
                "precio_boleto": None,
                "moneda": "ARS",
                "diferencia_b": None,
                "deuda_pendiente": None,
                "observaciones": json.dumps({"source": "Funes Exclusivos Base(BASE).csv", "row": index}, ensure_ascii=False),
            }
        for label, col in [("flete", 17), ("preparacion", 18), ("patentes_bajas", 19), ("otros_gastos", 20)]:
            amount = parse_money(row[col] if len(row) > col else None)
            if amount:
                gid = deterministic_uuid("gasto", f"{vid}:{label}:{index}:{amount}")
                data.gastos[gid] = {
                    "id": gid,
                    "vehiculo_id": vid,
                    "proveedor_id": proveedor,
                    "tipo": map_vehicle_expense_type(label),
                    "importe": abs(amount),
                    "monto": abs(amount),
                    "moneda": "ARS",
                    "fecha": fecha_operacion,
                    "detalle": " · ".join(
                        part
                        for part in [label.replace("_", " ").title(), clean_text(row[22] if len(row) > 22 else None)]
                        if part
                    ),
                    "observaciones": json.dumps({"source": "Funes Exclusivos Base(BASE).csv", "row": index, "col": col}, ensure_ascii=False),
                }


def parse_lp(data: MigrationData) -> None:
    rows = read_csv(SOURCE_DIR / "LP.csv")
    for index, row in enumerate(rows, start=0):
        if not row or not (clean_text(row[0]) or "").isdigit():
            continue
        domain = normalize_domain(row[1] if len(row) > 1 else None)
        key = vehicle_key_from_domain_or_source(domain, f"lp:{index}")
        proveedor = add_provider(data, row[19] if len(row) > 19 else None, "proveedor")
        status = (clean_text(row[16] if len(row) > 16 else None) or "").lower()
        vid = upsert_vehicle(
            data,
            key,
            {
                "marca": first(row[2] if len(row) > 2 else None, "Sin marca"),
                "modelo": first(row[3] if len(row) > 3 else None, "Sin modelo"),
                "version": clean_text(row[4] if len(row) > 4 else None),
                "motor": clean_text(row[5] if len(row) > 5 else None),
                "anio": parse_int(row[6] if len(row) > 6 else None),
                "color": clean_text(row[7] if len(row) > 7 else None),
                "km": parse_int(row[8] if len(row) > 8 else None) or 0,
                "dominio": domain,
                "precio_permuta": non_negative(parse_money(row[9] if len(row) > 9 else None)),
                "precio_contado": non_negative(parse_money(row[10] if len(row) > 10 else None)),
                "precio_venta": non_negative(parse_money(row[10] if len(row) > 10 else None)) or non_negative(parse_money(row[9] if len(row) > 9 else None)),
                "precio_moneda": "ARS",
                "precio_infoauto_actual": non_negative(parse_money(row[11] if len(row) > 11 else None)),
                "precio_infoauto_anterior": non_negative(parse_money(row[12] if len(row) > 12 else None)),
                "ubicacion": clean_text(row[14] if len(row) > 14 else None),
                "estado": "en_stock" if "stock" in status or not status else map_vehicle_state(status, status),
                "costo_adquisicion": non_negative(parse_money(row[17] if len(row) > 17 else None)),
                "costo_reposicion": non_negative(parse_money(row[21] if len(row) > 21 else None)),
                "costo_moneda": "ARS",
                "proveedor_id": proveedor,
                "publicado_rodados_google": bool(clean_text(row[25] if len(row) > 25 else None)),
                "publicado_mercadolibre": bool(clean_text(row[26] if len(row) > 26 else None)),
                "catalogo_publicado": False,
                "catalogo_destacado": False,
                "observaciones": json.dumps({"source": "LP.csv", "row": index, "facturacion": clean_text(row[20] if len(row) > 20 else None), "raw": row[:27]}, ensure_ascii=False),
            },
        )
        costo = non_negative(parse_money(row[17] if len(row) > 17 else None))
        if costo:
            cid = deterministic_uuid("compra", f"{vid}:lp:{costo}")
            data.compras.setdefault(
                cid,
                {
                    "id": cid,
                    "vehiculo_id": vid,
                    "proveedor_id": proveedor,
                    "fecha": None,
                    "nro_operacion": None,
                    "precio_compra": non_negative_or_zero(costo),
                    "precio_boleto": None,
                    "moneda": "ARS",
                    "diferencia_b": None,
                    "deuda_pendiente": None,
                    "observaciones": json.dumps({"source": "LP.csv", "row": index, "nota": "Compra inferida desde costo LP"}, ensure_ascii=False),
                },
            )


def parse_preparation(data: MigrationData) -> None:
    rows = read_csv(SOURCE_DIR / "Preparacion autos julio.csv")
    for index, row in enumerate(rows[1:], start=1):
        if not row or not (clean_text(row[0]) or "").isdigit():
            continue
        domain = normalize_domain(row[1] if len(row) > 1 else None)
        key = vehicle_key_from_domain_or_source(domain, f"preparacion:{index}")
        vid = upsert_vehicle(
            data,
            key,
            {
                "marca": first(row[2] if len(row) > 2 else None, "Sin marca"),
                "modelo": first(row[3] if len(row) > 3 else None, "Sin modelo"),
                "version": clean_text(row[4] if len(row) > 4 else None),
                "motor": clean_text(row[5] if len(row) > 5 else None),
                "anio": parse_int(row[6] if len(row) > 6 else None),
                "color": clean_text(row[7] if len(row) > 7 else None),
                "km": parse_int(row[8] if len(row) > 8 else None) or 0,
                "dominio": domain,
                "estado_preparacion": map_preparation_state(row[9] if len(row) > 9 else None),
                "chapero": clean_text(row[10] if len(row) > 10 else None),
                "preparacion_comentarios": " · ".join(x for x in [clean_text(row[11] if len(row) > 11 else None), clean_text(row[12] if len(row) > 12 else None)] if x) or None,
                "observaciones": json.dumps({"source": "Preparacion autos julio.csv", "row": index, "antig": clean_text(row[13] if len(row) > 13 else None)}, ensure_ascii=False),
            },
        )
        _ = vid


def parse_renta_file(data: MigrationData, path: Path) -> None:
    rows = read_csv(path)
    match = re.search(r"Renta (\d{2})-(\d{4})", path.name)
    default_year = int(match.group(2)) if match else None
    for index, row in enumerate(rows):
        if len(row) < 8 or not (clean_text(row[0]) or "").isdigit():
            continue
        fecha = parse_date(row[1], default_year)
        domain = normalize_domain(row[2])
        marca = first(row[3], "Sin marca")
        modelo = first(row[4], "Sin modelo")
        has_year = bool(parse_int(row[5]) and 1900 <= (parse_int(row[5]) or 0) <= 2035)
        anio = parse_int(row[5]) if has_year else None
        if has_year:
            precio_venta = non_negative(parse_money(row[6] if len(row) > 6 else None))
            precio_infoauto = non_negative(parse_money(row[7] if len(row) > 7 else None))
            info_hist = non_negative(parse_money(row[8] if len(row) > 8 else None))
            costo_reposicion = non_negative(parse_money(row[10] if len(row) > 10 else None))
            costo_historico = non_negative(parse_money(row[13] if len(row) > 13 else None))
            efectivo_idx, usado_idx, credito_idx = (19, 20, 21) if len(row) > 22 and clean_text(row[19]) else (16, 17, 18)
            vendedor_idx = 22 if efectivo_idx == 19 else 19
            rotacion_idx = 23 if efectivo_idx == 19 else 20
            estado_idx = 33 if len(row) > 33 else 30
            resultado_idx = 38 if len(row) > 38 else 35
            escribania_idx = 35 if len(row) > 35 else 32
            transferencia_idx = 36 if len(row) > 36 else 33
        else:
            precio_venta = non_negative(parse_money(row[5] if len(row) > 5 else None))
            precio_infoauto = non_negative(parse_money(row[6] if len(row) > 6 else None))
            info_hist = None
            costo_reposicion = None
            costo_historico = non_negative(parse_money(row[9] if len(row) > 9 else None))
            efectivo_idx, usado_idx, credito_idx = 12, 13, 14
            vendedor_idx = 16 if len(row) > 16 else 18
            rotacion_idx = None
            estado_idx = None
            resultado_idx = None
            escribania_idx = None
            transferencia_idx = None
        if not fecha and not precio_venta:
            continue
        key = vehicle_key_from_domain_or_source(domain, f"{path.name}:{index}")
        vid = upsert_vehicle(
            data,
            key,
            {
                "marca": marca,
                "modelo": modelo,
                "anio": anio,
                "dominio": domain,
                "estado": "vendido",
                "precio_venta": precio_venta,
                "precio_moneda": "ARS",
                "precio_infoauto_actual": precio_infoauto,
                "costo_reposicion": costo_reposicion,
                "costo_adquisicion": costo_historico,
                "costo_moneda": "ARS",
            },
        )
        vendedor = clean_text(row[vendedor_idx] if len(row) > vendedor_idx else None)
        venta_id = deterministic_uuid("venta", f"{path.name}:{index}:{domain or modelo}:{fecha or ''}")
        metodo = "permuta" if parse_money(row[usado_idx] if len(row) > usado_idx else None) else "transferencia"
        data.ventas[venta_id] = {
            "id": venta_id,
            "vehiculo_id": vid,
            "vehiculo_recibido_id": None,
            "vendedor_id": vendedor_sql_expr(vendedor),
            "fecha_venta": fecha,
            "cliente_nombre": "Cliente histórico",
            "cliente_telefono": None,
            "cliente_email": None,
            "cliente_documento": None,
            "precio_venta": non_negative_or_zero(precio_venta),
            "moneda": "ARS",
            "metodo_pago": metodo,
            "estado": "registrada",
            "monto_permuta": non_negative(parse_money(row[usado_idx] if len(row) > usado_idx else None)),
            "precio_infoauto": precio_infoauto,
            "info_historica_compra": info_hist,
            "costo_reposicion": costo_reposicion,
            "costo_historico": costo_historico,
            "margen_reposicion": parse_number(row[12] if has_year and len(row) > 12 else None),
            "margen_historico": parse_number(row[15] if has_year and len(row) > 15 else None),
            "rotacion_dias": parse_int(row[rotacion_idx]) if rotacion_idx is not None and len(row) > rotacion_idx else None,
            "saldo_preventa": None,
            "saldo_efectivo": None,
            "importe_gestoria": non_negative(parse_money(row[transferencia_idx] if transferencia_idx and len(row) > transferencia_idx else None)),
            "importe_escribania": non_negative(parse_money(row[escribania_idx] if escribania_idx and len(row) > escribania_idx else None)),
            "resultado_operativo": parse_number(row[resultado_idx] if resultado_idx and len(row) > resultado_idx else None),
            "observaciones": json.dumps({"source": path.name, "row": index, "vendedor_original": vendedor, "estado_original": clean_text(row[estado_idx] if estado_idx and len(row) > estado_idx else None), "raw": row[:45]}, ensure_ascii=False),
        }
        for tipo, col in [("efectivo", efectivo_idx), ("usado", usado_idx), ("credito", credito_idx)]:
            amount = parse_money(row[col] if len(row) > col else None)
            if amount and amount > 0:
                pid = deterministic_uuid("venta_pago", f"{venta_id}:{tipo}:{amount}")
                data.pagos[pid] = {
                    "id": pid,
                    "venta_id": venta_id,
                    "tipo": tipo,
                    "fecha": fecha,
                    "importe": amount,
                    "moneda": "ARS",
                    "medio": map_pago_medio(tipo),
                    "detalle": f"Pago {tipo} importado desde {path.name}",
                }


def parse_all_renta(data: MigrationData) -> None:
    for path in sorted(SOURCE_DIR.glob("Renta *.csv")):
        parse_renta_file(data, path)


def parse_pendiente_entrega(data: MigrationData) -> None:
    rows = read_csv(SOURCE_DIR / "Pendiente de entrega.csv")
    for index, row in enumerate(rows):
        if len(row) < 12 or not (clean_text(row[1]) or "").isdigit():
            continue
        fecha = parse_date(row[2], 2026)
        domain = normalize_domain(row[3])
        key = vehicle_key_from_domain_or_source(domain, f"pendiente:{index}")
        vid = upsert_vehicle(
            data,
            key,
            {
                "marca": None,
                "modelo": first(row[4], "Sin modelo"),
                "anio": parse_int(row[5]),
                "dominio": domain,
                "estado": "vendido",
                "precio_venta": non_negative(parse_money(row[6])),
                "precio_moneda": "ARS",
            },
        )
        venta_id = deterministic_uuid("venta", f"pendiente:{domain or index}:{fecha or ''}:{clean_text(row[1])}")
        if venta_id not in data.ventas:
            data.ventas[venta_id] = {
                "id": venta_id,
                "vehiculo_id": vid,
                "vehiculo_recibido_id": None,
                "vendedor_id": vendedor_sql_expr(clean_text(row[12] if len(row) > 12 else None)),
                "fecha_venta": fecha,
                "cliente_nombre": "Cliente pendiente de entrega",
                "cliente_telefono": None,
                "cliente_email": None,
                "cliente_documento": None,
                "precio_venta": non_negative_or_zero(parse_money(row[6])),
                "moneda": "ARS",
                "metodo_pago": "transferencia",
                "estado": "registrada",
                "monto_permuta": non_negative(parse_money(row[10])),
                "precio_infoauto": None,
                "info_historica_compra": None,
                "costo_reposicion": None,
                "costo_historico": None,
                "margen_reposicion": None,
                "margen_historico": None,
                "rotacion_dias": None,
                "saldo_preventa": non_negative(parse_money(row[7])),
                "saldo_efectivo": non_negative(parse_money(row[8])),
                "importe_gestoria": non_negative(parse_money(row[29] if len(row) > 29 else None)),
                "importe_escribania": non_negative(parse_money(row[30] if len(row) > 30 else None)),
                "resultado_operativo": None,
                "observaciones": json.dumps({"source": "Pendiente de entrega.csv", "row": index, "estado_operacion": clean_text(row[0]), "vendedor_original": clean_text(row[12]), "raw_first_40": row[:40]}, ensure_ascii=False),
            }
        entrega_id = deterministic_uuid("venta_entrega", venta_id)
        estado_raw = (clean_text(row[0]) or "").lower()
        estado = "observada" if "resta" in estado_raw or "observ" in estado_raw else "pendiente"
        if clean_text(row[28] if len(row) > 28 else None):
            estado = "lista_para_entregar"
        data.entregas[entrega_id] = {
            "id": entrega_id,
            "venta_id": venta_id,
            "estado": estado,
            "fecha_entrega": parse_date(row[28] if len(row) > 28 else None, 2026),
            "status_informe_vu": clean_text(row[15] if len(row) > 15 else None),
            "usado_credito": clean_text(row[11] if len(row) > 11 else None),
            "usado_informe_dominio": None,
            "usado_multas": None,
            "usado_patentes": None,
            "usado_observaciones": clean_text(row[0]),
            "observaciones": json.dumps({"source": "Pendiente de entrega.csv", "row": index, "raw_first_40": row[:40]}, ensure_ascii=False),
        }
        for tipo, col in [("efectivo", 9), ("usado", 10), ("credito", 11)]:
            amount = parse_money(row[col] if len(row) > col else None)
            if amount and amount > 0:
                pid = deterministic_uuid("venta_pago", f"{venta_id}:pendiente:{tipo}:{amount}")
                data.pagos[pid] = {
                    "id": pid,
                    "venta_id": venta_id,
                    "tipo": tipo,
                    "fecha": fecha,
                    "importe": amount,
                    "moneda": "ARS",
                    "medio": map_pago_medio(tipo),
                    "detalle": "Pago inicial importado desde pendiente de entrega",
                }


def parse_caja(data: MigrationData) -> None:
    rows = read_csv(SOURCE_DIR / "Caja 2025-2026.csv")
    for index, row in enumerate(rows):
        if len(row) < 6:
            continue
        fecha = parse_date(row[0], 2025)
        amount = parse_money(row[5])
        if not fecha or amount is None:
            continue
        medio = clean_text(row[1])
        moneda = "USD" if (medio and ("u$s" in medio.lower() or "dolar" in medio.lower())) else "ARS"
        concepto = clean_text(row[2])
        proveedor_original = clean_text(row[3] if len(row) > 3 else None)
        referencia = (
            clean_text(row[4])
            or proveedor_original
            or concepto
            or "Movimiento importado"
        )
        cid = deterministic_uuid("caja", f"{index}:{fecha}:{medio}:{row[2]}:{row[5]}")
        data.caja[cid] = {
            "id": cid,
            "tipo": "egreso" if amount < 0 else "ingreso",
            "origen": "manual",
            "compra_id": None,
            "venta_id": None,
            "venta_pago_id": None,
            "comision_liquidacion_id": None,
            "monto": abs(amount),
            "importe": abs(amount),
            "moneda": moneda,
            "fecha": fecha,
            "medio": map_medio(medio),
            "concepto": concepto,
            "detalle_1": referencia,
            "detalle_2": clean_text(row[6] if len(row) > 6 else None),
            "detalle_3": clean_text(row[7] if len(row) > 7 else None) or proveedor_original,
            "periodo": parse_period_date(row[8] if len(row) > 8 else None),
            "cuenta": clean_text(row[9] if len(row) > 9 else None),
            "observaciones": json.dumps({"source": "Caja 2025-2026.csv", "row": index, "proveedor_original": proveedor_original, "raw": row[:11]}, ensure_ascii=False),
        }
        add_provider(data, row[3] if len(row) > 3 else None, "caja")


def parse_gestoria(data: MigrationData) -> None:
    rows = read_csv(SOURCE_DIR / "ALTA BAJA MUNICIPAL.csv")
    for index, row in enumerate(rows[2:], start=2):
        domain = normalize_domain(row[0] if row else None)
        if not domain and not clean_text(row[2] if len(row) > 2 else None):
            continue
        key = vehicle_key_from_domain_or_source(domain, f"municipal:{index}")
        vid = upsert_vehicle(
            data,
            key,
            {
                "marca": clean_text(row[1] if len(row) > 1 else None),
                "modelo": clean_text(row[2] if len(row) > 2 else None),
                "anio": parse_int(row[3] if len(row) > 3 else None),
                "dominio": domain,
            },
        )
        proveedor = add_provider(data, row[4] if len(row) > 4 else None, "proveedor")
        estado_raw = " ".join(x for x in [clean_text(row[11] if len(row) > 11 else None), clean_text(row[13] if len(row) > 13 else None)] if x).lower()
        estado = "completado" if "ok" in estado_raw and "pte" not in estado_raw and "proceso" not in estado_raw else "en_proceso"
        fecha_finalizacion = parse_date(row[21] if len(row) > 21 else None, 2026) if estado == "completado" else None
        fecha_inicio = (
            parse_date(row[12] if len(row) > 12 else None, 2026)
            or parse_date(row[5] if len(row) > 5 else None, 2026)
            or fecha_finalizacion
            or MIGRATION_DATE
        )
        gid = deterministic_uuid("gestoria", f"municipal:{domain or index}")
        data.gestoria[gid] = {
            "id": gid,
            "tipo": "patente",
            "estado": estado,
            "titulo": f"Alta/Baja municipal {domain or clean_text(row[2]) or index}",
            "descripcion": "Migrado desde planilla Alta/Baja Municipal",
            "vehiculo_id": vid,
            "venta_id": None,
            "responsable_id": None,
            "cliente_nombre": None,
            "cliente_telefono": None,
            "cliente_email": None,
            "cliente_documento": None,
            "fecha_inicio": fecha_inicio,
            "fecha_vencimiento": None,
            "fecha_finalizacion": fecha_finalizacion,
            "etapa": "gestoria" if estado != "completado" else "terminado",
            "gestion_tipo": "interna",
            "fecha_envio": parse_date(row[12] if len(row) > 12 else None, 2026),
            "fecha_firma": None,
            "costo_final_transferencia": non_negative(parse_money(row[19] if len(row) > 19 else None)),
            "costo_final_moneda": "ARS",
            "presupuesto_confirmado": bool(parse_money(row[19] if len(row) > 19 else None)),
            "cat_estado": "completado" if "ok" in (clean_text(row[11] if len(row) > 11 else None) or "").lower() else "pendiente",
            "documentacion_fisica_estado": "pendiente",
            "escribania_estado": "no_aplica",
            "transferencia_registral_estado": "en_proceso" if "proceso" in estado_raw else "pendiente",
            "transferencia_municipal_estado": "completado" if estado == "completado" else "en_proceso",
            "seguimiento_comentarios": json.dumps({"source": "ALTA BAJA MUNICIPAL.csv", "row": index, "raw": row[:23]}, ensure_ascii=False),
            "observaciones": json.dumps({"source": "ALTA BAJA MUNICIPAL.csv", "row": index, "proveedor_id": proveedor}, ensure_ascii=False),
        }
    rows = read_csv(SOURCE_DIR / "Cta cte gestoria .csv")
    for index, row in enumerate(rows[2:], start=2):
        domain = normalize_domain(row[0] if row else None)
        tramite = clean_text(row[1] if len(row) > 1 else None)
        if not domain or not tramite:
            continue
        key = vehicle_key_from_domain_or_source(domain, f"ctacte:{index}")
        vid = upsert_vehicle(data, key, {"modelo": clean_text(row[3] if len(row) > 3 else None) or "Sin modelo", "dominio": domain})
        gid = deterministic_uuid("gestoria", f"ctacte:{domain}:{tramite}:{index}")
        saldo = parse_money(row[6] if len(row) > 6 else None)
        fecha_cta = parse_date(row[5] if len(row) > 5 else None, 2025) or MIGRATION_DATE
        data.gestoria[gid] = {
            "id": gid,
            "tipo": "transferencia" if "trans" in tramite.lower() else "patente" if "pat" in tramite.lower() else "otro",
            "estado": "completado" if saldo == 0 else "pendiente",
            "titulo": f"{tramite} {domain}",
            "descripcion": "Cuenta corriente de gestoría migrada",
            "vehiculo_id": vid,
            "venta_id": None,
            "responsable_id": None,
            "cliente_nombre": None,
            "cliente_telefono": None,
            "cliente_email": None,
            "cliente_documento": None,
            "fecha_inicio": fecha_cta,
            "fecha_vencimiento": None,
            "fecha_finalizacion": fecha_cta if saldo == 0 else None,
            "etapa": "terminado" if saldo == 0 else "gestoria",
            "gestion_tipo": "interna",
            "fecha_envio": None,
            "fecha_firma": None,
            "costo_final_transferencia": abs(parse_money(row[2] if len(row) > 2 else None) or 0) or None,
            "costo_final_moneda": "ARS",
            "presupuesto_confirmado": True,
            "cat_estado": "no_aplica",
            "documentacion_fisica_estado": "pendiente",
            "escribania_estado": "no_aplica",
            "transferencia_registral_estado": "completado" if saldo == 0 else "pendiente",
            "transferencia_municipal_estado": "no_aplica",
            "seguimiento_comentarios": json.dumps({"source": "Cta cte gestoria .csv", "row": index, "raw": row[:11]}, ensure_ascii=False),
            "observaciones": json.dumps({"source": "Cta cte gestoria .csv", "row": index}, ensure_ascii=False),
        }


def parse_comisiones(data: MigrationData) -> None:
    rows = read_csv(SOURCE_DIR / "Comisiones vendedores.csv")
    current_seller = None
    current_period = None
    period_total = 0.0
    section_rows = 0

    def close_section() -> None:
        nonlocal period_total, section_rows, current_seller, current_period
        if current_seller and current_period and section_rows:
            lid = deterministic_uuid("liquidacion", f"{current_seller}:{current_period}")
            data.liquidaciones[lid] = {
                "id": lid,
                "vendedor_id": vendedor_sql_expr(current_seller),
                "periodo": f"{current_period}-01",
                "estado": "cerrada",
                "moneda": "ARS",
                "neto_a_cobrar": max(period_total, 0),
                "fecha_pago": None,
                "fecha_cierre": f"{current_period}-28",
                "observaciones": json.dumps({"source": "Comisiones vendedores.csv", "vendedor_original": current_seller}, ensure_ascii=False),
            }
        period_total = 0.0
        section_rows = 0

    for index, row in enumerate(rows):
        title = clean_text(row[1] if len(row) > 1 else None)
        section = re.match(r"^(.+?)\s*-\s*(\d{2})/(\d{4})$", title or "")
        if section:
            close_section()
            current_seller = section.group(1).strip()
            current_period = f"{section.group(3)}-{section.group(2)}"
            continue
        if not current_seller or not current_period:
            continue
        if not (clean_text(row[0]) or "").isdigit():
            continue
        amount = parse_money(row[10] if len(row) > 10 else None)
        if not amount or amount <= 0:
            continue
        domain = normalize_domain(row[8] if len(row) > 8 else None)
        venta_id = None
        if domain:
            for sale in data.ventas.values():
                veh = data.vehiculos.get(sale["vehiculo_id"], {})
                if veh.get("dominio") == domain:
                    venta_id = sale["id"]
                    break
        if venta_id is None:
            vehicle_key = (
                vehicle_key_from_domain_or_source(domain, f"comision:{current_seller}:{current_period}:{index}")
                if domain
                else f"comision:{current_seller}:{current_period}:{index}"
            )
            vid = upsert_vehicle(
                data,
                vehicle_key,
                {
                    "marca": clean_text(row[1] if len(row) > 1 else None) or "Sin marca",
                    "modelo": clean_text(row[2] if len(row) > 2 else None) or "Comisión histórica",
                    "anio": parse_int(row[3] if len(row) > 3 else None),
                    "dominio": domain,
                    "estado": "vendido",
                    "precio_venta": non_negative(parse_money(row[4] if len(row) > 4 else None)),
                    "precio_moneda": "ARS",
                },
            )
            venta_id = deterministic_uuid("venta", f"comision:{current_seller}:{current_period}:{domain or index}")
            if venta_id not in data.ventas:
                data.ventas[venta_id] = {
                    "id": venta_id,
                    "vehiculo_id": vid,
                    "vehiculo_recibido_id": None,
                    "vendedor_id": vendedor_sql_expr(current_seller),
                    "fecha_venta": f"{current_period}-01",
                    "cliente_nombre": "Cliente histórico",
                    "cliente_telefono": None,
                    "cliente_email": None,
                    "cliente_documento": None,
                    "precio_venta": non_negative_or_zero(parse_money(row[4] if len(row) > 4 else None)),
                    "moneda": "ARS",
                    "metodo_pago": "transferencia",
                    "estado": "registrada",
                    "monto_permuta": None,
                    "precio_infoauto": None,
                    "info_historica_compra": None,
                    "costo_reposicion": None,
                    "costo_historico": None,
                    "margen_reposicion": None,
                    "margen_historico": None,
                    "rotacion_dias": None,
                    "saldo_preventa": None,
                    "saldo_efectivo": None,
                    "importe_gestoria": None,
                    "importe_escribania": None,
                    "resultado_operativo": None,
                    "observaciones": json.dumps(
                        {
                            "source": "Comisiones vendedores.csv",
                            "row": index,
                            "vendedor_original": current_seller,
                            "migration_note": "Venta histórica mínima creada para vincular comisión obligatoria.",
                            "raw": row[:11],
                        },
                        ensure_ascii=False,
                    ),
                }
        cid = deterministic_uuid("comision", f"{current_seller}:{current_period}:{domain or index}:{amount}")
        data.comisiones[cid] = {
            "id": cid,
            "venta_id": venta_id,
            "vendedor_id": vendedor_sql_expr(current_seller),
            "base_comision": non_negative(parse_money(row[4] if len(row) > 4 else None)),
            "porcentaje": non_negative(parse_number(row[9] if len(row) > 9 else None)),
            "monto_comision": amount,
            "moneda": "ARS",
            "estado": "pendiente",
            "fecha_generada": f"{current_period}-01",
            "fecha_pago": None,
            "observaciones": json.dumps({"source": "Comisiones vendedores.csv", "row": index, "vendedor_original": current_seller, "raw": row[:11]}, ensure_ascii=False),
        }
        period_total += amount
        section_rows += 1
    close_section()


def parse_recordatorios(data: MigrationData) -> None:
    # Recordatorios operativos derivados de vencimientos/observados de los Excel.
    for gid, tramite in data.gestoria.items():
        if tramite.get("estado") != "completado":
            rid = deterministic_uuid("recordatorio", f"gestoria:{gid}")
            data.recordatorios[rid] = {
                "id": rid,
                "tipo": "gestoria",
                "estado": "pendiente",
                "prioridad": "alta",
                "titulo": f"Revisar {tramite.get('titulo')}",
                "descripcion": "Generado desde planillas históricas de gestoría.",
                "fecha_vencimiento": tramite.get("fecha_vencimiento") or tramite.get("fecha_inicio") or MIGRATION_DATE,
                "fecha_completado": None,
                "fecha_pospuesto": None,
                "asignado_a": None,
                "lead_id": None,
                "conversacion_id": None,
                "venta_id": tramite.get("venta_id"),
                "entrega_id": None,
                "tramite_id": gid,
                "vehiculo_id": tramite.get("vehiculo_id"),
                "comision_liquidacion_id": None,
                "origen_automatico": True,
            }
    for eid, entrega in data.entregas.items():
        if entrega.get("estado") in {"pendiente", "observada"}:
            rid = deterministic_uuid("recordatorio", f"entrega:{eid}")
            data.recordatorios[rid] = {
                "id": rid,
                "tipo": "entrega",
                "estado": "pendiente",
                "prioridad": "alta" if entrega.get("estado") == "observada" else "media",
                "titulo": "Seguimiento de entrega pendiente",
                "descripcion": clean_text(entrega.get("usado_observaciones")) or "Operación pendiente de entrega.",
                "fecha_vencimiento": entrega.get("fecha_entrega") or MIGRATION_DATE,
                "fecha_completado": None,
                "fecha_pospuesto": None,
                "asignado_a": None,
                "lead_id": None,
                "conversacion_id": None,
                "venta_id": entrega.get("venta_id"),
                "entrega_id": eid,
                "tramite_id": None,
                "vehiculo_id": None,
                "comision_liquidacion_id": None,
                "origen_automatico": True,
            }


def build_data() -> MigrationData:
    data = new_data()
    parse_base(data)
    parse_lp(data)
    parse_preparation(data)
    parse_all_renta(data)
    parse_pendiente_entrega(data)
    parse_caja(data)
    parse_gestoria(data)
    parse_comisiones(data)
    parse_recordatorios(data)
    return data


def insert_statement(table: str, rows: list[dict[str, Any]], columns: list[str], conflict: str | None = None) -> str:
    if not rows:
        return f"-- Sin filas para {table}\n"
    statements: list[str] = []
    for start in range(0, len(rows), 400):
        batch = rows[start : start + 400]
        vals = []
        for row in batch:
            rendered = []
            for col in columns:
                if table == "vehiculos" and col == "fotos":
                    rendered.append(sql_text_array(row.get(col)))
                else:
                    rendered.append(sql_literal(row.get(col)))
            vals.append("(" + ", ".join(rendered) + ")")
        stmt = f"INSERT INTO public.{table} ({', '.join(columns)}) VALUES\n" + ",\n".join(vals)
        if conflict:
            stmt += f"\n{conflict}"
        stmt += ";"
        statements.append(stmt)
    return "\n\n".join(statements) + "\n"


def write_sql_files(data: MigrationData) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    reset_tables = [
        "conversacion_mensajes",
        "conversaciones",
        "whatsapp_instancias",
        "recordatorios",
        "vehiculo_documentos",
        "gestoria_presupuesto_items",
        "gestoria_presupuestos",
        "gestoria_tramites",
        "comision_liquidacion_items",
        "comision_ajustes",
        "comision_liquidaciones",
        "comisiones",
        "caja_movimientos",
        "ventas_pagos",
        "ventas_entregas",
        "ventas",
        "compras_vehiculos",
        "vehiculo_gastos",
        "leads",
        "vehiculos",
        "proveedores",
    ]
    reset_sql = [
        "-- Funes Exclusivos - reset operativo previo a migracion",
        "-- Revisar antes de ejecutar. No borra empleados ni configuracion_general.",
        "BEGIN;",
    ]
    reset_sql.extend([f"DELETE FROM public.{table};" for table in reset_tables])
    reset_sql.append("COMMIT;")
    reset_sql.append("\n-- Opcional y peligroso: NO ejecutar salvo decision explicita.")
    reset_sql.append("-- DELETE FROM public.empleados; -- puede dejar usuarios sin perfil operativo/login")
    (OUT_DIR / "00_reset_operational_data.sql").write_text("\n".join(reset_sql) + "\n", encoding="utf-8")

    sections: list[str] = [
        "-- Funes Exclusivos - import generado desde CSV operativos",
        "-- Ejecutar despues de 00_reset_operational_data.sql.",
        "-- Los datos no mapeados se preservan en observaciones/seguimiento_comentarios como JSON.",
        "BEGIN;",
    ]

    sections.append(insert_statement("proveedores", list(data.proveedores.values()), ["id", "nombre", "categoria", "telefono", "activo"]))
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
            vehicle["fecha_ingreso"] = vehicle.get("fecha_compra") or MIGRATION_DATE
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
            vehicle[field] = non_negative(vehicle.get(field))
    sections.append(insert_statement("vehiculos", list(data.vehiculos.values()), vehicle_cols))
    for compra in data.compras.values():
        if not compra.get("fecha"):
            vehicle = data.vehiculos.get(compra.get("vehiculo_id"), {})
            compra["fecha"] = vehicle.get("fecha_compra") or vehicle.get("fecha_ingreso") or MIGRATION_DATE
        compra["precio_compra"] = non_negative_or_zero(compra.get("precio_compra"))
        compra["precio_boleto"] = non_negative(compra.get("precio_boleto"))
        compra["deuda_pendiente"] = non_negative(compra.get("deuda_pendiente"))
    sections.append(insert_statement("compras_vehiculos", list(data.compras.values()), ["id", "vehiculo_id", "proveedor_id", "fecha", "nro_operacion", "precio_compra", "precio_boleto", "moneda", "diferencia_b", "deuda_pendiente", "observaciones"]))
    for gasto in data.gastos.values():
        gasto["importe"] = abs(gasto.get("importe") or 0)
        gasto["monto"] = abs(gasto.get("monto") or gasto.get("importe") or 0)
        if not gasto.get("fecha"):
            vehicle = data.vehiculos.get(gasto.get("vehiculo_id"), {})
            gasto["fecha"] = vehicle.get("fecha_compra") or vehicle.get("fecha_ingreso") or MIGRATION_DATE
    sections.append(insert_statement("vehiculo_gastos", list(data.gastos.values()), ["id", "vehiculo_id", "proveedor_id", "tipo", "monto", "moneda", "fecha", "detalle"]))
    venta_cols = ["id", "vehiculo_id", "vehiculo_recibido_id", "vendedor_id", "fecha_venta", "cliente_nombre", "cliente_telefono", "cliente_email", "cliente_documento", "precio_venta", "moneda", "metodo_pago", "estado", "monto_permuta", "precio_infoauto", "info_historica_compra", "costo_reposicion", "costo_historico", "margen_reposicion", "margen_historico", "rotacion_dias", "saldo_preventa", "saldo_efectivo", "importe_gestoria", "importe_escribania", "resultado_operativo", "observaciones"]
    registered_vehicle_sales: set[str] = set()
    for venta in data.ventas.values():
        venta["precio_venta"] = non_negative_or_zero(venta.get("precio_venta"))
        for field in ["monto_permuta", "precio_infoauto", "info_historica_compra", "costo_reposicion", "costo_historico", "saldo_preventa", "saldo_efectivo", "importe_gestoria", "importe_escribania"]:
            venta[field] = non_negative(venta.get(field))
        vehiculo_id = clean_text(venta.get("vehiculo_id"))
        if venta.get("estado") == "registrada" and vehiculo_id:
            if vehiculo_id in registered_vehicle_sales:
                venta["estado"] = "anulada"
                venta["observaciones"] = merge_json_note(
                    venta.get("observaciones"),
                    "migration_note",
                    "Venta histórica duplicada para el mismo vehículo; se importa como anulada para respetar ventas_vehiculo_registrada_unique_idx.",
                )
            else:
                registered_vehicle_sales.add(vehiculo_id)
    sections.append(insert_statement("ventas", list(data.ventas.values()), venta_cols))
    for pago in data.pagos.values():
        pago["importe"] = abs(pago.get("importe") or 0)
    sections.append(insert_statement("ventas_pagos", list(data.pagos.values()), ["id", "venta_id", "tipo", "fecha", "importe", "moneda", "medio", "detalle"]))
    sections.append(insert_statement("ventas_entregas", list(data.entregas.values()), ["id", "venta_id", "estado", "fecha_entrega", "status_informe_vu", "usado_credito", "usado_informe_dominio", "usado_multas", "usado_patentes", "usado_observaciones", "observaciones"]))
    caja_cols = ["id", "tipo", "origen", "compra_id", "venta_id", "venta_pago_id", "comision_liquidacion_id", "monto", "moneda", "fecha", "medio", "concepto", "detalle_1", "detalle_2", "detalle_3", "periodo", "cuenta", "observaciones"]
    sections.append(insert_statement("caja_movimientos", list(data.caja.values()), caja_cols))
    gestoria_cols = ["id", "tipo", "estado", "titulo", "descripcion", "vehiculo_id", "venta_id", "responsable_id", "cliente_nombre", "cliente_telefono", "cliente_email", "cliente_documento", "fecha_inicio", "fecha_vencimiento", "fecha_finalizacion", "etapa", "gestion_tipo", "fecha_envio", "fecha_firma", "costo_final_transferencia", "costo_final_moneda", "presupuesto_confirmado", "cat_estado", "documentacion_fisica_estado", "escribania_estado", "transferencia_registral_estado", "transferencia_municipal_estado", "seguimiento_comentarios", "observaciones"]
    sections.append(insert_statement("gestoria_tramites", list(data.gestoria.values()), gestoria_cols))
    comision_cols = ["id", "venta_id", "vendedor_id", "base_comision", "porcentaje", "monto_comision", "moneda", "estado", "fecha_generada", "fecha_pago", "observaciones"]
    sections.append(insert_statement("comisiones", list(data.comisiones.values()), comision_cols))
    liquidacion_cols = ["id", "vendedor_id", "periodo", "estado", "moneda", "neto_a_cobrar", "fecha_pago", "fecha_cierre", "observaciones"]
    sections.append(insert_statement("comision_liquidaciones", list(data.liquidaciones.values()), liquidacion_cols))
    recordatorio_cols = ["id", "tipo", "estado", "prioridad", "titulo", "descripcion", "fecha_vencimiento", "fecha_completado", "fecha_pospuesto", "asignado_a", "lead_id", "conversacion_id", "venta_id", "entrega_id", "tramite_id", "vehiculo_id", "comision_liquidacion_id", "origen_automatico"]
    sections.append(insert_statement("recordatorios", list(data.recordatorios.values()), recordatorio_cols))
    sections.append("COMMIT;")
    (OUT_DIR / "01_import_funes_data.sql").write_text("\n\n".join(sections) + "\n", encoding="utf-8")

    validations = [
        "-- Validaciones post-migracion Funes Exclusivos",
        "SELECT 'proveedores' tabla, count(*) cantidad FROM public.proveedores",
        "UNION ALL SELECT 'vehiculos', count(*) FROM public.vehiculos",
        "UNION ALL SELECT 'compras_vehiculos', count(*) FROM public.compras_vehiculos",
        "UNION ALL SELECT 'vehiculo_gastos', count(*) FROM public.vehiculo_gastos",
        "UNION ALL SELECT 'ventas', count(*) FROM public.ventas",
        "UNION ALL SELECT 'ventas_pagos', count(*) FROM public.ventas_pagos",
        "UNION ALL SELECT 'ventas_entregas', count(*) FROM public.ventas_entregas",
        "UNION ALL SELECT 'caja_movimientos', count(*) FROM public.caja_movimientos",
        "UNION ALL SELECT 'gestoria_tramites', count(*) FROM public.gestoria_tramites",
        "UNION ALL SELECT 'comisiones', count(*) FROM public.comisiones",
        "UNION ALL SELECT 'comision_liquidaciones', count(*) FROM public.comision_liquidaciones",
        "UNION ALL SELECT 'recordatorios', count(*) FROM public.recordatorios;",
        "",
        "SELECT estado, count(*) FROM public.vehiculos GROUP BY estado ORDER BY count(*) DESC;",
        "SELECT moneda, tipo, count(*), sum(monto) FROM public.caja_movimientos GROUP BY moneda, tipo ORDER BY moneda, tipo;",
        "SELECT date_trunc('month', fecha_venta)::date mes, count(*), sum(precio_venta) FROM public.ventas GROUP BY 1 ORDER BY 1;",
        "SELECT etapa, estado, count(*) FROM public.gestoria_tramites GROUP BY etapa, estado ORDER BY etapa, estado;",
    ]
    (OUT_DIR / "02_validation_queries.sql").write_text("\n".join(validations) + "\n", encoding="utf-8")


def write_report(data: MigrationData) -> None:
    counts = {
        "proveedores": len(data.proveedores),
        "vehiculos": len(data.vehiculos),
        "compras_vehiculos": len(data.compras),
        "vehiculo_gastos": len(data.gastos),
        "ventas": len(data.ventas),
        "ventas_pagos": len(data.pagos),
        "ventas_entregas": len(data.entregas),
        "caja_movimientos": len(data.caja),
        "gestoria_tramites": len(data.gestoria),
        "comisiones": len(data.comisiones),
        "comision_liquidaciones": len(data.liquidaciones),
        "recordatorios": len(data.recordatorios),
    }
    files = sorted(p.name for p in SOURCE_DIR.glob("*") if p.is_file())
    report = [
        "# Migración Funes Exclusivos",
        "",
        "## Archivos procesados",
        *[f"- `{name}`" for name in files if not name.startswith(".")],
        "",
        "## Conteos generados",
        *[f"- `{key}`: {value}" for key, value in counts.items()],
        "",
        "## Decisiones de migración",
        "- El reset borra datos operativos, pero no borra `empleados`, `configuracion_general` ni `catalogo_config` para no bloquear acceso ni configuración base.",
        "- Los perfiles de empleados no se recrean desde CSV porque `empleados.id` está vinculado a Supabase Auth.",
        "- Cuando una planilla trae vendedor histórico sin usuario Auth actual, se preserva el nombre original en `observaciones`.",
        "- Los valores no mapeados campo a campo se preservan como JSON en `observaciones` o `seguimiento_comentarios`.",
        "- `LP.csv` se toma como fuente de stock/lista actual y pisa campos comerciales sobre la base histórica por dominio.",
        "- Los archivos `Renta MM-YYYY.csv` se toman como fuente de ventas/rentabilidad histórica.",
        "- `Caja 2025-2026.csv` se importa como movimientos manuales de caja con tipo calculado por signo del importe.",
        "- `Peritaje.pdf` es escaneado sin texto extraíble; queda pendiente de carga documental/OCR manual.",
        "",
        "## Orden recomendado",
        "1. Revisar este reporte y los SQL generados.",
        "2. Ejecutar `00_reset_operational_data.sql` en Supabase SQL Editor.",
        "3. Ejecutar `01_import_funes_data.sql`.",
        "4. Ejecutar `02_validation_queries.sql` y comparar conteos.",
        "",
        "## Pendientes manuales",
        "- Revisar filas históricas sin dominio para confirmar si deben unificarse con vehículos existentes.",
        "- Vincular vendedores históricos con usuarios Auth cuando corresponda.",
        "- Cargar documentos reales del ZIP/PDF a Storage si se decide preservar archivos adjuntos.",
        "- Revisar moneda USD en movimientos donde la planilla usa `$` pero el medio indica dólares.",
    ]
    (OUT_DIR / "migration_report.md").write_text("\n".join(report) + "\n", encoding="utf-8")


def main() -> None:
    data = build_data()
    write_sql_files(data)
    write_report(data)
    print(json.dumps(
        {
            "out_dir": str(OUT_DIR),
            "counts": {
                "proveedores": len(data.proveedores),
                "vehiculos": len(data.vehiculos),
                "compras_vehiculos": len(data.compras),
                "vehiculo_gastos": len(data.gastos),
                "ventas": len(data.ventas),
                "ventas_pagos": len(data.pagos),
                "ventas_entregas": len(data.entregas),
                "caja_movimientos": len(data.caja),
                "gestoria_tramites": len(data.gestoria),
                "comisiones": len(data.comisiones),
                "comision_liquidaciones": len(data.liquidaciones),
                "recordatorios": len(data.recordatorios),
            },
        },
        ensure_ascii=False,
        indent=2,
    ))


if __name__ == "__main__":
    main()
