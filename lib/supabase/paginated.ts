type SupabasePageResult<T> = {
  data: T[] | null;
  error: unknown;
};

export const SUPABASE_PAGE_SIZE = 1000;
const PAGE_BATCH_SIZE = 4;

/** Loads every page without relying on the API's default 1,000-row cap. */
export async function fetchAllSupabaseRows<T>(
  buildPage: (from: number, to: number) => PromiseLike<SupabasePageResult<T>>
) {
  const rows: T[] = [];

  for (let batchStart = 0; ; batchStart += PAGE_BATCH_SIZE) {
    const results = await Promise.all(
      Array.from({ length: PAGE_BATCH_SIZE }, (_, index) => {
        const from = batchStart * SUPABASE_PAGE_SIZE + index * SUPABASE_PAGE_SIZE;
        return buildPage(from, from + SUPABASE_PAGE_SIZE - 1);
      })
    );

    for (const result of results) {
      if (result.error) {
        return { data: [] as T[], error: result.error };
      }

      rows.push(...(result.data ?? []));
    }

    const hasShortPage = results.some((result) => (result.data ?? []).length < SUPABASE_PAGE_SIZE);
    if (hasShortPage) break;
  }

  return { data: rows, error: null };
}
