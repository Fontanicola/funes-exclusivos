export type CurrencyAmount = {
  currency: string;
  total: number;
};

export type RentaBreakdown = {
  type: string;
  totals: CurrencyAmount[];
};

export type RentaVehicle = {
  id: string;
  marca: string | null;
  modelo: string | null;
  version: string | null;
  anio: number | null;
  dominio: string | null;
  fecha_compra?: string | null;
  costo_adquisicion?: number | null;
  costo_moneda?: string | null;
  costo_reposicion?: number | null;
  precio_infoauto_compra?: number | null;
  precio_infoauto_actual?: number | null;
};

export type RentaPerson = {
  id: string;
  nombre: string | null;
  email: string | null;
};

export type RentaPayment = {
  id?: string;
  venta_id?: string | null;
  tipo?: string | null;
  medio?: string | null;
  fecha?: string | null;
  importe?: number | string | null;
  monto?: number | string | null;
  moneda?: string | null;
  detalle?: string | null;
};

export type RentaExpense = {
  id?: string;
  vehiculo_id?: string | null;
  tipo?: string | null;
  fecha?: string | null;
  monto?: number | string | null;
  moneda?: string | null;
  detalle?: string | null;
};

export type RentaDelivery = {
  id?: string;
  venta_id?: string | null;
  estado?: string | null;
  fecha_entrega?: string | null;
};

export type RentaVenta = {
  id: string;
  fecha_venta: string | null;
  cliente_nombre: string | null;
  precio_venta: number | null;
  moneda: string | null;
  metodo_pago: string | null;
  estado: string | null;
  monto_permuta: number | null;
  precio_infoauto?: number | null;
  info_historica_compra?: number | null;
  costo_reposicion?: number | null;
  costo_historico?: number | null;
  margen_reposicion?: number | null;
  margen_historico?: number | null;
  rotacion_dias?: number | null;
  saldo_preventa?: number | null;
  saldo_efectivo?: number | null;
  importe_gestoria?: number | null;
  importe_escribania?: number | null;
  resultado_operativo?: number | null;
  created_at?: string | null;
  vehiculo: RentaVehicle | RentaVehicle[] | null;
  vehiculo_recibido?: RentaVehicle | RentaVehicle[] | null;
  vendedor: RentaPerson | RentaPerson[] | null;
};

export type RentaRow = {
  id: string;
  fechaVenta: string | null;
  clienteNombre: string | null;
  moneda: string | null;
  metodoPago: string | null;
  estado: string | null;
  montoPermuta: number | null;
  precioVenta: number | null;
  precioInfoauto: number | null;
  infoHistoricaCompra: number | null;
  costoReposicion: number | null;
  costoHistorico: number | null;
  margenReposicion: number | null;
  margenHistorico: number | null;
  saldoPreventa: number | null;
  saldoEfectivo: number | null;
  importeGestoria: number | null;
  importeEscribania: number | null;
  resultadoOperativo: number | null;
  resultStatus: "positive" | "negative" | "neutral" | "mixed" | "sin_datos";
  comparable: boolean;
  incomplete: boolean;
  rotacionDias: number | null;
  deliveryEstado: string | null;
  deliveryFecha: string | null;
  vendedor: RentaPerson | null;
  vehiculo: RentaVehicle | null;
  vehiculoRecibido: RentaVehicle | null;
  gastosTotales: CurrencyAmount[];
  pagosTotales: CurrencyAmount[];
  pagosPorTipo: RentaBreakdown[];
  gastosPorTipo: RentaBreakdown[];
};

export type RentaKpis = {
  operacionesRegistradas: number;
  resultadoOperativo: CurrencyAmount[];
  margenPromedio: CurrencyAmount[];
  rotacionPromedio: number | null;
  operacionesIncompletas: number;
  operacionesConDatos: number;
};

