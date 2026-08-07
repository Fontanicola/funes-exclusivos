#!/usr/bin/env python3
from __future__ import annotations

import re
from pathlib import Path


SRC = Path("generated/funes-migration/01_import_funes_data.sql")
OUT = Path("generated/funes-migration/chunks")
MAX_SIZE = 650_000


def split_tuples(values: str) -> list[str]:
    tuples: list[str] = []
    buffer: list[str] = []
    depth = 0
    in_string = False
    index = 0

    while index < len(values):
        char = values[index]
        buffer.append(char)

        if char == "'":
            if index + 1 < len(values) and values[index + 1] == "'":
                buffer.append(values[index + 1])
                index += 1
            else:
                in_string = not in_string
        elif not in_string:
            if char == "(":
                depth += 1
            elif char == ")":
                depth -= 1
                if depth == 0:
                    tuples.append("".join(buffer).strip().rstrip(","))
                    buffer = []
                    next_index = index + 1
                    while next_index < len(values) and values[next_index] in ",\n ":
                        next_index += 1
                    index = next_index - 1

        index += 1

    return tuples


def write_chunk(index: int, statements: list[str]) -> Path:
    path = OUT / f"{index:03d}_import_chunk.sql"
    path.write_text("\n\n".join(statements) + "\n", encoding="utf-8")
    return path


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for old_chunk in OUT.glob("*.sql"):
        old_chunk.unlink()

    text = SRC.read_text(encoding="utf-8").replace("BEGIN;", "").replace("COMMIT;", "")
    inserts = [
        part.strip() if part.strip().endswith(";") else part.strip() + ";"
        for part in re.split(r"(?=INSERT INTO public\.)", text)
        if part.strip().startswith("INSERT INTO public.")
    ]

    files: list[Path] = []
    current: list[str] = []
    current_size = 0
    chunk_index = 1

    for statement in inserts:
        statement_size = len(statement.encode("utf-8"))

        if statement_size > MAX_SIZE:
            if current:
                files.append(write_chunk(chunk_index, current))
                chunk_index += 1
                current = []
                current_size = 0

            match = re.match(r"^(INSERT INTO public\.[^(]+\([^)]*\) VALUES\n)(.*);$", statement, flags=re.S)
            if not match:
                files.append(write_chunk(chunk_index, [statement]))
                chunk_index += 1
                continue

            prefix, values = match.group(1), match.group(2)
            batch: list[str] = []
            batch_size = len(prefix.encode("utf-8"))

            for sql_tuple in split_tuples(values):
                next_size = len(sql_tuple.encode("utf-8")) + 3
                if batch and batch_size + next_size > MAX_SIZE:
                    files.append(write_chunk(chunk_index, [prefix + ",\n".join(batch) + ";"]))
                    chunk_index += 1
                    batch = []
                    batch_size = len(prefix.encode("utf-8"))
                batch.append(sql_tuple)
                batch_size += next_size

            if batch:
                files.append(write_chunk(chunk_index, [prefix + ",\n".join(batch) + ";"]))
                chunk_index += 1
            continue

        if current and current_size + statement_size > MAX_SIZE:
            files.append(write_chunk(chunk_index, current))
            chunk_index += 1
            current = []
            current_size = 0

        current.append(statement)
        current_size += statement_size

    if current:
        files.append(write_chunk(chunk_index, current))

    readme = [
        "# Chunks de import Funes",
        "",
        "Ejecutar en orden numerico despues de `00_reset_operational_data.sql`.",
        "Regenerado corrigiendo defaults obligatorios de `vehiculos`: `fotos`, catálogo, preparación y `fecha_ingreso`.",
        "",
        *[f"- `{path.name}` ({path.stat().st_size / 1024:.1f} KB)" for path in files],
    ]
    (OUT / "README.md").write_text("\n".join(readme) + "\n", encoding="utf-8")

    print(f"chunks={len(files)}")
    print(f"max_kb={max(path.stat().st_size for path in files) / 1024:.1f}")


if __name__ == "__main__":
    main()
