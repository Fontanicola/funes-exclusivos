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
  source?: string;
};

export type MonthlyPnlPoint = {
  monthKey: string;
  label: string;
  sales: number;
  income: number;
  expense: number;
  result: number;
  salesCount: number;
};

export type DashboardMetricsInput = {
  vehiculos?: AnyRecord[];
  vehiculoDocumentos?: AnyRecord[];
  ventas?: AnyRecord[];
  ventasPagos?: AnyRecord[];
  ventasEntregas?: AnyRecord[];
  vehiculoGastos?: AnyRecord[];
  comprasVehiculos?: AnyRecord[];
  cajaMovimientos?: AnyRecord[];
  comisiones?: AnyRecord[];
  comisionLiquidaciones?: AnyRecord[];
  recordatorios?: AnyRecord[];
  leads?: AnyRecord[];
  empleados?: AnyRecord[];
  gestoriaTramites?: AnyRecord[];
  gestoriaPresupuestos?: AnyRecord[];
  whatsappInstancias?: AnyRecord[];
  conversaciones?: AnyRecord[];
};

export type DashboardMetrics = {
  topKpis: Array<{
    title: string;
    value: string;
    description: string;
    href?: string;
    tone?: "neutral" | "highlight" | "success" | "warning" | "critical" | "info";
    featured?: boolean;
    badge?: string;
    progress?: {
      value: number;
      label?: string;
    };
    note?: string;
  }>;
  pnl: {
    sales: CurrencyTotals;
    cashIncome: CurrencyTotals;
    cashExpense: CurrencyTotals;
    purchases: CurrencyTotals;
    commissionsPaid: CurrencyTotals;
    otherExpenses: CurrencyTotals;
    operatingResult: CurrencyTotals;
    annualOperatingResult: CurrencyTotals;
    salesCount: number;
    salesMargin: CurrencyTotals;
    salesMarginAvailable: boolean;
    salesMarginDescription: string;
    monthlySeriesByCurrency: Record<string, MonthlyPnlPoint[]>;
  };
  inventory: {
    totalStock: number;
    stockValued: CurrencyTotals;
    sold: number;
    consignment: number;
    published: number;
    highlighted: number;
    unpublishedStock: number;
    publishedWithoutPhoto: number;
    vehiclesWithoutPrice: number;
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
    openConversations: number;
    leadStages: Array<{
      key: string;
      label: string;
      value: number;
      tone: "slate" | "amber" | "emerald" | "rose" | "zinc";
    }>;
  };
  operations: {
    pendingTramites: number;
    overdueTramites: number;
    pendingBudgets: number;
    pendingLiquidations: number;
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
  vendorActivity: Array<{
    id: string;
    nombre: string;
    email: string;
    rol: string;
    leadsActivos: number;
    ventasMes: number;
    conversacionesActivas: number;
    conversacionesAtencion: number;
    comisionesGeneradas: CurrencyTotals;
    leadsSeguimiento: number;
  }>;
  alerts: DashboardAlert[];
};

function isRecord(value: unknown): value is AnyRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function createEmptyCurrencyTotals(): CurrencyTotals {
  return { ARS: 0, USD: 0, other: {} };
}

function cloneCurrencyTotals(totals?: CurrencyTotals | null): CurrencyTotals {
  return {
    ARS: Number(totals?.ARS ?? 0),
    USD: Number(totals?.USD ?? 0),
    other: { ...(totals?.other ?? {}) },
  };
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/\s/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toStringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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

function formatDateValue(value: unknown) {
  const parsed = getDateValue(value);
  if (!parsed) return "—";
  return new Intl.DateTimeFormat("es-AR").format(parsed);
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function isSameCalendarMonth(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
}

function getMonthKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    month: "short",
    year: "2-digit",
  }).format(date);
}

function getLastMonths(count = 12) {
  const months: Array<{ key: string; label: string; date: Date }> = [];
  const base = new Date();
  base.setDate(1);
  base.setHours(0, 0, 0, 0);

  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(base.getFullYear(), base.getMonth() - index, 1);
    months.push({
      key: getMonthKey(date),
      label: getMonthLabel(date),
      date,
    });
  }

  return months;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(value);
}

function formatMoneySymbol(currency: CurrencyCode) {
  return currency === "USD" ? "US$" : currency === "ARS" ? "$" : `${currency} `;
}

function formatMoney(currency: CurrencyCode, value: number) {
  const symbol = formatMoneySymbol(currency);
  const formatted = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(Math.abs(value));
  return `${symbol} ${formatted}`.trim();
}

function formatSignedMoney(currency: CurrencyCode, value: number) {
  return `${value < 0 ? "-" : ""}${formatMoney(currency, value)}`;
}

function addCurrencyValue(target: CurrencyTotals, currency: CurrencyCode, value: number) {
  if (!Number.isFinite(value) || !value) return;
  if (currency === "ARS") target.ARS += value;
  else if (currency === "USD") target.USD += value;
  else target.other[currency] = (target.other[currency] ?? 0) + value;
}

function addTotals(target: CurrencyTotals, source: CurrencyTotals) {
  target.ARS += source.ARS;
  target.USD += source.USD;
  for (const [currency, amount] of Object.entries(source.other)) {
    target.other[currency] = (target.other[currency] ?? 0) + amount;
  }
}

