import { test, expect } from "@playwright/test";
import { TEAM_MEMBERS } from "../src/test/fixtures";

test.describe("Team page", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/team");
    });

    test("all six team member names are visible", async ({ page }) => {
        for (const { name } of TEAM_MEMBERS) {
            await expect(page.getByText(name)).toBeVisible();
        }
    });

    test("each LinkedIn link has the correct aria-label and href", async ({
        page,
    }) => {
        for (const { name, linkedinUrl } of TEAM_MEMBERS) {
            const link = page.getByRole("link", {
                name: `Visit ${name}'s LinkedIn profile`,
            });
            await expect(link).toHaveAttribute("href", linkedinUrl);
            await expect(link).toHaveAttribute("target", "_blank");
        }
    });

    test("the Become a Member heading is visible", async ({ page }) => {
        await expect(
            page.getByRole("heading", { name: /Become a Member/i }),
        ).toBeVisible();
    });
});