function normalizeCurrency(value: string | null | undefined) {
  const normalized = (value ?? "").trim().toUpperCase();
  if (!normalized) return "ARS";
  if (normalized === "USD" || normalized === "ARS") return normalized;
  return normalized;
}

function normalizeRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function resolveAmount(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

function formatAmount(value: number, currency: string) {
  const isoCurrency = normalizeCurrency(currency);
  const symbol = isoCurrency === "USD" ? "US$" : "$";

  const formatted = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: isoCurrency === "USD" || isoCurrency === "ARS" ? isoCurrency : "ARS",
    maximumFractionDigits: 0,
  }).format(value);

  return formatted.replace("US$", symbol).replace("$", symbol);
}

function sortCurrencyEntries(entries: CurrencyAmount[]) {
  const order = new Map([
    ["USD", 0],
    ["ARS", 1],
  ]);

  return [...entries].sort((left, right) => {
    const leftWeight = order.get(left.currency) ?? 99;
    const rightWeight = order.get(right.currency) ?? 99;
    if (leftWeight !== rightWeight) return leftWeight - rightWeight;
    return left.currency.localeCompare(right.currency);
  });
}

export function sumByCurrency<T extends Record<string, any>>(
  items: T[],
  amountKey: keyof T | string,
  currencyKey: keyof T | string
) {
  const groups = new Map<string, number>();

  for (const item of items ?? []) {
    const amount = resolveAmount(item?.[amountKey]);
    if (amount == null) continue;

    const currency = normalizeCurrency(item?.[currencyKey]);
    groups.set(currency, (groups.get(currency) ?? 0) + amount);
  }

  return sortCurrencyEntries(
    Array.from(groups.entries()).map(([currency, total]) => ({ currency, total }))
  );
}

export function formatCurrencyByCurrency(values: CurrencyAmount[] | null | undefined) {
  if (!values?.length) return "—";

  return sortCurrencyEntries(values)
    .map((entry) => `${entry.currency} ${formatAmount(entry.total, entry.currency)}`)
    .join(" · ");
}

export function calculateDaysBetween(start: string | null | undefined, end: string | null | undefined) {
  if (!start || !end) return null;

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null;
  }

  const diff = endDate.getTime() - startDate.getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

function getComparableCurrencySet(values: Array<{ amount: number | null; currency: string | null | undefined }>) {
  const currencies = values
    .filter((item) => item.amount != null && item.amount !== 0)
    .map((item) => normalizeCurrency(item.currency));

  return new Set(currencies);
}

function isRowComparable(venta: RentaVenta, gastos: RentaExpense[]) {
  const vehicle = normalizeRelation(venta.vehiculo);
  const currencies = getComparableCurrencySet([
    { amount: venta.precio_venta, currency: venta.moneda },
    {
      amount: venta.costo_historico ?? vehicle?.costo_adquisicion ?? null,
      currency: normalizeCurrency(venta.costo_historico != null ? venta.moneda : vehicle?.costo_moneda),
    },
    ...gastos.map((gasto) => ({
      amount: resolveAmount(gasto.monto),
      currency: gasto.moneda,
    })),
  ]);

  return currencies.size <= 1;
}

function sumExpensesForCurrency(gastos: RentaExpense[], currency: string) {
  return gastos.reduce((total, gasto) => {
    const amount = resolveAmount(gasto.monto);
    if (amount == null) return total;
    if (normalizeCurrency(gasto.moneda) !== currency) return total;
    return total + amount;
  }, 0);
}

function buildBreakdowns(items: RentaExpense[] | RentaPayment[], key: "tipo" | "medio") {
  const groups = new Map<string, RentaExpense[] | RentaPayment[]>();

  for (const item of items ?? []) {
    const rawItem = item as Record<string, any>;
    const name = String(rawItem[key] ?? "otros").trim().toLowerCase() || "otros";
    const current = groups.get(name) ?? [];
    current.push(item);
    groups.set(name, current);
  }

  return Array.from(groups.entries()).map(([type, groupItems]) => ({
    type,
    totals: sumByCurrency(
      groupItems as Array<Record<string, any>>,
      key === "medio" ? "importe" : "monto",
      "moneda"
    ),
  }));
}