function subtractTotals(...totals: CurrencyTotals[]) {
  const result = createEmptyCurrencyTotals();
  for (const item of totals) {
    result.ARS += item.ARS;
    result.USD += item.USD;
    for (const [currency, amount] of Object.entries(item.other)) {
      result.other[currency] = (result.other[currency] ?? 0) + amount;
    }
  }
  return result;
}

function resolveMedium(item: AnyRecord) {
  const medium = toStringValue(item?.medio);
  if (medium) return medium;
  const account = toStringValue(item?.cuenta);
  if (account) return account;
  const concept = toStringValue(item?.concepto);
  if (concept) return concept;
  return "otro";
}

function resolveAmount(item: AnyRecord) {
  return toNumber(item?.importe) ?? toNumber(item?.monto) ?? toNumber(item?.monto_comision) ?? 0;
}

function resolveDate(item: AnyRecord, keys: string[]) {
  for (const key of keys) {
    const value = getDateValue(item?.[key]);
    if (value) return value;
  }
  return null;
}

function buildMonthBuckets() {
  return new Map<
    string,
    {
      sales: CurrencyTotals;
      cashIncome: CurrencyTotals;
      cashExpense: CurrencyTotals;
      purchases: CurrencyTotals;
      commissionsPaid: CurrencyTotals;
      otherExpenses: CurrencyTotals;
      salesCount: number;
    }
  >();
}

function getMonthBucket(
  buckets: ReturnType<typeof buildMonthBuckets>,
  monthKey: string
) {
  const current =
    buckets.get(monthKey) ??
    {
      sales: createEmptyCurrencyTotals(),
      cashIncome: createEmptyCurrencyTotals(),
      cashExpense: createEmptyCurrencyTotals(),
      purchases: createEmptyCurrencyTotals(),
      commissionsPaid: createEmptyCurrencyTotals(),
      otherExpenses: createEmptyCurrencyTotals(),
      salesCount: 0,
    };

  buckets.set(monthKey, current);
  return current;
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
  return Boolean(state) && !["ganado", "perdido"].includes(state);
}

function isWinningLead(lead: AnyRecord) {
  return toStringValue(lead?.estado) === "ganado";
}

function isNegotiationLead(lead: AnyRecord) {
  return toStringValue(lead?.estado) === "negociacion";
}

