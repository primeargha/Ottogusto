import { OGButton } from "@/components/og-components/OGButton";
import { useBranding } from "@/contexts/BrandingContext";
import { RequestIcon } from "@/components/og-components/icons/RequestIcon";
import { getStoreFromDomain } from "@/config/client-theme-config";
import { DEFAULT_STORE } from "@/config/store-constants";
import { toTitleCase } from "@/helpers/UtilityHelper";

interface ProductRequestinformationProps {
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

const ProductRequestinformation: React.FC<ProductRequestinformationProps> = ({ data }) => {
  const { getLabel } = useBranding();
  const currentStore =
    typeof window !== "undefined" ? getStoreFromDomain(window.location.href) : DEFAULT_STORE;

  const handleRequestInformation = () => {
    const recipients = getLabel("support_email"); // "support@ottogusto.com,support@qverde.com";

    const partTitle = data?.title || data?.name || "Car part request";
    const oeReference = data?.oeReference ? ` (OE: ${data.oeReference})` : "";

    const subject = encodeURIComponent(
      // `Request information – ${partTitle}${oeReference}`
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
      //       `Hello Ottogusto Team,

      // I would like to request more information about the following part:

      // • Part name: ${partTitle}
      // • Manufacturer: ${data?.manufacturer ?? "-"}
      // • OE Reference: ${data?.oeReference ?? "-"}

      // Please let me know availability, delivery time, and any additional details.

      // Thank you,
      // `,
    );

    const mailtoUrl = `mailto:${recipients}?subject=${subject}&body=${body}`;

    window.open(mailtoUrl, "_blank");
  };

  return (
    <OGButton
      leftcomp={<RequestIcon className="text-color-text-inverse" />}
      className="flex w-full justify-around"
      size="small"
      onClick={handleRequestInformation}
    >
      {getLabel("request_information")}
    </OGButton>
  );
};

export default ProductRequestinformation;
