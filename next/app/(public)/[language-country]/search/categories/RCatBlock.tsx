import { Box } from "@/components/ui/box";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import React from "react";
import { Spinner } from "@/components/ui/spinner";
import { PartsCategoryInterface } from "@/stores/useAdvancedSearchStore";
import { useNewCategorySearchStore } from "@/stores/useNewCategorySearchStore";
import { useCategorySearchStore } from "@/stores/useCategorySearchStore";

import OGCategoriesSearcBlockNewModal from "@/components/og-components/OGCategoriesSearcBlockNewModal";
import { L1CategoriesBlock } from "./L1CategoriesBlock";
import { ScrollView } from "@/components/ui/scroll-view";

type Props = {
  noScroll: boolean;
};

const RCatBlock = (props: Props) => {
  const { noScroll = false } = props;

  const { L1CatExpanded, setL1CatExpanded, setL2CatExpanded } = useNewCategorySearchStore();

  const handleExpand = ({
    id,
    parentId,
    expanded,
  }: {
    id: string;
    parentId: string;
    expanded: boolean;
  }) => {
    setL1CatExpanded(id);
    setL2CatExpanded(null);
  };

  if (noScroll) {
    return <L1CategoriesBlock />;
  }
  return (
    <ScrollView className="max-h-[calc(100vh-160px)] scrollbar-hide">
      <L1CategoriesBlock />
    </ScrollView>
  );
};

export default RCatBlock;