function isHighInterestConversation(conversation: AnyRecord) {
  return toStringValue(conversation?.ia_interes_compra ?? conversation?.interes_compra) === "alto";
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

function getPublishedPrice(vehicle: AnyRecord) {
  return (
    toNumber(vehicle?.precio_contado) ??
    toNumber(vehicle?.precio_venta) ??
    toNumber(vehicle?.precio_permuta) ??
    toNumber(vehicle?.precio_infoauto_actual) ??
    null
  );
}

function hasVehiclePhoto(vehicle: AnyRecord) {
  const photos = vehicle?.fotos;
  if (Array.isArray(photos)) return photos.filter(Boolean).length > 0;
  if (typeof photos === "string") return photos.trim().length > 0;
  return false;
}

function getVehiclePhotosCount(vehicle: AnyRecord) {
  const photos = vehicle?.fotos;
  if (Array.isArray(photos)) return photos.filter(Boolean).length;
  if (typeof photos === "string" && photos.trim()) return 1;
  return 0;
}

function getVehicleLabel(vehicle: AnyRecord) {
  return [
    toStringValue(vehicle?.marca),
    toStringValue(vehicle?.modelo),
    toStringValue(vehicle?.version),
    toStringValue(vehicle?.dominio),
  ]
    .filter(Boolean)
    .join(" · ");
}

function getVehicleDocumentLabel(document: AnyRecord) {
  return (
    getVehicleLabel(document?.vehiculo) ||
    [toStringValue(document?.vehiculo?.marca), toStringValue(document?.vehiculo?.modelo), toStringValue(document?.vehiculo?.dominio)]
      .filter(Boolean)
      .join(" · ") ||
    `Vehículo ${toStringValue(document?.vehiculo_id) || ""}`.trim() ||
    "Vehículo"
  );
}

function isActiveVehicleDocument(document: AnyRecord) {
  const status = toStringValue(document?.estado).toLowerCase();
  return !["archivado"].includes(status);
}

function isVehicleDocumentKeyType(document: AnyRecord) {
  const type = toStringValue(document?.tipo).toLowerCase();
  return ["titulo", "cedula", "factura", "boleto", "permiso", "comprobante_pago"].includes(type);
}

function isVehicleDocumentExpiringSoon(document: AnyRecord, days = 15) {
  if (!isActiveVehicleDocument(document)) return false;
  if (isOverdue(document?.fecha_vencimiento)) return false;
  const due = getDateValue(document?.fecha_vencimiento);
  if (!due) return false;
  const today = startOfToday();
  const future = new Date(today);
  future.setDate(future.getDate() + days);
  return due.getTime() > today.getTime() && due.getTime() <= future.getTime();
}

function buildVendorLabel(employee: AnyRecord) {
  return toStringValue(employee?.nombre) || toStringValue(employee?.email) || "Sin nombre";
}

function buildVendorActivity(
  empleados: AnyRecord[],
  leads: AnyRecord[],
  ventas: AnyRecord[],
  conversaciones: AnyRecord[],
  comisiones: AnyRecord[]
) {
  const salesEmployees =
    empleados?.filter((employee) => {
      const role = toStringValue(employee?.rol).toLowerCase();
      return role.includes("vendedor") || role === "admin";
    }) ?? [];

  const activeMonth = new Date();
  const currentMonthSales = ventas.filter((sale) => {
    const date = resolveDate(sale, ["fecha_venta", "created_at"]);
    return Boolean(date && isSameCalendarMonth(date, activeMonth));
  });
  const currentMonthCommissions = comisiones.filter((commission) => {
    const date = resolveDate(commission, ["fecha_generada", "fecha_pago", "created_at"]);
    return Boolean(date && isSameCalendarMonth(date, activeMonth));
  });

  return salesEmployees
    .map((employee) => {
      const employeeId = toStringValue(employee?.id);
      const leadsForEmployee = leads.filter((lead) => toStringValue(lead?.vendedor_id) === employeeId);
      const activeLeads = leadsForEmployee.filter(isActiveLead);
      const salesForEmployee = currentMonthSales.filter((sale) => toStringValue(sale?.vendedor_id) === employeeId);
      const openConversations = conversaciones.filter((conversation) => {
        const conversationVendor = toStringValue(conversation?.vendedor_id);
        const state = toStringValue(conversation?.estado);
        return conversationVendor === employeeId && !["cerrada", "archivada"].includes(state);
      });
      const attentionConversations = conversaciones.filter(
        (conversation) =>
          toStringValue(conversation?.vendedor_id) === employeeId && Boolean(conversation?.requiere_atencion)
      );
      const commissionsGenerated = currentMonthCommissions.filter(
        (commission) => toStringValue(commission?.vendedor_id) === employeeId && isPaidCommission(commission)
      );
      const leadsSeguimiento = leadsForEmployee.filter((lead) => {
        const nextContact = getDateValue(lead?.proximo_contacto);
        return Boolean(nextContact && nextContact.getTime() <= startOfToday().getTime());
      }).length;

      return {
        id: employeeId,
        nombre: buildVendorLabel(employee),
        email: toStringValue(employee?.email),
        rol: toStringValue(employee?.rol) || "vendedor",
        leadsActivos: activeLeads.length,
        ventasMes: salesForEmployee.length,
        conversacionesActivas: openConversations.length,
        conversacionesAtencion: attentionConversations.length,
        comisionesGeneradas: groupAmountByCurrency(commissionsGenerated, "monto_comision", "moneda"),
        leadsSeguimiento,
      };
    })
    .sort(
      (left, right) =>
        right.ventasMes - left.ventasMes ||
        right.leadsActivos - left.leadsActivos ||
        right.conversacionesAtencion - left.conversacionesAtencion ||
        left.nombre.localeCompare(right.nombre)
    );
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
  const totals = createEmptyCurrencyTotals();

  for (const item of items ?? []) {
    const amount = toNumber(item?.[amountKey]);
    if (amount == null) continue;

    const currency = normalizeCurrency(item?.[currencyKey]);
    addCurrencyValue(totals, currency, amount);
  }

  return totals;
}

export function formatCurrencyByCurrency(values: CurrencyTotals | Record<string, number | null | undefined>) {
  const normalized = createEmptyCurrencyTotals();

  for (const [key, value] of Object.entries(values ?? {})) {
    if (key === "other" && isRecord(value)) {
      for (const [otherCurrency, otherAmount] of Object.entries(value)) {
        const amount = toNumber(otherAmount);
        if (amount == null) continue;
        normalized.other[otherCurrency] = (normalized.other[otherCurrency] ?? 0) + amount;
      }
      continue;
    }

    const amount = toNumber(value);
    if (amount == null) continue;
    addCurrencyValue(normalized, key, amount);
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

function buildMonthlySeries(
  months: Array<{ key: string; label: string; date: Date }>,
  buckets: Map<
    string,
    {
      sales: CurrencyTotals;
      cashIncome: CurrencyTotals;
      cashExpense: CurrencyTotals;
      purchases: CurrencyTotals;
      commissionsPaid: CurrencyTotals;
      otherExpenses: CurrencyTotals;
      salesCount: number;
    }
  >
) {
  const currencies = new Set<string>(["ARS", "USD"]);

  for (const bucket of buckets.values()) {
    for (const currency of Object.keys(bucket.sales.other)) currencies.add(currency);
    for (const currency of Object.keys(bucket.cashIncome.other)) currencies.add(currency);
    for (const currency of Object.keys(bucket.cashExpense.other)) currencies.add(currency);
    for (const currency of Object.keys(bucket.purchases.other)) currencies.add(currency);
    for (const currency of Object.keys(bucket.commissionsPaid.other)) currencies.add(currency);
    for (const currency of Object.keys(bucket.otherExpenses.other)) currencies.add(currency);
  }

  const monthlySeriesByCurrency: Record<string, MonthlyPnlPoint[]> = {};

  for (const currency of currencies) {
    monthlySeriesByCurrency[currency] = months.map(({ key, label }) => {
      const bucket = buckets.get(key) ?? {
        sales: createEmptyCurrencyTotals(),
        cashIncome: createEmptyCurrencyTotals(),
        cashExpense: createEmptyCurrencyTotals(),
        purchases: createEmptyCurrencyTotals(),
        commissionsPaid: createEmptyCurrencyTotals(),
        otherExpenses: createEmptyCurrencyTotals(),
        salesCount: 0,
      };

      const sales = normalizeCurrency(currency) === "ARS"
        ? bucket.sales.ARS
        : normalizeCurrency(currency) === "USD"
          ? bucket.sales.USD
          : bucket.sales.other[currency] ?? 0;
      const income = normalizeCurrency(currency) === "ARS"
        ? bucket.cashIncome.ARS + bucket.sales.ARS
        : normalizeCurrency(currency) === "USD"
          ? bucket.cashIncome.USD + bucket.sales.USD
          : (bucket.cashIncome.other[currency] ?? 0) + (bucket.sales.other[currency] ?? 0);
      const expense = normalizeCurrency(currency) === "ARS"
        ? bucket.cashExpense.ARS + bucket.purchases.ARS + bucket.commissionsPaid.ARS + bucket.otherExpenses.ARS
        : normalizeCurrency(currency) === "USD"
          ? bucket.cashExpense.USD + bucket.purchases.USD + bucket.commissionsPaid.USD + bucket.otherExpenses.USD
          : (bucket.cashExpense.other[currency] ?? 0) +
            (bucket.purchases.other[currency] ?? 0) +
            (bucket.commissionsPaid.other[currency] ?? 0) +
            (bucket.otherExpenses.other[currency] ?? 0);

      return {
        monthKey: key,
        label,
        sales,
        income,
        expense,
        result: income - expense,
        salesCount: bucket.salesCount,
      };
    });
  }

  return monthlySeriesByCurrency;
}

export function buildDashboardMetrics(input: DashboardMetricsInput): DashboardMetrics {
  const vehiculos = input.vehiculos ?? [];
  const ventas = input.ventas ?? [];
  const ventasPagos = input.ventasPagos ?? [];
  const ventasEntregas = input.ventasEntregas ?? [];
  const vehiculoGastos = input.vehiculoGastos ?? [];
  const vehiculoDocumentos = input.vehiculoDocumentos ?? [];
  const comprasVehiculos = input.comprasVehiculos ?? [];
  const cajaMovimientos = input.cajaMovimientos ?? [];
  const comisiones = input.comisiones ?? [];
  const comisionLiquidaciones = input.comisionLiquidaciones ?? [];
  const recordatorios = input.recordatorios ?? [];
  const leads = input.leads ?? [];
  const empleados = input.empleados ?? [];
  const gestoriaTramites = input.gestoriaTramites ?? [];
  const gestoriaPresupuestos = input.gestoriaPresupuestos ?? [];
  const whatsappInstancias = input.whatsappInstancias ?? [];
  const conversaciones = input.conversaciones ?? [];

  const currentMonth = new Date();
  const currentMonthSales = ventas.filter((sale) => {
    const date = resolveDate(sale, ["fecha_venta", "created_at"]);
    return Boolean(date && isSameCalendarMonth(date, currentMonth));
  });
  const currentMonthCashMovements = cajaMovimientos.filter((movement) => {
    const date = resolveDate(movement, ["fecha", "created_at"]);
    return Boolean(date && isSameCalendarMonth(date, currentMonth));
  });
  const currentMonthCommissions = comisiones.filter((commission) => {
    const date = resolveDate(commission, ["fecha_generada", "fecha_pago", "created_at"]);
    return Boolean(date && isSameCalendarMonth(date, currentMonth));
  });
  const currentMonthPurchases = comprasVehiculos.filter((purchase) => {
    const date = resolveDate(purchase, ["fecha", "created_at"]);
    return Boolean(date && isSameCalendarMonth(date, currentMonth));
  });
  const currentMonthVehicleExpenses = vehiculoGastos.filter((expense) => {
    const date = resolveDate(expense, ["fecha", "created_at"]);
    return Boolean(date && isSameCalendarMonth(date, currentMonth));
  });

  const stockVehicles = vehiculos.filter(isInStock);
  const stockValued = groupAmountByCurrency(stockVehicles, "precio_contado", "precio_moneda");
  const soldVehicles = vehiculos.filter((vehicle) => toStringValue(vehicle?.estado) === "vendido");
  const consignmentVehicles = vehiculos.filter((vehicle) => toStringValue(vehicle?.estado) === "en_consignacion");
  const publishedVehicles = vehiculos.filter((vehicle) => Boolean(vehicle?.catalogo_publicado));

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
  const vehiclesWithoutPrice = vehiculos.filter((vehicle) => !getPublishedPrice(vehicle)).length;
  const publishedWithoutPhoto = publishedVehicles.filter((vehicle) => !hasVehiclePhoto(vehicle)).length;
  const unpublishedStock = stockVehicles.filter((vehicle) => !Boolean(vehicle?.catalogo_publicado)).length;
  const documentsByVehicle = vehiculoDocumentos.reduce((map, document) => {
    const vehicleId = toStringValue(document?.vehiculo_id ?? document?.vehiculo?.id);
    if (!vehicleId) return map;
    const current = map.get(vehicleId) ?? [];
    current.push(document);
    map.set(vehicleId, current);
    return map;
  }, new Map<string, AnyRecord[]>());
  const overdueVehicleDocuments = vehiculoDocumentos.filter(
    (document) => isActiveVehicleDocument(document) && isOverdue(document?.fecha_vencimiento)
  );
  const expiringVehicleDocuments = vehiculoDocumentos.filter((document) =>
    isVehicleDocumentExpiringSoon(document, 15)
  );
  const vehiclesMissingKeyDocuments = vehiculos
    .filter((vehicle) => ["en_stock", "vendido"].includes(toStringValue(vehicle?.estado)))
    .filter((vehicle) => {
      const vehicleId = toStringValue(vehicle?.id);
      if (!vehicleId) return false;

      const documents = documentsByVehicle.get(vehicleId) ?? [];
      return !documents.some((document: AnyRecord) => isActiveVehicleDocument(document) && isVehicleDocumentKeyType(document));
    });

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
  const purchases = groupAmountByCurrency(currentMonthPurchases, "precio_compra", "moneda");
  const vehicleExpenses = groupAmountByCurrency(currentMonthVehicleExpenses, "monto", "moneda");
  const commissionsPaid = groupAmountByCurrency(
    currentMonthCommissions.filter(isPaidCommission),
    "monto_comision",
    "moneda"
  );
  const commissionsPending = groupAmountByCurrency(
    comisiones.filter(isCurrentPendingCommission),
    "monto_comision",
    "moneda"
  );
  const otherExpenses = cloneCurrencyTotals(vehicleExpenses);
  const grossIncome = createEmptyCurrencyTotals();
  addTotals(grossIncome, salesAmount);
  addTotals(grossIncome, cashIncome);
  const operatingResult = subtractTotals(grossIncome, cashExpense, purchases, commissionsPaid, otherExpenses);

  const months = getLastMonths(12);
  const monthBuckets = buildMonthBuckets();

  for (const sale of ventas.filter(isRegisteredSale)) {
    const saleDate = resolveDate(sale, ["fecha_venta", "created_at"]);
    if (!saleDate) continue;

    const bucket = getMonthBucket(monthBuckets, getMonthKey(saleDate));
    bucket.salesCount += 1;

    const saleCurrency = normalizeCurrency(sale?.moneda);
    const saleAmount = toNumber(sale?.precio_venta) ?? 0;
    addCurrencyValue(bucket.sales, saleCurrency, saleAmount);
  }

  for (const movement of cajaMovimientos) {
    const date = resolveDate(movement, ["fecha", "created_at"]);
    if (!date) continue;

    const bucket = getMonthBucket(monthBuckets, getMonthKey(date));
    const currency = normalizeCurrency(movement?.moneda);
    const amount = resolveAmount(movement);
    const type = toStringValue(movement?.tipo);

    if (type === "ingreso") addCurrencyValue(bucket.cashIncome, currency, amount);
    else if (type === "egreso") addCurrencyValue(bucket.cashExpense, currency, amount);
  }

  for (const purchase of comprasVehiculos) {
    const date = resolveDate(purchase, ["fecha", "created_at"]);
    if (!date) continue;

    const bucket = getMonthBucket(monthBuckets, getMonthKey(date));
    addCurrencyValue(bucket.purchases, normalizeCurrency(purchase?.moneda), toNumber(purchase?.precio_compra) ?? 0);
  }

  for (const expense of vehiculoGastos) {
    const date = resolveDate(expense, ["fecha", "created_at"]);
    if (!date) continue;

    const bucket = getMonthBucket(monthBuckets, getMonthKey(date));
    addCurrencyValue(bucket.otherExpenses, normalizeCurrency(expense?.moneda), toNumber(expense?.monto) ?? 0);
  }

  for (const commission of comisiones.filter(isPaidCommission)) {
    const date = resolveDate(commission, ["fecha_pago", "fecha_generada", "created_at"]);
    if (!date) continue;

    const bucket = getMonthBucket(monthBuckets, getMonthKey(date));
    addCurrencyValue(bucket.commissionsPaid, normalizeCurrency(commission?.moneda), toNumber(commission?.monto_comision) ?? 0);
  }

  const monthlySeriesByCurrency = buildMonthlySeries(months, monthBuckets);
  const annualOperatingResult = createEmptyCurrencyTotals();
  for (const [currency, points] of Object.entries(monthlySeriesByCurrency)) {
    for (const point of points) {
      addCurrencyValue(annualOperatingResult, currency, point.result);
    }
  }

  const vehicleById = getVehicleByIdMap(vehiculos);
  const salesMarginByCurrency = createEmptyCurrencyTotals();
  let salesMarginCount = 0;

  for (const sale of currentMonthSales.filter(isRegisteredSale)) {
    const saleVehicle =
      (isRecord(sale?.vehiculo) ? sale.vehiculo : null) ??
      vehicleById.get(toStringValue(sale?.vehiculo_id)) ??
      null;

    const salePrice = toNumber(sale?.precio_venta);
    const cost =
      toNumber(sale?.costo_historico) ??
      toNumber(sale?.costo_reposicion) ??
      toNumber(saleVehicle?.costo_adquisicion) ??
      toNumber(saleVehicle?.costo_reposicion);
    if (salePrice == null || cost == null) continue;

    const currency = normalizeCurrency(sale?.moneda ?? saleVehicle?.precio_moneda ?? saleVehicle?.costo_moneda);
    const margin = salePrice - cost;
    salesMarginCount += 1;
    addCurrencyValue(salesMarginByCurrency, currency, margin);
  }

  const activeLeads = leads.filter(isActiveLead);
  const negotiationLeads = leads.filter(isNegotiationLead);
  const wonLeads = leads.filter(isWinningLead);
  const highInterestConversations = conversaciones.filter(isHighInterestConversation);
  const attentionConversations = conversaciones.filter(requiresAttention);
  const openConversations = conversaciones.filter((conversation) =>
    !["cerrada", "archivada"].includes(toStringValue(conversation?.estado))
  );
  const nextContactLeads = leads.filter((lead) => {
    const nextContact = getDateValue(lead?.proximo_contacto);
    return Boolean(nextContact && nextContact.getTime() <= startOfToday().getTime());
  });

  const pendingTramites = gestoriaTramites.filter((tramite) =>
    ["pendiente", "en_proceso"].includes(toStringValue(tramite?.estado))
  );
  const overdueTramites = gestoriaTramites.filter(
    (tramite) =>
      isOverdue(tramite?.fecha_vencimiento) &&
      !["completado", "cancelado"].includes(toStringValue(tramite?.estado))
  );
  const pendingBudgets = gestoriaPresupuestos.filter((budget) =>
    ["borrador", "enviado"].includes(toStringValue(budget?.estado))
  );
  const pendingLiquidations = comisionLiquidaciones.filter((liquidation) =>
    ["borrador", "enviado", "aprobado", "cerrada"].includes(toStringValue(liquidation?.estado))
  );
  const whatsappConnected = whatsappInstancias.filter(isWhatsappConnected);
  const whatsappDisconnected = whatsappInstancias.filter(isWhatsappDisconnected);
  const pendingRecordatorios = recordatorios.filter((item) => {
    const status = toStringValue(item?.estado).toLowerCase();
    return ["pendiente", "pospuesto"].includes(status);
  });
  const overdueRecordatorios = pendingRecordatorios.filter((item) => isOverdue(item?.fecha_vencimiento));
  const todayRecordatorios = pendingRecordatorios.filter((item) => {
    const due = getDateValue(item?.fecha_vencimiento);
    const today = startOfToday();
    return Boolean(due && due.getTime() === today.getTime());
  });
  const soonRecordatorios = pendingRecordatorios.filter((item) => {
    const due = getDateValue(item?.fecha_vencimiento);
    if (!due) return false;
    const today = startOfToday();
    const inTwoDays = new Date(today);
    inTwoDays.setDate(inTwoDays.getDate() + 2);
    return due.getTime() > today.getTime() && due.getTime() <= inTwoDays.getTime();
  });
  const highPriorityRecordatorios = pendingRecordatorios.filter((item) => {
    const priority = toStringValue(item?.prioridad).toLowerCase();
    return ["alta", "critica"].includes(priority);
  });
  const cajaByMediumMap = cajaMovimientos.reduce((groups, movement) => {
    const medium = resolveMedium(movement);
    const current =
      groups.get(medium) ?? {
        medium,
        count: 0,
        totals: createEmptyCurrencyTotals(),
      };

    current.count += 1;
    addCurrencyValue(current.totals, normalizeCurrency(movement?.moneda), resolveAmount(movement));
    groups.set(medium, current);
    return groups;
  }, new Map<string, { medium: string; count: number; totals: CurrencyTotals }>());
  const cajaByMedium = Array.from(cajaByMediumMap.values() as Iterable<{
    medium: string;
    count: number;
    totals: CurrencyTotals;
  }>)
    .sort((left, right) => right.count - left.count || left.medium.localeCompare(right.medium))
    .slice(0, 6);

  const deliveryPending = ventasEntregas.filter((delivery) => {
    const state = toStringValue(delivery?.estado).toLowerCase();
    return !state || state === "pendiente";
  }).length;
  const deliveryDelivered = ventasEntregas.filter((delivery) => {
    const state = toStringValue(delivery?.estado).toLowerCase();
    return ["entregada", "entregado", "lista_para_entregar"].includes(state);
  }).length;
  const deliveryObserved = ventasEntregas.filter((delivery) => {
    const state = toStringValue(delivery?.estado).toLowerCase();
    return ["observada", "observado", "en_proceso"].includes(state);
  }).length;

  const vendorActivity = buildVendorActivity(empleados, leads, ventas, conversaciones, comisiones);

  const alerts: DashboardAlert[] = [];

  for (const reminder of overdueRecordatorios.slice(0, 2)) {
    alerts.push({
      title: "Recordatorio vencido",
      description: `${toStringValue(reminder?.titulo) || "Un recordatorio"} venció el ${formatDateValue(reminder?.fecha_vencimiento)}.`,
      href: "/recordatorios",
      severity: "critical",
      source: "Recordatorios",
    });
  }

  if (!overdueRecordatorios.length && todayRecordatorios.length) {
    alerts.push({
      title: "Recordatorios de hoy",
      description: `Tenés ${todayRecordatorios.length} recordatorio${todayRecordatorios.length === 1 ? "" : "s"} para revisar hoy.`,
      href: "/recordatorios",
      severity: "warning",
      source: "Recordatorios",
    });
  }

  if (!overdueRecordatorios.length && !todayRecordatorios.length && soonRecordatorios.length) {
    alerts.push({
      title: "Recordatorios próximos",
      description: `${soonRecordatorios.length} recordatorio${soonRecordatorios.length === 1 ? "" : "s"} vencen en las próximas 48 horas.`,
      href: "/recordatorios",
      severity: "info",
      source: "Recordatorios",
    });
  }

  if (highPriorityRecordatorios.length && alerts.length < 3) {
    alerts.push({
      title: "Alta prioridad en recordatorios",
      description: `${highPriorityRecordatorios.length} recordatorio${highPriorityRecordatorios.length === 1 ? "" : "s"} marcados como urgentes.`,
      href: "/recordatorios",
      severity: "warning",
      source: "Recordatorios",
    });
  }

  for (const instance of whatsappDisconnected.slice(0, 2)) {
    alerts.push({
      title: "WhatsApp requiere atención",
      description: `La instancia de ${toStringValue(instance?.empleado?.nombre) || toStringValue(instance?.empleado?.email) || "un vendedor"} está ${toStringValue(instance?.estado)}.`,
      href: "/whatsapp/conexiones",
      severity: toStringValue(instance?.estado) === "error" ? "critical" : "warning",
      source: "WhatsApp",
    });
  }

  if (overdueTramites.length) {
    alerts.push({
      title: "Trámites vencidos",
      description: `Hay ${overdueTramites.length} trámite${overdueTramites.length === 1 ? "" : "s"} que requieren seguimiento.`,
      href: "/gestoria",
      severity: "critical",
      source: "Gestoría",
    });
  }

  if (attentionConversations.length) {
    alerts.push({
      title: "Conversaciones que requieren atención",
      description: `Hay ${attentionConversations.length} conversación${attentionConversations.length === 1 ? "" : "es"} que no deberían esperar.`,
      href: "/whatsapp",
      severity: "warning",
      source: "WhatsApp",
    });
  }

  if (pendingLiquidations.length) {
    alerts.push({
      title: "Liquidaciones pendientes",
      description: `Hay ${pendingLiquidations.length} liquidación${pendingLiquidations.length === 1 ? "" : "es"} para revisar o pagar.`,
      href: "/comisiones/liquidaciones",
      severity: "info",
      source: "Comisiones",
    });
  }

  if (pendingBudgets.length) {
    alerts.push({
      title: "Presupuestos de gestoría pendientes",
      description: `Hay ${pendingBudgets.length} presupuesto${pendingBudgets.length === 1 ? "" : "s"} aún sin resolución.`,
      href: "/gestoria/presupuestos",
      severity: "info",
      source: "Gestoría",
    });
  }

  if (nextContactLeads.length) {
    alerts.push({
      title: "Seguimientos por hacer",
      description: `Hay ${nextContactLeads.length} lead${nextContactLeads.length === 1 ? "" : "s"} con próximo contacto para hoy o vencido.`,
      href: "/crm",
      severity: "warning",
      source: "CRM",
    });
  }

  if (vehiclesWithoutPrice) {
    alerts.push({
      title: "Vehículos sin precio",
      description: `Hay ${vehiclesWithoutPrice} unidad${vehiclesWithoutPrice === 1 ? "" : "es"} sin precio público definido.`,
      href: "/inventario",
      severity: "warning",
      source: "Inventario",
    });
  }

  if (publishedWithoutPhoto) {
    alerts.push({
      title: "Publicaciones sin foto",
      description: `Hay ${publishedWithoutPhoto} vehículo${publishedWithoutPhoto === 1 ? "" : "s"} publicado${publishedWithoutPhoto === 1 ? "" : "s"} sin imagen principal.`,
      href: "/catalogo",
      severity: "info",
      source: "Catálogo",
    });
  }

  for (const document of overdueVehicleDocuments.slice(0, 2)) {
    const vehicleId = toStringValue(document?.vehiculo_id ?? document?.vehiculo?.id);
    alerts.push({
      title: "Documento vencido",
      description: `${toStringValue(document?.titulo) || getVehicleDocumentLabel(document)} venció${document?.fecha_vencimiento ? ` el ${formatDateValue(document.fecha_vencimiento)}` : ""}.`,
      href: vehicleId ? `/inventario/${vehicleId}` : "/inventario",
      severity: "critical",
      source: "Documentos",
    });
  }

  if (!overdueVehicleDocuments.length && expiringVehicleDocuments.length) {
    for (const document of expiringVehicleDocuments.slice(0, 2)) {
      const vehicleId = toStringValue(document?.vehiculo_id ?? document?.vehiculo?.id);
      alerts.push({
        title: "Documento por vencer",
        description: `${toStringValue(document?.titulo) || getVehicleDocumentLabel(document)} vence${document?.fecha_vencimiento ? ` el ${formatDateValue(document.fecha_vencimiento)}` : ""}.`,
        href: vehicleId ? `/inventario/${vehicleId}` : "/inventario",
        severity: "warning",
        source: "Documentos",
      });
    }
  }

  for (const vehicle of vehiclesMissingKeyDocuments.slice(0, 2)) {
    alerts.push({
      title: "Documentación clave pendiente",
      description: `${getVehicleLabel(vehicle) || "Un vehículo"} aún no tiene documentos clave cargados.`,
      href: `/inventario/${toStringValue(vehicle?.id) || ""}`.replace(/\/$/, "") || "/inventario",
      severity: "warning",
      source: "Inventario",
    });
  }

  const criticalAlertsCount = alerts.filter((alert) => alert.severity === "critical").length;
  const resultForTopKpi = formatCurrencyByCurrency(subtractTotals(cashIncome, cashExpense));

  const topKpis = [
    {
      title: "Stock disponible",
      value: formatNumber(stockVehicles.length),
      description: `${publishedVehicles.length} publicados · ${unpublishedStock} sin publicar`,
      href: "/inventario",
      tone: "highlight" as const,
      featured: true,
      badge: "Inventario",
      progress: {
        value: stockVehicles.length > 0 ? Math.round((publishedVehicles.length / stockVehicles.length) * 100) : 0,
        label: "Publicación",
      },
    },
    {
      title: "Ventas del mes",
      value: formatNumber(currentMonthSales.filter(isRegisteredSale).length),
      description: `${formatCurrencyByCurrency(salesAmount)} registradas`,
      href: "/ventas",
      tone: "success" as const,
      badge: "Cierres",
      note: salesMarginCount > 0 ? `${formatNumber(salesMarginCount)} con margen estimado` : "Sin margen suficiente",
    },
    {
      title: "Resultado caja mes",
      value: formatCurrencyByCurrency(subtractTotals(cashIncome, cashExpense)),
      description: "Caja real antes de comisiones y compras.",
      href: "/caja",
      tone: "highlight" as const,
      badge: "Caja",
      note: resultForTopKpi,
    },
    {
      title: "Leads activos",
      value: formatNumber(activeLeads.length),
      description: `${formatNumber(negotiationLeads.length)} en negociación · ${formatNumber(wonLeads.length)} ganados`,
      href: "/crm",
      tone: "info" as const,
      badge: "Pipeline",
      progress: {
        value:
          activeLeads.length > 0
            ? Math.min(100, Math.round((negotiationLeads.length / activeLeads.length) * 100))
            : 0,
        label: "Negociación",
      },
    },
    {
      title: "Alertas críticas",
      value: formatNumber(criticalAlertsCount),
      description: `${formatNumber(alerts.length)} alertas totales activas`,
      href: "/dashboard",
      tone: criticalAlertsCount ? ("critical" as const) : ("neutral" as const),
      badge: criticalAlertsCount ? "Revisar" : "Sin riesgo",
      note: criticalAlertsCount ? "Hay señales urgentes para atender" : "El panel está estable",
    },
  ];

  return {
    topKpis,
    pnl: {
      sales: salesAmount,
      cashIncome,
      cashExpense,
      purchases,
      commissionsPaid,
      otherExpenses,
      operatingResult,
      annualOperatingResult,
      salesCount: currentMonthSales.filter(isRegisteredSale).length,
      salesMargin: salesMarginByCurrency,
      salesMarginAvailable: salesMarginCount > 0,
      salesMarginDescription:
        salesMarginCount > 0
          ? `${formatNumber(salesMarginCount)} ventas con costo relacionable`
          : "Sin datos suficientes para estimar margen",
      monthlySeriesByCurrency,
    },
    inventory: {
      totalStock: stockVehicles.length,
      stockValued,
      sold: soldVehicles.length,
      consignment: consignmentVehicles.length,
      published: publishedVehicles.length,
      highlighted: vehiculos.filter((vehicle) => Boolean(vehicle?.catalogo_destacado)).length,
      unpublishedStock,
      publishedWithoutPhoto,
      vehiclesWithoutPrice,
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
      openConversations: openConversations.length,
      leadStages: [
        { key: "nuevo", label: "Nuevo", value: leads.filter((lead) => toStringValue(lead?.estado) === "nuevo").length, tone: "slate" },
        { key: "contactado", label: "Contactado", value: leads.filter((lead) => toStringValue(lead?.estado) === "contactado").length, tone: "zinc" },
        { key: "interesado", label: "Interesado", value: leads.filter((lead) => toStringValue(lead?.estado) === "interesado").length, tone: "amber" },
        { key: "negociacion", label: "Negociación", value: negotiationLeads.length, tone: "amber" },
        { key: "reservado", label: "Reservado", value: leads.filter((lead) => toStringValue(lead?.estado) === "reservado").length, tone: "slate" },
        { key: "ganado", label: "Ganado", value: wonLeads.length, tone: "emerald" },
      ],
    },
    operations: {
      pendingTramites: pendingTramites.length,
      overdueTramites: overdueTramites.length,
      pendingBudgets: pendingBudgets.length,
      pendingLiquidations: pendingLiquidations.length,
      commissionsPending: comisiones.filter((commission) => toStringValue(commission?.estado) === "pendiente").length,
      whatsappConnected: whatsappConnected.length,
      whatsappDisconnected: whatsappDisconnected.length,
      deliveryPending,
      deliveryDelivered,
      deliveryObserved,
      cajaByMedium,
    },
    vendorActivity,
    alerts: alerts.slice(0, 5),
  };
}

export function calculateDashboardMetrics(input: DashboardMetricsInput) {
  return buildDashboardMetrics(input);
}
