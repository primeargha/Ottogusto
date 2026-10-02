import { Suspense } from "react";
import CategoryL3Page from "@/screens/category/CategoryL3Page";
import CategoryPageLoading from "@/screens/category/CategoryPageLoading";

export { generateMetadata } from "@/screens/category/categoryL3Metadata";

type Props = {
  params: {
    "language-country": string;
    l1: string;
    l2: string;
    l3: string;
  };
};

export default function Page({ params }: Props) {
  return (
    <Suspense
      key={`${params["language-country"]}:${params.l1}:${params.l2}:${params.l3}`}
      fallback={<CategoryPageLoading level="l3" />}
    >
      <CategoryL3Page params={params} />
    </Suspense>
  );
}

// Optional: cache generated page for 1 hour to improve TTFB (see LIGHTHOUSE_PERFORMANCE_AUDIT.md §10.4)
export const revalidate = 3600;
