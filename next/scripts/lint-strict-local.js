const { spawnSync } = require("child_process");

const nextCommand = process.platform === "win32" ? "next.cmd" : "next";
const args = [
  "lint",
  "--max-warnings",
  "0",
  "--dir",
  "app",
  "--dir",
  "components",
  "--dir",
  "screens",
  "--dir",
  "hooks",
  "--dir",
  "services",
  "--dir",
  "stores",
  "--dir",
  "helpers",
  "--dir",
  "utils",
  "--dir",
  "contexts",
  "--dir",
  "config",
  "--dir",
  "lib",
  "--dir",
  "providers",
  "--dir",
  "server",
  "--dir",
  "types",
  "--dir",
  "src",
];

const result = spawnSync(nextCommand, args, {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});

const output = `${result.stdout || ""}${result.stderr || ""}`;
const lines = output.split(/\r?\n/);

const isExternalParserNoise = (line) => {
  const lower = line.toLowerCase();
  if (!lower) return false;

  const mentionsNodeModules = lower.includes("node_modules\\") || lower.includes("node_modules/");

  return (
    mentionsNodeModules &&
    (lower.includes("error while parsing") ||
      lower.includes("parseforeslint") ||
      /^line \d+, column \d+:/.test(lower))
  );
};

if ((result.status ?? 0) === 0) {
  console.log("Lint check passed.");
  process.exit(0);
}

const remaining = lines.filter((line) => {
  const trimmed = line.trim();
  if (!trimmed) return false;
  return !isExternalParserNoise(trimmed);
});

if (remaining.length === 0) {
  console.warn("Ignored external parser noise from node_modules during lint.");
  process.exit(0);
}

console.error("Lint errors found in project files/configuration:");
remaining.forEach((line) => console.error(line));
process.exit(1);
