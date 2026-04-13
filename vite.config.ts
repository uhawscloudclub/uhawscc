import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

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
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
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
        // Split heavy libraries into separate chunks so the browser can
        // cache them independently across deploys
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-router": ["react-router-dom"],
          "vendor-motion": ["framer-motion"],
        },
      },
    },
  },
}));
