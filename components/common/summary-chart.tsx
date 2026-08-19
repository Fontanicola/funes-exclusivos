import { SimpleBarChart } from "@/components/dashboard/simple-bar-chart";

type SummaryChartItem = {
  label: string;
  value: number;
  tone?: "slate" | "emerald" | "amber" | "rose" | "zinc";
  helper?: string;
};

export function SummaryChart({
  title,
  description,
  items,
  emptyLabel = "Todavía no hay datos suficientes para graficar.",
}: {
  title: string;
  description: string;
  items: SummaryChartItem[];
  emptyLabel?: string;
}) {
  return (
    <div className="rounded-md border border-[#E5E7EB] bg-[#FAFAFA] p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[#111827]">{title}</h3>
        <p className="mt-1 text-xs text-[#6B7280]">{description}</p>
      </div>
      <SimpleBarChart items={items} compact emptyLabel={emptyLabel} />
    </div>
  );
}
