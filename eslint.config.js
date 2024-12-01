import path from "node:path";
import fs from "node:fs/promises";
import js from "@eslint/js";
import ts from "typescript-eslint";
import esm from "eslint-plugin-import";
import unicorn from "eslint-plugin-unicorn";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import next from "@next/eslint-plugin-next";
import prettier from "eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import noRelativeImportPaths from "eslint-plugin-no-relative-import-paths";

const config = JSON.parse(
  await fs.readFile(path.resolve(import.meta.dirname, "config.json")),
);

/** @type {import('eslint').Linter.Config[]} */
export default ts.config(
  { ignores: ["*.js", "*.jsx", "*.[cm]js", ".next"] },
  js.configs.recommended,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [{ group: ["~/.*", "~/app*"] }] },
      ],
      "no-restricted-globals": [
        "error",
        "window",
        "self",
        "global",
        "globalThis",
      ],
      "no-useless-rename": "error",
      "no-useless-return": "error",
      "object-shorthand": "error",
      "arrow-body-style": "error",
      "lines-around-directive": "error",
      curly: ["error", "multi-or-nest", "consistent"],
      quotes: ["error", "double", { avoidEscape: true }],
      "no-unused-vars": "off",
    },
  },
  ts.configs.strictTypeChecked,
  ts.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        projectService: true,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { ignoreRestSiblings: true },
      ],
      "@typescript-eslint/no-explicit-any": ["error", { ignoreRestArgs: true }],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true },
      ],
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: true,
          allowConciseArrowFunctionExpressionsStartingWithVoid: true,
        },
      ],
    },
  },
  esm.flatConfigs.recommended,
  esm.flatConfigs.typescript,
  {
    settings: { "import/resolver": { typescript: true, node: true } },
    rules: {
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
      "import/no-cycle": "error",
      "import/no-self-import": "error",
      "import/no-useless-path-segments": ["error", { noUselessIndex: true }],
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: false,
          peerDependencies: false,
          bundledDependencies: false,
          optionalDependencies: false,
        },
      ],
    },
  },
  unicorn.configs["flat/recommended"],
  {
    rules: {
      "unicorn/no-null": "off",
      "unicorn/prefer-global-this": "off",
      "unicorn/prevent-abbreviations": [
        "error",
        {
          replacements: {
            lib: { library: false },
            env: { environment: false },
            ref: { reference: false },
            arg: { argument: false },
            args: { arguments: false },
            prop: { property: false },
            props: { properties: false },
            param: { parameter: false },
            params: { parameters: false },
          },
        },
      ],
    },
  },
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  {
    settings: { react: { version: "detect" } },
    rules: {
      "react/prop-types": "off",
      "react/self-closing-comp": "error",
      "react/jsx-no-useless-fragment": "error",
      "react/jsx-curly-brace-presence": "error",
      "react/jsx-boolean-value": "error",
      "react/jsx-filename-extension": [
        "error",
        { allow: "as-needed", extensions: [".tsx", ".jsx"] },
      ],
      "react/jsx-sort-props": [
        "error",
        {
          locale: config.locale,
          reservedFirst: true,
          shorthandFirst: true,
          callbacksLast: true,
        },
      ],
    },
  },
  {
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-hooks/exhaustive-deps": "error",
    },
  },
  jsxA11y.flatConfigs.recommended,
  {
    plugins: { "@next/next": next },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs["core-web-vitals"].rules,
    },
  },
  {
    plugins: { "simple-import-sort": simpleImportSort },
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["client", "server"].map((env) => `^\\u0000${env}-only$`), // Runtime environments
            ["^\\u0000[^\\.]"], // External side-effects
            ["^\\u0000~\\/"], // Internal side-effects
            ["^\\u0000\\.\\."], // Parent side-effects
            ["^\\u0000\\.[^\\.]"], // Relative side-effects
            ["\\u0000$"], // External types
            ["^~\\/.*\\u0000$"], // Internal types
            ["^\\.\\..*\\u0000$"], // Parent types
            ["^\\.[^\\.].*\\u0000$"], // Relative types
            ["^[^\\.]"], // External modules
            ["^~\\/"], // Internal modules
            ["^\\.\\."], // Parent modules
            ["^\\.[^\\.]"], // Relative modules
          ],
        },
      ],
      "simple-import-sort/exports": "error",
    },
  },
  {
    plugins: { "no-relative-import-paths": noRelativeImportPaths },
    rules: {
      "no-relative-import-paths/no-relative-import-paths": [
        "error",
        { prefix: "~", allowSameFolder: true },
      ],
    },
  },
  {
    files: [".", "lib"].map(
      (directory) => `${directory}/*.{ts,cts,mts,tsx,js,jsx}`,
    ),
    rules: {
      "no-relative-import-paths/no-relative-import-paths": [
        "error",
        { prefix: "~", allowSameFolder: false },
      ],
    },
  },
  prettier,
);
