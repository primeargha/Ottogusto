import { useTheme } from "@/hooks/useThemeConfig";
import { STORE_IDS } from "@/config/store-constants";

export function useProductTheme() {
  const theme = useTheme();
  const store = theme.currentStore;
  const device = theme.currentDevice;
  const antonfont = "font-[family-name:var(--font-family-title)]";
  const overpassfont = "font-[family-name:var(--font-family-body)]";
  const texttarmac950black700 =
    store === STORE_IDS.OTTOGUSTO ? "text-[--color-tarmac-950m]" : "text-[--color-black-700]";
  const textpiston900black700 =
    store === STORE_IDS.OTTOGUSTO ? "text-[--color-piston-900m]" : "text-[--color-black-700]";
  const viabeige600seafoam200 =
    store === STORE_IDS.OTTOGUSTO ? "via-[--color-beige-600]/70" : "via-[--color-seafoam-200]/70";
  const borderpiston900green500 =
    store === STORE_IDS.OTTOGUSTO ? "border-[--color-piston-900m]" : "border-[--color-green-500m]";
  const traffic700green500 =
    store === STORE_IDS.OTTOGUSTO ? "text-[--color-traffic-700m]" : "text-[--color-green-500m]";
  const textpiston900green500 =
    store === STORE_IDS.OTTOGUSTO ? "text-[--color-piston-900m]" : "text-[--color-green-500m]";
  const bgpiston900green500 =
    store === STORE_IDS.OTTOGUSTO ? "bg-[--color-piston-900m]" : "bg-[--color-green-500m]";
  const bgblue100blue50 =
    store === STORE_IDS.OTTOGUSTO ? "bg-[--color-blue-100]" : "bg-[--color-blue-50]";
  const bordergrey500grey300 =
    store === STORE_IDS.OTTOGUSTO ? "border-[--color-grey-500]" : "border-[--color-grey-300]";
  const borderchrome800Peach400 =
    store === STORE_IDS.OTTOGUSTO ? "border-[--color-chrome-800]" : "border-[--color-peach-400]";
  const whitebackground = "bg-[--color-white]";
  const whitetextcolor = "text-[--color-white]";
  const hovercolor = "hover:bg-[var(--color-piston-900m)]/30";
  const body_regular_xs_sm = device === "mobile" ? "body-regular-xs" : "body-regualar-sm";
  return {
    antonfont,
    overpassfont,
    texttarmac950black700,
    textpiston900black700,
    viabeige600seafoam200,
    whitebackground,
    whitetextcolor,
    traffic700green500,
    bgpiston900green500,
    bgblue100blue50,
    bordergrey500grey300,
    borderpiston900green500,
    borderchrome800Peach400,
    textpiston900green500,
    hovercolor,
    body_regular_xs_sm,
  };
}
