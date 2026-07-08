import { PageLoadingSkeleton } from "@/components/shared/page-loading-skeleton";

export default function Loading() {
  return <PageLoadingSkeleton titleWidth="w-48" subtitleWidth="w-80" cards={5} tableRows={6} />;
}
