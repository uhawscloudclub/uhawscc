import { test, expect, type Page } from "@playwright/test";

// Reduced motion, skip link, and the /learn checklist in a real
// browser (jsdom can't paint a canvas or move keyboard focus realistically).
// Runs in both Playwright configs.

async function canvasChanges(page: Page): Promise<boolean> {
    // The canvas starts on requestIdleCallback (≤2s); wait until it has drawn.
    await page.waitForFunction(() => {
        const c = document.querySelector("canvas");
        if (!c) return false;
        const blank = document.createElement("canvas");
        blank.width = c.width;
        blank.height = c.height;
        return c.toDataURL() !== blank.toDataURL();
    }, null, { timeout: 5000 });
    return page.evaluate(
        () =>
            new Promise<boolean>((resolve) => {
                const c = document.querySelector("canvas")!;
                const before = c.toDataURL();
                setTimeout(() => resolve(c.toDataURL() !== before), 700);
            }),
    );
}

test.describe("prefers-reduced-motion", () => {
    // Pages on the Stage 3 pixel theme have no canvas at all; their only
    // ambient motion is the mascot's float, which must stop.
    for (const path of ["/", "/events"]) {
        test(`no animated canvas, and the mascot is still, on ${path}`, async ({ page }) => {
            await page.emulateMedia({ reducedMotion: "reduce" });
            await page.route("**/api/events", (r) => r.fulfill({ status: 200, contentType: "application/json", body: "[]" }));
            await page.goto(path);
            await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
            await expect(page.locator("canvas")).toHaveCount(0);
            // Every floating element (if the page has any) has its animation off.
            const animations = await page.locator(".px-float").evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
            expect(animations.every((name) => name === "none")).toBe(true);
        });
    }

    for (const path of ["/learn"]) {
        test(`background canvas stays still on ${path}`, async ({ page }) => {
            await page.emulateMedia({ reducedMotion: "reduce" });
            await page.route("**/api/events", (r) => r.fulfill({ status: 200, contentType: "application/json", body: "[]" }));
            await page.goto(path);
            expect(await canvasChanges(page)).toBe(false);
        });
    }

    test("background canvas still animates without the preference", async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "no-preference" });
        await page.route("**/api/events", (r) => r.fulfill({ status: 200, contentType: "application/json", body: "[]" }));
        await page.goto("/learn");
        expect(await canvasChanges(page)).toBe(true);
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
