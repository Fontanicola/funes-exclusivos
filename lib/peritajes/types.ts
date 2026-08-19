export type PeritajeStatus = "borrador" | "en_proceso" | "completado" | "anulado";
export type PeritajeItemStatus = "pendiente" | "revisar" | "reparar" | "listo" | "no_aplica";
export type PeritajeRepairStatus = "pendiente" | "realizado" | "no_aplica";
export type PeritajeFieldType = "estado" | "check" | "boolean" | "texto" | "numero" | "fecha";

export type PeritajeVehicle = {
  id: string;
  marca: string | null;
  modelo: string | null;
  version?: string | null;
  anio: number | null;
  color?: string | null;
  dominio: string | null;
  km?: number | null;
  fotos?: string[] | string | null;
};

export type PeritajeTemplateItem = {
  id: string;
  seccion_id: string;
  codigo: string;
  nombre: string;
  tipo: PeritajeFieldType;
  opciones?: unknown;
  orden: number;
  requerido?: boolean;
};

export type PeritajeTemplateSection = {
  id: string;
  plantilla_id: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  items: PeritajeTemplateItem[];
};

export type PeritajeTemplate = {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo?: boolean;
  secciones: PeritajeTemplateSection[];
};

export type PeritajeItem = {
  id?: string;
  codigo: string;
  nombre: string;
  seccion: string | null;
  tipo: PeritajeFieldType;
  estado: PeritajeItemStatus;
  valor: Record<string, unknown> | null;
  nota: string | null;
  orden: number;
};

export type PeritajePanel = {
  id?: string;
  codigo: string;
  nombre: string;
  estado: PeritajeItemStatus;
  nota: string | null;
  orden: number;
};

export type PeritajeRepair = {
  id?: string;
  orden: number;
  descripcion: string;
  monto: number;
  moneda: "ARS" | "USD";
  estado: PeritajeRepairStatus;
};

export type PeritajeRecord = {
  id: string;
  vehiculo_id: string;
  plantilla_id: string | null;
  estado: PeritajeStatus;
  fecha_peritaje: string;
  cliente_nombre: string | null;
  cliente_telefono: string | null;
  datos_generales: Record<string, unknown>;
  equipamiento: Record<string, unknown>;
  observaciones: string | null;
  gasto_total: number;
  moneda: "ARS" | "USD";
  valor_mercado: number | null;
  valor_sitio_1: number | null;
  valor_sitio_2: number | null;
  valor_tasado: number | null;
  created_at?: string;
  updated_at?: string;
  items: PeritajeItem[];
  paneles: PeritajePanel[];
  reparaciones: PeritajeRepair[];
};

export const DEFAULT_PERITAJE_PANELS: Array<Pick<PeritajePanel, "codigo" | "nombre" | "orden">> = [
  { codigo: "frente", nombre: "Frente", orden: 1 },
  { codigo: "capot", nombre: "Capot", orden: 2 },
  { codigo: "techo", nombre: "Techo", orden: 3 },
  { codigo: "parabrisas", nombre: "Parabrisas", orden: 4 },
  { codigo: "puerta_del_izq", nombre: "Puerta del. izq.", orden: 5 },
  { codigo: "puerta_del_der", nombre: "Puerta del. der.", orden: 6 },
  { codigo: "puerta_tras_izq", nombre: "Puerta tras. izq.", orden: 7 },
  { codigo: "puerta_tras_der", nombre: "Puerta tras. der.", orden: 8 },
  { codigo: "guardabarros_izq", nombre: "Guardabarros izq.", orden: 9 },
  { codigo: "guardabarros_der", nombre: "Guardabarros der.", orden: 10 },
  { codigo: "baul", nombre: "Baúl", orden: 11 },
  { codigo: "luneta", nombre: "Luneta", orden: 12 },
  { codigo: "paragolpes_tras", nombre: "Paragolpes tras.", orden: 13 },
  { codigo: "lateral_izq", nombre: "Lateral izq.", orden: 14 },
  { codigo: "lateral_der", nombre: "Lateral der.", orden: 15 },
];

export const PERITAJE_STATUS_LABELS: Record<PeritajeItemStatus, string> = {
  pendiente: "Pendiente",
  revisar: "Revisar",
  reparar: "Reparar",
  listo: "Listo",
  no_aplica: "No aplica",
};
