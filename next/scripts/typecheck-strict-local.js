const { spawnSync } = require("child_process");

const result =
  process.platform === "win32"
    ? spawnSync("cmd.exe", ["/d", "/s", "/c", "npx tsc --noEmit --pretty false"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      })
    : spawnSync("npx", ["tsc", "--noEmit", "--pretty", "false"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });

if (result.error) {
  console.error("Failed to run TypeScript compiler:", result.error.message);
  process.exit(1);
}

const output = `${result.stdout || ""}${result.stderr || ""}`;
const lines = output.split(/\r?\n/);

const nodeModulesErrorRegex = /^(.+)\((\d+),(\d+)\): error TS\d+:/;
const projectErrors = [];
const ignoredErrors = [];
const unclassifiedErrors = [];

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed) continue;

  const diagnosticMatch = trimmed.match(nodeModulesErrorRegex);
  if (!diagnosticMatch) {
    if (/error TS\d+:/.test(trimmed)) {
      unclassifiedErrors.push(trimmed);
    }
    continue;
  }

  const filePath = diagnosticMatch[1];
  if (filePath.includes("node_modules/") || filePath.includes("node_modules\\")) {
    ignoredErrors.push(trimmed);
  } else {
    projectErrors.push(trimmed);
  }
}

if (projectErrors.length > 0) {
  console.error("TypeScript errors found in project files:");
  projectErrors.forEach((line) => console.error(line));
  process.exit(1);
}

if (unclassifiedErrors.length > 0) {
  console.error("TypeScript check failed with unclassified diagnostics:");
  unclassifiedErrors.forEach((line) => console.error(line));
  process.exit(1);
}

if ((result.status ?? 0) !== 0 && ignoredErrors.length === 0) {
  console.error("TypeScript check failed.");
  process.exit(result.status ?? 1);
}

if (ignoredErrors.length > 0) {
  // Keep console clean when only node_modules diagnostics exist.
}

console.log("TypeScript check passed for project files.");
process.exit(0);
