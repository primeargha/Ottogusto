export type ColorUsage = "text" | "background" | "border";

export interface ColorToken {
  label: string;
  cssVar: string;
  tailwindClass: string;
  usage: ColorUsage;
  description?: string;
}

export interface ColorSection {
  title: string;
  tokens: ColorToken[];
  description?: string;
}

function createToken(
  label: string,
  cssVar: string,
  usage: ColorUsage,
  tailwindClass?: string,
): ColorToken {
  if (tailwindClass) {
    return { label, cssVar, tailwindClass, usage };
  }

  const prefix = usage === "text" ? "text" : usage === "background" ? "bg" : "border";

  return {
    label,
    cssVar,
    tailwindClass: `${prefix}-${cssVar}`,
    usage,
  };
}

function createSemanticTokens(
  title: string,
  baseName: string,
  usage: ColorUsage,
  items: Array<{ value: string; label: string; description?: string }>,
  description?: string,
): ColorSection {
  return {
    title,
    description,
    //@ts-ignore
    tokens: items.map((item) => ({
      ...createToken(item.label, `${baseName}-${item.value}`, usage),
      description: item.description,
    })),
  };
}

export const NEW_COLOR_SECTIONS: ColorSection[] = [
  createSemanticTokens(
    "Text Colors",
    "color-text",
    "text",
    [
      { value: "emphasis", label: "Emphasis" },
      { value: "default", label: "Default" },
      { value: "muted", label: "Muted" },
      { value: "disabled", label: "Disabled" },
      { value: "inverse", label: "Inverse" },
      { value: "brand", label: "Brand" },
      { value: "neutral", label: "Neutral" },
      { value: "accent", label: "Accent" },
      { value: "link", label: "Link" },
      { value: "visited", label: "Visited Link" },
      { value: "info", label: "Info" },
      { value: "danger", label: "Danger" },
      { value: "attention", label: "Attention" },
      { value: "positive", label: "Positive" },
    ],
    "Semantic text colors aligned with the new design system.",
  ),
  createSemanticTokens(
    "Icon Colors",
    "color-icon",
    "text",
    [
      { value: "emphasis", label: "Emphasis" },
      { value: "default", label: "Default" },
      { value: "muted", label: "Muted" },
      { value: "disabled", label: "Disabled" },
      { value: "inverse", label: "Inverse" },
      { value: "brand", label: "Brand" },
      { value: "neutral", label: "Neutral" },
      { value: "accent", label: "Accent" },
      { value: "link", label: "Link" },
      { value: "visited", label: "Visited Link" },
      { value: "info", label: "Info" },
      { value: "danger", label: "Danger" },
      { value: "attention", label: "Attention" },
      { value: "positive", label: "Positive" },
    ],
    "Icon-specific semantic color tokens.",
  ),
  createSemanticTokens(
    "Background Colors",
    "color-background",
    "background",
    [
      { value: "emphasis", label: "Emphasis" },
      { value: "default", label: "Default" },
      { value: "disabled", label: "Disabled" },
      { value: "inverse", label: "Inverse" },
      { value: "brand-emphasis", label: "Brand Emphasis" },
      { value: "brand-muted", label: "Brand Muted" },
      { value: "neutral-emphasis", label: "Neutral Emphasis" },
      { value: "neutral-muted", label: "Neutral Muted" },
      { value: "accent-emphasis", label: "Accent Emphasis" },
      { value: "accent-muted", label: "Accent Muted" },
      { value: "link-emphasis", label: "Link Emphasis" },
      { value: "link-muted", label: "Link Muted" },
      { value: "visited-emphasis", label: "Visited Emphasis" },
      { value: "visited-muted", label: "Visited Muted" },
      { value: "info-emphasis", label: "Info Emphasis" },
      { value: "info-muted", label: "Info Muted" },
      { value: "danger-emphasis", label: "Danger Emphasis" },
      { value: "danger-muted", label: "Danger Muted" },
      { value: "attention-emphasis", label: "Attention Emphasis" },
      { value: "attention-muted", label: "Attention Muted" },
      { value: "positive-emphasis", label: "Positive Emphasis" },
      { value: "positive-muted", label: "Positive Muted" },
    ],
    "Core background tokens for surfaces and states.",
  ),
  createSemanticTokens(
    "Border Colors",
    "color-border",
    "border",
    [
      { value: "emphasis", label: "Emphasis" },
      { value: "default", label: "Default" },
      { value: "muted", label: "Muted" },
      { value: "disabled", label: "Disabled" },
      { value: "inverse", label: "Inverse" },
      { value: "focus", label: "Focus Ring" },
      { value: "brand", label: "Brand" },
      { value: "neutral", label: "Neutral" },
      { value: "accent", label: "Accent" },
      { value: "link", label: "Link" },
      { value: "visited", label: "Visited Link" },
      { value: "info", label: "Info" },
      { value: "danger", label: "Danger" },
      { value: "attention", label: "Attention" },
      { value: "positive", label: "Positive" },
    ],
    "Border tokens aligned with states and emphasis levels.",
  ),
  {
    title: "Button Component Tokens",
    description: "Component-scoped tokens for the button system.",
    tokens: [
      createToken("Primary BG Default", "button-primary-bg-default", "background"),
      createToken("Primary BG Hover", "button-primary-bg-hover", "background"),
      createToken("Primary BG Disabled", "button-primary-bg-disabled", "background"),
      createToken("Primary Text", "button-primary-text", "text"),
      createToken("Primary Text Disabled", "button-primary-text-disabled", "text"),
      createToken("Primary Icon", "button-primary-icon", "text"),
      createToken("Primary Icon Disabled", "button-primary-icon-disabled", "text"),

      createToken("Outline Border", "button-outline-border", "border"),
      createToken("Outline BG Disabled", "button-outline-bg-disabled", "background"),
      createToken("Outline Text", "button-outline-text", "text"),
      createToken("Outline Text Disabled", "button-outline-text-disabled", "text"),
      createToken("Outline Icon", "button-outline-icon", "text"),
      createToken("Outline Icon Disabled", "button-outline-icon-disabled", "text"),

      createToken("Ghost BG Hover", "button-ghost-bg-hover", "background"),
      createToken("Ghost Text", "button-ghost-text", "text"),
      createToken("Ghost Text Disabled", "button-ghost-text-disabled", "text"),
      createToken("Ghost Icon", "button-ghost-icon", "text"),
      createToken("Ghost Icon Disabled", "button-ghost-icon-disabled", "text"),

      createToken("Danger BG Default", "button-danger-bg-default", "background"),
      createToken("Danger BG Hover", "button-danger-bg-hover", "background"),
      createToken("Danger BG Disabled", "button-danger-bg-disabled", "background"),
      createToken("Danger Text", "button-danger-text", "text"),
      createToken("Danger Text Disabled", "button-danger-text-disabled", "text"),
      createToken("Danger Icon", "button-danger-icon", "text"),
      createToken("Danger Icon Disabled", "button-danger-icon-disabled", "text"),

      createToken("Danger Outline Border", "button-danger-outline-border", "border"),
      createToken("Danger Outline BG Disabled", "button-danger-outline-bg-disabled", "background"),
      createToken("Danger Outline Text", "button-danger-outline-text", "text"),
      createToken("Danger Outline Text Disabled", "button-danger-outline-text-disabled", "text"),
      createToken("Danger Outline Icon", "button-danger-outline-icon", "text"),
      createToken("Danger Outline Icon Disabled", "button-danger-outline-icon-disabled", "text"),

      createToken("Danger Ghost BG Hover", "button-danger-ghost-bg-hover", "background"),
      createToken("Danger Ghost Text", "button-danger-ghost-text", "text"),
      createToken("Danger Ghost Text Disabled", "button-danger-ghost-text-disabled", "text"),
      createToken("Danger Ghost Icon", "button-danger-ghost-icon", "text"),
      createToken("Danger Ghost Icon Disabled", "button-danger-ghost-icon-disabled", "text"),
    ],
  },
  {
    title: "Header Component Tokens",
    description: "Component-scoped tokens for the header system.",
    tokens: [
      createToken("Header Background", "header-background", "background"),
      createToken("Header Divider", "header-divider", "border"),
      createToken("Header Action BG Default", "header-action-bg-default", "background"),
      createToken("Header Action BG Hover", "header-action-bg-hover", "background"),
      createToken("Header Action Text", "header-action-text", "text"),
      createToken("Header Action Icon", "header-action-icon", "text"),
      createToken("Header Badge Dot BG", "header-badge-dot-bg", "background"),
      createToken("Header Badge Count BG", "header-badge-count-bg", "background"),
      createToken("Header Badge Count Text", "header-badge-count-text", "text"),
    ],
  },
  {
    title: "Footer Component Tokens",
    description: "Component-scoped tokens for the footer system.",
    tokens: [
      createToken("Footer Background", "footer-background", "background"),
      createToken("Footer Divider", "footer-divider", "border"),
    ],
  },
];

