import { DEFAULT_PERITAJE_PANELS, type PeritajeRecord, type PeritajeTemplateSection, type PeritajeVehicle } from "./types";

export const DEMO_PERITAJE_SECTIONS: PeritajeTemplateSection[] = [
  {
    id: "demo-section-general",
    plantilla_id: "demo-template",
    nombre: "Datos generales",
    descripcion: "Identificación y antecedentes básicos de la unidad.",
    orden: 1,
    items: [
      { id: "demo-general-marca", seccion_id: "demo-section-general", codigo: "marca", nombre: "Marca", tipo: "texto", orden: 1 },
      { id: "demo-general-modelo", seccion_id: "demo-section-general", codigo: "modelo", nombre: "Modelo y versión", tipo: "texto", orden: 2 },
      { id: "demo-general-chasis", seccion_id: "demo-section-general", codigo: "chasis", nombre: "Número de chasis", tipo: "texto", orden: 3 },
      { id: "demo-general-documentacion", seccion_id: "demo-section-general", codigo: "documentacion", nombre: "Documentación completa", tipo: "boolean", orden: 4 },
    ],
  },
  {
    id: "demo-section-equipment",
    plantilla_id: "demo-template",
    nombre: "Equipamiento",
    descripcion: "Marcá los elementos que acompañan la unidad.",
    orden: 2,
    items: [
      { id: "demo-equipment-abs", seccion_id: "demo-section-equipment", codigo: "abs", nombre: "ABS", tipo: "check", orden: 1 },
      { id: "demo-equipment-airbag", seccion_id: "demo-section-equipment", codigo: "airbag", nombre: "Airbag", tipo: "check", orden: 2 },
      { id: "demo-equipment-climatizador", seccion_id: "demo-section-equipment", codigo: "climatizador", nombre: "Aire acondicionado", tipo: "check", orden: 3 },
      { id: "demo-equipment-llave", seccion_id: "demo-section-equipment", codigo: "llave_repuesto", nombre: "Llave de repuesto", tipo: "check", orden: 4 },
    ],
  },
  {
    id: "demo-section-condition",
    plantilla_id: "demo-template",
    nombre: "Estado y desgaste",
    descripcion: "Evaluá cada elemento y agregá una nota cuando sea necesario.",
    orden: 3,
    items: [
      { id: "demo-condition-neumaticos", seccion_id: "demo-section-condition", codigo: "neumaticos", nombre: "Neumáticos", tipo: "estado", orden: 1 },
      { id: "demo-condition-frenos", seccion_id: "demo-section-condition", codigo: "frenos", nombre: "Pastillas de freno", tipo: "estado", orden: 2 },
      { id: "demo-condition-suspension", seccion_id: "demo-section-condition", codigo: "suspension", nombre: "Suspensión", tipo: "estado", orden: 3 },
      { id: "demo-condition-motor", seccion_id: "demo-section-condition", codigo: "motor_general", nombre: "Motor general", tipo: "estado", orden: 4 },
      { id: "demo-condition-fugas", seccion_id: "demo-section-condition", codigo: "fugas", nombre: "Fugas visibles", tipo: "estado", orden: 5 },
    ],
  },
];

export function buildDemoPeritaje(vehicle: PeritajeVehicle): PeritajeRecord {
  const items = DEMO_PERITAJE_SECTIONS.flatMap((section) => section.items).map((item) => ({
    id: item.id,
    codigo: item.codigo,
    nombre: item.nombre,
    seccion: DEMO_PERITAJE_SECTIONS.find((section) => section.id === item.seccion_id)?.nombre ?? null,
    tipo: item.tipo,
    estado: "pendiente" as const,
    valor: { value: item.tipo === "boolean" || item.tipo === "check" ? false : "" },
    nota: null,
    orden: item.orden,
  }));

  return {
    id: `demo-peritaje-${vehicle.id}`,
    vehiculo_id: vehicle.id,
    plantilla_id: "demo-template",
    estado: "en_proceso",
    fecha_peritaje: new Date().toISOString().slice(0, 10),
    cliente_nombre: null,
    cliente_telefono: null,
    datos_generales: {},
    equipamiento: {},
    observaciones: "",
    gasto_total: 0,
    moneda: "ARS",
    valor_mercado: null,
    valor_sitio_1: null,
    valor_sitio_2: null,
    valor_tasado: null,
    items,
    paneles: DEFAULT_PERITAJE_PANELS.map((panel) => ({ ...panel, estado: "pendiente" as const, nota: null })),
    reparaciones: [],
  };
}