function resolveMarginStatus(
  comparable: boolean,
  value: number | null,
  explicitValue: number | null
): RentaRow["resultStatus"] {
  if (!comparable) {
    return explicitValue != null ? "mixed" : "sin_datos";
  }

  const resolved = explicitValue ?? value;
  if (resolved == null) return "sin_datos";
  if (resolved > 0) return "positive";
  if (resolved < 0) return "negative";
  return "neutral";
}

export function calculateRentaRows(
  ventas: RentaVenta[],
  gastos: RentaExpense[],
  pagos: RentaPayment[],
  entregas: RentaDelivery[]
): RentaRow[] {
  const gastosPorVehiculo = new Map<string, RentaExpense[]>();
  for (const gasto of gastos ?? []) {
    const vehiculoId = String(gasto?.vehiculo_id ?? "");
    if (!vehiculoId) continue;
    const current = gastosPorVehiculo.get(vehiculoId) ?? [];
    current.push(gasto);
    gastosPorVehiculo.set(vehiculoId, current);
  }

  const pagosPorVenta = new Map<string, RentaPayment[]>();
  for (const pago of pagos ?? []) {
    const ventaId = String(pago?.venta_id ?? "");
    if (!ventaId) continue;
    const current = pagosPorVenta.get(ventaId) ?? [];
    current.push(pago);
    pagosPorVenta.set(ventaId, current);
  }

  const entregaPorVenta = new Map<string, RentaDelivery>();
  for (const entrega of entregas ?? []) {
    const ventaId = String(entrega?.venta_id ?? "");
    if (!ventaId || entregaPorVenta.has(ventaId)) continue;
    entregaPorVenta.set(ventaId, entrega);
  }

  return (ventas ?? []).map((venta) => {
    const vehicle = normalizeRelation(venta.vehiculo);
    const vehicleReceived = normalizeRelation(venta.vehiculo_recibido);
    const seller = normalizeRelation(venta.vendedor);
    const expenseRows = vehicle?.id ? gastosPorVehiculo.get(vehicle.id) ?? [] : [];
    const paymentRows = pagosPorVenta.get(venta.id) ?? [];
    const delivery = entregaPorVenta.get(venta.id) ?? null;
    const comparable = isRowComparable(venta, expenseRows);
    const saleCurrency = normalizeCurrency(venta.moneda);
    const vehicleCost = resolveAmount(venta.costo_historico ?? vehicle?.costo_adquisicion ?? null);
    const reposicionCost = resolveAmount(venta.costo_reposicion ?? vehicle?.costo_reposicion ?? null);
    const expensesInSaleCurrency = sumExpensesForCurrency(expenseRows, saleCurrency);
    const hasForeignExpenses = expenseRows.some((expense) => {
      const amount = resolveAmount(expense.monto);
      return amount != null && amount !== 0 && normalizeCurrency(expense.moneda) !== saleCurrency;
    });
    const marginHistorical =
      comparable && venta.precio_venta != null && vehicleCost != null && !hasForeignExpenses
        ? venta.precio_venta - vehicleCost - expensesInSaleCurrency
        : null;
    const marginReposicion =
      comparable && venta.precio_venta != null && reposicionCost != null && !hasForeignExpenses
        ? venta.precio_venta - reposicionCost - expensesInSaleCurrency
        : null;
    const explicitResult = resolveAmount(venta.resultado_operativo ?? null);
    const resultStatus = resolveMarginStatus(comparable, marginHistorical ?? marginReposicion, explicitResult);
    const rotationDays =
      venta.rotacion_dias ??
      calculateDaysBetween(vehicle?.fecha_compra ?? null, venta.fecha_venta ?? null);
    const incomplete =
      !comparable ||
      rotationDays == null ||
      (vehicleCost == null && reposicionCost == null && explicitResult == null && marginHistorical == null && marginReposicion == null);

    return {
      id: venta.id,
      fechaVenta: venta.fecha_venta,
      clienteNombre: venta.cliente_nombre,
      moneda: saleCurrency,
      metodoPago: venta.metodo_pago,
      estado: venta.estado,
      montoPermuta: resolveAmount(venta.monto_permuta ?? null),
      precioVenta: resolveAmount(venta.precio_venta ?? null),
      precioInfoauto: resolveAmount(venta.precio_infoauto ?? null),
      infoHistoricaCompra: resolveAmount(venta.info_historica_compra ?? null),
      costoReposicion: reposicionCost,
      costoHistorico: vehicleCost,
      margenReposicion: marginReposicion,
      margenHistorico: marginHistorical,
      saldoPreventa: resolveAmount(venta.saldo_preventa ?? null),
      saldoEfectivo: resolveAmount(venta.saldo_efectivo ?? null),
      importeGestoria: resolveAmount(venta.importe_gestoria ?? null),
      importeEscribania: resolveAmount(venta.importe_escribania ?? null),
      resultadoOperativo: explicitResult ?? marginHistorical ?? marginReposicion,
      resultStatus,
      comparable,
      incomplete,
      rotacionDias: rotationDays,
      deliveryEstado: delivery?.estado ?? null,
      deliveryFecha: delivery?.fecha_entrega ?? null,
      vendedor: seller,
      vehiculo: vehicle,
      vehiculoRecibido: vehicleReceived,
      gastosTotales: sumByCurrency(expenseRows as Array<Record<string, any>>, "monto", "moneda"),
      pagosTotales: sumByCurrency(paymentRows as Array<Record<string, any>>, "importe", "moneda"),
      pagosPorTipo: buildBreakdowns(paymentRows, "medio"),
      gastosPorTipo: buildBreakdowns(expenseRows, "tipo"),
    };
  });
}

