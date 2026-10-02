/** @type {import('next').NextConfig} */
const { DefinePlugin } = require("webpack");
const { withSentryConfig } = require("@sentry/nextjs");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.NEXT_PUBLIC_BUNDLE_ANALYZER === "true",
});

module.exports = {
  // output: "export",
  output: "standalone",
  images: {
    // unoptimized: true, // PERF: Disabled — let Next.js optimize images (WebP, resize, lazy-load)
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.ottogusto.group",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cp2publicstorage.blob.core.windows.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  trailingSlash: false,
  reactStrictMode: false,
  headers: async () => {
    const noIndexHeaders = [
      {
        key: "X-Robots-Tag",
        value: "noindex, nofollow, noarchive",
      },
    ];

    return [
      { source: "/:locale/telemetry/:path*", headers: noIndexHeaders },
      { source: "/:locale/test-axiom/:path*", headers: noIndexHeaders },
      { source: "/api/telemetry/:path*", headers: noIndexHeaders },
      { source: "/api/axiom", headers: noIndexHeaders },
      { source: "/api/axiom-ui", headers: noIndexHeaders },
      { source: "/monitoring", headers: noIndexHeaders },
    ];
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "lucide-react-native",
      "@headlessui/react",
      "lodash",
      "lottie-web",
      "react-use",
      "react-icons",
      "@tanstack/react-query",
      "framer-motion",
      "zod",
      "react-hook-form",
      "@hookform/resolvers",
      "@auth0/auth0-react",
      "sonner",
      "@tanstack/react-query-persist-client",
      "@tanstack/query-sync-storage-persister",
      "react-infinite-scroll-component",
      "react-range-slider-input",
      "zustand",
    ],
    instrumentationHook: true,
    // reactCompiler: true,
    serverComponentsExternalPackages: ["better-sqlite3", "../server"],
    // Sentry server utils dynamically require meriyah; file tracing can omit it from
    // standalone output and cause MODULE_NOT_FOUND / 500s on Azure App Service.
    outputFileTracingIncludes: {
      "/*": ["./node_modules/meriyah/**/*"],
      "/api/**/*": ["./node_modules/meriyah/**/*"],
    },
  },
  transpilePackages: [
    "@gluestack-ui/accordion",
    "@gluestack-ui/actionsheet",
    "@gluestack-ui/avatar",
    "@gluestack-ui/button",
    "@gluestack-ui/checkbox",
    "@gluestack-ui/divider",
    "@gluestack-ui/form-control",
    "@gluestack-ui/icon",
    "@gluestack-ui/image",
    "@gluestack-ui/input",
    "@gluestack-ui/link",
    "@gluestack-ui/menu",
    "@gluestack-ui/modal",
    "@gluestack-ui/overlay",
    "@gluestack-ui/pressable",
    "@gluestack-ui/radio",
    "@gluestack-ui/select",
    "@gluestack-ui/textarea",
    "@gluestack-ui/toast",
    "@gluestack-ui/tooltip",
    "@gluestack-ui/popover",
    "@gluestack-ui/utils",
    "@gluestack-ui/nativewind-utils",
    "nativewind",
    "react-native-css-interop",
  ],
  webpack: (config, { isServer, dev }) => {
    // Ignore server directory completely for client builds
    if (!isServer) {
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        /server\/.*\.ts$/,
        /better-sqlite3/,
      ];
    }

    // Ignore OpenTelemetry warnings on server builds
    // https://github.com/open-telemetry/opentelemetry-js/issues/4173#issuecomment-1822938936
    if (isServer) {
      config.ignoreWarnings = [...(config.ignoreWarnings || []), { module: /opentelemetry/ }];
    }

    // Suppress Sentry/OpenTelemetry "Critical dependency: require function..." warning from require-in-the-middle
    config.ignoreWarnings = [...(config.ignoreWarnings || []), { module: /require-in-the-middle/ }];

    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Transform all direct `react-native` imports to `react-native-web`
      "react-native$": "react-native-web",
      "@unitools/router": "@unitools/router-next",
      "@unitools/image": "@unitools/image-next",
      "@unitools/link": "@unitools/link-next",
      "@react-native/assets-registry/registry":
        require.resolve("@react-native/assets-registry/registry.js"),
      // Handle node: scheme imports
      "node:fs": "fs",
      "node:path": "path",
    };

    config.resolve.extensions = [
      ".web.js",
      ".web.jsx",
      ".web.ts",
      ".web.tsx",
      ...config.resolve.extensions,
    ];

    // Exclude better-sqlite3 and Node.js modules from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        "better-sqlite3": false,
      };

      // Exclude better-sqlite3 and related files from client bundle
      config.externals = {
        ...config.externals,
        "better-sqlite3": "commonjs better-sqlite3",
        fs: "commonjs fs",
        path: "commonjs path",
      };
    }

    config.plugins.push(
      new DefinePlugin({
        __DEV__: JSON.stringify(process.env.NODE_ENV !== "production"),
      }),
    );

    return config;
  },
  typescript: { ignoreBuildErrors: true },
  rewrites: async () => {
    return {
      // beforeFiles runs before both filesystem and dynamic routes
      beforeFiles: [
        // Ensure favicon files are served from public folder (not caught by dynamic routes)
        {
          source: "/qverde-favicon/:path*",
          destination: "/qverde-favicon/:path*",
        },
        {
          source: "/og-favicon/:path*",
          destination: "/og-favicon/:path*",
        },
        {
          source: "/ottogusto-favicon/:path*",
          destination: "/ottogusto-favicon/:path*",
        },
      ],
      afterFiles: [
        {
          source: "/robots.txt",
          destination: "/api/robots",
        },
      ],
      fallback: [],
    };
  },
};
// Only apply Sentry configuration if enabled
const bundleAnalyzerEnabled = process.env.NEXT_PUBLIC_BUNDLE_ANALYZER === "true";
const sentryEnabled = process.env.NEXT_PUBLIC_SENTRY_ENABLED === "true";

let baseConfig = module.exports;
baseConfig = bundleAnalyzerEnabled ? withBundleAnalyzer(baseConfig) : baseConfig;

console.info("With BundleAnalyser:", bundleAnalyzerEnabled);
console.info("With Sentry:", sentryEnabled);

module.exports = sentryEnabled
  ? withSentryConfig(baseConfig, {
      // For all available options, see:
      // https://www.npmjs.com/package/@sentry/webpack-plugin#options

      org: "capitalnumbers-n6",
      project: process.env.SENTRY_PROJECT || process.env.NEXT_PUBLIC_STORE || "ottogusto",

      // Only print logs for uploading source maps in CI
      silent: !process.env.CI,

      // For all available options, see:
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,

      // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
      // This can increase your server load as well as your hosting bill.
      // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
      // side errors will fail.
      tunnelRoute: "/monitoring",

      // Automatically tree-shake Sentry logger statements to reduce bundle size
      disableLogger: true,

      // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
      // See the following for more information:
      // https://docs.sentry.io/product/crons/
      // https://vercel.com/docs/cron-jobs
      automaticVercelMonitors: true,
    })
  : baseConfig;
