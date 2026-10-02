import React from "react";
import { PlaceholderMap } from "@/types/globalTypes";
import { SimplePolicyLink } from "@/components/PolicyViewer";
import { useBranding } from "@/contexts/BrandingContext";
import Link from "next/link";
import { getRouteLocaleString } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import { useParams } from "next/navigation";
function renderDynamicLabel(text: string, placeholderMap: PlaceholderMap) {
  // Build a regex from the keys of the mapping
  const regex = new RegExp(
    `(${Object.keys(placeholderMap)
      .map((k) => k.replace(/[[\]]/g, "\\$&"))
      .join("|")})`,
    "g",
  );
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, idx) =>
        placeholderMap[part]
          ? React.cloneElement(placeholderMap[part] as React.ReactElement, { key: idx })
          : part,
      )}
    </>
  );
}
const Termsandconditioncom = () => {
  const { getLabel, getLocale } = useBranding();
  const params = useParams();
  const linkTextClass = `cursor-pointer text-color-text-link typography-caption underline decoration-solid underline-offset-auto`;

  function renderLegalNotice(text: string) {
    // Split the text by the placeholders and map to components
    const parts = text.split(/(\[Terms and Conditions\]|\[Privacy Policy\])/g);
    return (
      <>
        {parts.map((part, idx) => {
          if (part === "[Terms and Conditions]") {
            return (
              <SimplePolicyLink key={idx} policyType="terms" className={linkTextClass}>
                {getLabel("terms_n_conditions_head")}
              </SimplePolicyLink>
            );
          }
          if (part === "[Privacy Policy]") {
            return (
              <SimplePolicyLink key={idx} policyType="privacy" className={linkTextClass}>
                {getLabel("privacy_policy")}
              </SimplePolicyLink>
            );
          }
          return part;
        })}
      </>
    );
  }

  const legalNoticePlaceholders = {
    "[Return Policy]": (
      <Link href={getRouteLocaleString(Routes.returnPolicy, params)} className={linkTextClass}>
        {getLabel("return_policy")}
      </Link>
    ),
    "[Terms and Conditions]": (
      <SimplePolicyLink policyType="terms" className={linkTextClass}>
        {getLabel("terms_n_conditions_head")}
      </SimplePolicyLink>
    ),
    "[Privacy Policy]": (
      <SimplePolicyLink policyType="privacy" className={linkTextClass}>
        {getLabel("privacy_policy")}
      </SimplePolicyLink>
    ),
  };
  return (
    <>
      <span className="w-full text-wrap text-center text-color-text-default typography-caption">
        {renderDynamicLabel(getLabel("checkout_legalNotice_text2"), legalNoticePlaceholders)}
      </span>
    </>
  );
};

export default Termsandconditioncom;
