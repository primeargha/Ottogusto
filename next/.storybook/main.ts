import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: [
    "../components/**/*.story.@(js|jsx|ts|tsx)",
    // "../src/**/*.mdx",
    // "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
    "@storybook/addon-styling-webpack",
  ],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  staticDirs: ["../public"],
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "react-native": "react-native-web",
      "react-native-svg": "react-native-svg-web",
    };

    // This is the key: tell esbuild to treat .js files as jsx (for node_modules/react-native-css-interop)
    config.optimizeDeps = config.optimizeDeps || {};
    config.optimizeDeps.esbuildOptions = config.optimizeDeps.esbuildOptions || {};
    config.optimizeDeps.esbuildOptions.loader = {
      ...(config.optimizeDeps.esbuildOptions.loader || {}),
      ".js": "jsx",
    };

    return config;
  },
};
export default config;
