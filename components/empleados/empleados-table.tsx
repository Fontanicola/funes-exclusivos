"use client";

import { Fragment } from "react";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { EmpleadoRoleBadge } from "./empleado-role-badge";
import { EmpleadoStatusBadge } from "./empleado-status-badge";
import { EmpleadoEditForm } from "./empleado-edit-form";
import { EmpleadoDeleteButton } from "./empleado-delete-button";
import { PaginationControls } from "@/components/common/pagination-controls";

type Employee = {
  id: string;
  email: string;
  nombre: string | null;
  telefono: string | null;
  avatar_url: string | null;
  rol: string | null;
  activo: boolean | null;
  cargo: string | null;
  fecha_ingreso: string | null;
  comision_default_porcentaje: number | null;
  notas: string | null;
};

const roleOptions = ["", "admin", "vendedor", "gestor"] as const;
const statusOptions = ["all", "active", "inactive"] as const;
const PAGE_SIZE = 10;

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getSearchableText(employee: Employee) {
  return [
    employee.nombre,
    employee.email,
    employee.telefono,
    employee.cargo,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getInitials(employee: Employee) {
  const source = employee.nombre ?? employee.email;
  const parts = source.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return `${first}${last}`.toUpperCase();
}

function Avatar({ employee }: { employee: Employee }) {
  if (employee.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={employee.avatar_url}
        alt={employee.nombre ?? employee.email}
        className="h-10 w-10 rounded-full border border-[#E5E7EB] object-cover"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-[#F9FAFB] text-sm font-semibold text-[#111827]">
      {getInitials(employee)}
    </div>
  );
}

export function EmpleadosTable({
  empleados,
  currentUserId,
}: {
  empleados: Employee[];
  currentUserId: string | null;
}) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<(typeof roleOptions)[number]>("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return empleados.filter((employee) => {
      if (roleFilter && employee.rol !== roleFilter) return false;
      if (statusFilter === "active" && employee.activo !== true) return false;
      if (statusFilter === "inactive" && employee.activo === true) return false;
      if (!normalizedQuery) return true;
      return getSearchableText(employee).includes(normalizedQuery);
    });
  }, [empleados, query, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleEmployees = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <section className="rounded-md border border-[#E5E7EB] bg-white">
      <div className="border-b border-[#E5E7EB] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-[260px] flex-1 sm:w-[320px] sm:flex-none">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar empleado"
                className="h-10 w-full rounded-md border border-[#E5E7EB] bg-white pl-9 pr-9 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6]"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-[#6B7280] transition hover:bg-[#F3F4F6]"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>

            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as (typeof roleOptions)[number])}
              className="h-10 min-w-[180px] flex-1 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6] sm:flex-none"
            >
              <option value="">Todos los roles</option>
              <option value="admin">Admin</option>
              <option value="vendedor">Vendedor</option>
              <option value="gestor">Gestor</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as (typeof statusOptions)[number])}
              className="h-10 min-w-[180px] flex-1 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#8A1538] focus:ring-2 focus:ring-[#E9B8C6] sm:flex-none"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
          <p className="text-xs text-[#6B7280]">
            Mostrando {filtered.length} de {empleados.length}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] border-separate border-spacing-0">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.12em] text-[#6B7280]">
              <th className="border-b border-[#E5E7EB] px-4 py-3 font-medium">Empleado</th>
              <th className="border-b border-[#E5E7EB] px-4 py-3 font-medium">Rol</th>
              <th className="border-b border-[#E5E7EB] px-4 py-3 font-medium">Estado</th>
              <th className="border-b border-[#E5E7EB] px-4 py-3 font-medium">Cargo</th>
              <th className="border-b border-[#E5E7EB] px-4 py-3 font-medium">Teléfono</th>
              <th className="border-b border-[#E5E7EB] px-4 py-3 font-medium">Comisión default</th>
              <th className="border-b border-[#E5E7EB] px-4 py-3 font-medium">Fecha ingreso</th>
              <th className="border-b border-[#E5E7EB] px-4 py-3 font-medium">Acción</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length ? (
              visibleEmployees.map((employee) => {
                const isEditing = editingId === employee.id;

                return (
                  <Fragment key={employee.id}>
                    <tr className="align-top transition hover:bg-[#F9FAFB]">
                      <td className="border-b border-[#E5E7EB] px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar employee={employee} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[#111827]">
                              {employee.nombre ?? "Sin nombre"}
                            </p>
                            <p className="truncate text-sm text-[#6B7280]">{employee.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="border-b border-[#E5E7EB] px-4 py-4">
                        <EmpleadoRoleBadge role={employee.rol} />
                      </td>
                      <td className="border-b border-[#E5E7EB] px-4 py-4">
                        <EmpleadoStatusBadge active={employee.activo} />
                      </td>
                      <td className="border-b border-[#E5E7EB] px-4 py-4 text-sm text-[#111827]">
                        {employee.cargo ?? "—"}
                      </td>
                      <td className="border-b border-[#E5E7EB] px-4 py-4 text-sm text-[#111827]">
                        {employee.telefono ?? "—"}
                      </td>
                      <td className="border-b border-[#E5E7EB] px-4 py-4 text-sm text-[#111827]">
                        {employee.comision_default_porcentaje != null
                          ? `${employee.comision_default_porcentaje}%`
                          : "—"}
                      </td>
                      <td className="border-b border-[#E5E7EB] px-4 py-4 text-sm text-[#111827]">
                        {formatDate(employee.fecha_ingreso)}
                      </td>
                      <td className="border-b border-[#E5E7EB] px-4 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId((current) => (current === employee.id ? null : employee.id))}
                            className="inline-flex h-9 items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
                          >
                            {isEditing ? "Cerrar" : "Editar"}
                          </button>
                          {currentUserId !== employee.id ? (
                            <EmpleadoDeleteButton
                              employeeId={employee.id}
                              employeeName={employee.nombre ?? employee.email}
                            />
                          ) : null}
                        </div>
                      </td>
                    </tr>
                    {isEditing ? (
                      <tr className="bg-[#FAFAFA]">
                        <td className="border-b border-[#E5E7EB] px-4 py-4" colSpan={8}>
                          <EmpleadoEditForm
                            employee={employee}
                            currentUserId={currentUserId}
                            onCancel={() => setEditingId(null)}
                          />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-sm text-[#6B7280]">
                  No hay empleados que coincidan con los filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PaginationControls
        page={currentPage}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </section>
  );
}
