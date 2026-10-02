"use client";
import { useBranding } from "@/contexts/BrandingContext";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box } from "@/components/ui/box";
import { useSearchParams } from "next/navigation";
import Typography from "@/components/og-components/Typography";

type Props = {
  min: number;
  max: number;
  onChange: (val: [number, number]) => void;
  key?: string | number; // Allow passing a key to reset internal state when needed
};

const PriceMeterNew2 = ({ min, max, onChange }: Props) => {
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
    const [minVal, maxVal] = val;

    if (minVal === undefined || maxVal === undefined || isNaN(minVal) || isNaN(maxVal)) {
      setTempValue(val);
      return;
    }

    // 🚫 STOP if invalid range. minPrice === maxPrice is treated as invalid so
    // the user can never "select" an equal range — neither via the slider
    // (the controlled value won't update, so the dragged thumb snaps back to
    // the last valid position) nor via the inputs (the parent onChange just
    // doesn't fire, so no filter is applied with min === max).
    if (minVal >= maxVal) {
      if (debounceRef?.current) {
        clearTimeout(debounceRef.current);
      }
      return;
    }

    setTempValue(val);

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
    <Box className="flex w-full flex-col gap-space-xl">
      <Box className="flex flex-row items-center justify-center gap-space-xs">
        <Box className="flex h-10 w-full items-center justify-center rounded py-space-sm">
          <Box className="flex w-full flex-col items-start justify-start gap-3">
            <Typography className="text-color-text-default typography-body-02">
              {getLabel("price_filter_min_label")}
            </Typography>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={tempValue[0] === "" ? "" : tempValue[0]?.toString()}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw.length > 5) return;
                if (raw === "") {
                  setTempValue(["", tempValue[1]]);
                  return;
                }

                if (!/^\d+$/.test(raw)) return;

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

                if (val === "") val = effectiveMin;

                // Clamp typed value against the max field if it's set;
                // otherwise just keep it inside the overall range.
                const maxNum = Number(tempValue[1]);
                const upperBound = tempValue[1] !== "" && !isNaN(maxNum) ? maxNum : effectiveMax;
                val = Math.max(effectiveMin, Math.min(val, upperBound));

                // Don't auto-fill an empty max field — auto-filling with
                // effectiveMax can land on val === effectiveMax and produce
                // min === max.
                const updated: [number | "", number | ""] = [val, tempValue[1]];
                setTempValue(updated);
                if (updated[1] !== "" && !isNaN(Number(updated[1]))) {
                  handlePriceRangeUpdate([val, Number(updated[1])]);
                }
              }}
              className="w-full rounded-[4px] border border-color-border-emphasis bg-color-background-default p-[10px] text-color-text-default outline-none body-medium-sm focus:border-color-border-focus"
            />
          </Box>
        </Box>
        <Typography className="mt-9 text-color-text-default typography-body-02">-</Typography>
        <Box className="flex h-10 w-full items-center justify-center rounded py-2">
          <Box className="flex w-full flex-col items-start justify-start gap-3">
            <Typography className="text-color-text-default typography-body-02">
              {getLabel("price_filter_max_label")}
            </Typography>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={tempValue[1] === "" ? "" : String(tempValue[1])}
              onChange={(e) => {
                const raw = e.target.value;

                if (raw.length > 6) return;
                if (raw === "") {
                  setTempValue([tempValue[0], ""]);
                  return;
                }

                if (!/^\d+$/.test(raw)) return;

                let val = Number(raw);

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

                if (val === "") {
                  val = 1;
                }

                // Clamp typed value against the min field if it's set;
                // otherwise just keep it inside the overall range.
                const minNum = Number(tempValue[0]);
                const lowerBound = tempValue[0] !== "" && !isNaN(minNum) ? minNum : effectiveMin;
                val = Math.min(effectiveMax, Math.max(val, lowerBound));

                // Don't auto-fill an empty min field — auto-filling with
                // effectiveMin can land on val === effectiveMin and produce
                // min === max.
                const updated: [number | "", number | ""] = [tempValue[0], val];

                setTempValue(updated);
                if (updated[0] !== "" && !isNaN(Number(updated[0]))) {
                  handlePriceRangeUpdate([Number(updated[0]), val]);
                }
              }}
              className="w-full rounded-[4px] border border-color-border-emphasis bg-color-background-default p-[10px] text-color-text-default outline-none body-medium-sm focus:border-color-border-focus"
            />
          </Box>
        </Box>
      </Box>
      {/*  */}
      <RangeSlider
        id="range-slider-price"
        max={effectiveMax}
        min={effectiveMin}
        value={[safeMin, safeMax]}
        onInput={handlePriceRangeUpdate}
      />
    </Box>
  );
};

export default PriceMeterNew2;
