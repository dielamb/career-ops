import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: [
      "tests/**/*.test.{ts,tsx}",
      "lib/__tests__/**/*.test.{ts,tsx}",
      "app/api/__tests__/**/*.test.{ts,tsx}",
    ],
    exclude: ["e2e/**", "node_modules/**", ".next/**"],
    environmentMatchGlobs: [
      ["app/api/**", "node"],
    ],
    globals: true,
  },
});
