import { Box } from "@/components/ui/box";
import { useBranding } from "@/contexts/BrandingContext";
import Productcompatibilityverifyinput from "./productcompatibilityverifyinput";
import Typography from "@/components/og-components/Typography";
import { Product } from "@/types/product";
import { getDocFileNameFromUrl, normalizeProductDocs } from "./constants";
import Link from "next/link";
import DocumentIcon from "./DocumentIcon";

interface ProductcompatibilityverifyProps {
  data?: Partial<Product> | undefined;
  partId?: string;
  showPotentialCompatibilitySection?: boolean;
}

const Productcompatibilityverify = ({
  data,
  partId,
  showPotentialCompatibilitySection = true,
}: ProductcompatibilityverifyProps) => {
  const { getLabel } = useBranding();
  const normalizedDocs = normalizeProductDocs(data?.docs);
  const hasDocs = normalizedDocs.length > 0;

  return (
    <Box className="bg-color-bg-secondary flex w-full flex-col gap-stack">
      <Productcompatibilityverifyinput
        partId={partId || String(data?.id ?? "")}
        {...(data?.name ? { name: data.name } : {})}
        {...(data?.title ? { title: data.title } : {})}
        {...(data?.oeReference ? { oeReference: data.oeReference } : {})}
        {...(data?.priceInclVat != null ? { price: data.priceInclVat } : {})}
      />

      {(showPotentialCompatibilitySection || hasDocs) && (
        <Box
          id="technical-docs-divider"
          className="h-[1px] w-full scroll-mt-[120px] bg-color-border-default"
        />
      )}

      {hasDocs && (
        <Box className="flex w-full flex-col gap-space-md">
          <Box className="flex w-full flex-col gap-space-xs">
            <Typography className="text-color-text-emphasis typography-heading-03">
              {getLabel("technical_documentation")}
            </Typography>
            <Typography className="text-color-text-muted typography-body-02">
              {getLabel("pdp_placeholder_text")}
            </Typography>
          </Box>
          <Box className="flex w-full flex-col gap-space-xs">
            {normalizedDocs.map((doc, index) => (
              <Link
                key={`${doc.url}-${index}`}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-auto flex-row items-center justify-start gap-3 p-2 text-button-ghost-text underline typography-body-02"
              >
                <DocumentIcon className="text-button-ghost-icon" />
                {doc.name?.trim() ? doc.name : getDocFileNameFromUrl(doc.url)}
              </Link>
            ))}
          </Box>
        </Box>
      )}

      {hasDocs && showPotentialCompatibilitySection && (
        <Box className="h-[1px] w-full bg-color-border-default" />
      )}
      {showPotentialCompatibilitySection && (
        <Box className="flex w-full items-center justify-between base:flex-col base:gap-3 gtsm:flex-row gtsm:gap-0 gtlg:flex-row gtlg:gap-0">
          <Box className="flex w-auto flex-col gap-space-xs">
            <Typography type="h2" className="text-color-text-body typography-heading-03">
              {getLabel("Compatibility_Guide")}
            </Typography>
            <Typography className="text-color-text-muted typography-body-02">
              {getLabel("compatible_Car_subtitle")}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Productcompatibilityverify;
