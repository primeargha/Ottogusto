import Image from "next/image";
import CancelSquare from "@/assets/search/cancel-square.svg";
import { Box } from "@/components/ui/box";
import { useBranding } from "@/contexts/BrandingContext";
import Typography from "@/components/og-components/Typography";
const ModalHeader = ({ onClose }: { onClose: () => void }) => {
  const { getLabel } = useBranding();
  return (
    <Box className="flex h-[76px] flex-row items-center justify-between border-b bg-[var(--color-beige-800)] shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25)] base:px-[24px] base:pb-[12px] base:pt-[24px]">
      <Typography type="h2" className="text-color-primary-main">
        {getLabel("search_by_oe_ref")}
      </Typography>
      <button onClick={onClose} className="block p-4 md:hidden">
        <Image src={CancelSquare} alt="Cancel" height={28} width={28} />
      </button>
    </Box>
  );
};
export default ModalHeader;
