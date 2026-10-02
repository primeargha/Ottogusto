const { getRuntimeStoreColorMapping } = require("../getRuntimeStoreColorMapping.node.js");

const fs = require("fs").promises;
const path = require("path");

const staticSrcPath = path.join(__dirname, ".next/static");
const staticDestPath = path.join(__dirname, ".next/standalone/.next/static");

const publicSrcPath = path.join(__dirname, "public");
const publicDestPath = path.join(__dirname, ".next/standalone/public");

const standaloneNodeModulesPath = path.join(__dirname, ".next/standalone/node_modules");

const greenTick = `\x1b[32m\u2713\x1b[0m`;
const redCross = `\x1b[31m\u274C\x1b[0m`;

function copyAssets(src, dest) {
  return fs
    .mkdir(dest, { recursive: true })
    .then(() => fs.readdir(src, { withFileTypes: true }))
    .then((items) => {
      const promises = items?.map((item) => {
        const srcPath = path.join(src, item.name);
        const destPath = path.join(dest, item.name);

        if (item.isDirectory()) {
          return copyAssets(srcPath, destPath);
        } else {
          return fs.copyFile(srcPath, destPath);
        }
      });
      return Promise.all(promises);
    })
    .catch((err) => {
      console.error(`Error: ${err}`);
      throw err;
    });
}

/**
 * Ensure packages that Sentry/APM load dynamically are present in the standalone
 * output. Next file tracing can miss ESM entrypoints like meriyah.mjs.
 */
async function ensureStandaloneRuntimePackages() {
  const packagesToCopy = ["meriyah"];

  for (const packageName of packagesToCopy) {
    // Prefer the project install path. meriyah's package "exports" block
    // require.resolve("meriyah/package.json"), so resolve via filesystem.
    const srcPath = path.join(__dirname, "node_modules", packageName);
    try {
      await fs.access(path.join(srcPath, "package.json"));
    } catch {
      console.warn(`Skipping standalone copy for "${packageName}" (not installed)`);
      continue;
    }

    const destPath = path.join(standaloneNodeModulesPath, packageName);

    // meriyah's runtime failure specifically needs dist/meriyah.mjs present.
    const requiredEntry =
      packageName === "meriyah"
        ? path.join(destPath, "dist", "meriyah.mjs")
        : path.join(destPath, "package.json");

    try {
      await fs.access(requiredEntry);
      console.log(`${greenTick} Standalone already has ${packageName}`);
      continue;
    } catch {
      // Missing or incomplete — copy from install tree.
    }

    await copyAssets(srcPath, destPath);
    console.log(`${greenTick} Copied ${packageName} into standalone node_modules`);
  }
}

function moveCssImportsToTop(css) {
  // Match full @import statements that end with a semicolon
  const importRegex = /@import\s+url\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)\s*;/gi;

  const imports = css.match(importRegex) || [];
  const withoutImports = css.replace(importRegex, "").trim();

  return imports.join("\n") + "\n\n" + withoutImports;
}

async function generateStorybookTailwindCss() {
  try {
    const cssDir = path.join(__dirname, ".next/static/css");
    const storybookDir = path.join(__dirname, ".storybook");
    const outputCssPath = path.join(storybookDir, "tailwind.css");

    await fs.mkdir(storybookDir, { recursive: true });

    const entries = await fs.readdir(cssDir, { withFileTypes: true });
    const cssFiles = entries
      .reverse()
      .filter((e) => e.isFile() && e.name.endsWith(".css"))
      ?.map((e) => path.join(cssDir, e.name));

    if (cssFiles.length === 0) {
      console.warn("No built CSS files found in .next/static/css to copy for Storybook.");
      return;
    }

    const contents = await Promise.all(cssFiles?.map((f) => fs.readFile(f, "utf8")));
    const cssVarsforTheme = await colorMappings();
    const banner = `/* Auto-generated from Next build at ${new Date().toISOString()} */\n`;
    let combined = banner + contents.join("\n\n") + `${cssVarsforTheme}`;

    // short css
    combined = moveCssImportsToTop(combined);

    await fs.writeFile(outputCssPath, combined, "utf8");
  } catch (err) {
    console.error(`\x1b[31m\u274C\x1b[0m Failed to write Storybook Tailwind CSS: ${err}`);
  }
}

