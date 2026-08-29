import globals from "globals";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";
import tsParser from "@typescript-eslint/parser";
import pluginTypeScript from "@typescript-eslint/eslint-plugin";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,tsx}"], plugins: { "@typescript-eslint": pluginTypeScript }, languageOptions: { parser: tsParser, globals: globals.browser } },
  { files: ["**/*.{js,mjs,cjs,ts,tsx}"], rules: {
    "no-unused-vars": "warn",
    "no-console": "warn",
    "prefer-const": "error",
    "no-var": "error",
    "eqeqeq": "error",
    "curly": "error",
    "no-duplicate-imports": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
  }},
  { 
    files: ["**/*.{js,mjs,cjs,ts,tsx}"], 
    plugins: { react: pluginReact, "react-hooks": pluginReactHooks },
    settings: { react: { version: "detect" } }, 
    languageOptions: { 
      globals: { ...globals.browser, React: "readonly" },
      parser: tsParser
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    }
  },
]);
