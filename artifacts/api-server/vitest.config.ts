import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        statements: 90,
        lines: 90,
      },
      exclude: [
        "dist/**",
        "node_modules/**",
        "vitest.config.ts",
        "build.mjs",
        "src/index.ts", // entrypoint
        "src/routes/pullRequests.ts", // heavy external side-effects
        "src/routes/auth.ts", // OAuth external dependencies
        "src/lib/github.ts", // external GitHub API client
        "src/middlewares/auth.ts", // auth integration middleware
      ]
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
