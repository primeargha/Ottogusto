"use client";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Divider } from "@/components/ui/divider";
import { ChevronDownIcon, ChevronUpIcon } from "@/components/ui/icon";
import { useBranding } from "@/contexts/BrandingContext";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box } from "@/components/ui/box";
import { useSearchParams } from "next/navigation";
import { OGTextInput } from "@/components/og-components/OGTextInput";

type Props = {
  min: number;
  max: number;
  onChange: (val: [number, number]) => void;
};

const PriceMeterNew = ({ min, max, onChange }: Props) => {
  const { getLabel } = useBranding();
  const searchParams = useSearchParams();

  // When minPrice === maxPrice the API omits both attributes from its response,
  // so min/max arrive as NaN, undefined, or equal values. In that case fall back
  // to the full default range (0–50000) so the UI stays usable.
  const isDegenerate = !min || !max || min === max || isNaN(min) || isNaN(max);
  const effectiveMin = isDegenerate ? 0 : min;
  const effectiveMax = isDegenerate ? 50000 : max;

  const minParam = searchParams?.get("minPrice") || effectiveMin;
  const maxParam = searchParams?.get("maxPrice") || effectiveMax;

  const [value, setValue] = useState<[number, number]>([effectiveMin, effectiveMax]);
  const [tempValue, setTempValue] = useState<[number | "", number | ""]>([
    Number(minParam),
    Number(maxParam),
  ]);

  const safeMin =
    tempValue[0] === "" || isNaN(Number(tempValue[0])) ? effectiveMin : Number(tempValue[0]);
  const safeMax =
    tempValue[1] === "" || isNaN(Number(tempValue[1])) ? effectiveMax : Number(tempValue[1]);

  const debounceRef: any = useRef<NodeJS.Timeout | null>(null);
  const onChangeRef = useRef(onChange);
  const isFirstRender = useRef(true);

  // Update onChange ref when it changes to avoid stale closures
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Sync with props when min/max change
  useEffect(() => {
    setValue([effectiveMin, effectiveMax]);
    setTempValue([Number(minParam), Number(maxParam)]);
  }, [effectiveMin, effectiveMax, minParam, maxParam]);

  const handlePriceRangeUpdate = useCallback((val: [number, number]) => {
    setTempValue(val);

    const [minVal, maxVal] = val;

    if (minVal === undefined || maxVal === undefined || isNaN(minVal) || isNaN(maxVal)) {
      return;
    }

    // 🚫 STOP if invalid range
    if (minVal > maxVal) {
      if (debounceRef?.current) {
        clearTimeout(debounceRef.current);
      }
      return;
    }

    // ✅ clear previous debounce
    if (debounceRef?.current) {
      clearTimeout(debounceRef.current);
    }

    // ✅ only valid range gets debounced
    debounceRef.current = setTimeout(() => {
      setValue(val);

      if (onChangeRef.current) {
        onChangeRef.current(val);
      }
    }, 1000);
  }, []);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <Accordion
      size="lg"
      variant="unfilled"
      type="single"
      isCollapsible={true}
      isDisabled={false}
      className="w-full"
      defaultValue={["a"]}
    >
      <AccordionItem value="a">
        <AccordionHeader>
          <AccordionTrigger className="px-0 py-3">
            {({ isExpanded }: { isExpanded: boolean }) => (
              <>
                <AccordionTitleText className="text-start">{getLabel("price")}</AccordionTitleText>
                {isExpanded ? (
                  <AccordionIcon as={ChevronUpIcon} />
                ) : (
                  <AccordionIcon as={ChevronDownIcon} />
                )}
              </>
            )}
          </AccordionTrigger>
        </AccordionHeader>

        <Divider />

        <AccordionContent className="mt-[18px] gap-6 pl-[5px] pr-[5px]">
          <RangeSlider
            id="range-slider-price"
            max={effectiveMax}
            min={effectiveMin}
            value={[safeMin, safeMax]}
            onInput={handlePriceRangeUpdate}
          />

          <Box className="flex flex-row justify-between">
            <Box className="flex h-10 w-20 items-center justify-center rounded border px-2 py-2">
              <Box>
                <OGTextInput
                  value={tempValue[0] === "" ? "" : tempValue[0]?.toString()}
                  onChange={(e) => {
                    const raw = e;
                    if (raw.length > 5) return;
                    // ✅ allow empty input
                    if (raw === "") {
                      setTempValue(["", tempValue[1]]);
                      return;
                    }

                    const val = Number(raw);
                    if (isNaN(val)) return;

                    const updated: [number | "", number | ""] = [val, tempValue[1]];
                    setTempValue(updated);
                    if (updated[0] !== "" && updated[1] !== "") {
                      handlePriceRangeUpdate(updated as [number, number]);
                    }
                  }}
                  onBlur={() => {
                    let val = tempValue[0];

                    // ✅ if empty → reset to effectiveMin
                    if (val === "") val = effectiveMin;

                    val = Math.max(
                      effectiveMin,
                      Math.min(val, Number(tempValue[1]) || effectiveMax),
                    );

                    const updated: [number, number] = [val, Number(tempValue[1]) || effectiveMax];
                    setTempValue(updated);
                    handlePriceRangeUpdate(updated);
                  }}
                  className="w-20"
                />
              </Box>
            </Box>
            <Box className="flex h-10 w-20 items-center justify-center rounded border px-2 py-2">
              <Box>
                <OGTextInput
                  value={tempValue[1] === "" ? "" : String(tempValue[1])}
                  onChange={(e) => {
                    const raw = e;

                    // ✅ Allow empty typing
                    if (raw.length > 6) return;
                    if (raw === "") {
                      setTempValue([tempValue[0], ""]);
                      return;
                    }

                    // ✅ Allow only digits
                    if (!/^\d+$/.test(raw)) return;

                    let val = Number(raw);

                    // ✅ Prevent exceeding effectiveMax
                    if (val > effectiveMax) {
                      val = effectiveMax;
                    }

                    const updated: [number | "", number | ""] = [tempValue[0], val];
                    setTempValue(updated);

                    if (updated[0] !== "" && updated[1] !== "") {
                      handlePriceRangeUpdate(updated as [number, number]);
                    }
                  }}
                  onBlur={() => {
                    let val = tempValue[1];

                    // ✅ If empty → fallback to 1 (or min)
                    if (val === "") {
                      val = 1;
                    }

                    val = Math.min(
                      effectiveMax,
                      Math.max(val, Number(tempValue[0]) || effectiveMin),
                    );

                    const updated: [number, number] = [Number(tempValue[0]) || effectiveMin, val];

                    setTempValue(updated);
                    handlePriceRangeUpdate(updated);
                  }}
                  className="w-20"
                />
              </Box>
            </Box>
          </Box>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default PriceMeterNew;