function averageByCurrency(rows: RentaRow[], accessor: (row: RentaRow) => number | null) {
  const totals = new Map<string, { total: number; count: number }>();

  for (const row of rows) {
    if (row.estado?.toLowerCase() === "anulada") continue;
    if (!row.comparable) continue;

    const value = accessor(row);
    if (value == null) continue;

    const currency = normalizeCurrency(row.moneda);
    const current = totals.get(currency) ?? { total: 0, count: 0 };
    current.total += value;
    current.count += 1;
    totals.set(currency, current);
  }

  return sortCurrencyEntries(
    Array.from(totals.entries()).map(([currency, entry]) => ({
      currency,
      total: entry.count ? entry.total / entry.count : 0,
    }))
  );
}

export function calculateRentaKpis(rows: RentaRow[]): RentaKpis {
  const activeRows = rows.filter((row) => row.estado?.toLowerCase() !== "anulada");
  const resultadoOperativo = sumByCurrency(
    activeRows.filter((row) => row.resultStatus !== "mixed" && row.resultStatus !== "sin_datos"),
    "resultadoOperativo",
    "moneda"
  );
  const marginPromedio = averageByCurrency(activeRows, (row) => row.resultadoOperativo ?? row.margenHistorico ?? row.margenReposicion ?? null);
  const rotationRows = activeRows.filter((row) => row.rotacionDias != null);
  const rotationAverage = rotationRows.length
    ? Math.round(rotationRows.reduce((total, row) => total + (row.rotacionDias ?? 0), 0) / rotationRows.length)
    : null;

  return {
    operacionesRegistradas: activeRows.length,
    resultadoOperativo: resultadoOperativo,
    margenPromedio: marginPromedio,
    rotacionPromedio: rotationAverage,
    operacionesIncompletas: activeRows.filter((row) => row.incomplete).length,
    operacionesConDatos: activeRows.filter((row) => row.comparable && row.resultStatus !== "sin_datos").length,
  };
}
