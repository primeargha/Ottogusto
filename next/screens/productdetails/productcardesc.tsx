import type { ReactNode } from "react";
import { Box } from "@/components/ui/box";
import OGImageCarousal from "./productimgcarousal";
import OGDescription from "./productdescription";
import NoImage from "./noImage";
import Productprice from "./productprice";
import type { ViewItemListCategoryContext } from "@/utils/gtm";
import {
  getProductImagesForCarousel,
  isCategoryPlaceholderImage,
  resolvePartImageDisplay,
} from "@/utils/partImageUtils";

const Productcardesc = ({
  data,
  language,
  defaultQty = 1,
  itemCategoryContext,
  serverMainImage,
}: {
  data: any;
  language: string | undefined;
  defaultQty?: number;
  itemCategoryContext?: ViewItemListCategoryContext | undefined;
  serverMainImage?: ReactNode;
}) => {
  const categoryIDdata = data?.categories?.[0]?.slice(0, 9) ?? "001001";
  const { src: displaySrc } = resolvePartImageDisplay(data?.images, {
    categoryId: categoryIDdata,
  });
  const carouselImages = getProductImagesForCarousel(data?.images);
  const showCarousel = carouselImages.length > 0 && !isCategoryPlaceholderImage(data?.images);

  return (
    <Box className="w-full base:flex-col base:gap-space-md gtsm:flex-col gtsm:items-start gtsm:justify-between gtsm:gap-space-lg gtlg:flex-row gtlg:items-start gtlg:justify-between gtlg:gap-space-lg">
      {showCarousel ? (
        <OGImageCarousal
          data={carouselImages}
          productTitle={data.title}
          className="between-1024-1200:w-1/2"
          serverMainImage={serverMainImage}
        />
      ) : (
        <NoImage
          imageUrl={displaySrc}
          categoryId={categoryIDdata}
          className="flex align-middle between-1024-1200:w-1/2"
        />
      )}

      <Box className="flex w-full base:flex-col base:gap-space-md gtsm:flex-col gtsm:gap-space-md gtlg:flex-row gtlg:gap-space-lg">
        <OGDescription
          data={data}
          language={language ?? "en"}
          className="base:order-2 gtsm:order-2 gtlg:order-1 between-1024-1200:w-1/2"
        />
        <Box className="flex w-auto min-w-[340px] base:order-1 gtsm:order-1 gtlg:order-2">
          <Productprice
            data={data}
            defaultQty={defaultQty}
            itemCategoryContext={itemCategoryContext}
          />
        </Box>
      </Box>
    </Box>
  );
};
export default Productcardesc;
