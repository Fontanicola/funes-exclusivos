type AnyRecord = Record<string, any>;

export type CurrencyCode = "ARS" | "USD" | string;

export type CurrencyTotals = {
  ARS: number;
  USD: number;
  other: Record<string, number>;
};

export type DashboardAlert = {
  title: string;
  description: string;
  href: string;
  severity?: "critical" | "warning" | "info";
};

export type DashboardMetricsInput = {
  vehiculos?: AnyRecord[];
  ventas?: AnyRecord[];
  ventasEntregas?: AnyRecord[];
  cajaMovimientos?: AnyRecord[];
  comisiones?: AnyRecord[];
  leads?: AnyRecord[];
  gestoriaTramites?: AnyRecord[];
  whatsappInstancias?: AnyRecord[];
  conversaciones?: AnyRecord[];
};

export type DashboardMetrics = {
  topKpis: Array<{
    title: string;
    value: string;
    description: string;
    href?: string;
  }>;
  pnl: {
    sales: CurrencyTotals;
    cashIncome: CurrencyTotals;
    cashExpense: CurrencyTotals;
    commissionsPaid: CurrencyTotals;
    commissionsPending: CurrencyTotals;
    operatingResult: CurrencyTotals;
    salesCount: number;
    salesMargin: CurrencyTotals;
    salesMarginAvailable: boolean;
    salesMarginDescription: string;
  };
  inventory: {
    totalStock: number;
    stockValued: CurrencyTotals;
    sold: number;
    consignment: number;
    published: number;
    highlighted: number;
    unpublishedStock: number;
    preparationPending: number;
    preparationInProgress: number;
    preparationReady: number;
  };
  commercial: {
    salesCount: number;
    activeLeads: number;
    negotiationLeads: number;
    wonLeads: number;
    highInterestConversations: number;
    attentionConversations: number;
    nextContactLeads: number;
  };
  operations: {
    pendingTramites: number;
    overdueTramites: number;
    commissionsPending: number;
    whatsappConnected: number;
    whatsappDisconnected: number;
    deliveryPending: number;
    deliveryDelivered: number;
    deliveryObserved: number;
    cajaByMedium: Array<{
      medium: string;
      count: number;
      totals: CurrencyTotals;
    }>;
  };
  alerts: DashboardAlert[];
};

function isRecord(value: unknown): value is AnyRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toStringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function resolveAmount(item: AnyRecord) {
  return toNumber(item?.importe) ?? toNumber(item?.monto) ?? 0;
}

function resolveMedium(item: AnyRecord) {
  const medium = toStringValue(item?.medio);
  if (medium) return medium;
  const cuenta = toStringValue(item?.cuenta);
  if (cuenta) return cuenta;
  const concept = toStringValue(item?.concepto);
  if (concept) return concept;
  return "otro";
}

function normalizeCurrency(value: unknown): CurrencyCode {
  const currency = toStringValue(value).toUpperCase();
  if (currency === "ARS" || currency === "USD") return currency;
  return currency || "ARS";
}

