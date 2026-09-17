import { test, expect, type Page } from "@playwright/test";
import { getCommunityPhotos } from "../src/data/communityPhotos";

/**
 * Real-browser coverage for the homepage community carousel — keyboard,
 * control geometry and mobile clipping cannot be verified in jsdom, which has
 * no layout. Runs against the production build so the lazy chunk is exercised.
 *
 * Skips while no photos are curated: the section deliberately renders nothing
 * in that state, so there would be nothing to assert. It activates on its own
 * as soon as real records land in src/data/communityPhotos.ts.
 */
const photos = getCommunityPhotos();
const REGION = /Photos from CloudHub UH events/i;

test.describe("Homepage community carousel", () => {
    test.skip(
        photos.length === 0,
        "No curated community photos yet — section intentionally renders nothing.",
    );

    async function focusRegion(page: Page) {
        const region = page.getByRole("region", { name: REGION });
        await region.scrollIntoViewIfNeeded();
        await region.focus();
        return region;
    }

    test("is reachable within one viewport scroll below the hero", async ({
        page,
    }) => {
        await page.goto("/");
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await expect(page.getByText(/our community/i)).toBeVisible();
    });

    test("exposes a named, focusable carousel region", async ({ page }) => {
        await page.goto("/");
        const region = await focusRegion(page);

        await expect(region).toBeVisible();
        await expect(region).toBeFocused();
    });

    test("arrow keys move forward and back through the slides", async ({
        page,
    }) => {
        test.skip(photos.length < 2, "Needs at least two slides to navigate.");

        await page.goto("/");
        await focusRegion(page);

        const status = page.locator('[aria-live="polite"]');
        await expect(status).toContainText(/slide 1 of/i);

        await page.keyboard.press("ArrowRight");
        await expect(status).toContainText(/slide 2 of/i);

        await page.keyboard.press("ArrowLeft");
        await expect(status).toContainText(/slide 1 of/i);
    });

    test("both controls have accessible names and 44px targets", async ({
        page,
    }) => {
        await page.goto("/");
        await page.getByRole("region", { name: REGION }).scrollIntoViewIfNeeded();

        for (const name of [/previous slide/i, /next slide/i]) {
            const button = page.getByRole("button", { name });
            await expect(button).toBeVisible();

            const box = await button.boundingBox();
            expect(box).not.toBeNull();
            expect(box!.width).toBeGreaterThanOrEqual(44);
            expect(box!.height).toBeGreaterThanOrEqual(44);
        }
    });

    test("controls stay inside a 375px viewport", async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto("/");
        await page.getByRole("region", { name: REGION }).scrollIntoViewIfNeeded();

        for (const name of [/previous slide/i, /next slide/i]) {
            const box = await page.getByRole("button", { name }).boundingBox();
            expect(box).not.toBeNull();
            // The shadcn default positions these at -left-12/-right-12, which
            // would hang outside the viewport on a full-width section.
            expect(box!.x).toBeGreaterThanOrEqual(0);
            expect(box!.x + box!.width).toBeLessThanOrEqual(375);
        }
    });

    test("does not advance on its own while idle", async ({ page }) => {
        test.skip(photos.length < 2, "Needs at least two slides to detect drift.");

        await page.goto("/");
        await page.getByRole("region", { name: REGION }).scrollIntoViewIfNeeded();

        const status = page.locator('[aria-live="polite"]');
        await expect(status).toContainText(/slide 1 of/i);

        await page.waitForTimeout(5000);

        // No autoplay: the selected slide must be unchanged after idling.
        await expect(status).toContainText(/slide 1 of/i);
    });
});
