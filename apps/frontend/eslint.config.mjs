import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import prettierConfigRecommended from "eslint-plugin-prettier/recommended";
import { FlatCompat } from "@eslint/eslintrc";
import { fixupConfigRules } from "@eslint/compat";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const patchedConfig = fixupConfigRules([
  ...compat.extends("next/core-web-vitals", "next/typescript"),
]);

const config = [
  ...patchedConfig,
  prettierConfigRecommended, // Last since it disables some previously set rules
  { ignores: [".next/*", "jest.config.js", "cypress.config.ts"] },
];

export default config;
