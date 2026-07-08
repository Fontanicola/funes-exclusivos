import { PageLoadingSkeleton } from "@/components/shared/page-loading-skeleton";

export default function Loading() {
  return <PageLoadingSkeleton titleWidth="w-56" subtitleWidth="w-80" cards={0} tableRows={4} />;
}
