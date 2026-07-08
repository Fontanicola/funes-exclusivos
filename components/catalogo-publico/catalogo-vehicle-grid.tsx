"use client";

import { useMemo, useState } from "react";
import { CatalogoEmptyState } from "./catalogo-empty-state";
import { CatalogoFilters, type CatalogoSortValue } from "./catalogo-filters";
import { CatalogoVehicleCard } from "./catalogo-vehicle-card";

type Vehiculo = {
  id: string;
  marca: string | null;
  modelo: string | null;
  version: string | null;
  anio: number | null;
  color: string | null;
  km: number | null;
  dominio: string | null;
  precio_venta: number | null;
  precio_contado: number | null;
  precio_permuta: number | null;
  precio_moneda: string | null;
  precio_infoauto_actual: number | null;
  estado: string | null;
  fotos: string[] | string | null;
  descripcion: string | null;
  catalogo_titulo: string | null;
  catalogo_descripcion: string | null;
  catalogo_destacado: boolean | null;
  catalogo_orden: number | null;
  created_at: string | null;
};

type CatalogoConfig = {
  whatsapp_contacto: string | null;
  mostrar_precios: boolean | null;
  mostrar_km: boolean | null;
  mostrar_dominio: boolean | null;
};

function getSearchableText(vehicle: Vehiculo) {
  return [vehicle.marca, vehicle.modelo, vehicle.version, vehicle.color, vehicle.anio]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function compareBySort(a: Vehiculo, b: Vehiculo, sortBy: CatalogoSortValue) {
  if (sortBy === "featured") {
    if (Boolean(a.catalogo_destacado) !== Boolean(b.catalogo_destacado)) {
      return Boolean(a.catalogo_destacado) ? -1 : 1;
    }
    const orderA = a.catalogo_orden ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.catalogo_orden ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
  }

  if (sortBy === "lower_price") {
    return (a.precio_contado ?? a.precio_venta ?? Number.MAX_SAFE_INTEGER) - (b.precio_contado ?? b.precio_venta ?? Number.MAX_SAFE_INTEGER);
  }

  if (sortBy === "higher_price") {
    return (b.precio_contado ?? b.precio_venta ?? 0) - (a.precio_contado ?? a.precio_venta ?? 0);
  }

  if (sortBy === "newest_year") {
    return (b.anio ?? 0) - (a.anio ?? 0);
  }

  if (sortBy === "lower_km") {
    return (a.km ?? Number.MAX_SAFE_INTEGER) - (b.km ?? Number.MAX_SAFE_INTEGER);
  }

  return 0;
}

export function CatalogoVehicleGrid({
  vehiculos,
  config,
}: {
  vehiculos: Vehiculo[];
  config: CatalogoConfig;
}) {
  const [query, setQuery] = useState("");
  const [marca, setMarca] = useState("");
  const [anio, setAnio] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [sortBy, setSortBy] = useState<CatalogoSortValue>("featured");

  const marcas = useMemo(
    () =>
      Array.from(new Set(vehiculos.map((vehicle) => vehicle.marca?.trim()).filter(Boolean) as string[])).sort(),
    [vehiculos]
  );

  const anios = useMemo(
    () =>
      Array.from(
        new Set(vehiculos.map((vehicle) => vehicle.anio).filter((value): value is number => typeof value === "number"))
      ).sort((a, b) => b - a),
    [vehiculos]
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;

    return [...vehiculos]
      .filter((vehicle) => {
        if (onlyFeatured && !vehicle.catalogo_destacado) return false;
        if (marca && (vehicle.marca ?? "") !== marca) return false;
        if (anio && String(vehicle.anio ?? "") !== anio) return false;
        const price = vehicle.precio_contado ?? vehicle.precio_venta ?? 0;
        if (min != null && Number.isFinite(min) && price < min) return false;
        if (max != null && Number.isFinite(max) && price > max) return false;
        if (!normalizedQuery) return true;
        return getSearchableText(vehicle).includes(normalizedQuery);
      })
      .sort((a, b) => compareBySort(a, b, sortBy));
  }, [anio, marca, maxPrice, minPrice, onlyFeatured, query, sortBy, vehiculos]);

  return (
    <section className="space-y-5">
      <CatalogoFilters
        query={query}
        setQuery={setQuery}
        marca={marca}
        setMarca={setMarca}
        anio={anio}
        setAnio={setAnio}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        onlyFeatured={onlyFeatured}
        setOnlyFeatured={setOnlyFeatured}
        sortBy={sortBy}
        setSortBy={setSortBy}
        mostrarPrecios={Boolean(config.mostrar_precios)}
        mostrarKm={Boolean(config.mostrar_km)}
        marcas={marcas}
        anios={anios}
      />

      {filtered.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((vehicle) => (
            <CatalogoVehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              mostrarPrecios={Boolean(config.mostrar_precios)}
              mostrarKm={Boolean(config.mostrar_km)}
              mostrarDominio={Boolean(config.mostrar_dominio)}
              whatsappContacto={config.whatsapp_contacto}
            />
          ))}
        </div>
      ) : (
        <CatalogoEmptyState
          title="No hay vehículos publicados en este momento."
          description="Volvé más tarde o consultanos por WhatsApp para conocer nuevas unidades disponibles."
          whatsappContacto={config.whatsapp_contacto}
        />
      )}
    </section>
  );
}
