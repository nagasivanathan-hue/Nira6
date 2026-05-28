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
  {
    rules: {
      "jsx-a11y/role-has-required-aria-props": "off",
      "jsx-a11y/control-has-associated-label": "off",
      "jsx-a11y/interactive-supports-focus": "off",
      "jsx-a11y/no-interactive-element-to-noninteractive-role": "off",
      "jsx-a11y/no-static-element-interactions": "off",
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/anchor-is-valid": "off",
      "@next/next/no-img-element": "off",
      "jsx-a11y/label-has-associated-control": "off",
      "jsx-a11y/alt-text": "off",
      "jsx-a11y/heading-has-content": "off",
      "jsx-a11y/no-noninteractive-element-interactions": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "warn",
      "react/display-name": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn"
    }
  }
]);

export default eslintConfig;
