const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function checkArchuralBoundaries() {
  console.log("🔍 Checking architectural boundaries...\n");

  // Test 1: No app imports from screens
  try {
    const result = execSync('grep -r "from.*screens/" app/', { encoding: "utf8" });
    console.log("❌ Found app importing from screens:");
    console.log(result);
    process.exit(1);
  } catch (error) {
    console.log("✅ No app imports from screens");
  }

  // Test 2: No deep relative imports
  try {
    const result = execSync(
      'grep -r "\\.\\.\\./\\.\\.\\./" --include="*.ts" --include="*.tsx" . --exclude-dir=node_modules --exclude-dir=.next',
      { encoding: "utf8" },
    );
    console.log("❌ Found deep relative imports:");
    console.log(result);
  } catch (error) {
    console.log("✅ No deep relative imports found");
  }

  // Test 3: Count relative imports for migration tracking
  try {
    const result = execSync(
      'grep -r "\\.\\.\\./" --include="*.ts" --include="*.tsx" . --exclude-dir=node_modules --exclude-dir=.next | wc -l',
      { encoding: "utf8" },
    );
    const count = parseInt(result.trim());
    console.log(`📊 Found ${count} relative imports (should be migrated to path aliases)`);
  } catch (error) {
    console.log("✅ No relative imports found");
  }

  console.log("\n🎯 Architecture check completed!");
}

checkArchuralBoundaries();
