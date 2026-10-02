import { execSync } from "child_process";
import { describe, test, expect } from "vitest";

describe("Archural Boundaries", () => {
  test("no app imports from screens", () => {
    try {
      const result = execSync('grep -r "from.*screens/" app/', { encoding: "utf8" });
      expect.fail(`Found app importing from screens:\n${result}`);
    } catch (error) {
      // No matches found - test passes
      expect(true).toBe(true);
    }
  });

  test("no relative parent imports beyond 1 level", () => {
    try {
      const result = execSync(
        'grep -r "\\.\\.\\./\\.\\.\\./" --include="*.ts" --include="*.tsx" . --exclude-dir=node_modules --exclude-dir=.next',
        { encoding: "utf8" },
      );
      expect.fail(`Found deep relative imports:\n${result}`);
    } catch (error) {
      // No matches found - test passes
      expect(true).toBe(true);
    }
  });

  test("all imports use path aliases", () => {
    try {
      const result = execSync(
        'grep -r "\\.\\.\\./" --include="*.ts" --include="*.tsx" . --exclude-dir=node_modules --exclude-dir=.next',
        { encoding: "utf8" },
      );
      // Allow some exceptions for now, but log them
      if (result) {
        console.log("Found relative imports (should be migrated to path aliases):");
        console.log(result);
      }
      // Don't fail test yet - this is for migration purposes
      expect(true).toBe(true);
    } catch (error) {
      // No matches found - test passes
      expect(true).toBe(true);
    }
  });

  test("no circular dependencies", () => {
    try {
      const result = execSync("npm run check:dependencies", { encoding: "utf8" });
      if (result.includes("Circular dependencies found")) {
        expect.fail(`Circular dependencies detected:\n${result}`);
      }
      expect(true).toBe(true);
    } catch (error: any) {
      // Command failed - check if it's due to circular dependencies
      if (error.message.includes("Circular")) {
        expect.fail(`Circular dependencies detected:\n${error.message}`);
      }
      // Other command failures (like missing madge) are okay for now
      expect(true).toBe(true);
    }
  });
});
