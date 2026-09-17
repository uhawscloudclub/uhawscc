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

    test("is reachable within one viewport scroll below the hero (desktop)", async ({
        page,
    }) => {
        await page.goto("/");
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        // Exact match, not /our community/i — that regex also matches the
        // hero's "Join our community" CTA, which is always present and would
        // make this a strict-mode violation (two elements, one locator).
        await expect(page.getByText("Our community", { exact: true })).toBeVisible();
    });

    test("is reachable within one viewport scroll below the hero (375px mobile)", async ({
        page,
    }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto("/");
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await expect(page.getByText("Our community", { exact: true })).toBeVisible();
    });

    test("a single curated photo renders as a static figure with no carousel chrome", async ({
        page,
    }) => {
        test.skip(photos.length !== 1, "Only meaningful with exactly one curated photo.");

        await page.goto("/");
        const figure = page.locator("figure").filter({ hasText: photos[0].caption });
        await figure.scrollIntoViewIfNeeded();

        await expect(figure).toBeVisible();
        await expect(figure.getByRole("img")).toBeVisible();
        // CommunityCarousel deliberately renders one photo as a plain figure,
        // not a carousel — no region, no prev/next controls.
        await expect(page.getByRole("region", { name: REGION })).toHaveCount(0);
        await expect(
            page.getByRole("button", { name: /previous slide|next slide/i }),
        ).toHaveCount(0);
    });

    test("exposes a named, focusable carousel region", async ({ page }) => {
        test.skip(photos.length < 2, "Carousel chrome only renders for two or more photos.");

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
        const region = await focusRegion(page);

        // Scoped to the region, not page-wide: sonner's global toast
        // container (mounted on every page via <Sonner /> in App.tsx) also
        // renders aria-live="polite", so an unscoped locator matches two
        // elements and is a strict-mode violation.
        const status = region.locator('[aria-live="polite"]');
        await expect(status).toContainText(/slide 1 of/i);

        await page.keyboard.press("ArrowRight");
        await expect(status).toContainText(/slide 2 of/i);

        await page.keyboard.press("ArrowLeft");
        await expect(status).toContainText(/slide 1 of/i);
    });

    test("remains keyboard-navigable and announces slides under prefers-reduced-motion: reduce", async ({
        page,
    }) => {
        test.skip(photos.length < 2, "Needs at least two slides to navigate.");

        // Real browser emulation, not a mocked matchMedia: this exercises the
        // actual prefersReducedMotion() check in CommunityCarousel against a
        // genuine reduced-motion context, so embla is genuinely constructed
        // with duration: 0 rather than that being asserted only at the unit
        // level (CommunityCarousel.embla.test.tsx mocks the embla API and
        // proves the exact option value; this proves the feature keeps
        // working end-to-end when a real user has the OS preference set).
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto("/");
        const region = await focusRegion(page);
        await expect(region).toBeFocused();

        const status = region.locator('[aria-live="polite"]');
        await expect(status).toContainText(/slide 1 of/i);

        await page.keyboard.press("ArrowRight");
        await expect(status).toContainText(/slide 2 of/i);
    });

    test("both controls have accessible names and 44px targets", async ({
        page,
    }) => {
        test.skip(photos.length < 2, "Carousel chrome only renders for two or more photos.");

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
        test.skip(photos.length < 2, "Carousel chrome only renders for two or more photos.");

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
        const region = page.getByRole("region", { name: REGION });
        await region.scrollIntoViewIfNeeded();

        // Scoped to the region — see the note in the arrow-keys test above.
        const status = region.locator('[aria-live="polite"]');
        await expect(status).toContainText(/slide 1 of/i);

        await page.waitForTimeout(5000);

        // No autoplay: the selected slide must be unchanged after idling.
        await expect(status).toContainText(/slide 1 of/i);
    });
});