function getDateValue(value: unknown) {
  if (value instanceof Date) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

function isSameCalendarMonth(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(value);
}

function formatMoneySymbol(currency: CurrencyCode) {
  return currency === "USD" ? "US$" : currency === "ARS" ? "$" : `${currency} `;
}

export function isCurrentMonth(date: string | Date | null | undefined) {
  if (!date) return false;
  const parsed = getDateValue(date);
  if (!parsed) return false;
  return isSameCalendarMonth(parsed, new Date());
}

export function isOverdue(date: string | Date | null | undefined) {
  if (!date) return false;
  const parsed = getDateValue(date);
  if (!parsed) return false;
  return parsed.getTime() < startOfToday().getTime();
}

export function groupAmountByCurrency<T extends AnyRecord>(
  items: T[],
  amountKey: keyof T,
  currencyKey: keyof T
) {
  const totals: CurrencyTotals = { ARS: 0, USD: 0, other: {} };

  for (const item of items ?? []) {
    const amount = toNumber(item?.[amountKey]);
    if (amount == null) continue;

    const currency = normalizeCurrency(item?.[currencyKey]);
    if (currency === "ARS") {
      totals.ARS += amount;
    } else if (currency === "USD") {
      totals.USD += amount;
    } else {
      totals.other[currency] = (totals.other[currency] ?? 0) + amount;
    }
  }

  return totals;
}

function groupCashByMedium(items: AnyRecord[]) {
  const groups = new Map<string, { medium: string; count: number; totals: CurrencyTotals }>();

  for (const item of items ?? []) {
    const medium = resolveMedium(item);
    const amount = resolveAmount(item);
    if (!amount) continue;

    const currency = normalizeCurrency(item?.moneda);
    const current =
      groups.get(medium) ?? {
        medium,
        count: 0,
        totals: { ARS: 0, USD: 0, other: {} },
      };

    current.count += 1;
    if (currency === "ARS") current.totals.ARS += amount;
    else if (currency === "USD") current.totals.USD += amount;
    else current.totals.other[currency] = (current.totals.other[currency] ?? 0) + amount;
    groups.set(medium, current);
  }

  return Array.from(groups.values())
    .sort((left, right) => right.count - left.count || left.medium.localeCompare(right.medium))
    .slice(0, 6);
}

export function formatCurrencyByCurrency(values: CurrencyTotals | Record<string, number | null | undefined>) {
  const normalized: CurrencyTotals = {
    ARS: 0,
    USD: 0,
    other: {},
  };

  for (const [key, value] of Object.entries(values ?? {})) {
    if (key === "other" && isRecord(value)) {
      for (const [otherKey, otherValue] of Object.entries(value)) {
        const amount = toNumber(otherValue);
        if (amount == null) continue;
        normalized.other[otherKey] = (normalized.other[otherKey] ?? 0) + amount;
      }
      continue;
    }

    const amount = toNumber(value);
    if (amount == null) continue;
    if (key === "ARS") normalized.ARS += amount;
    else if (key === "USD") normalized.USD += amount;
    else normalized.other[key] = (normalized.other[key] ?? 0) + amount;
  }

  const parts: string[] = [];

  if (normalized.USD) parts.push(`${formatMoneySymbol("USD")} ${formatNumber(normalized.USD)}`);
  if (normalized.ARS) parts.push(`${formatMoneySymbol("ARS")} ${formatNumber(normalized.ARS)}`);

  for (const [currency, amount] of Object.entries(normalized.other)) {
    if (!amount) continue;
    parts.push(`${formatMoneySymbol(currency)}${formatNumber(amount)}`);
  }

  return parts.length ? parts.join(" · ") : "—";
}

function subtractCurrencyTotals(...totals: CurrencyTotals[]) {
  const result: CurrencyTotals = { ARS: 0, USD: 0, other: {} };

  for (const totalsItem of totals) {
    result.ARS += totalsItem.ARS;
    result.USD += totalsItem.USD;
    for (const [currency, amount] of Object.entries(totalsItem.other)) {
      result.other[currency] = (result.other[currency] ?? 0) + amount;
    }
  }

  return result;
}

function isInStock(vehicle: AnyRecord) {
  return toStringValue(vehicle?.estado) === "en_stock";
}

function isRegisteredSale(sale: AnyRecord) {
  return toStringValue(sale?.estado) === "registrada";
}

function isCurrentPendingCommission(commission: AnyRecord) {
  return toStringValue(commission?.estado) === "pendiente";
}

function isPaidCommission(commission: AnyRecord) {
  return toStringValue(commission?.estado) === "pagada";
}

function isActiveLead(lead: AnyRecord) {
  const state = toStringValue(lead?.estado);
  return state && !["ganado", "perdido"].includes(state);
}

function isWinningLead(lead: AnyRecord) {
  return toStringValue(lead?.estado) === "ganado";
}

function isNegotiationLead(lead: AnyRecord) {
  return toStringValue(lead?.estado) === "negociacion";
}

function isHighInterestConversation(conversation: AnyRecord) {
  return toStringValue(conversation?.interes_compra) === "alto";
}

function requiresAttention(conversation: AnyRecord) {
  return Boolean(conversation?.requiere_atencion);
}

function isWhatsappConnected(instance: AnyRecord) {
  return toStringValue(instance?.estado) === "conectado";
}

function isWhatsappDisconnected(instance: AnyRecord) {
  return ["desconectado", "error", "qr_pendiente"].includes(toStringValue(instance?.estado));
}

function getVehicleByIdMap(vehiculos: AnyRecord[]) {
  const map = new Map<string, AnyRecord>();
  for (const vehicle of vehiculos ?? []) {
    const id = toStringValue(vehicle?.id);
    if (id) map.set(id, vehicle);
  }
  return map;
}

export function calculateDashboardMetrics(input: DashboardMetricsInput): DashboardMetrics {
  const vehiculos = input.vehiculos ?? [];
  const ventas = input.ventas ?? [];
  const ventasEntregas = input.ventasEntregas ?? [];
  const cajaMovimientos = input.cajaMovimientos ?? [];
  const comisiones = input.comisiones ?? [];
  const leads = input.leads ?? [];
  const gestoriaTramites = input.gestoriaTramites ?? [];
  const whatsappInstancias = input.whatsappInstancias ?? [];
  const conversaciones = input.conversaciones ?? [];

  const currentMonthSales = ventas.filter((sale) => isCurrentMonth(sale?.fecha_venta ?? sale?.created_at));
  const currentMonthCashMovements = cajaMovimientos.filter((movement) =>
    isCurrentMonth(movement?.fecha ?? movement?.created_at)
  );
  const currentMonthCommissions = comisiones.filter((commission) => isCurrentMonth(commission?.fecha_generada ?? commission?.created_at));

  const stockVehicles = vehiculos.filter(isInStock);
  const preparationPending = vehiculos.filter((vehicle) => {
    const state = toStringValue(vehicle?.estado_preparacion).toLowerCase();
    return !state || ["pendiente", "sin empezar", "sin iniciar", "por hacer"].includes(state);
  }).length;
  const preparationInProgress = vehiculos.filter((vehicle) => {
    const state = toStringValue(vehicle?.estado_preparacion).toLowerCase();
    return ["en proceso", "en_proceso", "proceso", "preparando", "trabajo"].includes(state);
  }).length;
  const preparationReady = vehiculos.filter((vehicle) => {
    const state = toStringValue(vehicle?.estado_preparacion).toLowerCase();
    return ["listo", "ok", "terminado", "completo", "entregado"].includes(state);
  }).length;

  const stockValued = groupAmountByCurrency(stockVehicles, "precio_venta", "precio_moneda");
  const salesAmount = groupAmountByCurrency(currentMonthSales.filter(isRegisteredSale), "precio_venta", "moneda");
  const cashIncome = groupAmountByCurrency(
    currentMonthCashMovements.filter((movement) => toStringValue(movement?.tipo) === "ingreso"),
    "monto",
    "moneda"
  );
  const cashExpense = groupAmountByCurrency(
    currentMonthCashMovements.filter((movement) => toStringValue(movement?.tipo) === "egreso"),
    "monto",
    "moneda"
  );
  const commissionsPaid = groupAmountByCurrency(
    currentMonthCommissions.filter(isPaidCommission),
    "monto_comision",
    "moneda"
  );
  const commissionsPending = groupAmountByCurrency(
    currentMonthCommissions.filter(isCurrentPendingCommission),
    "monto_comision",
    "moneda"
  );
  const operatingResult = subtractCurrencyTotals(cashIncome, cashExpense, commissionsPaid);

  const vehicleById = getVehicleByIdMap(vehiculos);
  const salesMarginByCurrency: CurrencyTotals = { ARS: 0, USD: 0, other: {} };
  let salesMarginCount = 0;

  for (const sale of currentMonthSales.filter(isRegisteredSale)) {
    const saleVehicle =
      (isRecord(sale?.vehiculo) ? sale.vehiculo : null) ??
      vehicleById.get(toStringValue(sale?.vehiculo_id)) ??
      null;

    const salePrice = toNumber(sale?.precio_venta);
    const cost = toNumber(saleVehicle?.costo_adquisicion);
    if (salePrice == null || cost == null) continue;

    const currency = normalizeCurrency(sale?.moneda ?? saleVehicle?.precio_moneda ?? saleVehicle?.costo_moneda);
    const margin = salePrice - cost;
    salesMarginCount += 1;

    if (currency === "ARS") salesMarginByCurrency.ARS += margin;
    else if (currency === "USD") salesMarginByCurrency.USD += margin;
    else salesMarginByCurrency.other[currency] = (salesMarginByCurrency.other[currency] ?? 0) + margin;
  }

  const activeLeads = leads.filter(isActiveLead);
  const negotiationLeads = leads.filter(isNegotiationLead);
  const wonLeads = leads.filter(isWinningLead);
  const highInterestConversations = conversaciones.filter(isHighInterestConversation);
  const attentionConversations = conversaciones.filter(requiresAttention);
  const nextContactLeads = leads.filter((lead) => {
    const nextContact = getDateValue(lead?.proximo_contacto);
    if (!nextContact) return false;
    return nextContact.getTime() <= startOfToday().getTime();
  });

  const pendingTramites = gestoriaTramites.filter((tramite) =>
    ["pendiente", "en_proceso"].includes(toStringValue(tramite?.estado))
  );
  const overdueTramites = gestoriaTramites.filter(
    (tramite) =>
      isOverdue(tramite?.fecha_vencimiento) &&
      !["completado", "cancelado"].includes(toStringValue(tramite?.estado))
  );
  const whatsappConnected = whatsappInstancias.filter(isWhatsappConnected);
  const whatsappDisconnected = whatsappInstancias.filter(isWhatsappDisconnected);
  const cajaByMedium = groupCashByMedium(currentMonthCashMovements);

  const deliveryPending = ventasEntregas.filter((delivery) => {
    const state = toStringValue(delivery?.estado).toLowerCase();
    return !state || state === "pendiente";
  }).length;
  const deliveryDelivered = ventasEntregas.filter((delivery) => {
    const state = toStringValue(delivery?.estado).toLowerCase();
    return ["entregada", "entregado"].includes(state);
  }).length;
  const deliveryObserved = ventasEntregas.filter((delivery) => {
    const state = toStringValue(delivery?.estado).toLowerCase();
    return ["observada", "observado"].includes(state);
  }).length;

  const alerts: DashboardAlert[] = [];

  for (const instance of whatsappInstancias.filter(isWhatsappDisconnected).slice(0, 2)) {
    alerts.push({
      title: "WhatsApp requiere atención",
      description: `La instancia de ${toStringValue(instance?.empleado?.nombre) || toStringValue(instance?.empleado?.email) || "un vendedor"} está ${toStringValue(instance?.estado)}.`,
      href: "/whatsapp/conexiones",
      severity: toStringValue(instance?.estado) === "error" ? "critical" : "warning",
    });
  }

  if (overdueTramites.length) {
    alerts.push({
      title: "Trámites vencidos",
      description: `Hay ${overdueTramites.length} trámite${overdueTramites.length === 1 ? "" : "s"} que requieren seguimiento.`,
      href: "/gestoria",
      severity: "critical",
    });
  }

  if (attentionConversations.length) {
    alerts.push({
      title: "Conversaciones con atención pendiente",
      description: `Hay ${attentionConversations.length} conversación${attentionConversations.length === 1 ? "" : "es"} que no deberían esperar.`,
      href: "/whatsapp",
      severity: "warning",
    });
  }

  if (commissionsPending.ARS || commissionsPending.USD || Object.keys(commissionsPending.other).length) {
    alerts.push({
      title: "Comisiones pendientes",
      description: "Existen comisiones aprobadas o pendientes de pago para revisar.",
      href: "/comisiones",
      severity: "info",
    });
  }

  if (nextContactLeads.length) {
    alerts.push({
      title: "Seguimientos por hacer",
      description: `Hay ${nextContactLeads.length} lead${nextContactLeads.length === 1 ? "" : "s"} con próximo contacto para hoy o vencido.`,
      href: "/crm",
      severity: "warning",
    });
  }

  if (stockVehicles.some((vehicle) => !vehicle?.catalogo_publicado)) {
    alerts.push({
      title: "Stock sin publicar",
      description: "Hay unidades en stock que todavía no están publicadas en el catálogo.",
      href: "/catalogo",
      severity: "info",
    });
  }

  const topKpis = [
    {
      title: "Stock total",
      value: formatNumber(stockVehicles.length),
      description: "Unidades listas para mover entre venta y catálogo.",
      href: "/inventario",
    },
    {
      title: "Stock valorizado",
      value: formatCurrencyByCurrency(stockValued),
      description: "Suma estimada del stock en precio publicado.",
      href: "/inventario",
    },
    {
      title: "Ventas del mes",
      value: formatNumber(currentMonthSales.filter(isRegisteredSale).length),
      description: `Registradas: ${formatCurrencyByCurrency(salesAmount)}`,
      href: "/ventas",
    },
    {
      title: "Ingresos del mes",
      value: formatCurrencyByCurrency(cashIncome),
      description: "Cobros de caja confirmados en el período.",
      href: "/caja",
    },
    {
      title: "Egresos del mes",
      value: formatCurrencyByCurrency(cashExpense),
      description: "Salidas operativas y de soporte del negocio.",
      href: "/caja",
    },
    {
      title: "Saldo caja del mes",
      value: formatCurrencyByCurrency(subtractCurrencyTotals(cashIncome, cashExpense)),
      description: "Resultado de caja antes de comisiones.",
      href: "/caja",
    },
    {
      title: "Comisiones pendientes",
      value: formatNumber(
        comisiones.filter((commission) => toStringValue(commission?.estado) === "pendiente").length
      ),
      description: `Monto pendiente: ${formatCurrencyByCurrency(commissionsPending)}`,
      href: "/comisiones",
    },
    {
      title: "Leads activos",
      value: formatNumber(activeLeads.length),
      description: `${formatNumber(negotiationLeads.length)} en negociación · ${formatNumber(wonLeads.length)} ganados`,
      href: "/crm",
    },
    {
      title: "Trámites vencidos",
      value: formatNumber(overdueTramites.length),
      description: "Gestoría que requiere seguimiento inmediato.",
      href: "/gestoria",
    },
    {
      title: "WhatsApps desconectados",
      value: formatNumber(whatsappDisconnected.length),
      description: `${formatNumber(whatsappConnected.length)} conectados · requiere revisar alertas`,
      href: "/whatsapp/conexiones",
    },
  ];

  return {
    topKpis,
    pnl: {
      sales: salesAmount,
      cashIncome,
      cashExpense,
      commissionsPaid,
      commissionsPending,
      operatingResult,
      salesCount: currentMonthSales.filter(isRegisteredSale).length,
      salesMargin: salesMarginByCurrency,
      salesMarginAvailable: salesMarginCount > 0,
      salesMarginDescription:
        salesMarginCount > 0
          ? `${formatNumber(salesMarginCount)} ventas con costo relacionable`
          : "Sin datos suficientes para estimar margen",
    },
    inventory: {
      totalStock: stockVehicles.length,
      stockValued,
      sold: vehiculos.filter((vehicle) => toStringValue(vehicle?.estado) === "vendido").length,
      consignment: vehiculos.filter((vehicle) => toStringValue(vehicle?.estado) === "en_consignacion").length,
      published: vehiculos.filter((vehicle) => Boolean(vehicle?.catalogo_publicado)).length,
      highlighted: vehiculos.filter((vehicle) => Boolean(vehicle?.catalogo_destacado)).length,
      unpublishedStock: vehiculos.filter(
        (vehicle) => isInStock(vehicle) && !Boolean(vehicle?.catalogo_publicado)
      ).length,
      preparationPending,
      preparationInProgress,
      preparationReady,
    },
    commercial: {
      salesCount: currentMonthSales.filter(isRegisteredSale).length,
      activeLeads: activeLeads.length,
      negotiationLeads: negotiationLeads.length,
      wonLeads: wonLeads.length,
      highInterestConversations: highInterestConversations.length,
      attentionConversations: attentionConversations.length,
      nextContactLeads: nextContactLeads.length,
    },
    operations: {
      pendingTramites: pendingTramites.length,
      overdueTramites: overdueTramites.length,
      commissionsPending: comisiones.filter((commission) => toStringValue(commission?.estado) === "pendiente").length,
      whatsappConnected: whatsappConnected.length,
      whatsappDisconnected: whatsappDisconnected.length,
      deliveryPending,
      deliveryDelivered,
      deliveryObserved,
      cajaByMedium,
    },
    alerts: alerts.slice(0, 5),
  };
}
