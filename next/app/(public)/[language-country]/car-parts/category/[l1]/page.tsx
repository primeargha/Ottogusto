import { Suspense } from "react";
import CategoryL1Page from "@/screens/category/CategoryL1Page";
import CategoryPageLoading from "@/screens/category/CategoryPageLoading";

export { generateMetadata } from "@/screens/category/categoryL1Metadata";

type Props = {
  params: {
    "language-country": string;
    l1: string;
  };
};

export default function Page({ params }: Props) {
  return (
    <Suspense
      key={`${params["language-country"]}:${params.l1}`}
      fallback={<CategoryPageLoading level="l1" />}
    >
      <CategoryL1Page params={params} />
    </Suspense>
  );
}
