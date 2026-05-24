import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "analyze_excel.js",
    "import_accessories.js",
    "import_amazon_products.js",
    "import_csv_accessories.js",
    "inspect_excel.js",
    "list_db_products.js",
    "seed_creator_ecosystem.js",
    "test_mongo.js",
  ]),
]);

export default eslintConfig;
