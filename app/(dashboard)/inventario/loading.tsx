import { PageLoadingSkeleton } from "@/components/shared/page-loading-skeleton";

export default function Loading() {
  return <PageLoadingSkeleton titleWidth="w-48" subtitleWidth="w-64" cards={3} tableRows={5} />;
}
