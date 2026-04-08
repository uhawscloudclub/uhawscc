import { test, expect } from "@playwright/test";

test.describe("Navigation flow", () => {
    test("home page hero heading is visible", async ({ page }) => {
        await page.goto("/");
        await expect(
            page.getByRole("heading", { name: /Build in the Cloud/i }),
        ).toBeVisible();
    });

    test("clicking About nav link navigates to the About page", async ({
        page,
    }) => {
        await page.goto("/");
        await page.getByRole("link", { name: "About" }).first().click();
        await expect(
            page.getByRole("heading", { name: /What We Do/i }),
        ).toBeVisible();
    });

    test("clicking Events nav link navigates to the Events page", async ({
        page,
    }) => {
        await page.goto("/");
        await page.getByRole("link", { name: "Events" }).first().click();
        await expect(
            page.getByRole("heading", { name: /Upcoming Events/i }),
        ).toBeVisible();
    });

    test("clicking Resources nav link navigates to the Resources page", async ({
        page,
    }) => {
        await page.goto("/");
        await page.getByRole("link", { name: "Resources" }).first().click();
        await expect(
            page.getByRole("heading", { name: /Member Resources/i }),
        ).toBeVisible();
    });

    test("clicking Team nav link navigates to the Team page", async ({
        page,
    }) => {
        await page.goto("/");
        await page.getByRole("link", { name: "Team" }).first().click();
        await expect(
            page.getByRole("heading", { name: /Leadership/i }),
        ).toBeVisible();
    });

    test("clicking the logo returns to the home page", async ({ page }) => {
        await page.goto("/about");
        await page.getByRole("link", { name: /AWS Cloud Club/i }).first().click();
        await expect(
            page.getByRole("heading", { name: /Build in the Cloud/i }),
        ).toBeVisible();
    });

    test("mobile menu opens and a link navigates correctly", async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto("/");
        // Open mobile menu by clicking the hamburger button
        await page.getByRole("button").click();
        // Mobile menu should be visible
        await expect(page.getByRole("link", { name: "About" }).nth(1)).toBeVisible();
        // Click the About link in the mobile menu
        await page.getByRole("link", { name: "About" }).nth(1).click();
        await expect(
            page.getByRole("heading", { name: /What We Do/i }),
        ).toBeVisible();
    });
});
