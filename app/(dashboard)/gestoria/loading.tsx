import { PageLoadingSkeleton } from "@/components/shared/page-loading-skeleton";

export default function Loading() {
  return <PageLoadingSkeleton titleWidth="w-40" subtitleWidth="w-72" cards={4} tableRows={5} />;
}
