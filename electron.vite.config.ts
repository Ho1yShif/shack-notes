import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  // Configuration for Main Process
  main: {
    resolve: {
      alias: {
        "@main": path.resolve(__dirname, "src/main"),
      },
    },
    build: {
      outDir: "dist/main",
      rollupOptions: {
        input: "src/main/main.ts",
        external: ["better-sqlite3"],
      },
    },
  },

  // Configuration for Preload Script
  preload: {
    resolve: {
      alias: {
        "@main": path.resolve(__dirname, "src/main"),
      },
    },
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
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src/renderer"),
      },
    },
    build: {
      outDir: "dist/renderer",
      rollupOptions: {
        input: "src/renderer/index.html",
      },
    },
  },
});
