"use client";

import { useTheme } from "../ThemeProvider";

export function ClientThemeExample() {
  const { currentStore, currentDevice, getValue } = useTheme();

  // Get theme values using the client hook
  const primaryColor = getValue("Color/Piston/900");
  const textColor = getValue("Color/Tarmac/950M");
  const fontSize = getValue("Font/Size/lg");
  const lineHeight = getValue("Font/LineHeight/lg");
  const fontFamily = getValue("Font/Family/Anton");
  const fontWeight = getValue("Font/Weight/Bold");

  return (
    <div
      style={{
        backgroundColor: primaryColor,
        color: textColor,
        fontSize: fontSize,
        lineHeight: lineHeight,
        fontFamily: fontFamily,
        fontWeight: fontWeight,
        padding: "20px",
        borderRadius: "8px",
        margin: "20px 0",
      }}
    >
      <h2>Client Component Theme Example</h2>
      <p>Store: {currentStore}</p>
      <p>Device: {currentDevice}</p>
      <p>Primary Color: {primaryColor}</p>
      <p>Text Color: {textColor}</p>
      <p>Font Size: {fontSize}</p>
      <p>Line Height: {lineHeight}</p>
      <p>Font Family: {fontFamily}</p>
      <p>Font Weight: {fontWeight}</p>
    </div>
  );
}
