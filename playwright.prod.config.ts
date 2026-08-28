import { defineConfig } from "@playwright/test";
import baseConfig from "./playwright.config";

// Runs against a real `vite build` + `vite preview`, unlike playwright.config.ts
// (which points at the raw Vite dev server). manualChunks / React.lazy() code
// splitting only applies to the production build, so this is the only e2e
// config that actually exercises the real chunk graph users hit in prod.
export default defineConfig({
  ...baseConfig,
  testDir: "./e2e",
  testMatch: /prod-lazy-routes\.spec\.ts/,
  use: { ...baseConfig.use, baseURL: "http://localhost:4173" },
  webServer: {
    command: "npm run build && npm run preview -- --port 4173",
    url: "http://localhost:4173",
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
