import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  { ignores: ["prisma/migrations/**"] },
  {
    // The existing UI predates this config and uses plain <a>/<img> tags
    // throughout by design (no client-side route transitions anywhere in
    // the app). Downgraded to warnings rather than build-breaking errors
    // so lint stays useful without forcing an unrelated, app-wide rewrite.
    rules: {
      "@next/next/no-html-link-for-pages": "warn",
      "@next/next/no-img-element": "warn"
    }
  }
];

export default eslintConfig;
