import { OGButton } from "@/components/og-components/OGButton";
import { useBranding } from "@/contexts/BrandingContext";
import { RequestIcon } from "@/components/og-components/icons/RequestIcon";
import { getStoreFromDomain } from "@/config/client-theme-config";
import { DEFAULT_STORE } from "@/config/store-constants";
import { toTitleCase } from "@/helpers/UtilityHelper";

interface ProductRequestInfoSRPProps {
  data: {
    name?: string | undefined;
    title?: string | undefined;
    manufacturer?: string | undefined;
    oeReference?: string | undefined;
    seo?: {
      name?: string | undefined;
    };
    id?: string | undefined;
  };
}

const ProductRequestInfoSRP: React.FC<ProductRequestInfoSRPProps> = ({ data }) => {
  const { getLabel } = useBranding();

  const currentStore =
    typeof window !== "undefined" ? getStoreFromDomain(window.location.href) : DEFAULT_STORE;

  const handleRequestInformation = () => {
    const recipients = getLabel("support_email");

    const partTitle = data?.title || data?.name || "Car part request";
    const oeReference = data?.oeReference ? ` (OE: ${data.oeReference})` : "";

    const subject = encodeURIComponent(
      getLabel("email_inquiry_subject", {
        title: partTitle,
        oeRef: oeReference,
      }),
    );

    const body = encodeURIComponent(
      getLabel("email_inquiry_body", {
        store: toTitleCase(currentStore),
        title: partTitle,
        oeRef: data?.oeReference ?? "",
        manufacturer: data?.manufacturer ?? "",
      }),
    );

    const mailtoUrl = `mailto:${recipients}?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, "_blank");
  };

  return (
    <OGButton
      className="flex w-full justify-around"
      size="small"
      onClick={handleRequestInformation}
    >
      {getLabel("submit_button")}
    </OGButton>
  );
};

export default ProductRequestInfoSRP;
