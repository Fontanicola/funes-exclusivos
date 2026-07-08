function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[#E5E7EB] ${className}`} />;
}

export function PageLoadingSkeleton({
  titleWidth = "w-48",
  subtitleWidth = "w-72",
  cards = 3,
  tableRows = 6,
}: {
  titleWidth?: string;
  subtitleWidth?: string;
  cards?: number;
  tableRows?: number;
}) {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <SkeletonBlock className={`h-8 ${titleWidth}`} />
        <SkeletonBlock className={`h-4 ${subtitleWidth}`} />
      </div>

      {cards ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: cards }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm"
            >
              <SkeletonBlock className="h-4 w-28" />
              <SkeletonBlock className="mt-3 h-8 w-20" />
              <SkeletonBlock className="mt-2 h-3 w-36" />
            </div>
          ))}
        </div>
      ) : null}

      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] p-4">
          <SkeletonBlock className="h-5 w-40" />
          <SkeletonBlock className="mt-2 h-4 w-60" />
        </div>
        <div className="divide-y divide-[#E5E7EB]">
          {Array.from({ length: tableRows }).map((_, index) => (
            <div key={index} className="grid gap-3 p-4 md:grid-cols-6">
              {Array.from({ length: 6 }).map((__, cellIndex) => (
                <SkeletonBlock key={cellIndex} className="h-4 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
