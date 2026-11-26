import { test, expect } from "@playwright/test";

// Headings use regexes tolerant of the <br /> inside each h1 — accessible-name
// computation may or may not insert whitespace at the break.

test.describe("Navigation flow", () => {
    test("home page hero heading is visible", async ({ page }) => {
        await page.goto("/");
        await expect(
            page.getByRole("heading", { name: /Build cloud skills/i }),
        ).toBeVisible();
    });

    test("clicking About nav link navigates to the About page", async ({
        page,
    }) => {
        await page.goto("/");
        await page.getByRole("link", { name: "About" }).first().click();
        await expect(
            page.getByRole("heading", { name: /Built by students/i }),
        ).toBeVisible();
    });

    test("clicking Events nav link navigates to the Events page", async ({
        page,
    }) => {
        await page.goto("/");
        await page.getByRole("link", { name: "Events" }).first().click();
        await expect(
            page.getByRole("heading", { name: /meetups/i }),
        ).toBeVisible();
    });

    test("clicking Resources nav link navigates to the Resources page", async ({
        page,
    }) => {
        await page.goto("/");
        await page.getByRole("link", { name: "Resources" }).first().click();
        await expect(
            page.getByRole("heading", { name: /need to start/i }),
        ).toBeVisible();
    });

    test("clicking Team nav link navigates to the Team page", async ({
        page,
    }) => {
        await page.goto("/");
        await page.getByRole("link", { name: "Team" }).first().click();
        await expect(
            page.getByRole("heading", { name: /behind the club/i }),
        ).toBeVisible();
    });

    test("clicking the logo returns to the home page", async ({ page }) => {
        await page.goto("/about");
        await page.getByRole("link", { name: /AWS Student Builder Group/i }).first().click();
        await expect(
            page.getByRole("heading", { name: /Build cloud skills/i }),
        ).toBeVisible();
    });

    test("mobile menu opens and a link navigates correctly", async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto("/");
        // Locate the hamburger by its accessible name. An unqualified
        // getByRole("button") breaks as soon as the page grows another button
        // (for example the community carousel's prev/next controls).
        await page.getByRole("button", { name: /open navigation/i }).click();
        await expect(page.getByRole("link", { name: "About" }).nth(1)).toBeVisible();
        await page.getByRole("link", { name: "About" }).nth(1).click();
        await expect(
            page.getByRole("heading", { name: /Built by students/i }),
        ).toBeVisible();
    });

    test("learning paths is reachable by direct URL for internal review", async ({ page }) => {
        await page.goto("/learning-paths");
        await expect(
            page.getByRole("heading", { name: /Your path to/i }),
        ).toBeVisible();
    });
});
