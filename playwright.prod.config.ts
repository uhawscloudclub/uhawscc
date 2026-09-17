import { defineConfig } from "@playwright/test";
import baseConfig from "./playwright.config";

// Runs against a real `vite build` + `vite preview`, unlike playwright.config.ts
// (which points at the raw Vite dev server). manualChunks / React.lazy() code
// splitting only applies to the production build, so this is the only e2e
// config that actually exercises the real chunk graph users hit in prod.
export default defineConfig({
  ...baseConfig,
  testDir: "./e2e",
  // The homepage community carousel is code-split, so its chunk only exists in
  // a real build — it belongs here rather than in the dev-server config.
  testMatch: /(prod-lazy-routes|homepage-community)\.spec\.ts/,
  use: { ...baseConfig.use, baseURL: "http://localhost:4173" },
  // Distinct output paths. Both suites run in one job, and the defaults
  // (playwright-report/, test-results/) are shared — the prod run would
  // clobber the dev run's report, losing the evidence for a dev failure that
  // had already failed the job.
  outputDir: "test-results-prod",
  reporter: [["html", { outputFolder: "playwright-report-prod", open: "never" }]],
  webServer: {
    command: "npm run build && npm run preview -- --port 4173",
    url: "http://localhost:4173",
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
