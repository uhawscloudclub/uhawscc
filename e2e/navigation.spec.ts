import { test, expect } from "@playwright/test";

// Headings use regexes tolerant of the <br /> inside each h1 — accessible-name
// computation may or may not insert whitespace at the break.
test.describe("Navigation flow", () => {
    test("home page hero heading is visible", async ({ page }) => {
        await page.goto("/");
        await expect(page.getByRole("heading", { name: /Build cloud skills/i })).toBeVisible();
    });

    for (const [label, heading] of [
        ["Events", /^Events$/],
        ["Learn", /Your path to/i],
        ["Community", /Built by students/i],
        ["Contact", /hear from/i],
    ] as const) {
        test(`clicking ${label} in the nav opens that page`, async ({ page }) => {
            await page.goto("/");
            await page.getByRole("navigation").getByRole("link", { name: label, exact: true }).first().click();
            await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
        });
    }

    test("clicking the logo returns to the home page", async ({ page }) => {
        await page.goto("/community");
        await page.getByRole("link", { name: /AWS Student Builder Group/i }).first().click();
        await expect(page.getByRole("heading", { name: /Build cloud skills/i })).toBeVisible();
    });

    test("mobile menu opens and a link navigates correctly", async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto("/");
        // Locate the hamburger by its accessible name. An unqualified
        // getByRole("button") breaks as soon as the page grows another button
        // (for example the community carousel's prev/next controls).
        await page.getByRole("button", { name: /open navigation/i }).click();
        await expect(page.getByRole("link", { name: "Community" }).nth(1)).toBeVisible();
        await page.getByRole("link", { name: "Community" }).nth(1).click();
        await expect(page.getByRole("heading", { name: /Built by students/i })).toBeVisible();
    });
});
