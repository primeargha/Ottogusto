// import { Box } from "@/components/ui/box";
// import Image from "next/image";
import React, { useEffect } from "react";
// import flagIcon from "@/assets/Ottogusto/Flags.svg";
import { useBranding } from "@/contexts/BrandingContext";
import { useLandingPageDataStore } from "@/stores/useLandingPageDataStore";
// import { OGHeaderButton } from "@/components/og-components/OGHeaderButton";
import { OGLangSelectorButton } from "@/components/og-components/OGLangSelector";

type Props = {
  className?: string;
};

const LangButtonPopUp = ({ className }: Props) => {
  const { changeLocale } = useBranding();
  const { locale, setLocale, getLanguageCountryStringHeader, getFlag, openLanguageSelector } =
    useLandingPageDataStore();

  const handleLanguageSelector = () => {
    openLanguageSelector();
  };
  useEffect(() => {
    changeLocale(locale.split("-")[0] || "en");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);
  return (
    <>
      <OGLangSelectorButton
        onClick={handleLanguageSelector}
        buttonIcon={getFlag()}
        text={getLanguageCountryStringHeader()}
        hasLabel={true}
        className={className || ""}
      />
    </>
  );
};

export default LangButtonPopUp;
