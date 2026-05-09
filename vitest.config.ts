import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "istanbul",
      all: false,
      exclude: [
        "**/*.d.ts",
        "**/node_modules/**",
        "**/.next/**",
        "**/coverage/**",
        "prisma/**",
      ],
      reporter: ["text", "html"],
      thresholds: {
        statements: 9,
        branches: 40,
        functions: 15,
        lines: 9,
      },
    },
  },
});