import { test, expect } from "@playwright/test";

// Asserts the current client-rendered 404 UI only. The route still answers
// HTTP 200 via the SPA fallback; real 404 status handling is deliberately part
// of the later Express/SEO slice, not this one.

test.describe("404 Not Found page", () => {
    test("navigating to a non-existent route renders the 404 page", async ({
        page,
    }) => {
        await page.goto("/nonexistent-route");
        await expect(page.getByText("404")).toBeVisible();
        await expect(
            page.getByRole("heading", { name: /Page not\s*found/i }),
        ).toBeVisible();
    });

    test("Back to home link navigates back to the home page", async ({
        page,
    }) => {
        await page.goto("/nonexistent-route");
        await page.getByRole("link", { name: /Back to home/i }).click();
        await expect(
            page.getByRole("heading", { name: /Build cloud skills/i }),
        ).toBeVisible();
    });
});
