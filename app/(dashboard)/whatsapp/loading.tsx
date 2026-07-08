import { PageLoadingSkeleton } from "@/components/shared/page-loading-skeleton";

export default function Loading() {
  return <PageLoadingSkeleton titleWidth="w-32" subtitleWidth="w-80" cards={4} tableRows={5} />;
}
