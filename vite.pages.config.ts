import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: path.resolve(__dirname, "pages-build"),
  base: process.env.GITHUB_PAGES_BASE || "./",
  publicDir: path.resolve(__dirname, "public"),
  envDir: path.resolve(__dirname),
  define: {
    "import.meta.env.VITE_HASH_ROUTER": JSON.stringify("true"),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname)],
    },
  },
  plugins: [react(), tailwindcss()],
  build: {
    outDir: path.resolve(__dirname, "dist-pages"),
    emptyOutDir: true,
  },
});
