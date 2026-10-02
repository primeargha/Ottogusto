"use client";

// @ts-ignore
import "../styles/global.css";
import React, { useRef, useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { StyleRegistry, createStyleRegistry } from "styled-jsx";
// eslint-disable-next-line @next/next/no-document-import-in-page
import { Main } from "next/document";
import { flush } from "@gluestack-ui/nativewind-utils/flush";
// @ts-ignore
import { AppRegistry } from "react-native-web";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { BrandsProvider } from "@/contexts/BrandsContext";
import { CategoriesProvider } from "@/contexts/CategoriesContext";
import { SavedCarsProvider } from "@/contexts/SavedCarsContext";
import CarsInitialMakesPrefetch from "@/components/CarsInitialMakesPrefetch";

type Props = {
  children: React.ReactNode;
  // ✅ Optional - won't break existing usage
  initialTranslations?: any;
  initialLang?: string;
};

export default function StyledJsxRegistry({ children, initialTranslations, initialLang }: Props) {
  // Only create stylesheet once with lazy initial state
  // x-ref: https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
  const [jsxStyleRegistry] = useState(() => createStyleRegistry());
  const isServerInserted = useRef(false);

  useServerInsertedHTML(() => {
    AppRegistry.registerComponent("Main", () => Main);
    const { getStyleElement } = AppRegistry.getApplication("Main");
    if (!isServerInserted.current) {
      isServerInserted.current = true;
      const styles = [getStyleElement(), jsxStyleRegistry.styles(), flush()];
      jsxStyleRegistry.flush();
      return <>{styles}</>;
    }
  });

  return (
    <StyleRegistry registry={jsxStyleRegistry}>
      <BrandingProvider initialTranslations={initialTranslations} initialLang={initialLang || "en"}>
        <BrandsProvider>
          <CarsInitialMakesPrefetch />
          <CategoriesProvider>
            <SavedCarsProvider>{children}</SavedCarsProvider>
          </CategoriesProvider>
        </BrandsProvider>
      </BrandingProvider>
    </StyleRegistry>
  );
}
