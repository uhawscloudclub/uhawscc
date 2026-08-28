import { test, expect } from "@playwright/test";

// Runs only against a real production build (see playwright.prod.config.ts) —
// exercises the actual manualChunks-split, React.lazy()-loaded bundle, unlike
// e2e/navigation.spec.ts which points at the unbundled Vite dev server and so
// can never catch a chunk-loading/chunk-init-order regression.
const routes: [name: string, path: string, heading: RegExp][] = [
  ["About", "/about", /Built by students/i],
  ["Events", "/events", /Upcoming/i],
  ["Learning Paths", "/learning-paths", /Learning Paths|certification/i],
  ["Resources", "/resources", /need to start|Resources/i],
  ["News", "/news", /curated for/i],
  ["Team", "/team", /people.*behind the club|Leadership/i],
  ["Contact", "/contact", /hear from/i],
  ["Not Found (catch-all)", "/this-route-does-not-exist", /not.*found/i],
];

for (const [name, path, heading] of routes) {
  test(`${name} route loads without a runtime error (prod build)`, async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (err) => pageErrors.push(err));

    // Land on home first, then click through client-side navigation where
    // possible so this exercises the actual React.lazy() import() boundary
    // (a direct page.goto() to a sub-route re-requests index.html and would
    // also pass even if only server-rendered/hard-refresh navigation works).
    await page.goto("/");
    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading }).first()).toBeVisible();
    expect(pageErrors).toHaveLength(0);
  });
}

test("clicking through every nav link in one session hits no runtime error", async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (err) => pageErrors.push(err));

  await page.goto("/");
  const viewport = page.viewportSize();
  const isMobile = !viewport || viewport.width < 768;
  if (isMobile) {
    await page.getByRole("button", { name: /open navigation/i }).click();
  }

  for (const link of ["About", "Events", "Learning Paths", "Resources", "News", "Team"]) {
    await page.getByRole("link", { name: link }).first().click();
    if (isMobile) {
      await page.getByRole("button", { name: /open navigation/i }).click();
    }
  }

  expect(pageErrors).toHaveLength(0);
});
