//@ts-ignore
import { getServerThemeValue, getCurrentServerThemeInfo } from "../../utils/server-theme";

export function ServerThemeExample() {
  const themeInfo = getCurrentServerThemeInfo();

  // Get theme values using the server utility
  const primaryColor = getServerThemeValue("Color/Piston/900");
  const textColor = getServerThemeValue("Color/Tarmac/950M");
  const fontSize = getServerThemeValue("Font/Size/lg");
  const lineHeight = getServerThemeValue("Font/LineHeight/lg");
  const fontFamily = getServerThemeValue("Font/Family/Anton");
  const fontWeight = getServerThemeValue("Font/Weight/Bold");

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
      <h2>Server Component Theme Example</h2>
      <p>Store: {themeInfo.store}</p>
      <p>Device: {themeInfo.device}</p>
      <p>Primary Color: {primaryColor}</p>
      <p>Text Color: {textColor}</p>
      <p>Font Size: {fontSize}</p>
      <p>Line Height: {lineHeight}</p>
      <p>Font Family: {fontFamily}</p>
      <p>Font Weight: {fontWeight}</p>
    </div>
  );
}
