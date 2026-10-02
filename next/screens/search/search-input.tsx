import { ChangeEvent, forwardRef } from "react";

import { Box } from "@/components/ui/box";
import Image from "next/image";
import { Text } from "@/components/ui/text";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import alert from "@/assets/search/alert.svg";
import infoCircle from "@/assets/info-circle.svg";

interface SearchInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ label, placeholder, value, onChange }, ref) => {
    const { vinValidation, searchMode } = useSearchModalStore();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    };

    return (
      <Box className="gap-3 text-center">
        <label className="block font-Overpass text-[24px] leading-[26px] text-color-text-body base:font-normal gtsm:text-[38px] gtsm:font-[700] gtsm:leading-[56px]">
          {label}
        </label>
        <Box
          className={`mx-auto flex ${!vinValidation.isValid && vinValidation.error ? "h-[150px]" : "h-[50px]"} w-full flex-col items-center justify-center px-[12px] py-[12px]`}
        >
          <Box className="w-full gtsm:px-1 gtlg:px-10">
            <input
              ref={ref}
              type="text"
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
              className="w-full border-l-2 border-l-[--brand-traffic-light-green] bg-transparent pl-2 font-Overpass text-[24px] font-bold leading-[26px] text-[--Primary-Colors-Main] [caret-color:var(--brand-traffic-light-green)] [font-feature-settings:'liga'_off,'clig'_off] placeholder:text-[--primary-colors-disabled] focus:outline-none focus:ring-0 base:placeholder:text-[18px] gtsm:placeholder:text-[24px]"
            />
          </Box>

          {searchMode === "vin" && !vinValidation.isValid && vinValidation.error && (
            <Box className="mt-4 flex w-full flex-row justify-center gap-3">
              <Image src={infoCircle} height={16} width={16} alt="alert" />
              <Text className="font-Overpass text-[16px] font-[400] leading-[18px] text-[--Text-Tarmac-Placeholder]">
                {vinValidation.error}
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
);

SearchInput.displayName = "SearchInput";

export default SearchInput;
