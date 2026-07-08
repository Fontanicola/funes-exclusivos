import { PageLoadingSkeleton } from "@/components/shared/page-loading-skeleton";

export default function Loading() {
  return <PageLoadingSkeleton titleWidth="w-32" subtitleWidth="w-72" cards={3} tableRows={6} />;
}