function createDeprecatedToken(
  label: string,
  cssVar: string,
  tailwindClass: string,
  usage: ColorUsage,
): ColorToken {
  return { label, cssVar, tailwindClass, usage };
}

export const DEPRECATED_COLOR_SECTIONS: ColorSection[] = [
  {
    title: "Primary Palette (Deprecated)",
    tokens: [
      createDeprecatedToken(
        "Primary Main",
        "color-deprecated-color-primary-main",
        "bg-color-primary-main",
        "background",
      ),
      createDeprecatedToken(
        "Primary Hover",
        "color-deprecated-color-primary-hover",
        "bg-color-primary-hover",
        "background",
      ),
      createDeprecatedToken(
        "Primary Disabled",
        "color-deprecated-color-primary-disabled",
        "bg-color-primary-disabled",
        "background",
      ),
    ],
  },
  {
    title: "Secondary Palette (Deprecated)",
    tokens: [
      createDeprecatedToken(
        "Secondary Main",
        "color-deprecated-color-secondary-main",
        "bg-color-secondary-main",
        "background",
      ),
      createDeprecatedToken(
        "Secondary Hover",
        "color-deprecated-color-secondary-hover",
        "bg-color-secondary-hover",
        "background",
      ),
      createDeprecatedToken(
        "Secondary Disabled",
        "color-deprecated-color-secondary-disabled",
        "bg-color-secondary-disabled",
        "background",
      ),
    ],
  },
  {
    title: "Accent Palette (Deprecated)",
    tokens: [
      createDeprecatedToken(
        "Accent Main",
        "color-deprecated-color-accent-main",
        "bg-color-accent-main",
        "background",
      ),
      createDeprecatedToken(
        "Accent Hover",
        "color-deprecated-color-accent-hover",
        "bg-color-accent-hover",
        "background",
      ),
      createDeprecatedToken(
        "Accent Dark",
        "color-deprecated-color-accent-dark",
        "bg-color-accent-dark",
        "background",
      ),
      createDeprecatedToken(
        "Accent Light",
        "color-deprecated-color-accent-light",
        "bg-color-accent-light",
        "background",
      ),
    ],
  },
  {
    title: "Background Layers (Deprecated)",
    tokens: [
      createDeprecatedToken(
        "Background None",
        "color-deprecated-color-background-none",
        "bg-color-background-none",
        "background",
      ),
      createDeprecatedToken(
        "Background L1",
        "color-deprecated-color-background-l1",
        "bg-color-background-l1",
        "background",
      ),
      createDeprecatedToken(
        "Background L2",
        "color-deprecated-color-background-l2",
        "bg-color-background-l2",
        "background",
      ),
      createDeprecatedToken(
        "Background L3",
        "color-deprecated-color-background-l3",
        "bg-color-background-l3",
        "background",
      ),
      createDeprecatedToken(
        "Background L4",
        "color-deprecated-color-background-l4",
        "bg-color-background-l4",
        "background",
      ),
      createDeprecatedToken(
        "Background L5",
        "color-deprecated-color-background-l5",
        "bg-color-background-l5",
        "background",
      ),
      createDeprecatedToken(
        "Background L6",
        "color-deprecated-color-background-l6",
        "bg-color-background-l6",
        "background",
      ),
      createDeprecatedToken(
        "Background L7",
        "color-deprecated-color-background-l7",
        "bg-color-background-l7",
        "background",
      ),
      createDeprecatedToken(
        "Background L8",
        "color-deprecated-color-background-l8",
        "bg-color-background-l8",
        "background",
      ),
      createDeprecatedToken(
        "Background Overlay",
        "color-deprecated-color-background-overlay",
        "bg-color-background-overlay",
        "background",
      ),
      createDeprecatedToken(
        "Background Brand",
        "color-deprecated-color-background-brand",
        "bg-color-background-brand",
        "background",
      ),
    ],
  },
  {
    title: "Text (Deprecated)",
    tokens: [
      createDeprecatedToken(
        "Body",
        "color-deprecated-color-text-body",
        "text-color-text-body",
        "text",
      ),
      createDeprecatedToken(
        "Placeholder",
        "color-deprecated-color-text-placeholder",
        "text-color-text-placeholder",
        "text",
      ),
      createDeprecatedToken(
        "Disabled",
        "color-deprecated-color-text-disabled",
        "text-color-text-disabled",
        "text",
      ),
      createDeprecatedToken(
        "On Dark",
        "color-deprecated-color-text-on-dark",
        "text-color-text-on-dark",
        "text",
      ),
      createDeprecatedToken(
        "On Brand",
        "color-deprecated-color-text-on-brand",
        "text-color-text-on-brand",
        "text",
      ),
    ],
  },
  {
    title: "Neutral Surface (Deprecated)",
    tokens: [
      createDeprecatedToken(
        "Neutral Main",
        "color-deprecated-color-neutral-main",
        "bg-color-neutral-main",
        "background",
      ),
      createDeprecatedToken(
        "Neutral Disabled",
        "color-deprecated-color-neutral-disabled",
        "bg-color-neutral-disabled",
        "background",
      ),
      createDeprecatedToken(
        "Neutral Hover",
        "color-deprecated-color-neutral-hover",
        "bg-color-neutral-hover",
        "background",
      ),
    ],
  },
  {
    title: "System Warning (Deprecated)",
    tokens: [
      createDeprecatedToken(
        "Warning Extra Light",
        "color-deprecated-color-system-warning-extra-light",
        "bg-color-system-warning-extra-light",
        "background",
      ),
      createDeprecatedToken(
        "Warning Light",
        "color-deprecated-color-system-warning-light",
        "bg-color-system-warning-light",
        "background",
      ),
      createDeprecatedToken(
        "Warning Main",
        "color-deprecated-color-system-warning-main",
        "bg-color-system-warning-main",
        "background",
      ),
      createDeprecatedToken(
        "Warning Hover",
        "color-deprecated-color-system-warning-hover",
        "bg-color-system-warning-hover",
        "background",
      ),
      createDeprecatedToken(
        "Warning Dark",
        "color-deprecated-color-system-warning-dark",
        "bg-color-system-warning-dark",
        "background",
      ),
    ],
  },
  {
    title: "System Info (Deprecated)",
    tokens: [
      createDeprecatedToken(
        "Info Extra Light",
        "color-deprecated-color-system-info-extra-light",
        "bg-color-system-info-extra-light",
        "background",
      ),
      createDeprecatedToken(
        "Info Light",
        "color-deprecated-color-system-info-light",
        "bg-color-system-info-light",
        "background",
      ),
      createDeprecatedToken(
        "Info Main",
        "color-deprecated-color-system-info-main",
        "bg-color-system-info-main",
        "background",
      ),
      createDeprecatedToken(
        "Info Hover",
        "color-deprecated-color-system-info-hover",
        "bg-color-system-info-hover",
        "background",
      ),
      createDeprecatedToken(
        "Info Dark",
        "color-deprecated-color-system-info-dark",
        "bg-color-system-info-dark",
        "background",
      ),
    ],
  },
  {
    title: "System Success (Deprecated)",
    tokens: [
      createDeprecatedToken(
        "Success Extra Light",
        "color-deprecated-color-system-success-extra-light",
        "bg-color-system-success-extra-light",
        "background",
      ),
      createDeprecatedToken(
        "Success Light",
        "color-deprecated-color-system-success-light",
        "bg-color-system-success-light",
        "background",
      ),
      createDeprecatedToken(
        "Success Main",
        "color-deprecated-color-system-success-main",
        "bg-color-system-success-main",
        "background",
      ),
      createDeprecatedToken(
        "Success Hover",
        "color-deprecated-color-system-success-hover",
        "bg-color-system-success-hover",
        "background",
      ),
      createDeprecatedToken(
        "Success Dark",
        "color-deprecated-color-system-success-dark",
        "bg-color-system-success-dark",
        "background",
      ),
    ],
  },
  {
    title: "System Error (Deprecated)",
    tokens: [
      createDeprecatedToken(
        "Error Extra Light",
        "color-deprecated-color-system-error-extra-light",
        "bg-color-system-error-extra-light",
        "background",
      ),
      createDeprecatedToken(
        "Error Light",
        "color-deprecated-color-system-error-light",
        "bg-color-system-error-light",
        "background",
      ),
      createDeprecatedToken(
        "Error Main",
        "color-deprecated-color-system-error-main",
        "bg-color-system-error-main",
        "background",
      ),
      createDeprecatedToken(
        "Error Hover",
        "color-deprecated-color-system-error-hover",
        "bg-color-system-error-hover",
        "background",
      ),
      createDeprecatedToken(
        "Error Dark",
        "color-deprecated-color-system-error-dark",
        "bg-color-system-error-dark",
        "background",
      ),
    ],
  },
  {
    title: "Interaction States (Deprecated)",
    tokens: [
      createDeprecatedToken(
        "Hover Action Primary",
        "color-deprecated-color-hover-action-primary",
        "bg-color-hover-action-primary",
        "background",
      ),
      createDeprecatedToken(
        "Hover Action Error",
        "color-deprecated-color-hover-action-error",
        "bg-color-hover-action-error",
        "background",
      ),
    ],
  },
  {
    title: "Scroll Fade (Deprecated)",
    tokens: [
      createDeprecatedToken(
        "Scroll Fade White",
        "color-deprecated-color-scroll-fade-white",
        "bg-color-scroll-fade-white",
        "background",
      ),
      createDeprecatedToken(
        "Scroll Fade L1",
        "color-deprecated-color-scroll-fade-l1",
        "bg-color-scroll-fade-l1",
        "background",
      ),
      createDeprecatedToken(
        "Scroll Fade L2",
        "color-deprecated-color-scroll-fade-l2",
        "bg-color-scroll-fade-l2",
        "background",
      ),
      createDeprecatedToken(
        "Scroll Fade L3",
        "color-deprecated-color-scroll-fade-l3",
        "bg-color-scroll-fade-l3",
        "background",
      ),
    ],
  },
];
