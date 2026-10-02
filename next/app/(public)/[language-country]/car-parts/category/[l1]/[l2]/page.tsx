import { Suspense } from "react";
import CategoryL2Page from "@/screens/category/CategoryL2Page";
import CategoryPageLoading from "@/screens/category/CategoryPageLoading";

export { generateMetadata } from "@/screens/category/categoryL2Metadata";

type Props = {
  params: {
    "language-country": string;
    l1: string;
    l2: string;
  };
};

export default function Page({ params }: Props) {
  return (
    <Suspense
      key={`${params["language-country"]}:${params.l1}:${params.l2}`}
      fallback={<CategoryPageLoading level="l2" />}
    >
      <CategoryL2Page params={params} />
    </Suspense>
  );
}
