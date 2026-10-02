import ProductMatchingCarsClient from "./productmatchingcars-client";
import { Product } from "@/types/product";
import { CarItem } from "@/types/cars";

const ProductMatchingCars = async ({
  partId,
  product,
  language,
  matchingcars,
}: {
  partId: string;
  product?: Product | undefined;
  language?: string;
  matchingcars?: { data: CarItem[] };
}) => {
  // if (!matchingcars?.data || matchingcars.data.length === 0) {
  //   return null;
  // }

  return <ProductMatchingCarsClient product={product} matchingcars={matchingcars} />;
};

export default ProductMatchingCars;
