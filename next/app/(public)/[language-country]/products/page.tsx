import React from "react";

import type { MakeModelTypeBrandItem } from "@/type";
import Products from "@/screens/products/products";
import { Metadata } from "next";
import { buildAlternateLanguages } from "@/utils/hreflang";
import { Box } from "@/components/ui/box";
import LeftNavBar from "@/screens/landing/left-navbar";
import { mmtExtractFromMMTY_ID } from "@/helpers/UtilityHelper";
import { getModels, getTypes } from "@/services/search";
import { title } from "process";
import { getCategories } from "@/services/advancedSearchService";

export const generateMetadata = async ({
  params,
  searchParams,
}: {
  params: any;
  searchParams: any;
}) => {
  const { "language-country": languagecountry, partid } = params;
  const { makeModelTypeId = "", year, categoryId = false } = searchParams;

  if (categoryId) {
    const partsCategory = getCategories;
  }

  const mmytViaId = mmtExtractFromMMTY_ID(makeModelTypeId);
  if (makeModelTypeId.length >= 6) {
    if (mmytViaId.type !== "000") {
      const typeData = await getTypes({
        year: year,
        modelId: makeModelTypeId,
      });
      // if complete card detail is available
      if (typeData.data.length > 0) {
        const first = typeData.data[0];
        const brand = first?.brand ?? "";
        const model = first?.model ?? "";
        return {
          title: `${brand} ${model}`,
          description: `${brand} ${model} | Car parts`,
        };
      }
    }

    // only if model is available
    const modelData = await getModels(`${mmytViaId.makeID}${mmytViaId.modelId}`);
    let currentMakeModel = modelData.data.find((node: MakeModelTypeBrandItem) => {
      return node.id == makeModelTypeId;
    });
    if (!currentMakeModel && modelData.data.length > 0) {
      currentMakeModel = modelData.data[0];
      const brand = currentMakeModel?.brand ?? "";
      const model = currentMakeModel?.model ?? "";
      // not a model its a brand id
      if (modelData.data.length > 1) {
        return {
          title: `Looking Car Parts for ${brand}`,
          description: `Looking Car parts for all the models ${brand}`,
        };
      }
    }
    if (currentMakeModel) {
      const brand = currentMakeModel.brand ?? "";
      const model = currentMakeModel.model ?? "";
      return {
        title: `${brand} ${model}`,
        description: `${brand} ${model} | Car parts`,
      };
    }
  }

  const lang = languagecountry.split("-")[0];

  return {
    title: "Looking Car Parts",
    description: "Search car parts for",
    alternates: {
      languages: buildAlternateLanguages(`/${languagecountry}/products`),
    },
  };
};

const PrductsPage = async () => {
  return (
    <main className="z-[10] h-screen">
      <Box className="h-full w-full gtlg:pt-[75px] ml:pl-[200px]">
        <Products />
      </Box>
    </main>
  );
};

export default PrductsPage;
