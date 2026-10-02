import Image from "next/image";
import CancelSquare from "@/assets/search/cancel-square.svg";
import LeftArrow from "@/assets/adv-search/left-arrow.svg";
import { Box } from "@/components/ui/box";
import Typography from "@/components/og-components/Typography";

interface AdvSearchHeaderProps {
  openVia: string | null;
  onClose: () => void;
  onBack: () => void;
  getLabel: (key: string) => string;
  step?: number;
  labelText?: string;
}

const AdvSearchHeader = (props: AdvSearchHeaderProps) => {
  const { onBack, onClose, getLabel, openVia, step, labelText } = props;
  // debugger;
  return (
    <Box className="mb-[12px] flex h-[76px] flex-row items-center justify-between border-b bg-color-background-l2 p-[24px] gtsm:rounded-[8px]">
      {openVia === null && (
        <>
          <Image
            className="ml-[6px] cursor-pointer"
            src={LeftArrow}
            alt="Back"
            height={32}
            width={32}
            onClick={onBack}
          />
          <Typography
            type="h2"
            className="grow pl-[-50px] pl-[14px] font-Overpass text-2xl font-bold leading-[26px] text-color-text-body"
          >
            {getLabel("advanced_search")}
          </Typography>
        </>
      )}
      {openVia !== null && (
        <>
          {openVia == "og-search-by-car" && step === 2 && (
            <Image
              className="ml-[6px] cursor-pointer"
              src={LeftArrow}
              alt="Back"
              height={32}
              width={32}
              onClick={onBack}
            />
          )}
          {openVia == "og-search" && step === 3 && (
            <Image
              className="ml-[6px] cursor-pointer"
              src={LeftArrow}
              alt="Back"
              height={32}
              width={32}
              onClick={onBack}
            />
          )}
          <Typography
            type="h2"
            className="grow pl-[-50px] pl-[14px] font-Overpass text-2xl font-bold leading-[26px] text-color-text-body"
          >
            {/* {getLabel("select_category")} */}
            {labelText ? labelText : getLabel("select_category")}
          </Typography>
        </>
      )}

      {/* Desktop View */}
      <button onClick={onClose} className="hidden p-1 gtlg:block">
        <Image src={CancelSquare} alt="Cancel" height={38} width={38} />
      </button>

      {/* Tablet */}
      <button onClick={onClose} className="hidden p-1 gtsm:block gtlg:hidden">
        <Image src={CancelSquare} alt="Cancel" height={48} width={48} />
      </button>

      {/* Mobile View */}
      <button onClick={onClose} className="block p-1 gtsm:hidden">
        <Image src={CancelSquare} alt="Cancel" height={30} width={30} />
      </button>
    </Box>
  );
};

export default AdvSearchHeader;