const colorMappings = async () => {
  // Only run on client-side after hydration
  // if (typeof window === "undefined") return;

  // Define all the color mappings that need to be injected
  const colorMappings = [
    { name: "color-primary-main", ottogusto: "Piston.900M", qverde: "Green.500M" },
    { name: "color-primary-hover", ottogusto: "Piston.800", qverde: "Green.600" },
    { name: "color-primary-disabled", ottogusto: "Piston.Muted", qverde: "Green.50" },
    { name: "color-secondary-main", ottogusto: "Traffic.700M", qverde: "Green.500M" },
    { name: "color-secondary-hover", ottogusto: "Traffic.800", qverde: "Green.600" },
    { name: "color-secondary-disabled", ottogusto: "Traffic.Muted", qverde: "Green.50" },
    { name: "color-accent-main", ottogusto: "Highway.400M", qverde: "Red.500M" },
    // new
    { name: "color-accent-hover", ottogusto: "Highway.500", qverde: "Red.600" },
    { name: "color-accent-dark", ottogusto: "Highway.700", qverde: "Red.700" },
    { name: "color-accent-light", ottogusto: "Highway.100", qverde: "Red.300" },
    { name: "color-background-none", ottogusto: "White", qverde: "White" },
    { name: "color-background-l1", ottogusto: "Beige.200", qverde: "Seafoam.100" },
    { name: "color-background-l2", ottogusto: "Beige.600", qverde: "Seafoam.200" },
    { name: "color-background-l3", ottogusto: "Beige.800", qverde: "Seafoam.300" },
    { name: "color-background-l4", ottogusto: "Chrome.50", qverde: "Peach.50" },
    { name: "color-background-l5", ottogusto: "Chrome.200", qverde: "Peach.100" },
    { name: "color-background-l6", ottogusto: "Chrome.400", qverde: "Peach.200" },
    { name: "color-background-l7", ottogusto: "Chrome.600", qverde: "Peach.300" },
    { name: "color-background-l8", ottogusto: "Chrome.800", qverde: "Peach.400" },
    { name: "color-background-overlay", ottogusto: "Grey.950M", qverde: "Black.950M" },
    { name: "color-background-brand", ottogusto: "Piston.900M", qverde: "Green.500M" },
    { name: "color-text-body", ottogusto: "Tarmac.950M", qverde: "Black.700" },
    { name: "color-text-placeholder", ottogusto: "Grey.700", qverde: "Black.400" },
    { name: "color-text-disabled", ottogusto: "Grey.500", qverde: "Black.300" },
    { name: "color-text-on-dark", ottogusto: "White", qverde: "White" },
    { name: "color-text-on-brand", ottogusto: "Highway.400M", qverde: "White" },
    { name: "color-neutral-main", ottogusto: "Grey.300", qverde: "Grey.500M" },
    { name: "color-neutral-disabled", ottogusto: "Grey.100", qverde: "Grey.300" },
    { name: "color-neutral-hover", ottogusto: "Grey.400", qverde: "Grey.600" },
    { name: "color-system-warning-extra-light", ottogusto: "Orange.100", qverde: "Orange.100" },
    { name: "color-system-warning-light", ottogusto: "Orange.200", qverde: "Orange.300" },
    { name: "color-system-warning-main", ottogusto: "Orange.300", qverde: "Orange.500M" },
    // new
    { name: "color-system-warning-hover", ottogusto: "Orange.400", qverde: "Orange.600" },
    { name: "color-system-warning-dark", ottogusto: "Orange.400", qverde: "Orange.600" },
    { name: "color-system-info-extra-light", ottogusto: "Blue.100", qverde: "Blue.50" },
    { name: "color-system-info-light", ottogusto: "Blue.200", qverde: "Blue.200" },
    { name: "color-system-info-main", ottogusto: "Blue.300", qverde: "Blue.500M" },
    // new
    { name: "color-system-info-hover", ottogusto: "Blue.400", qverde: "Blue.600" },
    { name: "color-system-info-dark", ottogusto: "Blue.400", qverde: "Blue.700" },
    { name: "color-system-success-extra-light", ottogusto: "Green.100", qverde: "Green.50" },
    { name: "color-system-success-light", ottogusto: "Green.200", qverde: "Green.100" },
    { name: "color-system-success-main", ottogusto: "Green.300", qverde: "Green.500M" },
    // new
    { name: "color-system-success-hover", ottogusto: "Green.400", qverde: "Green.600" },
    { name: "color-system-success-dark", ottogusto: "Green.400", qverde: "Green.800" },
    { name: "color-system-error-extra-light", ottogusto: "Red.100", qverde: "Red.50" },
    { name: "color-system-error-light", ottogusto: "Red.200", qverde: "Red.200" },
    { name: "color-system-error-main", ottogusto: "Red.300", qverde: "Red.500M" },
    // new
    { name: "color-system-error-hover", ottogusto: "Red.400", qverde: "Red.600" },
    { name: "color-system-error-dark", ottogusto: "Red.400", qverde: "Red.700" },
    { name: "color-hover-action-primary", ottogusto: "Hovers.Main", qverde: "Hovers.Main" },
    { name: "color-hover-action-error", ottogusto: "Hovers.Error", qverde: "Hovers.Error" },
    { name: "color-scroll-fade-white", ottogusto: "White", qverde: "White" },
    { name: "color-scroll-fade-l1", ottogusto: "Beige.200", qverde: "Seafoam.L1-Overlay" },
    { name: "color-scroll-fade-l2", ottogusto: "Beige.600", qverde: "Seafoam.L2-Overlay" },
    { name: "color-scroll-fade-l3", ottogusto: "Beige.800", qverde: "Seafoam.L3-Overlay" },
  ];

  // Generate CSS custom properties for each color
  const cssVariables = colorMappings
    ?.map(({ name, ottogusto, qverde }) => {
      const colorValue = getRuntimeStoreColorMapping(ottogusto, qverde);
      return `--${name}: ${colorValue};`;
    })
    .join("\n    ");

  // Inject the CSS variables
  let textContent = `
  :root {
    ${cssVariables}
  }
  `;

  // return styleElement.outerHTML
  return textContent;
};

copyAssets(staticSrcPath, staticDestPath)
  .then(() => copyAssets(publicSrcPath, publicDestPath))
  .then(() => ensureStandaloneRuntimePackages())
  .then(() => console.log(`${greenTick} Assets copied successfully`))
  .then(() => generateStorybookTailwindCss())
  .catch((err) => console.error(`${redCross} Failed to copy assets: ${err}`));
