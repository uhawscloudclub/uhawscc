import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    // Proxy /api/* to the Express server during local dev.
    // Run `npm run dev:api` in a second terminal so both servers are up.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Compress images at build time — uses sharp (already a devDep).
    // Outputs optimised JPEG/PNG/WebP into dist without changing import paths.
    mode !== "development" && ViteImageOptimizer({
      png:  { quality: 80 },
      jpeg: { quality: 80 },
      jpg:  { quality: 80 },
      webp: { quality: 80 },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // es2020 covers all modern browsers + iOS 14+ / Android Chrome 80+
    // without the polyfill overhead of es2015 targets
    target: "es2020",
    // Never emit sourcemaps in production — they expose source code
    sourcemap: false,
    rollupOptions: {
      output: {
        // Function form catches all sub-packages (e.g. 20+ @radix-ui/* packages,
        // recharts + its d3 deps) into dedicated cacheable chunks that survive
        // across deploys, regardless of which pages import them.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("recharts") || id.includes("/d3-"))
            return "vendor-charts";
          if (id.includes("@radix-ui") || id.includes("use-sync-external-store"))
            return "vendor-radix";
          if (id.includes("framer-motion"))
            return "vendor-motion";
          // scheduler is react-dom's own runtime dependency (imported at module
          // scope); leaving it unassigned lets Rollup auto-chunk it separately
          // from vendor-react, which risks cross-chunk init-order bugs at
          // runtime ("X is not a function" deep in the vendor-react bundle).
          if (id.includes("react-dom") || id.includes("/scheduler/") || /\/react\//.test(id))
            return "vendor-react";
          if (id.includes("react-router"))
            return "vendor-router";
          if (
            id.includes("react-hook-form") ||
            id.includes("@hookform") ||
            id.includes("/zod/")
          )
            return "vendor-forms";
        },
      },
    },
  },
}));
