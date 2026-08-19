"use client";

import type { Dispatch, SetStateAction } from "react";
import { AdvancedFilters } from "@/components/common/advanced-filters";

function inputClassName() {
  return "h-11 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6]";
}

function selectClassName() {
  return "h-11 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6]";
}

export type CatalogoSortValue = "featured" | "lower_price" | "higher_price" | "newest_year" | "lower_km";

export function CatalogoFilters({
  query,
  setQuery,
  marca,
  setMarca,
  anio,
  setAnio,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  onlyFeatured,
  setOnlyFeatured,
  sortBy,
  setSortBy,
  mostrarPrecios,
  mostrarKm,
  marcas,
  anios,
}: {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  marca: string;
  setMarca: Dispatch<SetStateAction<string>>;
  anio: string;
  setAnio: Dispatch<SetStateAction<string>>;
  minPrice: string;
  setMinPrice: Dispatch<SetStateAction<string>>;
  maxPrice: string;
  setMaxPrice: Dispatch<SetStateAction<string>>;
  onlyFeatured: boolean;
  setOnlyFeatured: Dispatch<SetStateAction<boolean>>;
  sortBy: CatalogoSortValue;
  setSortBy: Dispatch<SetStateAction<CatalogoSortValue>>;
  mostrarPrecios: boolean;
  mostrarKm: boolean;
  marcas: string[];
  anios: number[];
  }) {
  return (
    <div className="flex flex-wrap gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por marca, modelo, versión, año o color"
          className={`${inputClassName()} min-w-[220px] flex-1`}
        />

        <AdvancedFilters label="Filtros">
        <select value={marca} onChange={(event) => setMarca(event.target.value)} className={`${selectClassName()} min-w-[180px]`}> 
          <option value="">Todas las marcas</option>
          {marcas.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select value={anio} onChange={(event) => setAnio(event.target.value)} className={`${selectClassName()} min-w-[150px]`}>
          <option value="">Todos los años</option>
          {anios.map((item) => (
            <option key={item} value={String(item)}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as CatalogoSortValue)}
          className={`${selectClassName()} min-w-[180px]`}
        >
          <option value="featured">Destacados primero</option>
          <option value="lower_price">Menor precio</option>
          <option value="higher_price">Mayor precio</option>
          <option value="newest_year">Más nuevos</option>
          {mostrarKm ? <option value="lower_km">Menor KM</option> : null}
        </select>

        <div className="flex flex-wrap gap-3">
          {mostrarPrecios ? (
            <>
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
                placeholder="Precio mínimo"
                className={`${inputClassName()} min-w-[160px]`}
              />
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                placeholder="Precio máximo"
                className={`${inputClassName()} min-w-[160px]`}
              />
            </>
          ) : null}
          <button
            type="button"
            onClick={() => setOnlyFeatured((current) => !current)}
            className={[
              "inline-flex h-11 items-center justify-center rounded-md border px-4 text-sm font-medium transition",
              onlyFeatured
                ? "border-[#E5E7EB] bg-[#8A1538] text-white hover:bg-[#6F102D]"
                : "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB]",
            ].join(" ")}
          >
            Solo destacados
          </button>
          </div>
        </AdvancedFilters>
      </div>
  );
}
