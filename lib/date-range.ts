export type DateRange = {
  from: string | null;
  to: string | null;
};

function isValidDateValue(value: string | null | undefined) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export function parseDateRange(searchParams?: {
  from?: string | string[];
  to?: string | string[];
}): DateRange {
  const from = Array.isArray(searchParams?.from) ? searchParams?.from[0] : searchParams?.from;
  const to = Array.isArray(searchParams?.to) ? searchParams?.to[0] : searchParams?.to;

  return {
    from: isValidDateValue(from) ? from! : null,
    to: isValidDateValue(to) ? to! : null,
  };
}

export function isDateInRange(value: string | null | undefined, range: DateRange) {
  if (!range.from && !range.to) return true;
  if (!value) return false;

  const date = value.slice(0, 10);
  if (range.from && date < range.from) return false;
  if (range.to && date > range.to) return false;
  return true;
}

export function filterByDateRange<T>(
  items: T[],
  range: DateRange,
  getDate: (item: T) => string | null | undefined
) {
  if (!range.from && !range.to) return items;
  return items.filter((item) => isDateInRange(getDate(item), range));
}

export function getDateRangeLabel(range: DateRange) {
  if (!range.from && !range.to) return "Todo el período";
  if (range.from && range.to && range.from.slice(0, 7) === range.to.slice(0, 7)) {
    const [year, month] = range.from.split("-").map(Number);
    return new Intl.DateTimeFormat("es-AR", { month: "short", year: "numeric" })
      .format(new Date(year, month - 1, 1))
      .replace(".", "");
  }
  return `${range.from ?? "Inicio"} - ${range.to ?? "Hoy"}`;
}
