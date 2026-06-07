import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "bus-lib": new URL("../bus-lib/src/index.ts", import.meta.url).pathname,
    },
  },
});
