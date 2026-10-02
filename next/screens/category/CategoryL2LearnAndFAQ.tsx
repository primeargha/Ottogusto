"use client";

import React from "react";
import { Box } from "@/components/ui/box";
import Typography from "@/components/og-components/Typography";
import type { CategoryNode } from "@/types/categories";
import { useBranding } from "@/contexts/BrandingContext";
import { useMedia } from "@/hooks/useMedia";
import { formatTitle } from "@/helpers/UtilityHelper";
import { useRecentlyViewedProductStore } from "@/stores/useRecentlyViewedProductStore";
import { collectCategoryFaqs } from "./categoryFaqCollect";

interface CategoryL2LearnAndFAQProps {
  l2Category: CategoryNode;
  faqLocale: string;
}

export default function CategoryL2LearnAndFAQ({
  l2Category,
  faqLocale,
}: CategoryL2LearnAndFAQProps) {
  const { getLabel } = useBranding();
  const title = l2Category.titles?.[faqLocale] || l2Category.name || "";
  const description = l2Category.descriptions?.[faqLocale] || l2Category.descriptions?.en || "";
  const isMobile = useMedia("(max-width: 639px)");
  const faqs = collectCategoryFaqs(l2Category, faqLocale);
  const { recentlyViewed } = useRecentlyViewedProductStore();
  const localeForTitle = faqLocale as "en" | "fr" | "nl";
  const fullDescription =
    l2Category.fullDescriptions?.[faqLocale] || l2Category.fullDescriptions?.en || "";

  return (
    <>
      {(fullDescription || faqs.length > 0) && (
        <Box
          className={`gap-stack section-standard ${fullDescription || faqs.length > 0 ? "" : "hidden"}`}
        >
          <Box className="">
            <Box className="h-[1px] w-full bg-color-border-default" />
          </Box>
          <Box
            className={`grid grid-cols-1 gap-stack gtlg:grid-cols-2 ${isMobile && "gap-stack"} `}
          >
            {/* Left column - Learn More */}
            {fullDescription ? (
              <Box className="flex flex-col gap-3">
                <Typography type="h2" className="text-color-text-emphasis typography-heading-03">
                  {getLabel("Category_Page_learn_more")} {formatTitle(title, localeForTitle)}
                </Typography>

                <Typography className="whitespace-pre-line leading-relaxed text-color-text-muted typography-body-02">
                  {fullDescription}
                </Typography>
              </Box>
            ) : (
              faqs?.length > 0 && (
                <>
                  <Box className="flex flex-col gap-3">
                    <Typography
                      type="h2"
                      className="text-color-text-emphasis typography-heading-03"
                    >
                      {getLabel("Category_page_FAQ")} {formatTitle(title, localeForTitle)}
                    </Typography>

                    <Box className="flex flex-col gap-space-md">
                      {faqs?.map((faq) => (
                        <Box key={faq.id} className="flex flex-col gap-space-xs">
                          <Typography
                            type="h3"
                            className="text-color-text-muted typography-heading-04"
                          >
                            {faq?.question}
                          </Typography>
                          <Typography className="text-color-text-muted typography-body-02">
                            {faq?.answer}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </>
              )
            )}

            {isMobile && fullDescription && faqs?.length > 0 && (
              <Box className="bg-color-border-defaut h-[1px] w-full border" />
            )}
            {/* Right column - FAQ */}
            {fullDescription && faqs?.length > 0 && (
              <Box className="flex flex-col gap-space-md layout-width-text">
                <Typography type="h2" className="text-color-text-emphasis typography-heading-03">
                  {getLabel("Category_page_FAQ")} {formatTitle(title, localeForTitle)}
                </Typography>

                <Box className="flex flex-col gap-space-md">
                  {faqs?.map((faq) => (
                    <Box key={faq.id} className="flex flex-col gap-space-xs">
                      <Typography type="h3" className="text-color-text-muted typography-heading-04">
                        {faq?.question}
                      </Typography>
                      <Typography className="text-color-text-muted typography-body-02">
                        {faq?.answer}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          {recentlyViewed?.length > 0 && <Box className="h-[1px] w-full bg-color-border-default" />}
        </Box>
      )}
    </>
  );
}
