import { test, expect } from "@playwright/test";

// Reduced motion, skip link, and the /learn checklist in a real browser
// (jsdom can't compute animations or move keyboard focus realistically).
// Runs in both Playwright configs.

test.describe("prefers-reduced-motion", () => {
    // No page has an animated background any more; the only ambient motion is
    // the mascot's float, which must stop under reduced motion.
    for (const path of ["/", "/events", "/learn", "/community", "/contact", "/no-such-page"]) {
        test(`no canvas, and nothing floats, on ${path}`, async ({ page }) => {
            await page.emulateMedia({ reducedMotion: "reduce" });
            await page.route("**/api/events", (r) => r.fulfill({ status: 200, contentType: "application/json", body: "[]" }));
            await page.goto(path);
            await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
            await expect(page.locator("canvas")).toHaveCount(0);
            const animations = await page.locator(".px-float").evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
            expect(animations.every((name) => name === "none")).toBe(true);
        });
    }

    test("without the preference, the homepage mascot does float", async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "no-preference" });
        await page.route("**/api/events", (r) => r.fulfill({ status: 200, contentType: "application/json", body: "[]" }));
        await page.goto("/");
        const name = await page.locator(".px-float").first().evaluate((el) => getComputedStyle(el).animationName);
        expect(name).toBe("px-float");
    });
});

test("skip link is the first Tab stop and moves focus into the page", async ({ page }) => {
    await page.route("**/api/events", (r) => r.fulfill({ status: 200, contentType: "application/json", body: "[]" }));
    await page.goto("/events");
    // /events is lazy-loaded: wait for it to render before pressing Tab.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();

    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
    expect(page.url()).not.toContain("#main-content");

    // The next Tab continues inside main, past the navigation.
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest("main"))).toBe(true);
});

test("/learn checklist works from the keyboard and survives a reload", async ({ page }) => {
    await page.goto("/learn");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const box = page.getByRole("checkbox", { name: /AWS Cloud Practitioner Essentials/ });
    await box.focus();
    await page.keyboard.press("Space");
    await expect(box).toBeChecked();
    expect(await box.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe("none");

    await page.reload();
    await expect(page.getByRole("checkbox", { name: /AWS Cloud Practitioner Essentials/ })).toBeChecked();
    expect(await page.evaluate(() => localStorage.getItem("uh_aws_cc_progress_ccp_v1"))).toBe("[2]");
});
