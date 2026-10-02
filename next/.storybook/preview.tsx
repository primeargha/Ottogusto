import type { Preview } from "@storybook/nextjs-vite";
import "./tailwind.css";
// import "./storybook.css";
import React from "react";
import { ThemeProvider } from "../components/ThemeProvider";
import { StoreProvider } from "../contexts/StoreContext";
import { CLIENT_THEME_CONFIG } from "../config/client-theme-config";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
    backgrounds: {
      default: "light",
      values: [
        {
          name: "light",
          value: "#ffffff",
        },
        {
          name: "dark",
          value: "#333333",
        },
      ],
    },
  },
};

export default preview;

export const decorators = [
  (Story: any) => (
    <StoreProvider currentStore={CLIENT_THEME_CONFIG.settings.defaultStore}>
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    </StoreProvider>
  ),
];
