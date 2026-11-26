import { test, expect } from "@playwright/test";

// Old URLs land on the right page and section. In these configs (Vite dev
// server / vite preview) the redirect is client-side; Express's HTTP 301s for
// the same map are checked against the running server separately.

for (const [from, path, heading, sectionHeading] of [
    ["/about", "/community", /Built by students/i, null],
    ["/team", "/community", /Built by students/i, "The people behind the club"],
    ["/learning-paths", "/learn", /Your path to/i, null],
    ["/resources", "/learn", /Your path to/i, "Free resources"],
    ["/news", "/learn", /Your path to/i, null],
] as const) {
    test(`${from} → ${path}${sectionHeading ? ` (${sectionHeading})` : ""}`, async ({ page }) => {
        await page.goto(`${from}?ref=bookmark`);
        await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
        await expect(page).toHaveURL(new RegExp(`${path}\\?ref=bookmark`));
        if (sectionHeading) {
            await expect(page.getByRole("heading", { name: sectionHeading })).toBeInViewport();
        }
    });
}

test("the News page is gone from navigation and the footer", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "News", exact: true })).toHaveCount(0);
});

test("/learn starts with the two setup steps, in order", async ({ page }) => {
    await page.goto("/learn");
    const boxes = page.getByRole("checkbox");
    await expect(boxes.nth(0)).toHaveAccessibleName(/Create your AWS Builder Center account/);
    await expect(boxes.nth(1)).toHaveAccessibleName(/Sign up for AWS Student Rewards/);
    await expect(page.getByRole("region", { name: "Start here" })).toContainText("Create your AWS Builder Center account");
});
