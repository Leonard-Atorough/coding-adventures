import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: ".",
  server: {
    port: 5173,
    open: true,
  },
  build: {
    target: "es2024",
    outDir: "dist",
    sourcemap: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    exclude: ["node_modules", "dist"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules", "dist", "src/**/*.test.ts", "src/**/*.spec.ts"],
    },
  },
});
