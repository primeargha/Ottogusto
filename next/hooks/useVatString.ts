import { useBranding } from "@/contexts/BrandingContext";
import { useConfig } from "@/contexts/ConfigContext";

export function useVatString() {
  const { getLabel } = useBranding();
  const config = useConfig();
  const vat = config?.vat;

  return `${getLabel("common_vatLabel_prefix")} ${vat}% ${getLabel("common_vatLabel_suffix")}`;
}
