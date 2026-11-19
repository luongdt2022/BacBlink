import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    testTimeout: 15000,
    exclude: ["node_modules", "dist", ".idea", ".git", ".cache", "e2e/**"],
  },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
