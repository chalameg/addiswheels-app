import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
    // 👇 Add this block to disable the "no-explicit-any" rule
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["off", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      }],
      "react-hooks/exhaustive-deps": "off",
      "react/no-unescaped-entities": "off",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "import/no-anonymous-default-export": "off",
      "import/no-default-export": "off",
      "react/jsx-key": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-empty-function": "off",

    },
  },

  // ⛔️ Add ignore pattern for generated code
  {
    ignores: ["src/generated/**"],
  },
];

export default eslintConfig;
