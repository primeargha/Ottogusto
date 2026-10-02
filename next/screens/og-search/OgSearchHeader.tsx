import Image from "next/image";
import CancelSquare from "@/assets/search/cancel-square.svg";
import { Box } from "@/components/ui/box";
import { useSearchModalStore } from "@/stores/useSearchModalStore";
import { useBranding } from "@/contexts/BrandingContext";
import Typography from "@/components/og-components/Typography";

const OgSearchHeader = ({ onClose }: { onClose: () => void }) => {
  const { ogSearchModalContent } = useSearchModalStore();
  const { getLabel } = useBranding();
  const getTitle = () => {
    if (ogSearchModalContent === "saved") return getLabel("search_by_saved_car");
    if (ogSearchModalContent === "car") return getLabel("search_by_car");
    if (ogSearchModalContent === "category") return getLabel("search_by_category");
    if (ogSearchModalContent === "oe") return getLabel("search_by_oe_ref");
    return getLabel("search_by_car");
  };

  return (
    <Box className="flex h-auto flex-row items-center justify-between border-b base:px-[24px] base:pb-[12px] base:pt-[24px]">
      <Typography type="h2" className="text-color-text-body">
        {getTitle()}
      </Typography>
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

export default OgSearchHeader;
