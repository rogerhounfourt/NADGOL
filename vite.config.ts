import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";

// No deploy o app sai como app.html, para a raiz (/) ser decidida pelas regras do vercel.json:
// nadgolacademy.com.br e www mostram a landing; os demais endereços (app., escolas) abrem o app.
const appComoAppHtml = {
  name: "app-como-app-html",
  apply: "build" as const,
  closeBundle() {
    const dir = path.resolve(import.meta.dirname, "dist/public");
    if (fs.existsSync(path.join(dir, "index.html"))) fs.renameSync(path.join(dir, "index.html"), path.join(dir, "app.html"));
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss(), appComoAppHtml],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "wouter"],
          charts: ["recharts"],
          supabase: ["@supabase/supabase-js", "@tanstack/react-query"],
        },
      },
    },
  },
  server: { port: 3000, strictPort: false, host: true },
});
