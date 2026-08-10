type SupabasePageResult<T> = {
  data: T[] | null;
  error: unknown;
};

export const SUPABASE_PAGE_SIZE = 1000;

/** Loads every page without relying on the API's default 1,000-row cap. */
export async function fetchAllSupabaseRows<T>(
  buildPage: (from: number, to: number) => PromiseLike<SupabasePageResult<T>>
) {
  const rows: T[] = [];

  for (let from = 0; ; from += SUPABASE_PAGE_SIZE) {
    const result = await buildPage(from, from + SUPABASE_PAGE_SIZE - 1);

    if (result.error) {
      return { data: [] as T[], error: result.error };
    }

    const page = result.data ?? [];
    rows.push(...page);

    if (page.length < SUPABASE_PAGE_SIZE) break;
  }

  return { data: rows, error: null };
}
