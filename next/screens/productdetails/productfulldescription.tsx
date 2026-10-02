"use client";

import { useEffect, useState } from "react";
import { Box } from "@/components/ui/box";
// import { Pressable } from "@/components/ui/pressable";
import { useBranding } from "@/contexts/BrandingContext";
import { useTheme } from "@/hooks/useThemeConfig";
import Typography from "@/components/og-components/Typography";
import { OGDiscountButton } from "@/components/og-components/OGDiscountButton";
import Productinfomessage from "./productinfomessage";
import { normalizeProductDocs } from "./constants";
import { getBrandById } from "@/services/search";
import Image from "next/image";
const Productfulldescription = ({ className, data }: { className?: string; data: any }) => {
  const { getLabel } = useBranding();
  const [fulldesc, setfulldesc] = useState(false);
  const [lineLimit, setLineLimit] = useState(8);
  const theme = useTheme();
  const normalizedDocs = normalizeProductDocs(data?.docs);
  const hasDocs = normalizedDocs.length > 0;

  const [brandImage, setBrandImage] = useState<string | null>(null);
  // True once the brand-logo fetch below has settled — lets the block below reserve
  // a fixed-size placeholder only while a logo is actually pending, matching the same
  // fix already applied to the mobile title block in productdetails.tsx, so the badges
  // row below it doesn't get pushed down once the logo (or lack thereof) is known.
  const [brandImageChecked, setBrandImageChecked] = useState(false);
  const isBrandedPart = Boolean(data?.manufacturerId && data?.manufacturerType !== "OEM");

  useEffect(() => {
    const fetchData = async () => {
      if (!data?.manufacturerId || data?.manufacturerType === "OEM") {
        setBrandImage(null); // ensure it's cleared
        setBrandImageChecked(true);
        return;
      }

      const res = await getBrandById(data.manufacturerId);

      setBrandImage(res.data.image || null);
      setBrandImageChecked(true);
    };

    setBrandImageChecked(false);
    fetchData();
  }, [data?.manufacturerId, data?.manufacturerType]);
  const getLineLimitByWidth = (width: number): number => {
    if (width < 1024) return 15;
    if (width > 1650) return 22;

    const base = 1024;
    const step = 50;
    const maxLimit = 20;
    const calculated = 8 + Math.floor((width - base) / step);
    return Math.min(calculated, maxLimit);
  };

  useEffect(() => {
    const updateLineLimit = () => {
      const width = window.innerWidth;
      setLineLimit(getLineLimitByWidth(width));
    };

    updateLineLimit();
    window.addEventListener("resize", updateLineLimit);
    return () => window.removeEventListener("resize", updateLineLimit);
  }, []);

  const scrollToTechDocs = () => {
    let attempts = 0;
    const tick = () => {
      const el = document.getElementById("technical-docs-divider");
      if (!el) {
        if (attempts++ < 25) window.setTimeout(tick, 100);
        return;
      }
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    tick();
  };
  return (
    <>
      <Box className={`flex w-full items-start gap-space-lg ${className}`}>
        <Box className="hidden flex-col gap-space-xs gtlg:flex">
          <Typography
            type="p"
            className={`cursor-default text-color-text-body typography-heading-01`}
          >
            {data?.title || "[title]"}
          </Typography>
          {/* {data.manufacturerType !== "OEM" && brandImage && (
            )} */}
          {isBrandedPart && !brandImageChecked && (
            <Box className="animate-pulse h-[50px] w-[100px] rounded bg-color-background-emphasis" />
          )}
          {brandImageChecked && brandImage && (
            <Image
              src={brandImage}
              alt="Brand Logo"
              width={100}
              height={50}
              quality={100}
              className="object-contain"
              unoptimized
            />
          )}
          {data?.description !== undefined && data?.description !== "" && (
            <Box className="flex flex-row items-center justify-start gap-space-xs">
              <Box
                className="text-color-text-default typography-subtitle-01"
                // @ts-ignore
                dangerouslySetInnerHTML={{
                  __html: data?.description,
                }}
              ></Box>
            </Box>
          )}

          <Box className="flex flex-row gap-space-xs">
            {data?.manufacturerType === "OEM" ? (
              <>
                <OGDiscountButton
                  type="muted"
                  color="info"
                  label={getLabel("OEM_part")}
                  trailingIcon={true}
                  tooltipText="oem_tooltip_info"
                  headingContent="original_manufacturer_text"
                />

                <OGDiscountButton
                  type="muted"
                  color="warning"
                  label={getLabel("original_brand") + " " + data?.manufacturer}
                  trailingIcon={false}
                />
              </>
            ) : data?.manufacturerType === "AMS" ? (
              <OGDiscountButton
                type="muted"
                color="neutral"
                label={getLabel("product_tag_ams")}
                tooltipText="ams_tooltip_info"
                headingContent="ams_tooltip_text"
                trailingIcon={true}
              />
            ) : data?.manufacturerType === "OES" ? (
              <OGDiscountButton
                type="muted"
                color="warning"
                label={getLabel("product_tag_oes")}
                tooltipText="oes_tooltip_info"
                headingContent="oes_tooltip_text"
                trailingIcon={true}
              />
            ) : (
              <OGDiscountButton type="muted" color="neutral" label={getLabel("non_oe_Reference")} />
            )}
          </Box>
        </Box>

        {/* product table deatils section */}
        <Box className="flex w-full gap-space-sm gtsm:flex-row gtlg:flex-col">
          <Box className="flex w-full flex-row gap-space-sm">
            <Box
              className={`flex h-full flex-col items-start justify-between border-b border-t border-color-border-default p-space-2xs base:w-full gtsm:w-full ${data?.manufacturerType === "OEM" ? "gtlg:w-full gtlg:max-w-full" : "w-auto"} `}
            >
              <Box className="text-color-text-muted typography-caption">
                {getLabel("manufacturer")}
              </Box>
              <Box className="text-color-text-emphasis typography-caption">
                {data?.manufacturer}
              </Box>
            </Box>
            {data?.manufacturerType === "OEM" ? (
              <Box className="flex h-full flex-col items-start justify-between border-b border-t border-color-border-default p-space-2xs base:w-full gtsm:w-full gtlg:w-full gtlg:max-w-full">
                {" "}
                <Typography className="text-color-text-muted typography-caption">
                  {getLabel("oe_reference")}
                </Typography>
                <Typography className="text-color-text-emphasis typography-caption">
                  {data?.oeReference}
                </Typography>
              </Box>
            ) : (
              <Box className="flex h-full flex-col items-start justify-between border-b border-t border-color-border-default p-space-2xs base:w-full gtsm:w-full">
                <Typography className="text-color-text-muted typography-caption">
                  {getLabel("non_oe_Reference")}
                </Typography>
                <Typography className="text-color-text-emphasis typography-caption">
                  {data?.oeReference}
                </Typography>
              </Box>
            )}
            {data?.eanCode && (
              <Box className="hidden h-full flex-col items-start justify-between border-b border-t border-color-border-default p-space-2xs gtsm:flex gtsm:w-full gtlg:w-full">
                <Typography className="text-color-text-muted typography-caption">
                  {getLabel("ean")}
                </Typography>
                <Box className="text-color-text-emphasis typography-caption">{data?.eanCode}</Box>
              </Box>
            )}
          </Box>
          <Box className="flex w-full flex-row gap-space-sm">
            {/* Mobile-only EAN block (hidden gtsm+, where EAN shows in the info-box row instead) */}
            {data?.eanCode !== undefined && (
              <Box className="flex w-full flex-col items-start justify-around border-b border-t border-color-border-default p-space-2xs gtsm:hidden">
                <Box className="text-color-text-muted typography-caption">{getLabel("ean")}</Box>
                <Box className="text-color-text-emphasis typography-caption">{data?.eanCode}</Box>
              </Box>
            )}
            {/* Dimensions block, gtsm+ only — mobile has its own copy below */}
            {data?.length !== undefined &&
              data?.width !== undefined &&
              data?.height !== undefined &&
              data?.length > 0 &&
              data?.width > 0 &&
              data?.height > 0 && (
                <Box className="hidden flex-col items-start justify-center border-b border-t border-color-border-default p-space-2xs gtsm:flex gtsm:w-[185px] gtsm:max-w-[190px] gtlg:w-full gtlg:max-w-full">
                  <Box className="text-color-text-muted typography-caption">
                    {getLabel("package_dimensions")}
                  </Box>
                  <Box className="text-color-text-emphasis typography-caption">
                    {data?.length} x {data?.width} x {data?.height}
                    {/* {getLabel("cm")} {getLabel("package_dimensions_unit")} */}
                  </Box>
                </Box>
              )}

            {/* Weight Block (always evaluated separately) */}
            {/* {data?.weight !== undefined && (
              <Box className="flex base:hidden base:w-full gtsm:flex gtsm:w-[129px] gtsm:max-w-[129px] gtlg:flex gtlg:w-full gtlg:max-w-full">
                <Box className="flex h-full w-full flex-col items-start justify-between border-b border-t border-color-border-default p-space-2xs">
                  <Box className="text-color-text-muted typography-caption">
                    {getLabel("package_weight")}
                  </Box>
                  <Box className="text-color-text-emphasis typography-caption">
                    {data?.weight}
                    {getLabel("weight_unit")}
                  </Box>
                </Box>
              </Box>
            )} */}

            {data?.length !== undefined &&
              data?.width !== undefined &&
              data?.height !== undefined &&
              data?.length > 0 &&
              data?.width > 0 &&
              data?.height > 0 && (
                <Box className="flex flex-col items-start justify-center border-b border-t border-color-border-default p-space-2xs base:flex base:w-full gtsm:hidden gtsm:w-[185px] gtsm:max-w-[190px] gtlg:hidden gtlg:w-full gtlg:max-w-full">
                  <Box className="text-color-text-muted typography-caption">
                    {getLabel("package_dimensions")}
                  </Box>
                  <Box className="text-color-text-emphasis typography-caption">
                    {data?.length} x {data?.width} x {data?.height}
                    {/* {getLabel("cm")} {getLabel("package_dimensions_unit")} */}
                  </Box>
                </Box>
              )}
          </Box>

          {/* {data?.weight !== undefined && (
            <Box className="flex base:flex base:w-full gtsm:hidden gtsm:w-[129px] gtsm:max-w-[129px] gtlg:hidden gtlg:w-full gtlg:max-w-full">
              <Box className="flex h-full w-full flex-col items-start justify-between border-b border-t border-color-border-default p-space-2xs">
                <Box className="text-color-text-muted typography-caption">
                  {getLabel("package_weight")}
                </Box>
                <Box className="text-color-text-emphasis typography-caption">
                  {data?.weight}
                  {getLabel("weight_unit")}
                </Box>
              </Box>
            </Box>
          )} */}
          {hasDocs && (
            <Box className="flex w-full flex-col border-b border-t border-color-border-default p-space-2xs">
              <Typography className="text-color-text-muted typography-caption">
                {getLabel("technical_documentation")}
              </Typography>
              <button
                type="button"
                onClick={scrollToTechDocs}
                className="w-fit bg-transparent p-0 text-left"
              >
                <Typography className="cursor-pointer text-color-text-link underline typography-link-03">
                  {normalizedDocs.length} {getLabel("available")}
                </Typography>
              </button>
            </Box>
          )}
        </Box>

        <Productinfomessage />

        {typeof data?.fullDescription === "string" && data.fullDescription.trim() !== "" && (
          // line-clamp-5 (~112px at typography-body-02's line-height) keeps this
          // under the shared ~128px skeleton reserve (ProductDetailsPageLoading.tsx)
          // on mobile, regardless of how long a given product's fullDescription is —
          // otherwise a client-side route transition between PDPs with different
          // description lengths shifts everything below it. Desktop/tablet unchanged.
          <Box className="line-clamp-5 whitespace-pre-line text-wrap text-color-text-muted typography-body-02 gtsm:line-clamp-none gtsm:h-auto">
            {data.fullDescription}
          </Box>
        )}
      </Box>
    </>
  );
};

export default Productfulldescription;
