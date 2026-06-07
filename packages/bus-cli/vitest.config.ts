import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "bus-lib": new URL("../bus-lib/src/index.ts", import.meta.url).pathname,
    },
  },
  test: {
    environment: "node",
  },
});
