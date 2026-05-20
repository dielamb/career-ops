import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: [
      "tests/**/*.test.{ts,tsx}",
      "lib/__tests__/**/*.test.{ts,tsx}",
      "app/api/__tests__/**/*.test.{ts,tsx}",
      "components/__tests__/**/*.test.{ts,tsx}",
    ],
    exclude: ["e2e/**", "node_modules/**", ".next/**"],
    environmentMatchGlobs: [
      ["app/api/**", "node"],
    ],
    globals: true,
  },
});
