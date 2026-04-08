import { test, expect } from "@playwright/test";

test.describe("404 Not Found page", () => {
    test("navigating to a non-existent route renders the 404 page", async ({
        page,
    }) => {
        await page.goto("/nonexistent-route");
        await expect(
            page.getByRole("heading", { name: "404" }),
        ).toBeVisible();
        await expect(page.getByText(/Page not found/i)).toBeVisible();
    });

    test("Return to Home link navigates back to the home page", async ({
        page,
    }) => {
        await page.goto("/nonexistent-route");
        await page.getByRole("link", { name: /Return to Home/i }).click();
        await expect(
            page.getByRole("heading", { name: /Build in the Cloud/i }),
        ).toBeVisible();
    });
});
