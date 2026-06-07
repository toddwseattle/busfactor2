import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "bus-lib": new URL("../bus-lib/src/index.ts", import.meta.url).pathname,
    },
  },
});
