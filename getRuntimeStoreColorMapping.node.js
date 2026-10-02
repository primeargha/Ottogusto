var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// getRuntimeStoreColorMapping.node.ts
var getRuntimeStoreColorMapping_node_exports = {};
__export(getRuntimeStoreColorMapping_node_exports, {
  getRuntimeStoreColorMapping: () => getRuntimeStoreColorMapping
});
module.exports = __toCommonJS(getRuntimeStoreColorMapping_node_exports);

// next/config/client-theme-config.ts
var ottogustoTheme = {
  Color: {
    White: "#FFFFFF",
    Black: "#000000",
    Piston: {
      50: "#EDFCF3",
      100: "#D3F8E2",
      200: "#ACEFC9",
      300: "#75E0AB",
      400: "#3ECA89",
      500: "#1AAF6F",
      600: "#0C8E58",
      700: "#0B714A",
      800: "#0C5A3C",
      "900M": "#0A4932",
      950: "#042A1D",
      Muted: "#AEC1BA"
    },
    Racing: {
      50: "#ECFEF4",
      100: "#CDFDE2",
      200: "#A1F8CB",
      300: "#66EFB0",
      400: "#28DE91",
      500: "#08C47A",
      600: "#01A063",
      700: "#008052",
      "800M": "#016341",
      900: "#025338",
      950: "#012F20"
    },
    Traffic: {
      50: "#EDFFF5",
      100: "#D6FFEA",
      200: "#B0FFD5",
      300: "#71FFB6",
      400: "#30FB8F",
      500: "#00E56F",
      600: "#03BF58",
      "700M": "#009F4D",
      800: "#07753C",
      900: "#076034",
      950: "#00361C",
      Muted: "#BBD7C9"
    },
    Highway: {
      50: "#FEFCE8",
      100: "#FFFBC2",
      200: "#FFF386",
      300: "#FFE543",
      "400M": "#FFD31A",
      500: "#EEB801",
      600: "#CE8E00",
      700: "#A46504",
      800: "#884E0C",
      900: "#733F11",
      950: "#422105",
      Muted: "#FFFFFF"
    },
    Beige: {
      200: "#FCFCFB",
      600: "#F7F7F3",
      800: "#F2F1EB",
      "200-Overlay": "#FCFCFB",
      "200-Overlay-2": "#FCFCFB",
      "600-Overlay": "#F7F7F3",
      "800-Overlay": "#F2F1EB"
    },
    Chrome: {
      50: "#F5F4F0",
      200: "#EBE9E2",
      400: "#E1DED3",
      600: "#D7D3C5",
      800: "#CDC8B6"
    },
    Blue: {
      50: "#f0f0f0",
      100: "#DEEAF8",
      200: "#8DB7EA",
      300: "#3C91E6",
      400: "#3B78D2",
      "500M": "#707070",
      600: "#606060",
      700: "#505050",
      800: "#404040",
      900: "#303030",
      950: "#202020"
    },
    Green: {
      50: "#E5FEF6",
      100: "#E5FEF6",
      200: "#8AC0AE",
      300: "#026341",
      400: "#013B27",
      "500M": "#013B27",
      600: "#013B27",
      700: "#013B27",
      800: "#013B27",
      900: "#013B27",
      950: "#013B27"
    },
    Red: {
      50: "#FDEDEE",
      100: "#FDEDEE",
      200: "#E0868B",
      300: "#E84855",
      400: "#C83434",
      "500M": "#C83434",
      600: "#C83434",
      700: "#C83434",
      800: "#C83434",
      900: "#C83434",
      950: "#C83434"
    },
    Orange: {
      50: "#f0f0f0",
      100: "#FDF7EC",
      200: "#F3C980",
      300: "#F9A620",
      400: "#CF8D32",
      "500M": "#707070",
      600: "#606060",
      700: "#505050",
      800: "#404040",
      900: "#303030",
      950: "#202020"
    },
    Hovers: {
      // Main: "rgba(10, 73, 50, 0.3)",
      Main: "#AEC1BA",
      Error: "#EFBEBE"
    },
    Tarmac: {
      50: "#F0F9F4",
      100: "#DAF1E2",
      200: "#B7E3C9",
      300: "#87CEAA",
      400: "#54B284",
      500: "#359567",
      600: "#237852",
      700: "#1C6043",
      800: "#1A4C36",
      900: "#163F2E",
      "950M": "#0C271D"
    },
    Grey: {
      50: "#F5F6F5",
      100: "#E6E7E6",
      200: "#D0D2D0",
      300: "#ADB3B1",
      400: "#979E9B",
      500: "#68716E",
      600: "#5A605E",
      700: "#4C5250",
      800: "#434746",
      900: "#3C3E3D",
      "950M": "#252726"
    }
  },
  Font: {
    Weight: {
      Regular: "400",
      Medium: "500",
      Bold: "700"
    },
    Family: {
      Title: "Anton",
      Body: "Overpass"
    },
    LineHeight: {
      xs: "16px",
      sm: "28px",
      md: "36px",
      lg: "48px",
      xl: "64px"
    },
    Size: {
      xs: "12px",
      sm: "16px",
      md: "20px",
      lg: "24px",
      xl: "32px",
      "2xl": "40px",
      "3xl": "56px"
    }
  },
  // Feature flags - these are the features that can be conditionally used
  features: {
    vin_feature_flag: true,
    engine_trim_feature_flag: false
  }
};
var qverdeTheme = {
  Color: {
    White: "#FFFFFF",
    Green: {
      50: "#C3FFD0",
      100: "#64FF96",
      200: "#06E16D",
      300: "#08C25D",
      400: "#01A44D",
      "500M": "#03853E",
      600: "#016B31",
      700: "#005023",
      800: "#013715",
      900: "#00210B",
      950: "#011405"
    },
    Terracotta: {
      50: "#FAE6E4",
      100: "#F8CDC8",
      200: "#F39989",
      300: "#E6623C",
      400: "#AE482A",
      "500M": "#772F1A",
      600: "#632614",
      700: "#4E1C0E",
      800: "#3B1408",
      900: "#260A05",
      950: "#1A0502"
    },
    Red: {
      50: "#FDEDEE",
      100: "#FAD8D8",
      200: "#F6AFB1",
      300: "#F38286",
      400: "#F14F58",
      "500M": "#CF2B37",
      600: "#A8212B",
      700: "#7F151E",
      800: "#5A0E13",
      900: "#390508",
      950: "#290305"
    },
    Grey: {
      50: "#FCFCFC",
      100: "#F6F6F6",
      200: "#EEEEEE",
      300: "#E5E5E5",
      400: "#DDDDDD",
      500: "#D5D5D5",
      600: "#A6A6A6",
      700: "#797979",
      800: "#505050",
      900: "#2A2A2A",
      "950M": "#191919"
    },
    Black: {
      50: "#E8E8E8",
      100: "#D1D1D1",
      200: "#A3A3A3",
      300: "#797979",
      400: "#505050",
      "500M": "#2C2C2C",
      600: "#242424",
      700: "#1D1D1D",
      800: "#151515",
      900: "#0E0E0E",
      950: "#070707"
    },
    Seafoam: {
      50: "#FFFFFF",
      100: "#FBFDF8",
      200: "#F9FBF0",
      300: "#F4F8E9",
      400: "#F0F6E0",
      "500M": "#EEF5DB",
      600: "#B8BEA5",
      700: "#868878",
      800: "#595B4E",
      900: "#2D2F27",
      950: "#1B1C16",
      "L1-Overlay": "#FBFDF8",
      "L2-Overlay": "#F4F8E9",
      "L3-Overlay": "#EEF5DB"
    },
    Peach: {
      50: "#FDFCFA",
      100: "#FCF5EF",
      200: "#F9ECDD",
      300: "#F6E2CA",
      400: "#F5D9B7",
      "500M": "#F2D0A4",
      600: "#C79F62",
      700: "#937548",
      800: "#614D2E",
      900: "#342815",
      950: "#22180B"
    },
    Blue: {
      50: "#E8F2FE",
      100: "#CBE2FB",
      200: "#94C9F9",
      300: "#38AFF6",
      400: "#2C90CC",
      "500M": "#2274A5",
      600: "#195C84",
      700: "#104666",
      800: "#083149",
      900: "#031B2B",
      950: "#02121F"
    },
    Hovers: {
      Main: "#ACD5B6",
      Error: "#EFBEBE"
    },
    Scroll: {
      White: "#FFFFFF"
    },
    Orange: {
      50: "#FFF5F2",
      100: "#FCE6E1",
      200: "#F9D2C5",
      300: "#F8B8A2",
      400: "#F6A180",
      "500M": "#F58549",
      600: "#C66730",
      700: "#924B21",
      800: "#653214",
      900: "#381907",
      950: "#270F03"
    }
  },
  Font: {
    Weight: {
      Regular: "400",
      Medium: "500",
      Bold: "700"
    },
    Family: {
      Title: "Oswald",
      Body: "Public sans"
    },
    LineHeight: {
      xs: "16px",
      sm: "28px",
      md: "36px",
      lg: "48px",
      xl: "64px"
    },
    Size: {
      xs: "12px",
      sm: "16px",
      md: "20px",
      lg: "24px",
      xl: "32px",
      "2xl": "40px",
      "3xl": "56px"
    }
  },
  // Feature flags - these are the features that can be conditionally used
  features: {
    vin_feature_flag: false,
    engine_trim_feature_flag: false
  }
};
var ottogustoMobileOverrides = {
  Font: {
    LineHeight: {
      xs: "16px",
      sm: "24px",
      md: "32px",
      lg: "40px",
      xl: "48px"
    },
    Size: {
      xs: "12px",
      sm: "16px",
      md: "18px",
      lg: "20px",
      xl: "24px",
      "2xl": "32px",
      "3xl": "40px"
    }
  }
};
var qverdeMobileOverrides = {
  Font: {
    LineHeight: {
      xs: "16px",
      sm: "24px",
      md: "32px",
      lg: "40px",
      xl: "48px"
    },
    Size: {
      xs: "12px",
      sm: "16px",
      md: "18px",
      lg: "20px",
      xl: "24px",
      "2xl": "32px",
      "3xl": "40px"
    }
  }
};
var CLIENT_THEME_CONFIG = {
  // Store-specific themes
  stores: {
    ottogusto: {
      desktop: ottogustoTheme,
      mobile: {
        ...ottogustoTheme,
        Font: {
          // Deep merge for Font
          ...ottogustoTheme.Font,
          ...ottogustoMobileOverrides.Font
        }
      }
    },
    qverde: {
      desktop: qverdeTheme,
      mobile: {
        ...qverdeTheme,
        Font: {
          // Deep merge for Font
          ...qverdeTheme.Font,
          ...qverdeMobileOverrides.Font
        }
      }
    }
  },
  // Global settings
  settings: {
    mobileBreakpoint: 640,
    // px
    // Default store fallback
    defaultStore: "ottogusto"
  }
};
function getStoreFromDomain(domain) {
  try {
    const url = new URL(domain.startsWith("http") ? domain : `https://${domain}`);
    const hostname = url.hostname;
    const subdomain = hostname.split(".")[0];
    if (subdomain.startsWith("dev-")) {
      const storeCode = subdomain.substring(4);
      switch (storeCode) {
        case "og":
          return "ottogusto";
        case "qv":
          return "qverde";
        default:
          console.warn(`Unknown store code: ${storeCode}, using default store`);
          return CLIENT_THEME_CONFIG.settings.defaultStore;
      }
    }
    console.warn(`Domain pattern not recognized: ${hostname}, using default store`);
    return CLIENT_THEME_CONFIG.settings.defaultStore;
  } catch (error) {
    console.error(`Error parsing domain: ${domain}`, error);
    return CLIENT_THEME_CONFIG.settings.defaultStore;
  }
}

// getRuntimeStoreColorMapping.node.ts
function getNestedValue(obj, path) {
  return path.split(".").reduce((current, key) => {
    return current && current[key] !== void 0 ? current[key] : void 0;
  }, obj);
}
function getColorFromPath(store, colorPath) {
  try {
    const themeConfig = CLIENT_THEME_CONFIG.stores[store].desktop;
    const value = getNestedValue(themeConfig, `Color.${colorPath}`);
    if (typeof value === "string") {
      return value;
    }
  } catch (error) {
  }
  return "#000000";
}
function getRuntimeStoreColorMapping(ottogustoPath, qverdePath, options = {}) {
  let resolvedStore = "ottogusto";
  if (options.store) {
    resolvedStore = options.store;
  } else if (options.url) {
    resolvedStore = getStoreFromDomain(options.url);
  } else if (options.host) {
    resolvedStore = getStoreFromDomain(`https://${options.host}`);
  }
  if (resolvedStore === "ottogusto") {
    return getColorFromPath("ottogusto", ottogustoPath);
  }
  return getColorFromPath("qverde", qverdePath);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getRuntimeStoreColorMapping
});
