import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${path.resolve(import.meta.dirname)}/` },
      // lib/lab-meta.ts uses React's server-only `cache()`. It exists only in
      // the React build Next ships for Server Components, so the tests load
      // that build the way the App Router does.
      {
        find: /^react$/,
        replacement: path.resolve(
          import.meta.dirname,
          "node_modules/next/dist/compiled/react/react.react-server.js"
        ),
      },
    ],
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
