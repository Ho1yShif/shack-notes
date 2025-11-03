import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Configuration for Main Process
  main: {
    build: {
      outDir: "dist/main",
      rollupOptions: {
        input: "src/main/main.ts",
      },
    },
  },

  // Configuration for Preload Script
  preload: {
    build: {
      outDir: "dist/preload",
      rollupOptions: {
        input: "src/main/preload.ts",
      },
    },
  },

  // Configuration for Renderer Process (React app)
  renderer: {
    plugins: [react()],
    build: {
      outDir: "dist/renderer",
      rollupOptions: {
        input: "src/renderer/index.html",
      },
    },
  },
});
